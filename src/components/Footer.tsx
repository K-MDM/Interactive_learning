import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-blue-600 hover:opacity-80 transition-opacity"
        >
          <BookOpen className="w-4 h-4" />
          Keeelai Notes
        </Link>

        {/* Links */}
        <div className="flex gap-8">
          <Link href="/"         className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Privacy Policy</Link>
          <Link href="/"         className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Terms of Service</Link>
          <Link href="/contact"  className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Contact</Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Keeelai. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
