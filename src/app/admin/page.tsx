'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, BookOpen, Settings, Tag, PlusCircle, Loader,
  Trash2, CheckCircle, AlertTriangle, Link2, ExternalLink,
  Layout, LogOut, DollarSign, Users, FileText, Gift, Plus, Edit, Layers
} from 'lucide-react';
import LicenceManager from './LicenceManager';

export default function AdminConsole() {
  const supabase = createClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'plans' | 'settings' | 'coupons' | 'licenses' | 'codes' | 'students' | 'taxonomy'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [role, setRole] = useState<'super_admin' | 'school_admin' | null>(null);

  // School Admin States
  const [license, setLicense] = useState<any>(null);
  const [schoolCodes, setSchoolCodes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(10);

  // Super Admin States
  const [globalLicenses, setGlobalLicenses] = useState<any[]>([]);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolSeats, setNewSchoolSeats] = useState(100);
  const [newSchoolDurationMonths, setNewSchoolDurationMonths] = useState(12);

  // Super Admin Taxonomy States
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [contentTypes, setContentTypes] = useState<any[]>([]);

  // Taxonomy Modal States
  const [isTaxonomyModalOpen, setIsTaxonomyModalOpen] = useState(false);
  const [taxonomyModalType, setTaxonomyModalType] = useState<'board' | 'class' | 'subject' | 'content-type'>('board');
  const [editingTaxonomyItem, setEditingTaxonomyItem] = useState<any>(null);
  const [isNewTaxonomyItem, setIsNewTaxonomyItem] = useState(true);

  // Note-Taxonomy Modal States (for linking boards/classes/subjects to notes)
  const [isNoteTaxonomyModalOpen, setIsNoteTaxonomyModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [activeNoteTaxonomy, setActiveNoteTaxonomy] = useState<any[]>([]);
  const [activeNoteContentTypes, setActiveNoteContentTypes] = useState<any[]>([]);

  const [linkBoardIds, setLinkBoardIds] = useState<string[]>([]);
  const [linkClassIds, setLinkClassIds] = useState<string[]>([]);
  const [linkSubjectIds, setLinkSubjectIds] = useState<string[]>([]);

  const [linkAllBoards, setLinkAllBoards] = useState(true);
  const [linkAllClasses, setLinkAllClasses] = useState(true);
  const [linkAllSubjects, setLinkAllSubjects] = useState(true);

  // Edit Note Modal States
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editingNoteData, setEditingNoteData] = useState<{ id: string; title: string; description: string; is_demo: boolean } | null>(null);
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);

  // Delete Note Confirmation Modal States
  const [isDeleteNoteModalOpen, setIsDeleteNoteModalOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState<any>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Data States
  const [notes, setNotes] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Settings States
  const [pricing, setPricing] = useState<any>({
    plans: [],
    tax_mode: 'domestic_only',
    tax_percent: 18,
    intl_fee_percent: 3.0,
    domestic_country: 'IN'
  });

  // Plans Modal States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [downloads, setDownloads] = useState({
    android: '',
    macos: '',
    windows: ''
  });

  // KPI Dashboard Metrics State
  const [metrics, setMetrics] = useState({
    notesCount: 0,
    couponsCount: 0,
    subscribersCount: 0,
    estimatedMRR: 0,
    recentSignups: [] as any[]
  });

  // New Coupon Form States
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState(20);
  const [newCouponExpiry, setNewCouponExpiry] = useState('');
  const [newCouponMinAmount, setNewCouponMinAmount] = useState('');
  const [newCouponEligiblePlans, setNewCouponEligiblePlans] = useState<string[]>([]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // 0. Verify Session & set email
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/admin/login');
        return;
      }
      setAdminEmail(session.user.email ?? null);

      // Fetch user profile to check role
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileErr || !profile || (profile.role !== 'super_admin' && profile.role !== 'school_admin')) {
        // Not an authorized admin, kick to home
        router.push('/');
        return;
      }

      const userRole = profile.role as 'super_admin' | 'school_admin';
      setRole(userRole);

      if (userRole === 'super_admin') {
        // Load Super Admin global data
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
        let taxMode = 'domestic_only';
        let intlFeePercent = 3.0;
        let domesticCountry = 'IN';

        if (dbSettings) {
          const pricingRow = dbSettings.find(s => s.key === 'pricing');
          if (pricingRow && pricingRow.value) {
            taxPercent = typeof pricingRow.value.tax_percent === 'number' ? pricingRow.value.tax_percent : 18;
            taxMode = pricingRow.value.tax_mode || 'domestic_only';
            intlFeePercent = typeof pricingRow.value.intl_fee_percent === 'number' ? pricingRow.value.intl_fee_percent : 3.0;
            domesticCountry = pricingRow.value.domestic_country || 'IN';
          }

          const downloadsRow = dbSettings.find(s => s.key === 'downloads');
          if (downloadsRow) setDownloads(downloadsRow.value);
        }

        setPricing({
          plans: dbPlans || [],
          tax_mode: taxMode,
          tax_percent: taxPercent,
          intl_fee_percent: intlFeePercent,
          domestic_country: domesticCountry,
        });

        // 4. Fetch metrics
        const metRes = await fetch('/api/admin/metrics');
        const metData = await metRes.json();
        if (!metData.error) {
          setMetrics(metData);
        }

        // 5. Fetch global licenses
        const resLic = await fetch('/api/super/licenses');
        const dataLic = await resLic.json();
        setGlobalLicenses(dataLic.licenses || []);

        // 6. Fetch taxonomy options
        const resTax = await fetch('/api/flutter/taxonomy');
        const dataTax = await resTax.json();
        setBoards(dataTax.boards || []);
        setClasses(dataTax.classes || []);
        setSubjects(dataTax.subjects || []);
        setContentTypes(dataTax.content_types || []);
      }
      else if (userRole === 'school_admin') {
        // Load School Admin local data
        // 1. Fetch school license details
        const resLic = await fetch('/api/admin/license');
        const dataLic = await resLic.json();
        setLicense(dataLic.license);

        // 2. Fetch generated codes
        const resCodes = await fetch('/api/admin/codes');
        const dataCodes = await resCodes.json();
        setSchoolCodes(dataCodes.codes || []);

        // 3. Fetch active student list
        const resStud = await fetch('/api/admin/students');
        const dataStud = await resStud.json();
        setStudents(dataStud.students || []);

        // Default school admin to school dashboard tab
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const getTestLink = (noteId: string) => {
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
      // Refresh metrics count
      const metRes = await fetch('/api/admin/metrics');
      const metData = await metRes.json();
      if (!metData.error) setMetrics(metData);

      setMessage({ type: 'success', text: `Demo access updated.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to toggle demo status' });
    }
  };

  // Handle Save Note Edit
  const handleSaveNoteEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteData || !editingNoteData.title.trim()) return;

    setIsUpdatingNote(true);
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: editingNoteData.id,
          title: editingNoteData.title,
          description: editingNoteData.description,
          isDemo: editingNoteData.is_demo,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setNotes(notes.map((n) => (n.id === editingNoteData.id ? { ...n, ...data.note } : n)));
      setMessage({ type: 'success', text: `Lesson "${editingNoteData.title}" updated successfully.` });
      setIsEditNoteModalOpen(false);
      setEditingNoteData(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update lesson' });
    } finally {
      setIsUpdatingNote(false);
    }
  };

  // Handle Delete Note
  const handleConfirmDeleteNote = async () => {
    if (!deletingNote) return;

    setIsDeletingNote(true);
    try {
      const res = await fetch(`/api/admin/notes?id=${deletingNote.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setNotes(notes.filter((n) => n.id !== deletingNote.id));
      setMessage({ type: 'success', text: `Lesson "${deletingNote.title}" deleted successfully.` });
      setIsDeleteNoteModalOpen(false);
      setDeletingNote(null);

      // Refresh metrics
      const metRes = await fetch('/api/admin/metrics');
      const metData = await metRes.json();
      if (!metData.error) setMetrics(metData);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete lesson' });
    } finally {
      setIsDeletingNote(false);
    }
  };

  // Save Plan modal handler (creates or updates a plan and saves to DB)
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    if (isNewPlan && !editingPlan.id.trim()) {
      setMessage({ type: 'error', text: 'Plan ID is required for new plans.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let updatedPlans = [];
      if (isNewPlan) {
        // Check for duplicate ID
        if (pricing.plans.some((p: any) => p.id.toLowerCase() === editingPlan.id.trim().toLowerCase())) {
          throw new Error(`Plan with ID '${editingPlan.id}' already exists.`);
        }
        updatedPlans = [...pricing.plans, { ...editingPlan, id: editingPlan.id.trim() }];
      } else {
        updatedPlans = pricing.plans.map((p: any) => p.id === editingPlan.id ? editingPlan : p);
      }

      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: updatedPlans })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setPricing({ ...pricing, plans: updatedPlans });
      setIsPlanModalOpen(false);
      setEditingPlan(null);
      setMessage({ type: 'success', text: `Plan '${editingPlan.name}' saved successfully.` });

      // Reload administrative console stats/metrics
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save subscription plan' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Plan handler (deletes plan from local state and DB)
  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${planName}"?`)) return;

    setSaving(true);
    setMessage(null);

    try {
      const updatedPlans = pricing.plans.filter((p: any) => p.id !== planId);
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: updatedPlans })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setPricing({ ...pricing, plans: updatedPlans });
      setMessage({ type: 'success', text: `Plan '${planName}' deleted.` });

      // Reload administrative console stats/metrics
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete plan' });
    } finally {
      setSaving(false);
    }
  };

  // Taxonomy CRUD handlers
  const handleSaveTaxonomyItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaxonomyItem) return;

    setSaving(true);
    setMessage(null);

    let apiPath = `/api/super/${taxonomyModalType}s`;
    if (taxonomyModalType === 'class') {
      apiPath = '/api/super/classes';
    } else if (taxonomyModalType === 'content-type') {
      apiPath = '/api/super/content-types';
    }
    const method = isNewTaxonomyItem ? 'POST' : 'PUT';

    try {
      const payload: Record<string, any> = {
        name: editingTaxonomyItem.name,
        slug: editingTaxonomyItem.slug,
        sort_order: parseInt(editingTaxonomyItem.sort_order, 10) || 0,
      };

      if (!isNewTaxonomyItem) {
        payload.id = editingTaxonomyItem.id;
      }

      if (taxonomyModalType === 'subject' || taxonomyModalType === 'content-type') {
        payload.icon_emoji = editingTaxonomyItem.icon_emoji || '📘';
      }

      if (taxonomyModalType === 'content-type') {
        payload.color_hex = editingTaxonomyItem.color_hex || '#6C63FF';
      }

      const res = await fetch(apiPath, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Refresh list
      const resTax = await fetch('/api/flutter/taxonomy');
      const dataTax = await resTax.json();
      setBoards(dataTax.boards || []);
      setClasses(dataTax.classes || []);
      setSubjects(dataTax.subjects || []);
      setContentTypes(dataTax.content_types || []);

      setIsTaxonomyModalOpen(false);
      setEditingTaxonomyItem(null);
      setMessage({ type: 'success', text: `Taxonomy item saved successfully.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save taxonomy item' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTaxonomyItem = async (type: 'board' | 'class' | 'subject' | 'content-type', id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${type} "${name}"?`)) return;

    setSaving(true);
    setMessage(null);

    let apiPath = `/api/super/${type}s`;
    if (type === 'class') {
      apiPath = '/api/super/classes';
    } else if (type === 'content-type') {
      apiPath = '/api/super/content-types';
    }

    try {
      const res = await fetch(`${apiPath}?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Refresh lists
      const resTax = await fetch('/api/flutter/taxonomy');
      const dataTax = await resTax.json();
      setBoards(dataTax.boards || []);
      setClasses(dataTax.classes || []);
      setSubjects(dataTax.subjects || []);
      setContentTypes(dataTax.content_types || []);

      setMessage({ type: 'success', text: `${type} deleted successfully.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || `Failed to delete ${type}` });
    } finally {
      setSaving(false);
    }
  };

  // Note-Taxonomy Linkage handlers
  const handleOpenNoteTaxonomyModal = async (note: any) => {
    setActiveNote(note);
    setIsNoteTaxonomyModalOpen(true);
    setMessage(null);
    setLinkBoardIds([]);
    setLinkClassIds([]);
    setLinkSubjectIds([]);
    setLinkAllBoards(true);
    setLinkAllClasses(true);
    setLinkAllSubjects(true);
    try {
      const res = await fetch(`/api/super/notes/${note.id}/taxonomy`);
      const data = await res.json();
      setActiveNoteTaxonomy(data.taxonomy || []);

      const resCt = await fetch(`/api/super/notes/${note.id}/content-types`);
      const dataCt = await resCt.json();
      setActiveNoteContentTypes(dataCt.content_types || []);
    } catch (err) {
      console.error('Failed to load note taxonomy associations', err);
    }
  };

  const handleLinkContentType = async (contentTypeId: string) => {
    if (!activeNote) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/super/notes/${activeNote.id}/content-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type_id: contentTypeId })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Refresh list
      const resCt = await fetch(`/api/super/notes/${activeNote.id}/content-types`);
      const dataCt = await resCt.json();
      setActiveNoteContentTypes(dataCt.content_types || []);
      setMessage({ type: 'success', text: 'Content type linked successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to link content type' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkContentType = async (contentTypeId: string) => {
    if (!activeNote) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/super/notes/${activeNote.id}/content-types?content_type_id=${contentTypeId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Refresh list
      const resCt = await fetch(`/api/super/notes/${activeNote.id}/content-types`);
      const dataCt = await resCt.json();
      setActiveNoteContentTypes(dataCt.content_types || []);
      setMessage({ type: 'success', text: 'Content type unlinked.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to unlink content type' });
    } finally {
      setSaving(false);
    }
  };

  const handleLinkNoteTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote) return;

    setSaving(true);
    setMessage(null);

    const finalBoardIds = linkAllBoards ? [] : linkBoardIds;
    const finalClassIds = linkAllClasses ? [] : linkClassIds;
    const finalSubjectIds = linkAllSubjects ? [] : linkSubjectIds;

    try {
      const res = await fetch(`/api/super/notes/${activeNote.id}/taxonomy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_ids: finalBoardIds,
          class_ids: finalClassIds,
          subject_ids: finalSubjectIds
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Reload assigned list
      const resTax = await fetch(`/api/super/notes/${activeNote.id}/taxonomy`);
      const dataTax = await resTax.json();
      setActiveNoteTaxonomy(dataTax.taxonomy || []);

      setLinkBoardIds([]);
      setLinkClassIds([]);
      setLinkSubjectIds([]);
      setLinkAllBoards(true);
      setLinkAllClasses(true);
      setLinkAllSubjects(true);
      setMessage({ type: 'success', text: 'Categories linked to lecture successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add taxonomy mapping' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkNoteTaxonomy = async (tagId: string) => {
    if (!activeNote) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/super/notes/${activeNote.id}/taxonomy?tag_id=${tagId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Reload assigned list
      const resTax = await fetch(`/api/super/notes/${activeNote.id}/taxonomy`);
      const dataTax = await resTax.json();
      setActiveNoteTaxonomy(dataTax.taxonomy || []);

      setMessage({ type: 'success', text: 'Category mapping removed.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete taxonomy mapping' });
    } finally {
      setSaving(false);
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

      // Save Tax & Jurisdiction settings via secure settings API
      const resTax = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'pricing',
          value: {
            tax_mode: pricing.tax_mode || 'domestic_only',
            tax_percent: Number(pricing.tax_percent ?? 18),
            intl_fee_percent: Number(pricing.intl_fee_percent ?? 3.0),
            domestic_country: (pricing.domestic_country || 'IN').toUpperCase(),
          }
        })
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
      loadAdminData();
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
      loadAdminData();
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
      loadAdminData();
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
      setMessage({ type: 'success', text: `Coupon '${code}' deleted.` });
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete coupon' });
    }
  };

  // Add School Admin
  const handleAddSchoolAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/super/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          schoolName: newSchoolName,
          totalSeats: newSchoolSeats,
          durationMonths: newSchoolDurationMonths
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message || 'Successfully created school admin!' });
      setIsSchoolModalOpen(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewSchoolName('');
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create school admin' });
    } finally {
      setSaving(false);
    }
  };

  // Create Access Code
  const handleCreateAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCodeName,
          maxUses: newCodeMaxUses
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage({ type: 'success', text: 'Successfully generated new access code!' });
      setIsCodeModalOpen(false);
      setNewCodeName('');
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create access code' });
    } finally {
      setSaving(false);
    }
  };

  // Revoke Student Seat
  const handleRevokeStudentSeat = async (membershipId: string) => {
    if (!confirm('Are you sure you want to revoke this student seat? They will lose premium access immediately.')) return;
    try {
      const res = await fetch(`/api/admin/students?membershipId=${membershipId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage({ type: 'success', text: 'Student seat membership revoked successfully.' });
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to revoke student seat' });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 mt-3">Loading administrator workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">

      {/* LEFT SIDE DRAWER / SIDEBAR PANEL */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between sticky top-0 h-screen z-20 shrink-0">

        {/* Upper Menu block */}
        <div className="p-6 space-y-8">

          {/* Dashboard Logo Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block font-display">Keeelai Admin</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mt-0.5">Control Center</span>
            </div>
          </div>

          {/* Navigation Drawer Menu items */}
          <nav className="space-y-1">
            {role === 'super_admin' ? (
              // Super Admin Sidebar Navigation
              [
                { id: 'dashboard', label: 'Dashboard', icon: <Layout className="w-4 h-4" /> },
                { id: 'licenses', label: 'School Licenses', icon: <ShieldCheck className="w-4 h-4" /> },
                { id: 'notes', label: 'Interactive Lectures', icon: <BookOpen className="w-4 h-4" /> },
                { id: 'plans', label: 'Subscription Plans', icon: <DollarSign className="w-4 h-4" /> },
                { id: 'coupons', label: 'Coupon Codes', icon: <Tag className="w-4 h-4" /> },
                { id: 'settings', label: 'System Configs', icon: <Settings className="w-4 h-4" /> },
                { id: 'taxonomy', label: 'Taxonomy Data', icon: <Layers className="w-4 h-4" /> }
              ].map((menuItem) => (
                <button
                  key={menuItem.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(menuItem.id as any);
                    setMessage(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === menuItem.id
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  {menuItem.icon}
                  <span>{menuItem.label}</span>
                </button>
              ))
            ) : role === 'school_admin' ? (
              // School Admin Sidebar Navigation
              [
                { id: 'dashboard', label: 'School License', icon: <Layout className="w-4 h-4" /> },
                { id: 'codes', label: 'Access Codes', icon: <Tag className="w-4 h-4" /> },
                { id: 'students', label: 'Student Seats', icon: <Users className="w-4 h-4" /> }
              ].map((menuItem) => (
                <button
                  key={menuItem.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(menuItem.id as any);
                    setMessage(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === menuItem.id
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  {menuItem.icon}
                  <span>{menuItem.label}</span>
                </button>
              ))
            ) : null}
          </nav>

        </div>

        {/* User Session profile panel */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="px-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Logged in as</span>
            <span className="text-xs font-semibold text-slate-700 truncate block mt-0.5" title={adminEmail || ''}>
              {adminEmail || 'admin@keeelai.com'}
            </span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1 block">
              {role === 'super_admin' ? 'Super Admin' : 'School Admin'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* RIGHT SIDE MAIN CONTENT PANEL */}
      <main className="flex-1 overflow-y-auto p-8 relative flex flex-col justify-between">

        <div className="space-y-8">

          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
            <div>
              <span className="text-xs text-slate-455 font-semibold uppercase tracking-wider">Console / {activeTab}</span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1 capitalize font-display">
                {role === 'super_admin' ? (
                  activeTab === 'notes'
                    ? 'Interactive Lectures'
                    : activeTab === 'plans'
                      ? 'Subscription Plans'
                      : activeTab === 'settings'
                        ? 'System Configurations'
                        : activeTab === 'coupons'
                          ? 'Coupon Manager'
                          : activeTab === 'licenses'
                            ? 'School Licenses Control'
                            : 'Global Dashboard Metrics'
                ) : (
                  activeTab === 'codes'
                    ? 'School Access Codes'
                    : activeTab === 'students'
                      ? 'Enrolled Students'
                      : 'School License Summary'
                )}
              </h1>
            </div>
            {role === 'super_admin' && activeTab === 'notes' && (
              <Link
                href="/admin/upload"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Lecture</span>
              </Link>
            )}
          </div>

          {/* Feedback alerts */}
          {message && (
            <div className={`p-4 rounded-xl border text-sm font-semibold flex items-start gap-2.5 ${message.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* VIEW CONTENT RENDERERS */}

          {/* TAB: DASHBOARD METRICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    label: 'Estimated MRR',
                    val: `$${metrics.estimatedMRR.toFixed(2)}`,
                    desc: 'Monthly estimate',
                    color: 'bg-blue-600',
                    icon: <DollarSign className="w-5 h-5 text-white" />
                  },
                  {
                    label: 'Total Revenue (USD)',
                    val: `$${((metrics as any).totalRevenueUsd || 0).toFixed(2)}`,
                    desc: 'Sum of USD transactions',
                    color: 'bg-indigo-650',
                    icon: <DollarSign className="w-5 h-5 text-white" />
                  },
                  {
                    label: 'Total Revenue (INR)',
                    val: `₹${((metrics as any).totalRevenueInr || 0).toLocaleString()}`,
                    desc: 'Sum of INR transactions',
                    color: 'bg-emerald-600',
                    icon: <DollarSign className="w-5 h-5 text-white" />
                  },
                  {
                    label: 'Active Subscribers',
                    val: metrics.subscribersCount.toString(),
                    desc: 'Premium memberships',
                    color: 'bg-sky-500',
                    icon: <Users className="w-5 h-5 text-white" />
                  },
                  {
                    label: 'Lectures Uploaded',
                    val: metrics.notesCount.toString(),
                    desc: 'Total HTML files',
                    color: 'bg-violet-500',
                    icon: <FileText className="w-5 h-5 text-white" />
                  },
                  {
                    label: 'Active Coupons',
                    val: metrics.couponsCount.toString(),
                    desc: 'Coupons in circulation',
                    color: 'bg-amber-500',
                    icon: <Gift className="w-5 h-5 text-white" />
                  }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{kpi.label}</span>
                      <span className="text-2xl font-extrabold text-slate-900 block font-display">{kpi.val}</span>
                      <span className="text-[11px] text-slate-500 block">{kpi.desc}</span>
                    </div>
                    <div className={`w-11 h-11 rounded-xl ${kpi.color} flex items-center justify-center shadow-md shadow-slate-200/50`}>
                      {kpi.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-grid section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Registrations Table (Operational View) */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 font-display">Recent Registrations</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">User Email</th>
                          <th className="pb-3">Date Joined</th>
                          <th className="pb-3 text-right">Subscription</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.recentSignups.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-slate-450">No users registered yet.</td>
                          </tr>
                        ) : (
                          metrics.recentSignups.map((signup: any, sIdx: number) => (
                            <tr key={sIdx} className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 font-semibold text-slate-800">{signup.email}</td>
                              <td className="py-3.5 text-slate-500">
                                {new Date(signup.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${signup.web_subscription_active
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                                  }`}>
                                  {signup.web_subscription_active ? 'Premium' : 'Free Account'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dashboard Summary Guide */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 font-display">Platform Status</h3>
                  <div className="space-y-4 text-xs leading-relaxed text-slate-650">
                    <p>
                      Keeelai is currently operating normally. Payments are routed through Razorpay and dynamic streaming is serving HTML files.
                    </p>
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">Razorpay Hook: Connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">Private Storage Bucket: Active</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Transactions Log Table (KPI and Auditing Purpose) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-display">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Payment ID</th>
                        <th className="pb-3">User Email</th>
                        <th className="pb-3">Plan</th>
                        <th className="pb-3">Coupon</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!((metrics as any).recentTransactions) || ((metrics as any).recentTransactions).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-450">No transactions recorded yet.</td>
                        </tr>
                      ) : (
                        ((metrics as any).recentTransactions).map((tx: any) => (
                          <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 font-semibold text-slate-900 font-mono">{tx.razorpay_payment_id}</td>
                            <td className="py-3 text-slate-650">{tx.user_email}</td>
                            <td className="py-3 text-slate-800 font-semibold">{tx.plan_id}</td>
                            <td className="py-3 text-slate-500">
                              {tx.coupon_code ? (
                                <span className="bg-blue-55 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                  {tx.coupon_code}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-3 font-bold text-slate-900">
                              {tx.currency === 'INR' ? '₹' : '$'}{Number(tx.amount_paid).toFixed(tx.currency === 'INR' ? 0 : 2)}
                            </td>
                            <td className="py-3 text-slate-500">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 text-right">
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                {tx.status}
                              </span>
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

          {/* TAB: LECTURES LIST */}
          {activeTab === 'notes' && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200/80 p-12 text-center rounded-2xl shadow-sm">
                  <p className="text-slate-500 font-semibold text-lg">No notes found.</p>
                  <p className="text-slate-400 text-xs mt-1">Upload your first interactive lecture file above.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-slate-900 text-base line-clamp-1 flex-1 font-display">{note.title}</h3>
                        {note.is_demo && (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed min-h-[36px]">
                        {note.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Uploaded: {new Date(note.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={getTestLink(note.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-600 font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Test Link</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => toggleNoteDemo(note.id, note.is_demo)}
                            className={`border font-bold py-2 px-2.5 rounded-lg text-xs transition-colors ${note.is_demo
                                ? 'border-emerald-250 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                              }`}
                          >
                            {note.is_demo ? 'Disable Demo' : 'Make Demo'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteData({
                                id: note.id,
                                title: note.title,
                                description: note.description || '',
                                is_demo: note.is_demo || false,
                              });
                              setIsEditNoteModalOpen(true);
                            }}
                            className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-600 font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                            <span>Edit Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingNote(note);
                              setIsDeleteNoteModalOpen(true);
                            }}
                            className="bg-rose-50/70 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenNoteTaxonomyModal(note)}
                          className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-650 font-bold py-2 px-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>Categorization Mapping</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

          {/* TAB: SUBSCRIPTION PLANS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Manage Subscription Plans</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Configure available purchase options displayed to students during checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan({
                      id: '',
                      name: '',
                      duration_months: 1,
                      price_usd: 19.99,
                      discount_percent: 0,
                      subtext: ''
                    });
                    setIsNewPlan(true);
                    setIsPlanModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Plan</span>
                </button>
              </div>

              {/* Plans Card Grid */}
              {(!pricing.plans || pricing.plans.length === 0) ? (
                <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-sm">
                  <p className="text-slate-550 font-semibold">No subscription plans found.</p>
                  <p className="text-slate-400 text-xs mt-1">Create one to enable premium access pricing options.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pricing.plans.map((plan: any) => (
                    <div
                      key={plan.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 shadow-sm relative overflow-hidden"
                    >
                      {/* Top Bar with Plan Identifier and Edit/Delete controls */}
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">ID: {plan.id}</span>
                          <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {plan.duration_months} {plan.duration_months === 1 ? 'Month' : 'Months'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlan({ ...plan });
                              setIsNewPlan(false);
                              setIsPlanModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-550 hover:text-blue-600 rounded-lg border border-slate-150 transition-colors cursor-pointer"
                            title="Edit Plan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlan(plan.id, plan.name)}
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-550 hover:text-rose-600 rounded-lg border border-slate-150 transition-colors cursor-pointer"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content body */}
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-slate-900 text-lg leading-tight font-display line-clamp-1" title={plan.name}>
                            {plan.name}
                          </h4>
                          {plan.subtext && (
                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                              {plan.subtext}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 flex items-baseline gap-2 border-t border-slate-100 mt-4">
                          <span className="text-3xl font-black text-slate-900 font-display">
                            ${Number(plan.price_usd).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            USD
                          </span>
                          {plan.discount_percent > 0 && (
                            <span className="ml-auto bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                              {plan.discount_percent}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Dashed Add New Plan Card Placeholder */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlan({
                        id: '',
                        name: '',
                        duration_months: 1,
                        price_usd: 19.99,
                        discount_percent: 0,
                        subtext: ''
                      });
                      setIsNewPlan(true);
                      setIsPlanModalOpen(true);
                    }}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[190px] text-center gap-3 transition-all cursor-pointer group group-hover:scale-98"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-450 group-hover:text-blue-600 transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">Add New Plan Option</span>
                      <span className="text-xs text-slate-450 block mt-0.5">Click here to define a custom subscription.</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Plans Editing overlay Modal */}
              {isPlanModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-6 zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 font-display">
                          {isNewPlan ? 'Create Subscription Plan' : 'Edit Plan Details'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Enter details to update plan configuration.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlanModalOpen(false);
                          setEditingPlan(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors p-1"
                      >
                        &times;
                      </button>
                    </div>

                    <form onSubmit={handleSavePlan} className="space-y-4">
                      {/* Plan ID Input */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">Plan ID</label>
                        <input
                          type="text"
                          placeholder="e.g. 3m, yearly_pro"
                          value={editingPlan?.id || ''}
                          onChange={(e) => {
                            if (isNewPlan) {
                              setEditingPlan({ ...editingPlan, id: e.target.value });
                            }
                          }}
                          required
                          disabled={!isNewPlan}
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${isNewPlan
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-slate-100 border-slate-200 text-slate-450 cursor-not-allowed font-mono'
                            }`}
                        />
                        {isNewPlan && (
                          <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                            Unique URL key/db index (e.g. "3m", "annual"). Cannot be changed once created.
                          </span>
                        )}
                      </div>

                      {/* Plan Name */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">Plan Name</label>
                        <input
                          type="text"
                          placeholder="e.g. 3 Months Pro Plan"
                          value={editingPlan?.name || ''}
                          onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {/* Duration */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">Duration (Months)</label>
                          <input
                            type="number"
                            min="1"
                            value={editingPlan?.duration_months || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, duration_months: parseInt(e.target.value, 10) || 1 })}
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* Price (USD) */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">Intl. Price (USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingPlan?.price_usd || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, price_usd: parseFloat(e.target.value) || 0 })}
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* Price (INR) */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">India Price (INR)</label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="e.g. 990"
                            value={editingPlan?.price_inr ?? ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, price_inr: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Discount */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">Discount (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingPlan?.discount_percent || 0}
                            onChange={(e) => setEditingPlan({ ...editingPlan, discount_percent: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* Description Subtext */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">Subtext / Desc</label>
                          <input
                            type="text"
                            placeholder="e.g. Best offer value"
                            value={editingPlan?.subtext || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, subtext: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPlanModalOpen(false);
                            setEditingPlan(null);
                          }}
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                        >
                          {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <span>Save Plan</span>}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8 max-w-4xl">

              {/* Jurisdiction, Tax & International Fee Config Section */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 font-display">Jurisdiction & Tax Configuration</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure tax rules, international processing fees, and home country ISO settings.</p>
                </div>

                {/* Tax Applicability Mode */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tax Applicability Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      pricing.tax_mode === 'domestic_only'
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs">Domestic (India) Only</span>
                        <input
                          type="radio"
                          name="tax_mode"
                          value="domestic_only"
                          checked={pricing.tax_mode === 'domestic_only'}
                          onChange={() => setPricing({ ...pricing, tax_mode: 'domestic_only' })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500/20"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 leading-normal">
                        Apply tax rate to domestic buyers only. International exports are 0% tax exempt.
                      </span>
                    </label>

                    <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      pricing.tax_mode === 'all'
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs">All Transactions</span>
                        <input
                          type="radio"
                          name="tax_mode"
                          value="all"
                          checked={pricing.tax_mode === 'all'}
                          onChange={() => setPricing({ ...pricing, tax_mode: 'all' })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500/20"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 leading-normal">
                        Apply standard tax rate globally to all buyers regardless of location.
                      </span>
                    </label>

                    <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      pricing.tax_mode === 'per_country'
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs">Per-Country Rates</span>
                        <input
                          type="radio"
                          name="tax_mode"
                          value="per_country"
                          checked={pricing.tax_mode === 'per_country'}
                          onChange={() => setPricing({ ...pricing, tax_mode: 'per_country' })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500/20"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 leading-normal">
                        Apply custom tax rates configured individually per country ISO code.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Tax Rate, Intl Fee %, Domestic Country inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={pricing.tax_percent}
                      onChange={(e) => setPricing({ ...pricing, tax_percent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Standard GST/VAT rate (e.g. 18%)</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Intl. Processing Fee (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={pricing.intl_fee_percent}
                      onChange={(e) => setPricing({ ...pricing, intl_fee_percent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Cross-border gateway fee (e.g. 3.0%)</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Domestic Country ISO Code
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={pricing.domestic_country}
                      onChange={(e) => setPricing({ ...pricing, domestic_country: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-semibold uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Home country ISO code (e.g. IN)</span>
                  </div>
                </div>
              </div>

              {/* App Downloads links */}
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <h3 className="text-base font-bold text-slate-900 font-display border-b border-slate-100 pb-2">Client App Downloads</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Android (Play Store URL)</label>
                    <input
                      type="url"
                      value={downloads.android}
                      onChange={(e) => setDownloads({ ...downloads, android: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">macOS (.dmg URL)</label>
                    <input
                      type="url"
                      value={downloads.macos}
                      onChange={(e) => setDownloads({ ...downloads, macos: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Windows Installer (.exe URL)</label>
                    <input
                      type="url"
                      value={downloads.windows}
                      onChange={(e) => setDownloads({ ...downloads, windows: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer text-xs"
              >
                {saving ? <Loader className="w-5 h-5 animate-spin" /> : <span>Save Configurations</span>}
              </button>
            </form>
          )}

          {/* TAB: COUPON MANAGEMENT */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Create Coupon Box */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  <span>Create Coupon</span>
                </h3>
                <form onSubmit={handleAddCoupon} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider mb-2">Coupon Code</label>
                    <input
                      type="text"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      placeholder="e.g. SAVE20"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider mb-2">Discount (%)</label>
                    <input
                      type="number" min="1" max="100"
                      value={newCouponPercent}
                      onChange={(e) => setNewCouponPercent(parseInt(e.target.value, 10) || 0)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider mb-2">Minimum Order Amount (USD, Optional)</label>
                    <input
                      type="number" step="0.01" min="0"
                      value={newCouponMinAmount}
                      onChange={(e) => setNewCouponMinAmount(e.target.value)}
                      placeholder="e.g. 50.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider mb-2">Eligible Plans (Optional, defaults to all)</label>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {pricing.plans.map((plan: any) => (
                        <label key={plan.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
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
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                          />
                          <span>{plan.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={newCouponExpiry}
                      onChange={(e) => setNewCouponExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
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
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
                  <Tag className="w-5 h-5 text-slate-400" />
                  <span>Existing Coupons</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
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
                          <td colSpan={7} className="py-6 text-center text-slate-400">No coupon codes active.</td>
                        </tr>
                      ) : (
                        coupons.map((coupon) => (
                          <tr key={coupon.code} className="border-b border-slate-100 hover:bg-slate-55/50 transition-colors">
                            <td className="py-3.5 font-bold text-slate-900 uppercase">{coupon.code}</td>
                            <td className="py-3.5 text-blue-600 font-bold">{coupon.discount_percent}% Off</td>
                            <td className="py-3.5 text-slate-600">
                              {coupon.min_order_amount !== null && coupon.min_order_amount !== undefined
                                ? `$${Number(coupon.min_order_amount).toFixed(2)}`
                                : 'None'}
                            </td>
                            <td className="py-3.5 text-slate-650 max-w-[150px] truncate" title={
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
                            <td className="py-3.5 text-slate-500">
                              {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${coupon.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                {coupon.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => toggleCoupon(coupon.code, coupon.active)}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
                              >
                                Toggle
                              </button>
                              <button
                                onClick={() => deleteCoupon(coupon.code)}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-500 border border-rose-100 px-2 py-1 rounded hover:bg-rose-50"
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

          {/* TAB: LICENCE MANAGEMENT (Super Admin Only) */}
          {role === 'super_admin' && activeTab === 'licenses' && (
            <LicenceManager />
          )}

          {/* TAB: ACCESS CODES (School Admin Only) */}
          {role === 'school_admin' && activeTab === 'codes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">School Access Codes</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Generate codes for students to unlock premium simulated visual modules.</p>
                </div>
                <button
                  onClick={() => setIsCodeModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Access Code</span>
                </button>
              </div>

              {/* License Status Card */}
              {license && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">School Name</span>
                    <span className="text-sm font-extrabold text-slate-900 block mt-1">{license.school_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seat License Quota</span>
                    <span className="text-sm font-extrabold text-slate-900 block mt-1">
                      <span className="text-blue-600">{license.used_seats}</span> / {license.total_seats} Seats Occupied
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">License Expiration</span>
                    <span className="text-sm font-extrabold text-slate-900 block mt-1">
                      {new Date(license.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Codes list */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Access Code</th>
                        <th className="pb-3">Redemption Usage Limit</th>
                        <th className="pb-3">Enrollments Created</th>
                        <th className="pb-3">Created On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolCodes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">No school access codes generated yet.</td>
                        </tr>
                      ) : (
                        schoolCodes.map((c: any) => (
                          <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 font-bold text-slate-900 uppercase tracking-wider text-sm text-blue-600">{c.code}</td>
                            <td className="py-3.5 text-slate-600 font-semibold">{c.max_uses} max enrollments</td>
                            <td className="py-3.5 font-bold text-slate-700">
                              {c.current_uses} / {c.max_uses} Redeemed
                            </td>
                            <td className="py-3.5 text-slate-500">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MODAL: Generate Code */}
              {isCodeModalOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 rounded-3xl p-7 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">Generate School Access Code</h3>
                    <p className="text-slate-500 text-xs mb-6">Create a code students can redeem to claim a seat on your license.</p>

                    <form onSubmit={handleCreateAccessCode} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider mb-2">Access Code text</label>
                        <input
                          type="text" required
                          value={newCodeName}
                          onChange={(e) => setNewCodeName(e.target.value)}
                          placeholder="e.g. OAKRIDGE-STEM-2026"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider mb-2">Max Uses (Student Seats)</label>
                        <input
                          type="number" required min={1}
                          value={newCodeMaxUses}
                          onChange={(e) => setNewCodeMaxUses(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsCodeModalOpen(false)}
                          className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer"
                        >
                          {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Generate Code'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: STUDENT SEATS (School Admin Only) */}
          {role === 'school_admin' && activeTab === 'students' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Student Seat Registrations</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Manage students currently using seats under your school license. Revoking a seat will revert their account to free tier access.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Student Email</th>
                        <th className="pb-3">Code Redeemed</th>
                        <th className="pb-3">Date Joined</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">No students currently enrolled in school seats.</td>
                        </tr>
                      ) : (
                        students.map((student: any) => (
                          <tr key={student.membershipId} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 font-bold text-slate-900">{student.email}</td>
                            <td className="py-3.5 text-blue-600 font-semibold uppercase">{student.code}</td>
                            <td className="py-3.5 text-slate-500">
                              {new Date(student.joinedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => handleRevokeStudentSeat(student.membershipId)}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-500 border border-rose-100 px-2 py-1 rounded hover:bg-rose-50 cursor-pointer"
                              >
                                Revoke Seat
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

          {/* TAB: TAXONOMY DATA (Super Admin Only) */}
          {role === 'super_admin' && activeTab === 'taxonomy' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 font-display">Manage Taxonomy Structure</h3>
                <p className="text-slate-500 text-xs mt-0.5">Define boards, classes, and subjects that categorize interactive visual learning modules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* BOARDS PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[400px]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="font-bold text-slate-800 text-sm font-display">Boards</span>
                      <button
                        onClick={() => {
                          setTaxonomyModalType('board');
                          setEditingTaxonomyItem({ name: '', slug: '', sort_order: 0 });
                          setIsNewTaxonomyItem(true);
                          setIsTaxonomyModalOpen(true);
                        }}
                        className="bg-blue-55 hover:bg-blue-100 text-blue-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-1">
                      {boards.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs">No boards defined yet.</div>
                      ) : (
                        boards.map((board) => (
                          <div key={board.id} className="py-3 flex justify-between items-center group">
                            <div>
                              <span className="text-xs font-semibold text-slate-800 block">{board.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">slug: {board.slug}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setTaxonomyModalType('board');
                                  setEditingTaxonomyItem({ ...board });
                                  setIsNewTaxonomyItem(false);
                                  setIsTaxonomyModalOpen(true);
                                }}
                                className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-55 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTaxonomyItem('board', board.id, board.name)}
                                className="p-1 text-slate-550 hover:text-rose-600 rounded hover:bg-slate-55 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* CLASSES PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[400px]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="font-bold text-slate-800 text-sm font-display">Classes</span>
                      <button
                        onClick={() => {
                          setTaxonomyModalType('class');
                          setEditingTaxonomyItem({ name: '', slug: '', sort_order: 0 });
                          setIsNewTaxonomyItem(true);
                          setIsTaxonomyModalOpen(true);
                        }}
                        className="bg-blue-55 hover:bg-blue-100 text-blue-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-1">
                      {classes.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs">No classes defined yet.</div>
                      ) : (
                        classes.map((c) => (
                          <div key={c.id} className="py-3 flex justify-between items-center group">
                            <div>
                              <span className="text-xs font-semibold text-slate-800 block">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">slug: {c.slug}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setTaxonomyModalType('class');
                                  setEditingTaxonomyItem({ ...c });
                                  setIsNewTaxonomyItem(false);
                                  setIsTaxonomyModalOpen(true);
                                }}
                                className="p-1 text-slate-550 hover:text-blue-600 rounded hover:bg-slate-55 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTaxonomyItem('class', c.id, c.name)}
                                className="p-1 text-slate-550 hover:text-rose-600 rounded hover:bg-slate-55 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* SUBJECTS PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[400px]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="font-bold text-slate-800 text-sm font-display">Subjects</span>
                      <button
                        onClick={() => {
                          setTaxonomyModalType('subject');
                          setEditingTaxonomyItem({ name: '', slug: '', icon_emoji: '📘', sort_order: 0 });
                          setIsNewTaxonomyItem(true);
                          setIsTaxonomyModalOpen(true);
                        }}
                        className="bg-blue-55 hover:bg-blue-100 text-blue-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-1">
                      {subjects.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs">No subjects defined yet.</div>
                      ) : (
                        subjects.map((sub) => (
                          <div key={sub.id} className="py-3 flex justify-between items-center group">
                            <div className="flex items-center gap-2">
                              <span className="text-lg shrink-0">{sub.icon_emoji || '📘'}</span>
                              <div>
                                <span className="text-xs font-semibold text-slate-800 block">{sub.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">slug: {sub.slug}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setTaxonomyModalType('subject');
                                  setEditingTaxonomyItem({ ...sub });
                                  setIsNewTaxonomyItem(false);
                                  setIsTaxonomyModalOpen(true);
                                }}
                                className="p-1 text-slate-550 hover:text-blue-600 rounded hover:bg-slate-55 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTaxonomyItem('subject', sub.id, sub.name)}
                                className="p-1 text-slate-555 hover:text-rose-600 rounded hover:bg-slate-55 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* CONTENT TYPES PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[400px]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="font-bold text-slate-800 text-sm font-display">Content Types</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTaxonomyModalType('content-type');
                          setEditingTaxonomyItem({ name: '', slug: '', icon_emoji: '🎮', color_hex: '#10B981', sort_order: 0 });
                          setIsNewTaxonomyItem(true);
                          setIsTaxonomyModalOpen(true);
                        }}
                        className="bg-blue-55 hover:bg-blue-100 text-blue-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-1">
                      {contentTypes.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs">No content types defined yet.</div>
                      ) : (
                        contentTypes.map((ct) => (
                          <div key={ct.id} className="py-3 flex justify-between items-center group">
                            <div className="flex items-center gap-2">
                              <span className="text-lg shrink-0">{ct.icon_emoji || '📖'}</span>
                              <div>
                                <span className="text-xs font-semibold text-slate-800 block">{ct.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-slate-400 font-mono">slug: {ct.slug}</span>
                                  {ct.color_hex && (
                                    <span
                                      className="w-2 h-2 rounded-full inline-block"
                                      style={{ backgroundColor: ct.color_hex }}
                                      title={ct.color_hex}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setTaxonomyModalType('content-type');
                                  setEditingTaxonomyItem({ ...ct });
                                  setIsNewTaxonomyItem(false);
                                  setIsTaxonomyModalOpen(true);
                                }}
                                className="p-1 text-slate-550 hover:text-blue-600 rounded hover:bg-slate-55 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTaxonomyItem('content-type', ct.id, ct.name)}
                                className="p-1 text-slate-555 hover:text-rose-600 rounded hover:bg-slate-55 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* TAXONOMY CREATE/EDIT MODAL */}
              {isTaxonomyModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 font-display capitalize">
                          {isNewTaxonomyItem ? `Create ${taxonomyModalType}` : `Edit ${taxonomyModalType}`}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Enter details to define taxonomy item.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTaxonomyModalOpen(false);
                          setEditingTaxonomyItem(null);
                        }}
                        className="text-slate-400 hover:text-slate-655 text-xl font-bold cursor-pointer transition-colors p-1"
                      >
                        &times;
                      </button>
                    </div>

                    <form onSubmit={handleSaveTaxonomyItem} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-1.5">Name</label>
                        <input
                          type="text"
                          placeholder="e.g. CBSE, Grade 10, Physics"
                          value={editingTaxonomyItem?.name || ''}
                          onChange={(e) => setEditingTaxonomyItem({ ...editingTaxonomyItem, name: e.target.value })}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-1.5">Slug</label>
                        <input
                          type="text"
                          placeholder="e.g. cbse, grade-10, physics"
                          value={editingTaxonomyItem?.slug || ''}
                          onChange={(e) => setEditingTaxonomyItem({ ...editingTaxonomyItem, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {(taxonomyModalType === 'subject' || taxonomyModalType === 'content-type') && (
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-1.5">Icon Emoji</label>
                          <input
                            type="text"
                            placeholder="e.g. 📙, 🔬, 🎮"
                            value={editingTaxonomyItem?.icon_emoji || ''}
                            onChange={(e) => setEditingTaxonomyItem({ ...editingTaxonomyItem, icon_emoji: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}

                      {taxonomyModalType === 'content-type' && (
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-1.5">Color Hex</label>
                          <input
                            type="text"
                            placeholder="e.g. #6C63FF, #10B981"
                            value={editingTaxonomyItem?.color_hex || ''}
                            onChange={(e) => setEditingTaxonomyItem({ ...editingTaxonomyItem, color_hex: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-1.5">Sort Order</label>
                        <input
                          type="number"
                          value={editingTaxonomyItem?.sort_order ?? 0}
                          onChange={(e) => setEditingTaxonomyItem({ ...editingTaxonomyItem, sort_order: parseInt(e.target.value, 10) || 0 })}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsTaxonomyModalOpen(false);
                            setEditingTaxonomyItem(null);
                          }}
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <span>Save Item</span>}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOTE TAXONOMY MAPPING MODAL */}
          {isNoteTaxonomyModalOpen && activeNote && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative animate-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">Manage Categories: {activeNote.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Map this visual module to boards, classes, and subjects.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsNoteTaxonomyModalOpen(false);
                      setActiveNote(null);
                    }}
                    className="text-slate-400 hover:text-slate-655 text-xl font-bold cursor-pointer p-1"
                  >
                    &times;
                  </button>
                </div>

                {/* Currently Linked Taxonomy Tags */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">Assigned Classifications</h4>
                  {activeNoteTaxonomy.length === 0 ? (
                    <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-450 border border-slate-200">
                      No board/class/subject classifications linked to this note yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {activeNoteTaxonomy.map((tax) => (
                        <div key={tax.id} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 text-xs transition-colors">
                          <div className="flex flex-wrap gap-1 items-center font-medium text-slate-700">
                            {tax.boards && <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold">{tax.boards.name}</span>}
                            {tax.classes && <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold">{tax.classes.name}</span>}
                            {tax.subjects && <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">{tax.subjects.icon_emoji} {tax.subjects.name}</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnlinkNoteTaxonomy(tax.id)}
                            className="text-[10px] text-rose-600 hover:text-rose-500 font-bold border border-rose-100 hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Currently Linked Content Types */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">Assigned Content Types</h4>
                  {activeNoteContentTypes.length === 0 ? (
                    <div className="bg-slate-50 rounded-xl p-3 text-center text-xs text-slate-450 border border-slate-200">
                      No content types linked to this note yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
                      {activeNoteContentTypes.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-colors"
                          style={{
                            backgroundColor: act.content_types?.color_hex ? `${act.content_types.color_hex}15` : '#f1f5f9',
                            borderColor: act.content_types?.color_hex || '#cbd5e1',
                            color: act.content_types?.color_hex || '#334155'
                          }}
                        >
                          <span>{act.content_types?.icon_emoji} {act.content_types?.name}</span>
                          <button
                            type="button"
                            onClick={() => handleUnlinkContentType(act.content_type_id)}
                            className="text-xs hover:text-rose-600 transition-colors ml-1 font-bold cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form to Assign New Tag combo */}
                <form onSubmit={handleLinkNoteTaxonomy} className="space-y-4 border-t border-slate-150 pt-4">
                  <h4 className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">Add Classification Category</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* BOARDS LIST */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-250 pb-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Boards</span>
                        <label className="flex items-center gap-1 text-[10px] text-blue-600 font-extrabold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={linkAllBoards}
                            onChange={(e) => {
                              setLinkAllBoards(e.target.checked);
                              if (e.target.checked) setLinkBoardIds([]);
                            }}
                            className="w-3 h-3 rounded"
                          />
                          <span>All</span>
                        </label>
                      </div>
                      {!linkAllBoards && (
                        <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                          {boards.map(b => (
                            <label key={b.id} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-650 cursor-pointer hover:text-slate-900">
                              <input
                                type="checkbox"
                                checked={linkBoardIds.includes(b.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setLinkBoardIds([...linkBoardIds, b.id]);
                                  } else {
                                    setLinkBoardIds(linkBoardIds.filter(id => id !== b.id));
                                  }
                                }}
                                className="w-3 h-3 rounded text-blue-600"
                              />
                              <span>{b.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {linkAllBoards && (
                        <p className="text-[10px] text-slate-400 italic py-1">All Boards (wildcard)</p>
                      )}
                    </div>

                    {/* CLASSES LIST */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-250 pb-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Classes</span>
                        <label className="flex items-center gap-1 text-[10px] text-blue-600 font-extrabold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={linkAllClasses}
                            onChange={(e) => {
                              setLinkAllClasses(e.target.checked);
                              if (e.target.checked) setLinkClassIds([]);
                            }}
                            className="w-3 h-3 rounded"
                          />
                          <span>All</span>
                        </label>
                      </div>
                      {!linkAllClasses && (
                        <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                          {classes.map(c => (
                            <label key={c.id} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-650 cursor-pointer hover:text-slate-900">
                              <input
                                type="checkbox"
                                checked={linkClassIds.includes(c.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setLinkClassIds([...linkClassIds, c.id]);
                                  } else {
                                    setLinkClassIds(linkClassIds.filter(id => id !== c.id));
                                  }
                                }}
                                className="w-3 h-3 rounded text-blue-600"
                              />
                              <span>{c.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {linkAllClasses && (
                        <p className="text-[10px] text-slate-400 italic py-1">All Classes (wildcard)</p>
                      )}
                    </div>

                    {/* SUBJECTS LIST */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-250 pb-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Subjects</span>
                        <label className="flex items-center gap-1 text-[10px] text-blue-600 font-extrabold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={linkAllSubjects}
                            onChange={(e) => {
                              setLinkAllSubjects(e.target.checked);
                              if (e.target.checked) setLinkSubjectIds([]);
                            }}
                            className="w-3 h-3 rounded"
                          />
                          <span>All</span>
                        </label>
                      </div>
                      {!linkAllSubjects && (
                        <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                          {subjects.map(s => (
                            <label key={s.id} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-650 cursor-pointer hover:text-slate-900">
                              <input
                                type="checkbox"
                                checked={linkSubjectIds.includes(s.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setLinkSubjectIds([...linkSubjectIds, s.id]);
                                  } else {
                                    setLinkSubjectIds(linkSubjectIds.filter(id => id !== s.id));
                                  }
                                }}
                                className="w-3 h-3 rounded text-blue-600"
                              />
                              <span>{s.icon_emoji} {s.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {linkAllSubjects && (
                        <p className="text-[10px] text-slate-400 italic py-1">All Subjects (wildcard)</p>
                      )}
                    </div>

                    {/* CONTENT TYPES LIST */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block border-b border-slate-250 pb-1">Content Types</span>
                      <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {contentTypes.map(ct => {
                          const isLinked = activeNoteContentTypes.some(item => item.content_type_id === ct.id);
                          return (
                            <label key={ct.id} className="flex items-center gap-2 text-[11px] font-medium text-slate-655 cursor-pointer hover:text-slate-900 select-none">
                              <input
                                type="checkbox"
                                checked={isLinked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleLinkContentType(ct.id);
                                  } else {
                                    handleUnlinkContentType(ct.id);
                                  }
                                }}
                                className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                              />
                              <span>{ct.icon_emoji} {ct.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <span>Add Mapping</span>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EDIT NOTE MODAL */}
          {isEditNoteModalOpen && editingNoteData && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                    <Edit className="w-5 h-5 text-blue-600" />
                    <span>Edit Lesson Details</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditNoteModalOpen(false);
                      setEditingNoteData(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveNoteEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      value={editingNoteData.title}
                      onChange={(e) => setEditingNoteData({ ...editingNoteData, title: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingNoteData.description || ''}
                      onChange={(e) => setEditingNoteData({ ...editingNoteData, description: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 resize-none font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 bg-blue-50/50 p-3.5 rounded-xl border border-blue-150">
                    <input
                      type="checkbox"
                      id="editIsDemo"
                      checked={editingNoteData.is_demo}
                      onChange={(e) => setEditingNoteData({ ...editingNoteData, is_demo: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                    />
                    <label htmlFor="editIsDemo" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      Public Free Demo Lesson (Experience Zone)
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditNoteModalOpen(false);
                        setEditingNoteData(null);
                      }}
                      disabled={isUpdatingNote}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingNote || !editingNoteData.title.trim()}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-blue-300"
                    >
                      {isUpdatingNote ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <span>Save Changes</span>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DELETE NOTE CONFIRMATION MODAL */}
          {isDeleteNoteModalOpen && deletingNote && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 font-display">Delete Lesson</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingNote.title}"</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteNoteModalOpen(false);
                      setDeletingNote(null);
                    }}
                    disabled={isDeletingNote}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteNote}
                    disabled={isDeletingNote}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-rose-300"
                  >
                    {isDeletingNote ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <span>Delete Lesson</span>}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="w-full text-center text-xs text-slate-400 mt-16 pt-4 border-t border-slate-200/50">
          <p>&copy; {new Date().getFullYear()} Keeelai Operations Center. All rights reserved.</p>
        </footer>

      </main>

    </div>
  );
}
