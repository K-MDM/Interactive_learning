const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load env variables manually from .env.local
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found. Make sure you completed the placeholders in it.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('your_supabase_') || serviceRoleKey.includes('your_supabase_')) {
  console.error("Error: Please set valid NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: node scripts/createAdmin.js <email> <password>");
  process.exit(1);
}

// 2. Initialize Supabase with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log(`Attempting to create admin account: ${email}...`);

  // 3. Create user in Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error("Failed to create auth user:", error.message);
    process.exit(1);
  }

  console.log(`Success! Created Auth user: ${email} (ID: ${data.user.id})`);

  // 4. Register profile in profiles table with active subscription (100 years validity for Admin testing)
  const oneHundredYears = new Date();
  oneHundredYears.setFullYear(oneHundredYears.getFullYear() + 100);

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      email: email,
      web_subscription_active: true,
      web_subscription_expires_at: oneHundredYears.toISOString()
    });

  if (profileError) {
    console.error("Auth user created, but writing to public.profiles failed:", profileError.message);
    console.log("Make sure you have created the public.profiles table in Supabase.");
  } else {
    console.log("Admin profile registered successfully in database!");
  }
}

main();
