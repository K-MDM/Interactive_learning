'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { 
  Key, Copy, Check, QrCode, Download, Smartphone, Laptop, 
  Plus, Clock, CheckCircle2, AlertTriangle, ShieldX, Loader2, ArrowRight
} from 'lucide-react';

interface Licence {
  id: string;
  key: string;
  duration_months: number;
  source: string;
  type: string;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  activated_at: string | null;
  expires_at: string | null;
  last_activated_device_id: string | null;
  created_at: string;
}

export default function UserDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [licences, setLicences] = useState<Licence[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Download links
  const [downloads, setDownloads] = useState({
    android: 'https://play.google.com/store/apps/details?id=com.keeelai.notes',
    macos: 'https://keeelai.com/downloads/keeelai-notes.dmg',
    windows: 'https://keeelai.com/downloads/keeelai-notes-setup.exe',
  });

  useEffect(() => {
    async function initDashboard() {
      try {
        // Check auth user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login');
          return;
        }

        setUserEmail(user.email || 'User');

        // Fetch user's purchased licences
        const res = await fetch('/api/user/licences');
        const data = await res.json();
        if (res.ok) {
          setLicences(data.licences || []);
        }

        // Fetch download links
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'downloads')
          .single();

        if (settingsData && settingsData.value) {
          setDownloads(settingsData.value);
        }
      } catch (err) {
        console.error('Dashboard init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [supabase, router]);

  const copyKey = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
              Customer Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              My Purchased Licences
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Manage all your device-locked licence keys, view activation status, and scan QR codes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/checkout"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Purchase New Licence</span>
            </Link>
          </div>
        </div>

        {/* Client App Download Quick Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-display flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <span>Download Keeelai Mobile / Desktop App</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Install the app on your device and activate your key or scan your QR code.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <a
              href={downloads.android}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android</span>
            </a>
            <a
              href={downloads.macos}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>macOS</span>
            </a>
            <a
              href={downloads.windows}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Windows</span>
            </a>
          </div>
        </div>

        {/* Licence List Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 font-display flex items-center justify-between">
            <span>Your Keys ({licences.length})</span>
          </h2>

          {licences.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">No Licence Keys Found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                You haven't purchased any licence keys yet. Purchase a licence plan to get instant device access.
              </p>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm"
              >
                <span>Browse Licence Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {licences.map((lic) => {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=keeel://activate?key=${lic.key}`;

                return (
                  <div
                    key={lic.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-6"
                  >
                    {/* Top Row: Key Header + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                          Licence Key ({lic.duration_months} Months)
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-wider">
                            {lic.key}
                          </span>
                          <button
                            onClick={() => copyKey(lic.key)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-colors cursor-pointer"
                            title="Copy Key"
                          >
                            {copiedKey === lic.key ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                            lic.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lic.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : lic.status === 'expired'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {lic.status === 'active' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {lic.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {lic.status === 'revoked' && <ShieldX className="w-3.5 h-3.5 text-rose-600" />}
                          {lic.status === 'pending' ? 'Pending Activation' : lic.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: QR Code + Details */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      
                      {/* Left: Activation Details */}
                      <div className="space-y-3 text-xs text-slate-600 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Activated On
                            </span>
                            <span className="font-semibold text-slate-800 block mt-0.5">
                              {lic.activated_at ? new Date(lic.activated_at).toLocaleDateString() : 'Not activated yet'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Expiration Date
                            </span>
                            <span className="font-semibold text-slate-800 block mt-0.5">
                              {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : `${lic.duration_months} Months after activation`}
                            </span>
                          </div>

                          <div className="sm:col-span-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Device Identification
                            </span>
                            <span className="font-mono text-[11px] text-slate-700 block mt-0.5 truncate" title={lic.last_activated_device_id || ''}>
                              {lic.last_activated_device_id || 'Will bind to your device upon first activation'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 italic">
                          * Note: Licence key can only be activated on one device. Contact support to transfer to a new device.
                        </p>
                      </div>

                      {/* Right: QR Code */}
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shrink-0 text-center shadow-sm">
                        <img src={qrUrl} alt="Licence QR Code" className="w-28 h-28 mx-auto rounded-xl bg-white p-1" />
                        <span className="text-[9px] font-bold text-emerald-400 block mt-2 uppercase tracking-widest flex items-center justify-center gap-1">
                          <QrCode className="w-3 h-3" /> Scan to Activate
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
