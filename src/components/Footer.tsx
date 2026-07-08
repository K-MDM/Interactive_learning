import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface FooterProps {
  dark?: boolean;
}

export default function Footer({ dark = false }: FooterProps) {
  return (
    <footer className={`border-t transition-colors duration-300 ${dark ? 'border-slate-900 bg-[#05090D]' : 'border-slate-200 bg-white'
      }`}>
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-2 font-bold hover:opacity-80 transition-opacity ${dark ? 'text-white' : 'text-blue-600'
            }`}
        >
          <BookOpen className={`w-4 h-4 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
          KEEEL AI
        </Link>

        {/* Links */}
        <div className="flex gap-8">
          <Link href="/" className={`text-xs transition-colors ${dark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>Privacy Policy</Link>
          <Link href="/" className={`text-xs transition-colors ${dark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>Terms of Service</Link>
          <Link href="/contact" className={`text-xs transition-colors ${dark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>Contact</Link>
        </div>

        {/* Copyright */}
        <p className={`text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
          © {new Date().getFullYear()} Keeelai. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
