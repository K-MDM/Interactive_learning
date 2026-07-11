'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, BookOpen, CheckCircle, ArrowRight, Loader,
  Tag, Info, ChevronLeft, Zap, Star, Crown, Check, Smartphone
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Screen = 'plans' | 'checkout' | 'membership';

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Screen control: 'plans' -> 'checkout'
  const [screen, setScreen] = useState<Screen>('plans');

  // Dynamic config loaded from DB
  const [pricing, setPricing] = useState<any>({ plans: [], tax_percent: 18 });
  const [exchangeRate, setExchangeRate] = useState(83.5);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Checkout choices
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // School code states
  const [schoolCode, setSchoolCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Auth States
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Detect currency based on timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && (tz.includes('Calcutta') || tz.includes('Asia/Kolkata') || tz.includes('India'))) {
        setCurrency('INR');
      }
    } catch (e) {
      console.warn('Could not auto-detect timezone/currency', e);
    }
  }, []);

  // Fetch configs and user session
  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(dbProfile || null);
      }

      try {
        const { data: dbPlans } = await supabase
          .from('plans')
          .select('*')
          .order('created_at', { ascending: true });

        let taxPercent = 18;
        const { data: priceData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'pricing')
          .single();

        if (priceData?.value) {
          taxPercent = priceData.value.tax_percent || 18;
        }

        if (dbPlans && dbPlans.length > 0) {
          setPricing({ plans: dbPlans, tax_percent: taxPercent });
          const has12m = dbPlans.find((p: any) => p.id === '12m');
          setSelectedPlan(has12m ? '12m' : dbPlans[0].id);
        } else {
          const defaultPlans = [
            { id: '1m', name: '1 Month Plan', duration_months: 1, price_usd: 9.99, discount_percent: 0, subtext: 'Billed monthly' },
            { id: '6m', name: '6 Months Plan', duration_months: 6, price_usd: 14.99, discount_percent: 0, subtext: 'Best value built-in' },
            { id: '12m', name: '12 Months (Introductory Offer)', duration_months: 12, price_usd: 99.99, discount_percent: 20, subtext: 'Introductory annual deal' }
          ];
          setPricing({ plans: defaultPlans, tax_percent: taxPercent });
          setSelectedPlan('12m');
        }

        const rateRes = await fetch('/api/payments/exchange-rate');
        const rateData = await rateRes.json();
        if (rateData.rate) setExchangeRate(rateData.rate);
      } catch (err) {
        console.error('Failed to load portal configuration', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(dbProfile || null);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Auth Submit Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Logged in successfully!' });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
            emailRedirectTo: `${window.location.origin}/checkout`,
          }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Registration complete! Check your email for verification.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication failed' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAppliedCoupon(null);
    setMessage(null);
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolCode.trim()) return;
    setRedeemLoading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Please login or create an account first to redeem your school license access code.');
      }

      const res = await fetch('/api/school/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: schoolCode.trim() })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage({ type: 'success', text: 'School access code redeemed successfully! Welcome to Keeelai Premium.' });
      
      // Reload profile
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(dbProfile || null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to redeem school access code.' });
    } finally {
      setRedeemLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setMessage(null);

    const planObj = Array.isArray(pricing.plans) ? pricing.plans.find((p: any) => p.id === selectedPlan) : null;
    const baseVal = planObj ? planObj.price_usd : 0;
    const planDisc = planObj ? (planObj.discount_percent || 0) : 0;
    const priceAfterIntro = baseVal * (1 - planDisc / 100);

    try {
      const res = await fetch(`/api/payments/coupon?code=${encodeURIComponent(couponCode)}&planId=${selectedPlan}&price=${priceAfterIntro}`);
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
        setMessage({ type: 'success', text: `Coupon '${data.code}' applied! (${data.discountPercent}% Off)` });
      } else {
        setAppliedCoupon(null);
        setMessage({ type: 'error', text: data.error || 'Invalid coupon' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error validating coupon' });
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (appliedCoupon) {
      const revalidateCoupon = async () => {
        const planObj = Array.isArray(pricing.plans) ? pricing.plans.find((p: any) => p.id === selectedPlan) : null;
        if (!planObj) return;
        const priceAfterIntro = planObj.price_usd * (1 - (planObj.discount_percent || 0) / 100);

        try {
          const res = await fetch(`/api/payments/coupon?code=${encodeURIComponent(appliedCoupon.code)}&planId=${selectedPlan}&price=${priceAfterIntro}`);
          const data = await res.json();
          if (!data.valid) {
            setAppliedCoupon(null);
            setMessage({ type: 'error', text: `Coupon removed: ${data.error || 'not eligible for selected plan'}` });
          }
        } catch {
          setAppliedCoupon(null);
        }
      };
      revalidateCoupon();
    }
  }, [selectedPlan, pricing.plans]);

  // Redirect subscribed users to membership management dashboard
  useEffect(() => {
    const isSubscribed = (!!profile?.web_subscription_active &&
      (!profile?.web_subscription_expires_at || new Date(profile.web_subscription_expires_at) > new Date())) ||
      (profile?.role === 'student' || profile?.role === 'super_admin' || profile?.role === 'school_admin');

    if (isSubscribed) {
      setScreen('membership');
    } else if (screen === 'membership') {
      setScreen('plans');
    }
  }, [profile, screen]);

  // Pricing calculations
  const selectedPlanObj = Array.isArray(pricing.plans)
    ? pricing.plans.find((p: any) => p.id === selectedPlan)
    : null;

  const basePriceUsd = selectedPlanObj ? selectedPlanObj.price_usd : 0;
  const planDiscountPercent = selectedPlanObj ? (selectedPlanObj.discount_percent || 0) : 0;
  const priceAfterIntroUsd = basePriceUsd * (1 - planDiscountPercent / 100);

  let finalBaseUsd = priceAfterIntroUsd;
  if (appliedCoupon) {
    finalBaseUsd = priceAfterIntroUsd * (1 - appliedCoupon.discountPercent / 100);
  }

  const activePriceBase = currency === 'INR' ? finalBaseUsd * exchangeRate : finalBaseUsd;
  const taxAmount = activePriceBase * (pricing.tax_percent / 100);
  const totalAmount = activePriceBase + taxAmount;
  const symbol = currency === 'INR' ? '₹' : '$';

  const startPayment = async () => {
    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, couponCode: appliedCoupon?.code || '', currency })
      });

      const orderData = await res.json();
      if (orderData.error) throw new Error(orderData.error);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Keeelai',
        description: `KEEEL AI: ${selectedPlanObj?.name || selectedPlan} Membership`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setProcessing(true);
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              router.push(`/checkout/success?planId=${selectedPlan}`);
            } else {
              throw new Error(verifyData.error || 'Payment signature verification failed');
            }
          } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Verification failed' });
          } finally {
            setProcessing(false);
          }
        },
        prefill: { email: orderData.user.email },
        theme: { color: '#3B82F6' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Payment processing failed' });
    } finally {
      setProcessing(false);
    }
  };

  // Plan icon helper
  const getPlanIcon = (idx: number) => {
    if (idx === 0) return <Zap className="w-5 h-5" />;
    if (idx === 1) return <Star className="w-5 h-5" />;
    return <Crown className="w-5 h-5" />;
  };

  // Plan features helper
  const getPlanFeatures = (plan: any, idx: number) => {
    const base = [
      'Full access to all lecture notes',
      'Animated HTML learning modules',
      'Offline-ready downloads',
    ];
    if (idx >= 1) base.push('Priority content updates', 'Multi-device sync');
    if (idx >= 2) base.push('Early access to new subjects', 'Dedicated support');
    return base;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     SCREEN 1: PLAN SELECTION
  ───────────────────────────────────────────── */
  if (screen === 'plans') {
    const plans = Array.isArray(pricing.plans) ? pricing.plans : [];
    const popularIdx = plans.length > 1
      ? plans.reduce((best: number, p: any, i: number) => (p.discount_percent || 0) > (plans[best]?.discount_percent || 0) ? i : best, Math.floor(plans.length / 2))
      : 0;

    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] font-sans relative overflow-x-hidden">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

        {/* Diagonal glowing decorations */}
        <div className="absolute top-[-25%] left-[-25%] w-[75%] h-[75%] rounded-full bg-blue-500/5 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-25%] right-[-25%] w-[75%] h-[75%] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />

        {/* Global Navbar */}
        <Navbar rightSlot={
          <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${currency === 'USD' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
            >
              ₹ INR
            </button>
          </div>
        } />

        <main className="pt-32 pb-20 relative z-10">
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-6 mb-12 text-center space-y-4">
            <span className="inline-block bg-blue-50 border border-blue-200 text-blue-750 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Premium Learning Access
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 font-display">
              Choose Your Plan
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-semibold">
              Unlock premium animated lecture notes with transparent, flexible access tiers designed for every learner.
            </p>
          </section>

          {/* Plans Grid */}
          <section className="max-w-6xl mx-auto px-6">
            {plans.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
                <p>Loading plans...</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 gap-6 items-stretch ${plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : plans.length >= 3 ? 'md:grid-cols-3' : ''}`}>
                {plans.map((plan: any, idx: number) => {
                  const isPopular = idx === popularIdx && plans.length > 1;
                  const hasDiscount = (plan.discount_percent || 0) > 0;
                  const discountedPriceUsd = plan.price_usd * (1 - (plan.discount_percent || 0) / 100);
                  const priceInr = discountedPriceUsd * exchangeRate;
                  const originalPriceInr = plan.price_usd * exchangeRate;
                  const isSelected = selectedPlan === plan.id;
                  const features = getPlanFeatures(plan, idx);

                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col rounded-3xl border transition-all duration-300 cursor-pointer p-7 bg-white shadow-sm
                        ${isPopular
                          ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/[0.02] md:scale-[1.02]'
                          : isSelected
                            ? 'border-2 border-blue-500 bg-blue-50/[0.08] shadow-sm'
                            : 'border-slate-200 hover:border-slate-350 hover:-translate-y-1'
                        }`}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                      }}
                    >
                      {/* Most Popular Badge */}
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                          Most Popular
                        </div>
                      )}

                      {/* Discount ribbon */}
                      {hasDiscount && (
                        <div className="absolute top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          Save {plan.discount_percent}%
                        </div>
                      )}

                      <div className="flex flex-col flex-1 h-full justify-between">
                        {/* Header */}
                        <div>
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${isPopular ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                            {getPlanIcon(idx)}
                          </div>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isPopular ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {plan.duration_months === 1 ? 'Basic' : plan.duration_months <= 6 ? 'Advanced' : 'Premium'}
                          </p>
                          <h2 className="text-xl font-bold text-slate-900 font-display">{plan.name}</h2>
                          {plan.subtext && (
                            <p className="text-xs text-slate-500 mt-1">{plan.subtext}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="my-6">
                          <div className="flex items-end gap-2">
                            <span className={`text-4xl font-extrabold tracking-tight font-display ${isPopular ? 'bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent' : 'text-slate-900'}`}>
                              {symbol}{currency === 'INR' ? priceInr.toFixed(0) : discountedPriceUsd.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-slate-400 line-through mb-1.5">
                                {symbol}{currency === 'INR' ? originalPriceInr.toFixed(0) : plan.price_usd.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5 font-bold">
                            for {plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'} access
                          </p>
                        </div>

                        {/* Features list */}
                        <ul className="space-y-3 mb-8 flex-1 border-t border-slate-100 pt-4">
                          {features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5">
                              <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPopular ? 'text-emerald-500' : 'text-blue-500'}`} />
                              <span className="text-sm text-slate-600 font-semibold">{feat}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan.id);
                            setScreen('checkout');
                          }}
                          className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all active:scale-[0.98] cursor-pointer
                            ${isPopular
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                              : 'bg-transparent hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900'
                            }`}
                        >
                          {isPopular ? 'Get Started →' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* School Access Code Redemption Card */}
          <section className="max-w-2xl mx-auto px-6 mt-16">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-400" />
              
              <div className="text-center space-y-2">
                <span className="inline-block bg-blue-50 border border-blue-200 text-blue-750 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  School License Redemption
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-display">Redeem Access Code</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Enter the seat activation code provided by your teacher or school administrator to instantly unlock premium K-12 interactive animated modules.
                </p>
              </div>

              {message && (message.text.includes('School access code') || message.text.includes('license code')) && (
                <div className={`p-4 rounded-xl border text-sm font-semibold flex items-start gap-2.5 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                  {message.text}
                </div>
              )}

              {user ? (
                <form onSubmit={handleRedeemCode} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    placeholder="e.g. OAKRIDGE-STEM-2026"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={redeemLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer shrink-0"
                  >
                    {redeemLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Redeem Seat'}
                  </button>
                </form>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                  <p className="text-xs text-slate-500 font-semibold">
                    You must be logged in to claim a seat under a school license.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      // Navigate user to checkout form to login / create account
                      setScreen('checkout');
                    }}
                    className="inline-flex items-center gap-1 bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <span>Login or Register First</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Trust Signals */}
          <section className="max-w-6xl mx-auto px-6 mt-20 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">
              Trusted by students worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-35 grayscale">
              {[140, 100, 120, 160, 90].map((w, i) => (
                <div key={i} className="h-7 bg-slate-300 rounded" style={{ width: w }} />
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="max-w-6xl mx-auto px-6 mt-20">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-transparent border border-blue-100 rounded-3xl p-10 text-center shadow-sm">
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl md:text-3xl font-extrabold font-display text-slate-900">
                  Ready to learn smarter?
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed font-semibold">
                  Join thousands of students already using Keeelai to ace their studies with interactive animated lectures.
                </p>
                <button
                  onClick={() => plans.length > 0 && setScreen('checkout')}
                  className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-full text-sm transition-all active:scale-95 shadow-md"
                >
                  Start Learning Today
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     SCREEN: ACTIVE MEMBERSHIP DASHBOARD
  ───────────────────────────────────────────── */
  if (screen === 'membership') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] font-sans flex flex-col justify-between relative overflow-hidden">
        <Navbar dark={false} />

        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-55 pointer-events-none" />

        <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-32 pb-24 z-10 flex flex-col justify-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-md space-y-8 relative overflow-hidden">

            {/* Accent border top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-250 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Membership</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 font-display">Manage Membership</h1>
                <p className="text-slate-500 text-sm font-semibold">Review your active premium subscription details below.</p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Sign Out Account
              </button>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Subscription Status</h3>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-650 font-bold">User Account:</span>
                      <span className="font-extrabold text-slate-900 truncate max-w-[200px]" title={user?.email}>{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-650 font-bold">Member Since:</span>
                      <span className="font-extrabold text-slate-900">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-650 font-bold">Plan Status:</span>
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                        Premium Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-3.5">
                      <span className="text-slate-650 font-bold">Expiration Date:</span>
                      <span className="font-extrabold text-slate-900">
                        {profile?.web_subscription_expires_at
                          ? new Date(profile.web_subscription_expires_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Lifetime Access'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-slate-600 text-xs leading-relaxed space-y-2">
                  <h4 className="font-bold text-blue-800">Looking to change plans?</h4>
                  <p>
                    Because you have an active membership, we prevent purchasing multiple overlapping subscriptions. To adjust billing details or cancel renewal, please contact support.
                  </p>
                </div>
              </div>

              {/* Downloads & Client Apps */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">How to Access Lectures</h3>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                    <p className="text-slate-605 text-xs leading-relaxed font-semibold">
                      Keeelai interactive, animated lecture modules are designed to run inside our secure mobile learning app. Note: You cannot run premium notes directly in the desktop browser.
                    </p>
                    <div className="space-y-2.5 pt-2">
                      <a
                        href="https://play.google.com/store/apps/details?id=com.keeelai.notes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-white border border-slate-200 hover:border-slate-350 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                      >
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Download Android App</span>
                      </a>
                      <Link
                        href="/contact"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
                      >
                        <span>Contact Billing Support</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     SCREEN 2: CHECKOUT / PAYMENT FORM
  ───────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#0F172A] p-4 md:p-8 flex items-center justify-center relative overflow-hidden font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Diagonal background decorations */}
      <div className="absolute top-[-25%] left-[-25%] w-[70%] h-[70%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[70%] h-[70%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl z-10 relative">

        {/* Back button */}
        <button
          onClick={() => { setScreen('plans'); setMessage(null); }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-905 hover:text-slate-900 font-semibold mb-6 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Plans
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left panel: Plan highlight switcher */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center gap-2 text-slate-900 font-extrabold hover:opacity-85 transition-opacity">
                <span className="font-extrabold tracking-wider font-display text-sm text-slate-900 uppercase">
                  KEEEL AI
                </span>
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Complete Your Purchase
              </h1>
              <p className="text-slate-600 text-sm mt-1 font-semibold">
                Review your plan and proceed to secure payment.
              </p>
            </div>

            {/* Active Card Summary */}
            {selectedPlanObj && (() => {
              const discountedPriceUsd = basePriceUsd * (1 - planDiscountPercent / 100);
              const priceToShow = currency === 'INR'
                ? discountedPriceUsd * exchangeRate
                : discountedPriceUsd;

              return (
                <div className="bg-emerald-50 border border-emerald-200 text-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-1.5">Selected Plan</p>
                      <h2 className="text-xl font-extrabold font-display text-slate-900">{selectedPlanObj.name}</h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {selectedPlanObj.duration_months} {selectedPlanObj.duration_months === 1 ? 'month' : 'months'} full access
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold font-display bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        {symbol}{priceToShow.toFixed(currency === 'INR' ? 0 : 2)}
                      </span>
                      {planDiscountPercent > 0 && (
                        <span className="block text-slate-400 text-xs line-through mt-1">
                          {symbol}{currency === 'INR' ? (basePriceUsd * exchangeRate).toFixed(0) : basePriceUsd.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {planDiscountPercent > 0 && (
                    <span className="inline-block bg-white/60 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase px-3 py-1 rounded-lg">
                      {planDiscountPercent}% Plan Discount Applied
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Quick Switch Tiers */}
            <div className="space-y-2.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Switch Plan</p>
              {Array.isArray(pricing.plans) && pricing.plans.filter((p: any) => p.id !== selectedPlan).map((plan: any) => {
                const disc = plan.price_usd * (1 - (plan.discount_percent || 0) / 100);
                const priceToShow = currency === 'INR' ? disc * exchangeRate : disc;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className="flex items-center justify-between border border-slate-200 bg-white rounded-xl px-4 py-3 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <span className="text-sm font-bold text-slate-700">{plan.name}</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {symbol}{priceToShow.toFixed(currency === 'INR' ? 0 : 2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Currency details toggle */}
            <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl self-start">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${currency === 'USD' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
              >
                INR (₹)
              </button>
            </div>

            {/* security lock */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-550 pt-2 border-t border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secure encryption. Payments processed via Razorpay.</span>
            </div>
          </div>

          {/* Right Panel: login/reg auth and final billing summaries */}
          <div className="lg:col-span-6 flex">
            <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-md relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-t-3xl" />

              {message && (
                <div className={`p-3.5 mb-4 rounded-xl border text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                  {message.text}
                </div>
              )}

              {!user ? (
                /* Auth Screen toggles */
                <div className="space-y-5">
                  <div className="flex border-b border-slate-200 mb-2">
                    <button
                      onClick={() => { setIsLogin(true); setMessage(null); }}
                      className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 cursor-pointer ${isLogin ? 'border-blue-500 text-blue-650' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { setIsLogin(false); setMessage(null); }}
                      className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 cursor-pointer ${!isLogin ? 'border-blue-500 text-blue-650' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                    >
                      Register
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your Name" required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit Mobile No." required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <button type="submit" disabled={authLoading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all cursor-pointer text-xs uppercase tracking-wider">
                      {authLoading ? <Loader className="w-5 h-5 animate-spin" /> : <span>{isLogin ? 'Log In to Continue' : 'Create Account & Continue'}</span>}
                    </button>
                  </form>
                </div>
              ) : (
                /* Secure Payment Card */
                <div className="space-y-6 flex-1 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Logged In As</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block max-w-[200px]">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-[10px] border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl transition-colors font-bold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>

                  {/* Coupon Codes */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coupon Code</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g. SAVE20"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                      <button onClick={applyCoupon} disabled={couponLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer">
                        {couponLoading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Apply</span>}
                      </button>
                    </div>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600 my-4 font-semibold">
                    <div className="flex justify-between">
                      <span>Plan Base (USD)</span>
                      <span className="font-bold text-slate-900">${basePriceUsd.toFixed(2)}</span>
                    </div>
                    {planDiscountPercent > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Plan Discount ({planDiscountPercent}%)</span>
                        <span>-${(basePriceUsd * (planDiscountPercent / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Coupon ({appliedCoupon.discountPercent}%)</span>
                        <span>-${(priceAfterIntroUsd * (appliedCoupon.discountPercent / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    {currency === 'INR' && (
                      <div className="flex justify-between text-slate-450 border-t border-slate-200 pt-2.5">
                        <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Exch. Rate</span>
                        <span>$1 = ₹{exchangeRate.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200 pt-2.5">
                      <span>Subtotal ({currency})</span>
                      <span className="font-bold text-slate-900">{symbol}{activePriceBase.toFixed(currency === 'INR' ? 0 : 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({pricing.tax_percent}%)</span>
                      <span className="font-bold text-slate-900">{symbol}{taxAmount.toFixed(currency === 'INR' ? 0 : 2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2.5 text-sm font-black">
                      <span className="text-slate-900">Grand Total</span>
                      <span className="text-blue-600">{symbol}{totalAmount.toFixed(currency === 'INR' ? 0 : 2)}</span>
                    </div>
                  </div>

                  {/* Payment Trigger */}
                  <button
                    onClick={startPayment}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-widest"
                  >
                    {processing ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Pay Securely with Razorpay</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
