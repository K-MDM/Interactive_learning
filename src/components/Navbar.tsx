'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X } from 'lucide-react';

interface NavbarProps {
  /** Optional right-side slot for extra controls (e.g. currency switcher) */
  rightSlot?: React.ReactNode;
  dark?: boolean;
}

export default function Navbar({ rightSlot, dark = false }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/demo', label: 'Demos' },
    { href: '/checkout', label: 'Pricing' },
    { href: '/contact', label: 'Support' },
  ];

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
      dark
        ? 'bg-[#05090D]/80 backdrop-blur-md border-b border-slate-900/60'
        : 'bg-white/90 backdrop-blur-md border-b border-slate-200/70'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative z-50">

        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity ${
            dark ? 'text-white' : 'text-blue-600'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
          KEEEL AI
        </Link>

        {/* Centre nav links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors ${
                  isActive
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

        {/* Right slot (Desktop) + Hamburger & Controls */}
        <div className="flex items-center gap-3">
          {rightSlot}
          
          {/* Get Started Button (Desktop/Tablet) */}
          <Link
            href="/checkout"
            className={`text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.98] hidden sm:inline-flex items-center ${
              dark
                ? 'bg-white hover:bg-slate-100 text-[#05090D]'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            Get Started
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors md:hidden focus:outline-none ${
              dark 
                ? 'text-slate-400 hover:text-white hover:bg-slate-900/60' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* ─────────────────────────────────────────────
         APPLE-STYLE MOBILE MENU OVERLAY
      ───────────────────────────────────────────── */}
      <div 
        className={`fixed inset-0 top-16 z-40 w-full h-[calc(100vh-4rem)] flex flex-col justify-between transition-all duration-300 md:hidden overflow-hidden ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        } ${
          dark 
            ? 'bg-[#05090D]/95 backdrop-blur-lg border-t border-slate-900/40' 
            : 'bg-white/95 backdrop-blur-lg border-t border-slate-200/40'
        }`}
      >
        {/* Navigation list */}
        <nav className="flex flex-col px-8 py-10 space-y-6">
          {links.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-2xl font-black font-display tracking-tight transition-transform duration-300 ${
                  isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                } ${
                  isActive
                    ? dark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                    : dark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                style={{ transitionDelay: `${links.indexOf({ href, label }) * 50}ms` }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom CTA block in Drawer */}
        <div className={`p-8 border-t ${
          dark ? 'border-slate-900/60 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <Link
            href="/checkout"
            className={`w-full py-4 rounded-xl font-bold text-center block text-sm shadow-md transition-all active:scale-[0.99] ${
              dark
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
