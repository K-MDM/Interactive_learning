'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, Plus, RefreshCw, Copy, Check, Search, Building2, 
  CheckCircle2, Clock, ShieldX, Download, Loader2, User, Layers, ArrowLeft, ArrowRight, ChevronRight
} from 'lucide-react';

interface Organisation {
  id: string;
  name: string;
}

interface Licence {
  id: string;
  key: string;
  duration_months: number;
  source: 'mobile' | 'web' | 'dashboard';
  type: 'free' | 'paid';
  status: 'pending' | 'active' | 'expired' | 'revoked';
  activated_at: string | null;
  expires_at: string | null;
  last_activated_device_id: string | null;
  created_at: string;
  organisation_id: string | null;
  organisations?: { id: string; name: string } | null;
  profiles?: { email: string; full_name: string } | null;
}

export default function LicenceManager() {
  const [allLicences, setAllLicences] = useState<Licence[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [kpis, setKpis] = useState({
    total: 0, active: 0, pending: 0, free: 0, paid: 0, mobile: 0, web: 0, dashboard: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Navigation & Category State
  const [categoryTab, setCategoryTab] = useState<'all' | 'org' | 'individual'>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bulk Form State
  const [quantity, setQuantity] = useState(10);
  const [durationMonths, setDurationMonths] = useState(12);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [licenceType, setLicenceType] = useState<'free' | 'paid'>('free');
  const [generating, setGenerating] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);

  // Org Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Action State
  const [transferringId, setTransferringId] = useState<string | null>(null);

  useEffect(() => {
    fetchLicences();
    fetchOrganisations();
  }, [search, statusFilter, sourceFilter, typeFilter]);

  const fetchLicences = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (sourceFilter) params.append('source', sourceFilter);
      if (typeFilter) params.append('type', typeFilter);

      const res = await fetch(`/api/admin/licences?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setAllLicences(data.licences || []);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (err) {
      console.error('Failed to fetch licences:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganisations = async () => {
    try {
      const res = await fetch('/api/admin/organisations');
      const data = await res.json();
      if (res.ok) {
        setOrganisations(data.organisations || []);
      }
    } catch (err) {
      console.error('Failed to fetch organisations:', err);
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const targetOrg = selectedOrgId || (selectedOrg ? selectedOrg.id : null);

      const res = await fetch('/api/admin/licences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          duration_months: durationMonths,
          organisation_id: targetOrg,
          type: licenceType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedKeys(data.keys || []);
        fetchLicences();
      } else {
        alert(data.error || 'Failed to generate keys');
      }
    } catch (err: any) {
      alert('Generation error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreatingOrg(true);
    try {
      const res = await fetch('/api/admin/organisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewOrgName('');
        setIsOrgModalOpen(false);
        fetchOrganisations();
      } else {
        alert(data.error || 'Failed to create organisation');
      }
    } catch (err: any) {
      alert('Organisation creation error: ' + err.message);
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleTransferKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this licence and issue a new replacement key?')) return;
    setTransferringId(id);
    try {
      const res = await fetch(`/api/admin/licences/${id}/transfer`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Licence transferred! Old key revoked.\n\nNew Key: ${data.new_key}`);
        fetchLicences();
      } else {
        alert(data.error || 'Transfer failed');
      }
    } catch (err: any) {
      alert('Transfer error: ' + err.message);
    } finally {
      setTransferringId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadCSV = () => {
    if (generatedKeys.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8,Licence Key\n" + generatedKeys.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `keeel_licence_keys_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists
  const filteredOrganisations = organisations.filter(o => 
    o.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  let displayedLicences = allLicences;
  if (categoryTab === 'org') {
    if (selectedOrg) {
      displayedLicences = allLicences.filter(l => l.organisation_id === selectedOrg.id);
    } else {
      displayedLicences = allLicences.filter(l => l.organisation_id !== null || l.source === 'dashboard');
    }
  } else if (categoryTab === 'individual') {
    displayedLicences = allLicences.filter(l => l.organisation_id === null && l.source !== 'dashboard');
  }

  // Counts
  const orgLicencesCount = allLicences.filter(l => l.organisation_id !== null || l.source === 'dashboard').length;
  const indLicencesCount = allLicences.filter(l => l.organisation_id === null && l.source !== 'dashboard').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <span>Licence Key Console</span>
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Manage device-locked licence keys, enterprise organisation distributions, and customer web sales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOrgModalOpen(true)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>+ Add Organisation</span>
          </button>
          <button
            onClick={() => {
              setGeneratedKeys([]);
              setSelectedOrgId(selectedOrg?.id || '');
              setIsBulkModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Bulk Generate Keys</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Keys</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{kpis.total}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Active / Used</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{kpis.active}</span>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Pending / Available</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">{kpis.pending}</span>
        </div>
        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block">Paid Keys</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">{kpis.paid}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Free Grants</span>
          <span className="text-xl font-black text-slate-700 mt-1 block">{kpis.free}</span>
        </div>
      </div>

      {/* SUB-TAB NAVIGATION BAR */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => { setCategoryTab('all'); setSelectedOrg(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            categoryTab === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1.5" />
          All Master Licences ({kpis.total})
        </button>
        
        <button
          onClick={() => { setCategoryTab('org'); setSelectedOrg(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            categoryTab === 'org'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
          🏢 Enterprise Organisations ({organisations.length})
        </button>

        <button
          onClick={() => { setCategoryTab('individual'); setSelectedOrg(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            categoryTab === 'individual'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 inline mr-1.5" />
          👤 End-User Purchases ({indLicencesCount})
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ORGANISATION TAB VIEW (Card Grid OR Org Licence Drill-Down)
      ───────────────────────────────────────────────────────────── */}
      {categoryTab === 'org' && (
        <div className="space-y-6">
          {selectedOrg === null ? (
            /* --- ORGANISATION CARD DIRECTORY GRID --- */
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-display">Select an Enterprise Organisation</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Click an organisation card below to inspect its dedicated licence keys and seat allocations.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search organisation by name..."
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {filteredOrganisations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                  <Building2 className="w-10 h-10 text-purple-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">No Organisations Found</h4>
                  <p className="text-slate-500 text-xs">Create an organisation entity to group bulk enterprise licence keys.</p>
                  <button
                    onClick={() => setIsOrgModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Organisation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOrganisations.map((org) => {
                    const orgLicences = allLicences.filter(l => l.organisation_id === org.id);
                    const activeCount = orgLicences.filter(l => l.status === 'active').length;
                    const pendingCount = orgLicences.filter(l => l.status === 'pending').length;

                    return (
                      <div
                        key={org.id}
                        onClick={() => setSelectedOrg(org)}
                        className="bg-white border border-slate-200 hover:border-purple-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                              {orgLicences.length} Total Keys
                            </span>
                          </div>

                          <div>
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors font-display">
                              {org.name}
                            </h4>
                            <p className="text-slate-400 text-[11px] mt-0.5 font-mono">ID: {org.id.substring(0, 8)}...</p>
                          </div>
                        </div>

                        {/* Org Card Metrics */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="bg-slate-50 p-2.5 rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Active</span>
                            <span className="font-extrabold text-emerald-600">{activeCount} Seats</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Available</span>
                            <span className="font-extrabold text-amber-600">{pendingCount} Seats</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-purple-600 pt-1 group-hover:translate-x-1 transition-transform">
                          <span>Inspect Licences</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* --- DRILLED-DOWN ORGANISATION LICENCES VIEW --- */
            <div className="space-y-4">
              <div className="bg-purple-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedOrg(null)}
                    className="text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors mb-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Organisations Directory
                  </button>
                  <h3 className="text-2xl font-extrabold font-display flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-purple-300" />
                    <span>{selectedOrg.name}</span>
                  </h3>
                  <p className="text-purple-200 text-xs">
                    Viewing device-locked licence keys issued exclusively to {selectedOrg.name}.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrgId(selectedOrg.id);
                      setGeneratedKeys([]);
                      setIsBulkModalOpen(true);
                    }}
                    className="bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-purple-700" />
                    <span>Bulk Generate Keys for {selectedOrg.name}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TABLE VIEW (Shown for ALL, INDIVIDUAL, or DRILLED-DOWN ORG)
      ───────────────────────────────────────────────────────────── */}
      {(categoryTab !== 'org' || selectedOrg !== null) && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search key or device ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Types (Free/Paid)</option>
                <option value="paid">Paid</option>
                <option value="free">Free Grant</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Sources</option>
                <option value="web">Web Purchase</option>
                <option value="dashboard">Dashboard Bulk</option>
                <option value="mobile">Mobile</option>
              </select>

              <button
                onClick={() => {
                  setSearch(''); setStatusFilter(''); setSourceFilter(''); setTypeFilter('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 p-2"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Licences Master Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Licence Key</th>
                    <th className="py-3.5 px-4">Category & Entity</th>
                    <th className="py-3.5 px-4">Purchaser / Owner</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Device ID</th>
                    <th className="py-3.5 px-4">Activated / Expiry</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading licences...
                      </td>
                    </tr>
                  ) : displayedLicences.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No licences found for this view.
                      </td>
                    </tr>
                  ) : (
                    displayedLicences.map((lic) => {
                      const isOrgLicence = lic.organisation_id !== null || lic.organisations || lic.source === 'dashboard';

                      return (
                        <tr key={lic.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Key */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm tracking-wider">
                            <div className="flex items-center gap-2">
                              <span>{lic.key}</span>
                              <button
                                onClick={() => copyToClipboard(lic.key)}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                title="Copy Key"
                              >
                                {copiedKey === lic.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Category Badging */}
                          <td className="py-3.5 px-4">
                            {isOrgLicence ? (
                              <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                                <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>{lic.organisations?.name || 'Enterprise Org'}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>Individual Purchase</span>
                              </div>
                            )}
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase">
                              <span>Source: {lic.source}</span>
                              <span>•</span>
                              <span className={lic.type === 'paid' ? 'text-blue-600 font-bold' : 'text-slate-500'}>
                                {lic.type === 'paid' ? 'Paid' : 'Free Grant'}
                              </span>
                            </div>
                          </td>

                          {/* Owner Email */}
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {lic.profiles?.email ? (
                              <div>
                                <span className="font-semibold block">{lic.profiles.email}</span>
                                {lic.profiles.full_name && <span className="text-[10px] text-slate-400">{lic.profiles.full_name}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              lic.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              lic.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              lic.status === 'expired' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {lic.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {lic.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                              {lic.status === 'revoked' && <ShieldX className="w-3 h-3 text-rose-600" />}
                              {lic.status}
                            </span>
                          </td>

                          {/* Device ID */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 max-w-[140px] truncate" title={lic.last_activated_device_id || ''}>
                            {lic.last_activated_device_id || <span className="text-slate-300">Not activated</span>}
                          </td>

                          {/* Dates */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {lic.activated_at ? (
                              <div>
                                <div>Act: {new Date(lic.activated_at).toLocaleDateString()}</div>
                                <div className="text-slate-400">Exp: {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : 'N/A'}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400">{lic.duration_months} Months Duration</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            {lic.status !== 'revoked' && (
                              <button
                                onClick={() => handleTransferKey(lic.id)}
                                disabled={transferringId === lic.id}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {transferringId === lic.id ? 'Transferring...' : 'Reissue / Transfer'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Bulk Key Generator */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-display">Bulk Generate Licence Keys</h3>
            <p className="text-slate-500 text-xs mb-6">Create multiple device-locked licence keys for schools, institutions, or free promotions.</p>

            {generatedKeys.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-between">
                  <span>Successfully generated {generatedKeys.length} licence keys!</span>
                  <button
                    onClick={downloadCSV}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs space-y-1">
                  {generatedKeys.map((key) => (
                    <div key={key} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                      <span>{key}</span>
                      <button
                        onClick={() => copyToClipboard(key)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        {copiedKey === key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBulkGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Quantity</label>
                    <input
                      type="number" min="1" max="500" value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Duration (Months)</label>
                    <input
                      type="number" min="1" max="120" value={durationMonths}
                      onChange={(e) => setDurationMonths(parseInt(e.target.value, 10) || 12)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Assign to Organisation (Optional)</label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None (Standalone Distribution)</option>
                    {organisations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Licence Type</label>
                  <select
                    value={licenceType}
                    onChange={(e: any) => setLicenceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="free">Free Grant / Sponsored</option>
                    <option value="paid">Paid Purchase</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="w-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Keys'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Create Organisation */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-display">Create Organisation</h3>
            <p className="text-slate-500 text-xs mb-6">Add an enterprise or school entity to group licence keys.</p>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Organisation Name</label>
                <input
                  type="text"
                  placeholder="e.g. Oakridge Academy"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingOrg}
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center"
                >
                  {creatingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
