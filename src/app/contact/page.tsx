'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, Mail, MapPin, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SceneBackdrop from '@/components/three/SceneBackdrop';
import Reveal from '@/components/motion/Reveal';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketRef, setTicketRef] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setTicketRef(data.ticketRef);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen text-[#0F172A] flex flex-col font-sans relative overflow-x-hidden">
      <SceneBackdrop density={6} veil={0.35} />
      <Navbar dark={false} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Get in Touch with Keeelai Education Support",
            "url": "https://keeelai.com/contact",
            "description": "Contact Keeelai support team for subscription activations, custom educational licenses, or system setup help.",
            "mainEntity": {
              "@type": "Organization",
              "name": "Keeelai",
              "url": "https://keeelai.com",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "support@keeelai.com",
                "contactType": "customer support",
                "availableLanguage": "English"
              }
            }
          })
        }}
      />

      {/* Grid background layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-55 pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">

        {/* Contact Info column */}
        <Reveal from="left" className="lg:col-span-5 relative z-20">
          <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
                Get in <span className="text-gradient-fun">touch</span>
              </h1>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                Have questions about subscription activation, custom team licenses, or experiencing technical rendering issues inside the mobile app? Drop us a line.
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Us</h3>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">support@keeelai.com</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Average response time: &lt; 2 hours</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Hours</h3>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">Monday – Friday</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">9:00 AM – 6:00 PM EST</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Headquarters</h3>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">Keeel Pvt. Ltd.</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Contact Form Card */}
        <Reveal from="right" className="lg:col-span-7 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xl relative z-20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-candy-blue via-candy-indigo to-candy-coral rounded-t-3xl" />

          {submitted ? (
            <div className="text-center py-10 space-y-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-slate-900 font-display">Message Sent!</h2>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed font-medium">
                  Thank you for reaching out. Our operations support team has received your ticket and will respond within 2 hours.
                </p>
              </div>

              {ticketRef && (
                <div className="w-full max-w-sm bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Ticket Reference ID</span>
                  <span className="text-2xl font-black text-blue-600 font-mono tracking-widest bg-white border border-blue-100 px-5 py-2 rounded-xl shadow-xs">{ticketRef}</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1">Please keep this ID for your records</span>
                </div>
              )}

              <button
                onClick={() => { setSubmitted(false); setTicketRef(''); }}
                className="mt-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Send us a message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-candy-blue focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-candy-blue focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help you?"
                  required
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-candy-blue focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your request in detail..."
                  required
                  disabled={loading}
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-candy-blue focus:bg-white transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-candy-blue hover:brightness-110 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-candy-blue/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}

        </Reveal>
      </main>
      <Footer />

    </div>
  );
}
