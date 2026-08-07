'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileText,
  ShieldAlert,
  CreditCard,
  UserX,
  AlertCircle,
  Mail,
  ChevronRight,
  Gavel,
  BookOpen,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SceneBackdrop from '@/components/three/SceneBackdrop';
import Reveal from '@/components/motion/Reveal';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: 'acceptance', title: '1. Acceptance & Eligibility', icon: BookOpen },
  { id: 'account', title: '2. User Accounts & Security', icon: FileText },
  { id: 'ip', title: '3. Intellectual Property Rights', icon: Scale },
  { id: 'billing', title: '4. Subscriptions & Payments', icon: CreditCard },
  { id: 'conduct', title: '5. Acceptable Use Policy', icon: ShieldAlert },
  { id: 'disclaimer', title: '6. Disclaimers & Liability', icon: AlertCircle },
  { id: 'availability', title: '7. Service Modifications', icon: FileText },
  { id: 'termination', title: '8. Account Termination', icon: UserX },
  { id: 'law', title: '9. Governing Law & Jurisdiction', icon: Gavel },
  { id: 'contact', title: '10. Contact Information', icon: Mail },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState<string>('acceptance');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen text-[#0F172A] flex flex-col font-sans relative overflow-x-hidden">
      <SceneBackdrop density={5} veil={0.35} />
      <Navbar dark={false} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Terms of Service | Keeel AI',
            url: 'https://keeelai.com/terms',
            description:
              'Terms of Service governing the use of Keeel AI educational platforms, subscription services, and interactive 3D simulations.',
            publisher: {
              '@type': 'Organization',
              name: 'Keeel Pvt. Ltd.',
              url: 'https://keeelai.com',
            },
          }),
        }}
      />

      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-55 pointer-events-none" />

      {/* Header Banner */}
      <header className="relative pt-32 pb-12 z-10 px-6 max-w-6xl mx-auto w-full">
        <Reveal from="down">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-display">
            Terms of <span className="text-gradient-fun">Service</span>
          </h1>
          <p className="mt-4 text-slate-600 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
            Please read these Terms of Service carefully before accessing or using the Keeel AI platform, services, or interactive learning simulations.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-lg">
              Effective Date: August 1, 2026
            </span>
            <span className="bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-lg">
              Last Updated: August 5, 2026
            </span>
          </div>
        </Reveal>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">
              Terms Navigation
            </h2>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{sec.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Mail className="w-4 h-4" />
              <span>Questions?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              If you have any questions regarding these terms, our support team is available to help.
            </p>
            <a
              href="mailto:support@keeel.in"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Contact Legal Team &rarr;
            </a>
          </div>
        </aside>

        {/* Content Document Card */}
        <div className="lg:col-span-8 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-12">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-candy-blue via-candy-indigo to-candy-coral" />

          {/* Section 1 */}
          <section id="acceptance" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                1. Acceptance of Terms & Eligibility
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;) and <strong>Keeel Pvt. Ltd.</strong> (&quot;Keeel AI&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;) governing your access to and use of <strong>https://keeelai.com</strong>, our mobile software, web applications, and associated services.
              </p>
              <p>
                By registering an account, purchasing a subscription, or using any portion of our platform, you agree to be bound by these Terms. If you do not agree, you must immediately discontinue use of the platform.
              </p>
              <p>
                <strong>Eligibility:</strong> You must be at least 13 years of age (or the minimum legal age of digital consent in your jurisdiction) to create an account directly. If you are under 18, you represent that you have received permission from a parent, legal guardian, or educational institution.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="account" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                2. User Accounts & Security
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>To access full feature sets and interactive simulations, you must register for an account.</p>
              <ul className="list-disc list-inside space-y-2 text-xs text-slate-700 pl-2">
                <li><strong>Account Accuracy:</strong> You agree to provide accurate, current, and complete registration information.</li>
                <li><strong>Credential Confidentiality:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities occurring under your account.</li>
                <li><strong>Unauthorized Access:</strong> You must notify us immediately at support@keeel.in if you suspect any breach of security or unauthorized use of your account.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="ip" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                3. Intellectual Property Rights
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                All content, 3D interactive models, simulation engine assets, AI assistance algorithms, software code, graphic elements, trademarks, logos, and UI designs contained on Keeel AI are the exclusive property of Keeel Pvt. Ltd. or its licensors and are protected under international copyright, trademark, and patent laws.
              </p>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Limited License Grant</h4>
                <p className="text-xs text-slate-600">
                  Subject to your compliance with these Terms, Keeel AI grants you a personal, non-exclusive, non-transferable, revocable license to access and view the interactive educational content for individual educational use or approved classroom instruction.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="billing" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                4. Subscriptions, Payments & Renewals
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>Keeel AI offers individual plans, educator passes, and institutional custom licenses.</p>
              <ul className="list-disc list-inside space-y-2 text-xs text-slate-700 pl-2">
                <li><strong>Billing Cycles:</strong> Subscriptions are billed on a recurring monthly or annual basis unless cancelled prior to the renewal date.</li>
                <li><strong>Payment Processors:</strong> Transactions are securely handled by PCI-DSS compliant third parties (e.g., Razorpay / Stripe). Applicable taxes are calculated during checkout.</li>
                <li><strong>Cancellation Policy:</strong> You may cancel your subscription renewal at any time via your account settings or by contacting support. Your access will remain active until the conclusion of the paid billing period.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="conduct" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                5. Acceptable Use Policy
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 pl-2">
                <li>Reverse engineering, decompiling, or extracting source code or WebGL assets from our simulations.</li>
                <li>Scraping, automated data mining, or harvesting user information from our servers.</li>
                <li>Sharing your account login credentials with unauthorized third parties outside your subscription terms.</li>
                <li>Attempting to bypass security mechanisms, rate limits, or platform access controls.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="disclaimer" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                6. Disclaimers & Limitation of Liability
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                Keeel AI platform, services, and interactive 3D content are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied.
              </p>
              <p>
                To the maximum extent permitted by applicable law, Keeel Pvt. Ltd. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue arising out of your access to or inability to use the platform.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="availability" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                7. Service Modifications
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                We reserve the right to modify, update, suspend, or discontinue any feature, simulation module, or aspect of the platform at any time without prior notice. We will strive to provide advance notification for major system upgrades or scheduled maintenance windows.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="termination" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <UserX className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                8. Account Termination
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                We reserve the right to suspend or terminate your account and restrict platform access immediately if you breach any provision of these Terms or engage in fraudulent or abusive activities.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="law" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Gavel className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                9. Governing Law & Jurisdiction
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms shall be instituted exclusively in the competent courts located in Maharashtra, India.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="contact" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                10. Contact Information
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                If you have questions, comments, or legal inquiries regarding these Terms of Service, please contact us:
              </p>
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-2 mt-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Keeel AI Legal Department</h4>
                <p className="text-xs text-slate-700"><strong>Company:</strong> Keeel Pvt. Ltd.</p>
                <p className="text-xs text-slate-700"><strong>Email:</strong> support@keeel.in</p>
                <p className="text-xs text-slate-700"><strong>Location:</strong> Maharashtra, India</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
