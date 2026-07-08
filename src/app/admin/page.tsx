'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  ShieldCheck, BookOpen, Settings, Tag, Plus, Loader, 
  Trash2, PlusCircle, CheckCircle, AlertTriangle, Link2, ExternalLink
} from 'lucide-react';

export default function AdminConsole() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'notes' | 'settings' | 'coupons'>('notes');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data States
  const [notes, setNotes] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  // Settings States
  const [pricing, setPricing] = useState<any>({
    plans: [],
    tax_percent: 18
  });
  const [downloads, setDownloads] = useState({
    android: '',
    macos: '',
    windows: ''
  });

  // New Coupon Form States
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState(20);
  const [newCouponExpiry, setNewCouponExpiry] = useState('');
  const [newCouponMinAmount, setNewCouponMinAmount] = useState('');
  const [newCouponEligiblePlans, setNewCouponEligiblePlans] = useState<string[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        // 1. Fetch notes
        const { data: dbNotes } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false });
        setNotes(dbNotes || []);

        // 2. Fetch coupons
        const { data: dbCoupons } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });
        setCoupons(dbCoupons || []);

        // 3. Fetch dynamic pricing from plans table
        const { data: dbPlans } = await supabase
          .from('plans')
          .select('*')
          .order('created_at', { ascending: true });

        // Fetch settings for downloads and tax rate
        const { data: dbSettings } = await supabase
          .from('settings')
          .select('*');
        
        let taxPercent = 18;
        if (dbSettings) {
          const pricingRow = dbSettings.find(s => s.key === 'pricing');
          if (pricingRow && pricingRow.value) {
            taxPercent = pricingRow.value.tax_percent || 18;
          }

          const downloadsRow = dbSettings.find(s => s.key === 'downloads');
          if (downloadsRow) setDownloads(downloadsRow.value);
        }

        setPricing({
          plans: dbPlans || [],
          tax_percent: taxPercent
        });
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [supabase]);

  // Generate Timed HMAC test links (calculated client-side for testing)
  // We fetch a preview token from backend or compute with a mock secret if local test
  const getTestLink = (noteId: string) => {
    // Generate a temporary link containing a static verification string
    // In production, the old app backend generates this dynamically
    const expiry = Math.floor(Date.now() / 1000) + 1800; // 30 mins
    return `/webview/notes/${noteId}?userId=admin_tester&expiry=${expiry}&signature=test_signature`;
  };

  // Toggle Note Demo Access
  const toggleNoteDemo = async (noteId: string, currentDemo: boolean) => {
    try {
      const res = await fetch('/api/admin/notes/demo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, isDemo: !currentDemo })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setNotes(notes.map(n => n.id === noteId ? { ...n, is_demo: !currentDemo } : n));
      setMessage({ type: 'success', text: `Demo access updated.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to toggle demo status' });
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Save Pricing plans via secure dynamic plans API
      const resPricing = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: pricing.plans })
      });
      const dataPricing = await resPricing.json();
      if (dataPricing.error) throw new Error(dataPricing.error);

      // Save Tax Percent via secure settings API
      const resTax = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'pricing', value: { tax_percent: pricing.tax_percent } })
      });
      const dataTax = await resTax.json();
      if (dataTax.error) throw new Error(dataTax.error);

      // Save Downloads config via secure API
      const resDownloads = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'downloads', value: downloads })
      });
      const dataDownloads = await resDownloads.json();
      if (dataDownloads.error) throw new Error(dataDownloads.error);

      setMessage({ type: 'success', text: 'System settings updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  // Add Coupon Handler
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const code = newCouponCode.trim().toUpperCase();
      const expiresAt = newCouponExpiry ? new Date(newCouponExpiry).toISOString() : null;

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountPercent: newCouponPercent,
          expiresAt,
          eligiblePlanIds: newCouponEligiblePlans,
          minOrderAmount: newCouponMinAmount || null
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setCoupons([data.coupon, ...coupons]);
      setNewCouponCode('');
      setNewCouponExpiry('');
      setNewCouponMinAmount('');
      setNewCouponEligiblePlans([]);
      setMessage({ type: 'success', text: `Coupon code '${code}' added successfully!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add coupon' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Coupon Active Status
  const toggleCoupon = async (code: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, active: !currentActive })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setCoupons(coupons.map(c => c.code === code ? { ...c, active: !currentActive } : c));
      setMessage({ type: 'success', text: `Coupon ${code} updated successfully.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to toggle coupon' });
    }
  };

  // Delete Coupon
  const deleteCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon '${code}'?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setCoupons(coupons.filter(c => c.code !== code));
      setMessage({ type: 'success', text: `Coupon ${code} removed.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete coupon' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center text-white">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header Console */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
              <span>Admin Console</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Configure pricing plans, verify payments, and manage lectures</p>
          </div>

          <div className="flex gap-3">
            <Link 
              href="/admin/upload" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              <span>Upload Note</span>
            </Link>
            <Link 
              href="/" 
              className="border border-gray-800 hover:border-gray-700 bg-[#12141c]/50 text-gray-300 font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all"
            >
              <span>View Site</span>
            </Link>
          </div>
        </header>

        {/* Global Notifications */}
        {message && (
          <div className={`p-4 rounded-xl border text-sm font-medium flex items-start gap-2.5 ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs switcher */}
        <div className="flex bg-[#12141c]/60 border border-gray-850 p-1.5 rounded-xl w-fit">
          <button 
            onClick={() => { setActiveTab('notes'); setMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'notes' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Interactive Notes ({notes.length})</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('settings'); setMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Configs</span>
          </button>

          <button 
            onClick={() => { setActiveTab('coupons'); setMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'coupons' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupon Codes ({coupons.length})</span>
          </button>
        </div>

        {/* TAB 1: NOTES LIST */}
        {activeTab === 'notes' && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.length === 0 ? (
              <div className="col-span-full bg-[#12141c]/30 border border-gray-850 p-12 text-center rounded-2xl">
                <p className="text-gray-400 font-semibold text-lg">No notes found.</p>
                <p className="text-gray-600 text-xs mt-1">Upload your first interactive lecture file above.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-[#12141c] border border-gray-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all shadow-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-white text-base line-clamp-1 flex-1">{note.title}</h3>
                      {note.is_demo && (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed min-h-[36px]">
                      {note.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-800/60 mt-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>Uploaded: {new Date(note.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href={getTestLink(note.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#181a24] hover:bg-[#1f222f] border border-gray-800 text-blue-400 font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Test Link</span>
                      </a>
                      <button 
                        type="button"
                        onClick={() => toggleNoteDemo(note.id, note.is_demo)}
                        className={`border font-semibold py-2 px-2.5 rounded-lg text-xs transition-colors ${
                          note.is_demo 
                            ? 'border-emerald-950/25 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-950/20' 
                            : 'border-gray-800 bg-[#181a24] text-gray-300 hover:bg-[#1f222f]'
                        }`}
                      >
                        {note.is_demo ? 'Disable Demo' : 'Make Demo'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 2: SYSTEM CONFIGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-[#12141c] border border-gray-800 rounded-2xl p-6 md:p-8 max-w-4xl space-y-8 shadow-xl">
            
            {/* Pricing Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h3 className="text-base font-bold text-white">Subscription Plans</h3>
                <button 
                  type="button"
                  onClick={() => {
                    const newPlan = {
                      id: `plan_${self.crypto.randomUUID()}`,
                      name: 'New Custom Plan',
                      duration_months: 1,
                      price_usd: 19.99,
                      discount_percent: 0,
                      subtext: 'Billed monthly/yearly'
                    };
                    setPricing({
                      ...pricing,
                      plans: [...(pricing.plans || []), newPlan]
                    });
                  }}
                  className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Plan</span>
                </button>
              </div>

              {/* Plans Grid */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {(!pricing.plans || pricing.plans.length === 0) ? (
                  <div className="bg-[#181a24]/30 border border-gray-850 p-6 text-center rounded-xl text-gray-500 text-xs">
                    No active subscription plans defined. Add one above.
                  </div>
                ) : (
                  pricing.plans.map((plan: any, idx: number) => (
                    <div key={plan.id} className="bg-[#181a24]/40 border border-gray-800 rounded-xl p-4 space-y-3 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Plan #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPricing({
                              ...pricing,
                              plans: pricing.plans.filter((p: any) => p.id !== plan.id)
                            });
                          }}
                          className="text-rose-500 hover:text-rose-450 text-xs font-semibold hover:underline"
                        >
                          Delete Plan
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Plan ID (Auto Generated)</label>
                          <input
                            type="text"
                            value={plan.id}
                            readOnly
                            disabled
                            className="w-full bg-[#0d0f14]/40 border border-gray-900 rounded px-2.5 py-1.5 text-xs text-gray-500 focus:outline-none cursor-not-allowed font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Plan Name</label>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => {
                              const updated = [...pricing.plans];
                              updated[idx].name = e.target.value;
                              setPricing({ ...pricing, plans: updated });
                            }}
                            required
                            className="w-full bg-[#0d0f14]/85 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Duration (Months)</label>
                          <input
                            type="number" min="1"
                            value={plan.duration_months}
                            onChange={(e) => {
                              const updated = [...pricing.plans];
                              updated[idx].duration_months = parseInt(e.target.value, 10) || 1;
                              setPricing({ ...pricing, plans: updated });
                            }}
                            required
                            className="w-full bg-[#0d0f14]/85 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Base Price (USD)</label>
                          <input
                            type="number" step="0.01" min="0"
                            value={plan.price_usd}
                            onChange={(e) => {
                              const updated = [...pricing.plans];
                              updated[idx].price_usd = parseFloat(e.target.value) || 0;
                              setPricing({ ...pricing, plans: updated });
                            }}
                            required
                            className="w-full bg-[#0d0f14]/85 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Plan Discount (%)</label>
                          <input
                            type="number" min="0" max="100"
                            value={plan.discount_percent || 0}
                            onChange={(e) => {
                              const updated = [...pricing.plans];
                              updated[idx].discount_percent = parseInt(e.target.value, 10) || 0;
                              setPricing({ ...pricing, plans: updated });
                            }}
                            className="w-full bg-[#0d0f14]/85 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Subtext / Description</label>
                          <input
                            type="text"
                            value={plan.subtext || ''}
                            onChange={(e) => {
                              const updated = [...pricing.plans];
                              updated[idx].subtext = e.target.value;
                              setPricing({ ...pricing, plans: updated });
                            }}
                            className="w-full bg-[#0d0f14]/85 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Global Config Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Global Tax Rate (%)</label>
                  <input 
                    type="number" min="0" max="100"
                    value={pricing.tax_percent}
                    onChange={(e) => setPricing({ ...pricing, tax_percent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* App Downloads links */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white border-b border-gray-800 pb-2">Client App Downloads</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Android (Play Store URL)</label>
                  <input 
                    type="url"
                    value={downloads.android}
                    onChange={(e) => setDownloads({ ...downloads, android: e.target.value })}
                    className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">macOS (.dmg URL)</label>
                  <input 
                    type="url"
                    value={downloads.macos}
                    onChange={(e) => setDownloads({ ...downloads, macos: e.target.value })}
                    className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Windows Installer (.exe URL)</label>
                  <input 
                    type="url"
                    value={downloads.windows}
                    onChange={(e) => setDownloads({ ...downloads, windows: e.target.value })}
                    className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer"
            >
              {saving ? <Loader className="w-5 h-5 animate-spin" /> : <span>Save Configurations</span>}
            </button>
          </form>
        )}

        {/* TAB 3: COUPON MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Create Coupon Box */}
            <div className="lg:col-span-4 bg-[#12141c] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-500" />
                <span>Create Coupon</span>
              </h3>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Coupon Code</label>
                  <input 
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="e.g. SAVE20"
                    required
                    className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white uppercase placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Discount (%)</label>
                  <input 
                    type="number" min="1" max="100"
                    value={newCouponPercent}
                    onChange={(e) => setNewCouponPercent(parseInt(e.target.value, 10) || 0)}
                    required
                    className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Minimum Order Amount (USD, Optional)</label>
                  <input 
                    type="number" step="0.01" min="0"
                    value={newCouponMinAmount}
                    onChange={(e) => setNewCouponMinAmount(e.target.value)}
                    placeholder="e.g. 50.00"
                    className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Eligible Plans (Optional, defaults to all)</label>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto bg-[#181a24] p-3 rounded-lg border border-gray-800">
                    {pricing.plans.map((plan: any) => (
                      <label key={plan.id} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white">
                        <input
                          type="checkbox"
                          checked={newCouponEligiblePlans.includes(plan.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewCouponEligiblePlans([...newCouponEligiblePlans, plan.id]);
                            } else {
                              setNewCouponEligiblePlans(newCouponEligiblePlans.filter(id => id !== plan.id));
                            }
                          }}
                          className="rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span>{plan.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                  <input 
                    type="date"
                    value={newCouponExpiry}
                    onChange={(e) => setNewCouponExpiry(e.target.value)}
                    className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all cursor-pointer text-sm"
                >
                  {saving ? <Loader className="w-5 h-5 animate-spin" /> : <span>Add Coupon</span>}
                </button>
              </form>
            </div>

            {/* Coupons Table */}
            <div className="lg:col-span-8 bg-[#12141c] border border-gray-800 rounded-2xl p-6 shadow-xl overflow-hidden">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <span>Existing Coupons</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Discount</th>
                      <th className="pb-3">Min Order</th>
                      <th className="pb-3">Eligible Plans</th>
                      <th className="pb-3">Expiry</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-gray-500">No coupon codes active.</td>
                      </tr>
                    ) : (
                      coupons.map((coupon) => (
                        <tr key={coupon.code} className="border-b border-gray-850 hover:bg-[#181a24]/30 transition-colors">
                          <td className="py-3.5 font-bold text-white uppercase">{coupon.code}</td>
                          <td className="py-3.5 text-blue-400 font-bold">{coupon.discount_percent}% Off</td>
                          <td className="py-3.5 text-gray-300">
                            {coupon.min_order_amount !== null && coupon.min_order_amount !== undefined
                              ? `$${Number(coupon.min_order_amount).toFixed(2)}`
                              : 'None'}
                          </td>
                          <td className="py-3.5 text-gray-300 max-w-[150px] truncate" title={
                            coupon.eligible_plan_ids && coupon.eligible_plan_ids.length > 0
                              ? coupon.eligible_plan_ids.map((id: string) => {
                                  const pl = pricing.plans.find((p: any) => p.id === id);
                                  return pl ? pl.name : id;
                                }).join(', ')
                              : 'All Plans'
                          }>
                            {coupon.eligible_plan_ids && coupon.eligible_plan_ids.length > 0
                              ? coupon.eligible_plan_ids.map((id: string) => {
                                  const pl = pricing.plans.find((p: any) => p.id === id);
                                  return pl ? pl.name : id;
                                }).join(', ')
                              : 'All Plans'}
                          </td>
                          <td className="py-3.5 text-gray-400">
                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              coupon.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {coupon.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2 whitespace-nowrap">
                            <button 
                              onClick={() => toggleCoupon(coupon.code, coupon.active)}
                              className="text-xs font-semibold text-gray-400 hover:text-white border border-gray-800 px-2 py-1 rounded hover:bg-gray-800"
                            >
                              Toggle
                            </button>
                            <button 
                              onClick={() => deleteCoupon(coupon.code)}
                              className="text-xs font-semibold text-rose-500 hover:text-rose-450 border border-rose-950/20 px-2 py-1 rounded hover:bg-rose-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
