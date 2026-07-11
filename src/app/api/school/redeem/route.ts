import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid access code' }, { status: 400 });
    }

    const formattedCode = code.trim().toUpperCase();

    // Call stored procedure RPC using admin client (executes trigger definitions & definer context)
    const adminClient = createAdminClient();
    const { error: rpcError } = await adminClient.rpc('redeem_school_code', {
      student_id: user.id,
      input_code: formattedCode
    });

    if (rpcError) {
      console.error('Redeem RPC Error:', rpcError);
      
      let clientMessage = 'Failed to redeem school code';
      const errMsg = rpcError.message || '';

      if (errMsg.includes('Invalid access code')) {
        clientMessage = 'We could not find that code. Double-check the spelling and try again.';
      } else if (errMsg.includes('usage limit')) {
        clientMessage = 'This access code has reached its maximum enrollment cap.';
      } else if (errMsg.includes('seats remaining')) {
        clientMessage = 'This school license has run out of seats. Please ask your teacher to contact support.';
      } else if (errMsg.includes('expired')) {
        clientMessage = 'This school license has expired.';
      } else if (errMsg.includes('suspended')) {
        clientMessage = 'This school license has been suspended.';
      } else if (errMsg.includes('duplicate key') || errMsg.includes('unique constraint')) {
        clientMessage = 'You already belong to a school license membership.';
      }

      return NextResponse.json({ error: clientMessage }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'License code redeemed successfully! Welcome to your school premium workspace.' });
  } catch (err: any) {
    console.error('School redeem route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
