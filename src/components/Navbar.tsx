'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';

interface NavbarProps {
  /** Optional right-side slot for extra controls (e.g. currency switcher) */
  rightSlot?: React.ReactNode;
  dark?: boolean;
}

export default function Navbar({ rightSlot, dark = false }: NavbarProps) {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/demo', label: 'Demos' },
    { href: '/checkout', label: 'Pricing' },
    { href: '/contact', label: 'Support' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${dark
        ? 'bg-[#05090D]/80 backdrop-blur-md border-b border-slate-900/60'
        : 'bg-white/90 backdrop-blur-md border-b border-slate-200/70'
      }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity ${dark ? 'text-white' : 'text-blue-600'
            }`}
        >
          <BookOpen className={`w-5 h-5 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
          KEEEL AI
        </Link>

        {/* Centre nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors ${isActive
                    ? dark
                      ? 'font-semibold text-white border-b-2 border-white pb-0.5'
                      : 'font-semibold text-blue-600 border-b-2 border-blue-600 pb-0.5'
                    : dark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right slot (optional) + CTA */}
        <div className="flex items-center gap-3">
          {rightSlot}
          <Link
            href="/checkout"
            className={`text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.98] hidden sm:inline-flex items-center ${dark
                ? 'bg-white hover:bg-slate-100 text-[#05090D]'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
          >
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}
