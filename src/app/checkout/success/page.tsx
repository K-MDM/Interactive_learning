'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Download, Smartphone, Laptop, Loader, HelpCircle } from 'lucide-react';

export default function SuccessPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [os, setOs] = useState<'android' | 'macos' | 'windows' | 'other'>('other');
  
  // Dynamic links loaded from Supabase settings
  const [downloadLinks, setDownloadLinks] = useState({
    android: 'https://play.google.com/store/apps/details?id=com.keeelai.notes',
    macos: 'https://keeelai.com/downloads/keeelai-notes.dmg',
    windows: 'https://keeelai.com/downloads/keeelai-notes-setup.exe'
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const { data: dbData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'downloads')
          .single();

        if (dbData && dbData.value) {
          setDownloadLinks(dbData.value);
        }
      } catch (e) {
        console.error('Failed to load download links config', e);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Get active download details based on OS
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/5 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 text-center space-y-6">
        
        {/* Success Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-3xl" />

          {/* Success Checkmark Icon */}
          <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Payment Successful!</h1>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed max-w-sm mx-auto">
            Your membership has been activated successfully. You can now access all interactive HTML notes inside our client application.
          </p>

          <div className="my-8 border-t border-slate-200 pt-8 space-y-6">
            <h2 className="text-sm font-bold text-slate-450 uppercase tracking-widest">Download Client Application</h2>

            {/* Targeted Download CTA */}
            {currentDownload ? (
              <div className="space-y-4">
                <a 
                  href={currentDownload.link}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer text-sm"
                >
                  <Download className="w-5 h-5" />
                  <span>Download for {currentDownload.osName}</span>
                </a>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  {currentDownload.icon}
                  <span>Targeted {currentDownload.title} package detected for your device.</span>
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 text-left">
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span>Choose download format for your operating system:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <a 
                    href={downloadLinks.android}
                    className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 py-2.5 px-3 rounded-lg text-center text-xs font-bold transition-all block"
                  >
                    Android (PlayStore)
                  </a>
                  <a 
                    href={downloadLinks.macos}
                    className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 py-2.5 px-3 rounded-lg text-center text-xs font-bold transition-all block"
                  >
                    macOS (.dmg)
                  </a>
                  <a 
                    href={downloadLinks.windows}
                    className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 py-2.5 px-3 rounded-lg text-center text-xs font-bold transition-all block"
                  >
                    Windows (.exe)
                  </a>
                </div>
              </div>
            )}

            {/* General fallback list for other OS */}
            {currentDownload && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Need a different version?</p>
                <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-450">
                  {os !== 'android' && <a href={downloadLinks.android} className="hover:text-slate-800 transition-colors">Android</a>}
                  {os !== 'macos' && <a href={downloadLinks.macos} className="hover:text-slate-800 transition-colors">macOS</a>}
                  {os !== 'windows' && <a href={downloadLinks.windows} className="hover:text-slate-800 transition-colors">Windows</a>}
                </div>
              </div>
            )}
          </div>

          <Link 
            href="/"
            className="text-xs text-slate-400 hover:text-slate-800 uppercase tracking-wider font-bold transition-colors mt-4 block"
          >
            Return to Homepage
          </Link>
        </div>

      </div>
    </main>
  );
}
