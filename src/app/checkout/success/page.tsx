'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  CheckCircle, Download, Smartphone, Laptop, Loader, HelpCircle, 
  Copy, Check, QrCode, ArrowRight, Key
} from 'lucide-react';

interface Licence {
  id: string;
  key: string;
  duration_months: number;
  status: string;
  created_at: string;
}

export default function SuccessPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [os, setOs] = useState<'android' | 'macos' | 'windows' | 'other'>('other');
  const [latestLicence, setLatestLicence] = useState<Licence | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Dynamic links loaded from Supabase settings
  const [downloadLinks, setDownloadLinks] = useState({
    android: 'https://play.google.com/store/apps/details?id=com.keeelai.notes',
    macos: 'https://keeelai.com/downloads/keeelai-notes.dmg',
    windows: 'https://keeelai.com/downloads/keeelai-notes-setup.exe'
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch download links
        const { data: dbData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'downloads')
          .single();

        if (dbData && dbData.value) {
          setDownloadLinks(dbData.value);
        }

        // Fetch latest generated licence key for user
        const res = await fetch('/api/user/licences');
        const data = await res.json();
        if (res.ok && data.licences && data.licences.length > 0) {
          setLatestLicence(data.licences[0]);
        }
      } catch (e) {
        console.error('Failed to load success page data', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Detect user OS
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes('android')) {
        setOs('android');
      } else if (ua.includes('macintosh') || ua.includes('mac os x') || ua.includes('ipad') || ua.includes('iphone')) {
        setOs('macos');
      } else if (ua.includes('windows') || ua.includes('win32') || ua.includes('win64')) {
        setOs('windows');
      } else {
        setOs('other');
      }
    }
  }, [supabase]);

  const copyKey = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getDownloadDetails = () => {
    switch (os) {
      case 'android':
        return {
          title: 'Google Play Store',
          link: downloadLinks.android,
          icon: <Smartphone className="w-5 h-5" />,
          osName: 'Android'
        };
      case 'macos':
        return {
          title: 'macOS Application (.dmg)',
          link: downloadLinks.macos,
          icon: <Laptop className="w-5 h-5" />,
          osName: 'macOS'
        };
      case 'windows':
        return {
          title: 'Windows Installer (.exe)',
          link: downloadLinks.windows,
          icon: <Laptop className="w-5 h-5" />,
          osName: 'Windows'
        };
      default:
        return null;
    }
  };

  const currentDownload = getDownloadDetails();
  const qrCodeUrl = latestLicence 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=keeel://activate?key=${latestLicence.key}`
    : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/5 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 text-center space-y-6 my-10">
        
        {/* Success Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 rounded-t-3xl" />

          {/* Checkmark Icon */}
          <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Purchase Successful!</h1>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed max-w-sm mx-auto">
            Your payment has been verified and your device licence key has been generated.
          </p>

          {/* LICENCE KEY DISPLAY & QR CODE SECTION */}
          {latestLicence && (
            <div className="my-6 bg-slate-900 text-white rounded-2xl p-6 shadow-md text-left space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Single-Device Licence Key
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  {latestLicence.duration_months} Months Plan
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 w-full">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between font-mono text-lg sm:text-xl font-bold tracking-widest text-emerald-400">
                    <span>{latestLicence.key}</span>
                    <button
                      onClick={() => copyKey(latestLicence.key)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors cursor-pointer ml-2"
                      title="Copy Key"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Type or scan this key on your mobile app to activate access for your device.
                  </p>
                </div>

                {/* QR CODE DISPLAY */}
                {qrCodeUrl && (
                  <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-sm text-center">
                    <img src={qrCodeUrl} alt="Licence QR Code" className="w-28 h-28 mx-auto rounded-lg" />
                    <span className="text-[9px] font-bold text-slate-700 block mt-1 uppercase tracking-wider">Scan to Activate</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DASHBOARD LINK CTA */}
          <div className="my-4">
            <Link
              href="/dashboard"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
            >
              <span>View All Purchased Licences in Dashboard</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>

          {/* DOWNLOAD CLIENT APPLICATION SECTION */}
          <div className="my-6 border-t border-slate-200 pt-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Download Client Application</h2>

            {currentDownload ? (
              <div className="space-y-3">
                <a 
                  href={currentDownload.link}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download for {currentDownload.osName}</span>
                </a>
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  {currentDownload.icon}
                  <span>Targeted {currentDownload.title} package detected.</span>
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 text-left">
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span>Select download for your device:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <a 
                    href={downloadLinks.android}
                    className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 py-2 px-3 rounded-lg text-center text-xs font-bold transition-all block"
                  >
                    Android
                  </a>
                  <a 
                    href={downloadLinks.macos}
                    className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 py-2 px-3 rounded-lg text-center text-xs font-bold transition-all block"
                  >
                    macOS
                  </a>
                  <a 
                    href={downloadLinks.windows}
                    className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 py-2 px-3 rounded-lg text-center text-xs font-bold transition-all block"
                  >
                    Windows
                  </a>
                </div>
              </div>
            )}
          </div>

          <Link 
            href="/"
            className="text-xs text-slate-400 hover:text-slate-800 uppercase tracking-wider font-bold transition-colors block"
          >
            Return to Homepage
          </Link>
        </div>

      </div>
    </main>
  );
}
