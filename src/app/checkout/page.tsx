'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, BookOpen, CheckCircle, ArrowRight, Loader,
  Tag, Info, ChevronLeft, Zap, Star, Crown, Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Screen = 'plans' | 'checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
        description: `Keeelai Notes: ${selectedPlanObj?.name || selectedPlan} Membership`,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     SCREEN 1: PLAN SELECTION
  ───────────────────────────────────────────── */
  if (screen === 'plans') {
    const plans = Array.isArray(pricing.plans) ? pricing.plans : [];
    // Decide which card index is "most popular" (typically the middle one, or highest discount)
    const popularIdx = plans.length > 1
      ? plans.reduce((best: number, p: any, i: number) => (p.discount_percent || 0) > (plans[best]?.discount_percent || 0) ? i : best, Math.floor(plans.length / 2))
      : 0;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

        {/* Shared Navbar — currency switcher injected as rightSlot */}
        <Navbar rightSlot={
          <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'INR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              ₹ INR
            </button>
          </div>
        } />

        <main className="pt-24 pb-20">
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-6 mt-12 mb-12 text-center">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider border border-blue-100">
              Premium Learning Access
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 font-display">
              Choose Your Plan
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
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
              <div className={`grid grid-cols-1 gap-6 items-start ${plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : plans.length >= 3 ? 'md:grid-cols-3' : ''}`}>
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
                      className={`relative flex flex-col rounded-2xl border transition-all duration-200 cursor-pointer
                        ${isPopular
                          ? 'border-2 border-blue-500 bg-white shadow-xl shadow-blue-100/50 scale-[1.02]'
                          : isSelected
                          ? 'border-2 border-blue-300 bg-white shadow-md'
                          : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-1'
                        }`}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                      }}
                    >
                      {/* Most Popular Badge */}
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm whitespace-nowrap">
                          Most Popular
                        </div>
                      )}

                      {/* Discount ribbon */}
                      {hasDiscount && (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Save {plan.discount_percent}%
                        </div>
                      )}

                      <div className="p-7 flex flex-col flex-1">
                        {/* Header */}
                        <div className="mb-6">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${isPopular ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {getPlanIcon(idx)}
                          </div>
                          <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${isPopular ? 'text-blue-600' : 'text-slate-400'}`}>
                            {plan.duration_months === 1 ? 'Basic' : plan.duration_months <= 6 ? 'Advanced' : 'Premium'}
                          </p>
                          <h2 className="text-xl font-bold text-slate-900 font-display">{plan.name}</h2>
                          {plan.subtext && (
                            <p className="text-xs text-slate-400 mt-0.5">{plan.subtext}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                          <div className="flex items-end gap-2">
                            <span className={`text-4xl font-extrabold tracking-tight font-display ${isPopular ? 'text-blue-600' : 'text-slate-900'}`}>
                              {symbol}{currency === 'INR' ? priceInr.toFixed(0) : discountedPriceUsd.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-slate-400 line-through mb-1">
                                {symbol}{currency === 'INR' ? originalPriceInr.toFixed(0) : plan.price_usd.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            for {plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'} access
                          </p>
                        </div>

                        {/* Features list */}
                        <ul className="space-y-2.5 mb-8 flex-1">
                          {features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5">
                              <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPopular ? 'text-blue-500' : 'text-emerald-500'}`} />
                              <span className="text-sm text-slate-600">{feat}</span>
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
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]
                            ${isPopular
                              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-200'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
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

          {/* Trust Signals */}
          <section className="max-w-6xl mx-auto px-6 mt-20 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-8">
              Trusted by students worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale">
              {[140, 100, 120, 160, 90].map((w, i) => (
                <div key={i} className={`h-7 bg-slate-400 rounded`} style={{ width: w }} />
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="max-w-6xl mx-auto px-6 mt-20">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-10 text-center text-white">
              <div className="absolute inset-0 opacity-10"
                style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}}
              />
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-extrabold mb-3 font-display">
                  Ready to learn smarter?
                </h3>
                <p className="text-blue-100 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  Join thousands of students already using Keeelai to ace their studies with interactive animated lectures.
                </p>
                <button
                  onClick={() => plans.length > 0 && setScreen('checkout')}
                  className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full text-sm shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all active:scale-95"
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
     SCREEN 2: CHECKOUT / PAYMENT
  ───────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 flex items-center justify-center relative overflow-hidden font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Background decoration */}
      <div className="absolute top-[-25%] left-[-25%] w-[70%] h-[70%] rounded-full bg-blue-900/5 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-5xl z-10">

        {/* Back button */}
        <button
          onClick={() => { setScreen('plans'); setMessage(null); }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Plans
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left: Selected plan summary + plan switcher */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-4 hover:underline">
                <BookOpen className="w-5 h-5" />
                Keeelai Notes
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Complete Your Purchase
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Review your plan and proceed to secure payment.
              </p>
            </div>

            {/* Selected Plan Highlight Card */}
            {selectedPlanObj && (() => {
              const discountedPriceUsd = basePriceUsd * (1 - planDiscountPercent / 100);
              const priceToShow = currency === 'INR'
                ? discountedPriceUsd * exchangeRate
                : discountedPriceUsd;

              return (
                <div className="bg-blue-600 text-white rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Selected Plan</p>
                      <h2 className="text-xl font-extrabold font-display">{selectedPlanObj.name}</h2>
                      <p className="text-blue-200 text-xs mt-0.5">
                        {selectedPlanObj.duration_months} {selectedPlanObj.duration_months === 1 ? 'month' : 'months'} full access
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold font-display">
                        {symbol}{priceToShow.toFixed(currency === 'INR' ? 0 : 2)}
                      </span>
                      {planDiscountPercent > 0 && (
                        <span className="block text-blue-200 text-xs line-through mt-0.5">
                          {symbol}{currency === 'INR' ? (basePriceUsd * exchangeRate).toFixed(0) : basePriceUsd.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {planDiscountPercent > 0 && (
                    <span className="inline-block bg-white/20 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                      {planDiscountPercent}% Plan Discount Applied
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Other plans (quick switch) */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Switch Plan</p>
              {Array.isArray(pricing.plans) && pricing.plans.filter((p: any) => p.id !== selectedPlan).map((plan: any) => {
                const disc = plan.price_usd * (1 - (plan.discount_percent || 0) / 100);
                const priceToShow = currency === 'INR' ? disc * exchangeRate : disc;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className="flex items-center justify-between border border-slate-200 bg-white rounded-xl px-4 py-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                  >
                    <span className="text-sm font-semibold text-slate-700">{plan.name}</span>
                    <span className="text-sm font-bold text-slate-900">
                      {symbol}{priceToShow.toFixed(currency === 'INR' ? 0 : 2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Currency toggle */}
            <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl self-start">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${currency === 'USD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${currency === 'INR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                INR (₹)
              </button>
            </div>

            {/* Security note */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Secure encryption. Payments processed via Razorpay.</span>
            </div>
          </div>

          {/* Right: Auth / Payment Panel */}
          <div className="lg:col-span-6 flex">
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-2xl" />

              {message && (
                <div className={`p-3 mb-4 rounded-lg border text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                  {message.text}
                </div>
              )}

              {!user ? (
                /* Inline Auth */
                <div className="space-y-4">
                  <div className="flex border-b border-slate-200 mb-2">
                    <button
                      onClick={() => { setIsLogin(true); setMessage(null); }}
                      className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 ${isLogin ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { setIsLogin(false); setMessage(null); }}
                      className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 ${!isLogin ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                    >
                      Register
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your Name" required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit Mobile No." required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white" />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white" />
                    </div>
                    <button type="submit" disabled={authLoading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all cursor-pointer text-sm">
                      {authLoading ? <Loader className="w-5 h-5 animate-spin" /> : <span>{isLogin ? 'Log In to Continue' : 'Create Account & Continue'}</span>}
                    </button>
                  </form>
                </div>
              ) : (
                /* Payment Checkout Card */
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  {/* Account line */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Logged In As</span>
                      <span className="text-xs font-semibold text-slate-700 truncate block max-w-[200px]">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-[10px] border border-slate-200 hover:bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg transition-colors font-bold"
                    >
                      Sign Out
                    </button>
                  </div>

                  {/* Coupon */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Coupon Code</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g. SAVE20"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white" />
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                      </div>
                      <button onClick={applyCoupon} disabled={couponLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer">
                        {couponLoading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Apply</span>}
                      </button>
                    </div>
                  </div>

                  {/* Billing Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Plan Base (USD)</span>
                      <span className="font-semibold text-slate-900">${basePriceUsd.toFixed(2)}</span>
                    </div>
                    {planDiscountPercent > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Plan Discount ({planDiscountPercent}%)</span>
                        <span>-${(basePriceUsd * (planDiscountPercent / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon ({appliedCoupon.discountPercent}%)</span>
                        <span>-${(priceAfterIntroUsd * (appliedCoupon.discountPercent / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    {currency === 'INR' && (
                      <div className="flex justify-between text-slate-400 border-t border-slate-200/60 pt-2.5">
                        <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Exch. Rate</span>
                        <span>$1 = ₹{exchangeRate.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200/60 pt-2.5">
                      <span>Subtotal ({currency})</span>
                      <span className="font-semibold text-slate-900">{symbol}{activePriceBase.toFixed(currency === 'INR' ? 0 : 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({pricing.tax_percent}%)</span>
                      <span className="font-semibold text-slate-900">{symbol}{taxAmount.toFixed(currency === 'INR' ? 0 : 2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2.5 text-sm font-bold">
                      <span className="text-slate-900">Grand Total</span>
                      <span className="text-blue-600">{symbol}{totalAmount.toFixed(currency === 'INR' ? 0 : 2)}</span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={startPayment}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer text-sm"
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
