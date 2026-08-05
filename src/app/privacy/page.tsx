'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  UserCheck,
  Server,
  Cookie,
  Mail,
  ChevronRight,
  BookOpen,
  CheckCircle2,
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
  { id: 'overview', title: '1. Overview & Scope', icon: BookOpen },
  { id: 'collection', title: '2. Information We Collect', icon: Eye },
  { id: 'usage', title: '3. How We Use Information', icon: UserCheck },
  { id: 'protection', title: '4. Data Protection & Security', icon: Lock },
  { id: 'third-parties', title: '5. Third-Party Processors', icon: Server },
  { id: 'cookies', title: '6. Cookies & Tracking', icon: Cookie },
  { id: 'rights', title: '7. Your Rights & Choices', icon: ShieldCheck },
  { id: 'children', title: '8. Student & Children Privacy', icon: CheckCircle2 },
  { id: 'contact', title: '9. Updates & Contact Us', icon: Mail },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('overview');

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
            name: 'Privacy Policy | Keeel AI',
            url: 'https://keeelai.com/privacy',
            description:
              'Privacy Policy for Keeel AI detailing how we collect, protect, and handle user data and interactive simulation telemetry.',
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
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Transparency & Trust</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-display">
            Privacy <span className="text-gradient-fun">Policy</span>
          </h1>
          <p className="mt-4 text-slate-600 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
            At Keeel AI, we are committed to safeguarding your personal data and ensuring full transparency regarding how we handle information across our interactive learning platform.
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
              On This Page
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
              <span>Need Assistance?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Have questions about your data privacy or want to exercise your user rights?
            </p>
            <a
              href="mailto:support@keeel.in"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Email Privacy Team &rarr;
            </a>
          </div>
        </aside>

        {/* Content Document Card */}
        <div className="lg:col-span-8 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-12">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-candy-blue via-candy-indigo to-candy-coral" />

          {/* Section 1 */}
          <section id="overview" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                1. Overview & Scope
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                Keeel AI (operated by <strong>Keeel Pvt. Ltd.</strong>, referred to herein as &quot;Keeel AI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides an interactive learning platform designed for 3D visual exploration, AI-guided educational simulations, and personalized learning pathways.
              </p>
              <p>
                This Privacy Policy explains how we collect, store, process, transfer, and protect your information when you visit our website (<strong>https://keeelai.com</strong>), use our web applications, or interact with our mobile applications and simulation services.
              </p>
              <p>
                By creating an account, accessing, or using Keeel AI, you acknowledge that you have read and understood the privacy practices described in this document.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="collection" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                2. Information We Collect
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-medium">
              <p>We collect information in three primary ways: direct submission, automated interaction telemetry, and third-party authentication services.</p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">A. Personal Information You Provide</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                  <li><strong>Account Registration:</strong> Name, email address, password, educational institution, and role (student, educator, self-learner).</li>
                  <li><strong>Billing & Transactions:</strong> Billing contact information and transaction receipts. Payment card processing details are handled directly by certified payment gateways (e.g., Razorpay/Stripe); we do not store full payment card numbers.</li>
                  <li><strong>Support & Communications:</strong> Messages, ticket references, and attachments sent to support@keeel.in or through our contact forms.</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">B. Simulation & Usage Telemetry</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                  <li><strong>Interactive Progress:</strong> Completed simulation modules, quiz scores, time spent per topic, and learning mastery metrics.</li>
                  <li><strong>Technical Diagnostics:</strong> WebGL/Three.js rendering performance, frame rates, browser type, operating system, screen resolution, IP address, and error logs.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="usage" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                3. How We Use Your Information
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>We use the collected information strictly for operational and educational improvement purposes, including:</p>
              <ul className="list-disc list-inside space-y-2 text-xs text-slate-700 pl-2">
                <li>Delivering, personalizing, and rendering 3D interactive learning modules.</li>
                <li>Processing subscription upgrades, license activations, and issuing invoices.</li>
                <li>Improving AI response accuracy and interactive simulation performance.</li>
                <li>Responding to customer support tickets and resolving system errors.</li>
                <li>Sending transactional updates, security alerts, and essential account notifications.</li>
                <li>Preventing fraudulent activity, unauthorized platform exploitation, or security breaches.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="protection" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                4. Data Protection & Security Controls
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                We employ industry-standard administrative, technical, and physical safeguards to protect your personal data against unauthorized access, loss, alteration, or disclosure:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900">TLS Encryption</h4>
                  <p className="text-xs text-slate-600">All data in transit is encrypted using HTTPS / TLS 1.3 encryption protocols.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900">Secure Storage</h4>
                  <p className="text-xs text-slate-600">Database infrastructure is hosted on encrypted Supabase / PostgreSQL instances with strict RLS policies.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="third-parties" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Server className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                5. Third-Party Sub-Processors
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                We collaborate with vetted cloud providers and service partners to deliver platform functionality. These partners process data strictly under contractual data protection agreements:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-slate-700 pl-2">
                <li><strong>Cloud Infrastructure & Hosting:</strong> Vercel (Web Hosting & Edge API), Supabase (Database & Authentication).</li>
                <li><strong>Payment Gateways:</strong> Razorpay / Stripe (PCI-DSS compliant transaction processors).</li>
                <li><strong>Analytics & Diagnostics:</strong> Next.js Analytics & Vercel Telemetry (aggregated performance tracking).</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="cookies" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Cookie className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                6. Cookies & Local Storage
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                Keeel AI uses essential cookies and browser local storage to maintain session authentication, preserve active simulation state, and remember your visual interface preferences.
              </p>
              <p>
                You can manage cookie settings directly in your browser preferences. Disabling essential cookies may impair your ability to log in or maintain simulation states.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="rights" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                7. Your Rights & Choices
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>Depending on your jurisdiction, you possess specific privacy rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 pl-2">
                <li><strong>Access:</strong> Request a copy of the personal information stored in your profile.</li>
                <li><strong>Rectification:</strong> Correct inaccuracies or update out-of-date information.</li>
                <li><strong>Deletion:</strong> Request permanent removal of your account and personal history.</li>
                <li><strong>Data Portability:</strong> Export your learning completion data and certificates.</li>
              </ul>
              <p className="text-xs pt-1">
                To submit a privacy request, please contact us at <a href="mailto:support@keeel.in" className="text-blue-600 font-bold underline">support@keeel.in</a>. We process verified requests within 30 days.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="children" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                8. Student & Children Privacy
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                Keeel AI is designed for educational use. When institutions or parents enroll students under the age of 18, account creation is managed via institutional licenses or parent consent. We do not sell student data or utilize student information for behavioral ad targeting.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="contact" className="scroll-mt-32 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                9. Policy Updates & Contact Information
              </h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-medium">
              <p>
                We may revise this Privacy Policy periodically to reflect platform enhancements or regulatory changes. Significant updates will be posted on this page with an updated modification date.
              </p>
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-2 mt-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Keeel AI Data Protection Contact</h4>
                <p className="text-xs text-slate-700"><strong>Legal Entity:</strong> Keeel Pvt. Ltd.</p>
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
