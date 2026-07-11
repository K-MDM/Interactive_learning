import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-[#FAF9F6] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-[#0F172A] hover:opacity-85 transition-opacity"
        >
          <span className="font-extrabold tracking-wider font-display text-sm text-[#0F172A] uppercase">
            KEEEL AI
          </span>
        </Link>

        {/* Links */}
        <div className="flex gap-8">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</Link>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">Terms of Service</Link>
          <Link href="/contact" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">Contact</Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Keeelai. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
