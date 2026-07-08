'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, BookOpen, CheckCircle, ArrowRight, Loader, Tag, Info } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic config loaded from DB
  const [pricing, setPricing] = useState<any>({
    plans: [],
    tax_percent: 18
  });
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
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      try {
        // Fetch dynamic pricing plans directly from the plans table
        const { data: dbPlans } = await supabase
          .from('plans')
          .select('*')
          .order('created_at', { ascending: true });

        // Fetch tax rate from settings pricing
        let taxPercent = 18;
        const { data: priceData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'pricing')
          .single();

        if (priceData && priceData.value) {
          taxPercent = priceData.value.tax_percent || 18;
        }

        if (dbPlans && dbPlans.length > 0) {
          setPricing({
            plans: dbPlans,
            tax_percent: taxPercent
          });

          // Select default plan
          const has12m = dbPlans.find((p: any) => p.id === '12m');
          setSelectedPlan(has12m ? '12m' : dbPlans[0].id);
        } else {
          // Empty fallback default plans if table is unseeded
          const defaultPlans = [
            { id: '1m', name: '1 Month Plan', duration_months: 1, price_usd: 9.99, discount_percent: 0, subtext: 'Billed monthly' },
            { id: '6m', name: '6 Months Plan', duration_months: 6, price_usd: 14.99, discount_percent: 0, subtext: 'Best value built-in' },
            { id: '12m', name: '12 Months (Introductory Offer)', duration_months: 12, price_usd: 99.99, discount_percent: 20, subtext: 'Introductory annual deal' }
          ];
          setPricing({
            plans: defaultPlans,
            tax_percent: taxPercent
          });
          setSelectedPlan('12m');
        }

        // Fetch cached exchange rate
        const rateRes = await fetch('/api/payments/exchange-rate');
        const rateData = await rateRes.json();
        if (rateData.rate) {
          setExchangeRate(rateData.rate);
        }
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
            data: {
              full_name: fullName,
              phone: phone
            },
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

  // Coupon application handler
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
        setAppliedCoupon({
          code: data.code,
          discountPercent: data.discountPercent
        });
        setMessage({ type: 'success', text: `Coupon '${data.code}' applied successfully! (${data.discountPercent}% Off)` });
      } else {
        setAppliedCoupon(null);
        setMessage({ type: 'error', text: data.error || 'Invalid coupon' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error validating coupon' });
    } finally {
      setCouponLoading(false);
    }
  };

  // Revalidate coupon when plan changes
  useEffect(() => {
    if (appliedCoupon) {
      const revalidateCoupon = async () => {
        const planObj = Array.isArray(pricing.plans) ? pricing.plans.find((p: any) => p.id === selectedPlan) : null;
        if (!planObj) return;
        const baseVal = planObj.price_usd;
        const planDisc = planObj.discount_percent || 0;
        const priceAfterIntro = baseVal * (1 - planDisc / 100);

        try {
          const res = await fetch(`/api/payments/coupon?code=${encodeURIComponent(appliedCoupon.code)}&planId=${selectedPlan}&price=${priceAfterIntro}`);
          const data = await res.json();
          if (!data.valid) {
            setAppliedCoupon(null);
            setMessage({ type: 'error', text: `Coupon removed: ${data.error || 'not eligible for the selected plan'}` });
          }
        } catch (err) {
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

  // Coupon discount
  let finalBaseUsd = priceAfterIntroUsd;
  if (appliedCoupon) {
    finalBaseUsd = priceAfterIntroUsd * (1 - appliedCoupon.discountPercent / 100);
  }

  // Currency Conversion
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
        body: JSON.stringify({
          planId: selectedPlan,
          couponCode: appliedCoupon?.code || '',
          currency
        })
      });

      const orderData = await res.json();
      if (orderData.error) throw new Error(orderData.error);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Keeelai',
        description: `Keeelai Notes: ${selectedPlan === '1m' ? '1 Month' : selectedPlan === '6m' ? '6 Months' : '1 Year'} Membership`,
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
              // Redirect to success screen
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
        prefill: {
          email: orderData.user.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Payment processing failed' });
    } finally {
      setProcessing(false);
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
    <main className="min-h-screen bg-[#07080c] text-gray-100 p-4 md:p-8 flex items-center justify-center relative overflow-hidden font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Background gradients */}
      <div className="absolute top-[-25%] left-[-25%] w-[70%] h-[70%] rounded-full bg-blue-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[70%] h-[70%] rounded-full bg-violet-900/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 items-stretch">

        {/* Left Side: Select Plans */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <Link href="/" className="inline-flex items-center space-x-2 text-blue-400 font-bold mb-4 hover:underline">
              <BookOpen className="w-5 h-5" />
              <span>Keeelai Notes</span>
            </Link>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Select Your Plan
            </h1>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              Get premium animated HTML lectures delivered directly to your device.
            </p>

            {/* Currency Selector */}
            <div className="flex bg-[#12141c] border border-gray-800 p-1.5 rounded-xl self-start w-fit mb-6">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${currency === 'USD' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${currency === 'INR' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
              >
                INR (₹)
              </button>
            </div>

            {/* Plans List */}
            <div className="space-y-4">
              {Array.isArray(pricing.plans) && pricing.plans.map((plan: any) => {
                const isSelected = selectedPlan === plan.id;
                const hasDiscount = plan.discount_percent > 0;

                const discountedPriceUsd = plan.price_usd * (1 - (plan.discount_percent || 0) / 100);
                const originalPriceInr = plan.price_usd * exchangeRate;
                const discountedPriceInr = discountedPriceUsd * exchangeRate;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`border cursor-pointer p-4 rounded-xl flex items-center justify-between transition-all relative overflow-hidden ${isSelected ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 bg-[#12141c]/40 hover:border-gray-700'
                      }`}
                  >
                    {hasDiscount && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-bl">
                        Save {plan.discount_percent}%
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-700'
                        }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{plan.name}</h3>
                        <p className="text-xs text-gray-500">
                          {hasDiscount ? (
                            <>
                              Regularly <span className="line-through">
                                {symbol}{currency === 'INR' ? originalPriceInr.toFixed(0) : plan.price_usd.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            plan.subtext || 'Billed monthly'
                          )}
                        </p>
                      </div>
                    </div>

                    <span className={`text-lg font-extrabold ${hasDiscount ? 'text-blue-400' : 'text-white'}`}>
                      {symbol}{currency === 'INR'
                        ? discountedPriceInr.toFixed(0)
                        : discountedPriceUsd.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification info */}
          <div className="pt-6 border-t border-gray-900/60 hidden lg:flex items-center space-x-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-blue-500/60" />
            <span>Secure encryption. Payments processed in real-time.</span>
          </div>
        </div>

        {/* Right Side: Account Setup & Payments */}
        <div className="lg:col-span-5 flex">
          <div className="w-full bg-[#12141c]/90 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-2xl" />

            {message && (
              <div className={`p-4 mb-4 rounded-lg border text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                {message.text}
              </div>
            )}

            {!user ? (
              /* Inline Registration Card */
              <div className="space-y-4">
                <div className="flex border-b border-gray-800 mb-2">
                  <button
                    onClick={() => { setIsLogin(true); setMessage(null); }}
                    className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 ${isLogin ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'
                      }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setIsLogin(false); setMessage(null); }}
                    className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 ${!isLogin ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'
                      }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your Name"
                          required
                          className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit Mobile No."
                          required
                          className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all cursor-pointer text-sm"
                  >
                    {authLoading ? <Loader className="w-5 h-5 animate-spin" /> : <span>{isLogin ? 'Log In to Buy' : 'Create Account & Buy'}</span>}
                  </button>
                </form>
              </div>
            ) : (
              /* Checkout Card */
              <div className="space-y-6 flex-1 flex flex-col justify-between">

                {/* Account Details */}
                <div className="flex justify-between items-center border-b border-gray-850 pb-4">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Logged In</span>
                    <span className="text-xs font-semibold text-white truncate block max-w-[180px]">{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-[10px] border border-gray-800 hover:border-rose-500/20 text-gray-400 hover:text-rose-400 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>

                {/* Coupon Code Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Coupon Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. SAVE20"
                        className="w-full bg-[#181a24] border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white uppercase placeholder-gray-600 focus:outline-none focus:border-blue-500"
                      />
                      <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      {couponLoading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Apply</span>}
                    </button>
                  </div>
                </div>

                {/* Billing Summary */}
                <div className="bg-[#181a24] border border-gray-850 rounded-xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan Base (USD)</span>
                    <span className="font-semibold text-white">${basePriceUsd}</span>
                  </div>

                  {planDiscountPercent > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Plan Discount ({planDiscountPercent}%)</span>
                      <span>-${(basePriceUsd * (planDiscountPercent / 100)).toFixed(2)}</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Coupon Discount ({appliedCoupon.discountPercent}%)</span>
                      <span>-${(priceAfterIntroUsd * (appliedCoupon.discountPercent / 100)).toFixed(2)}</span>
                    </div>
                  )}

                  {currency === 'INR' && (
                    <div className="flex justify-between text-gray-500 border-t border-gray-800/40 pt-2.5">
                      <span className="flex items-center gap-1">
                        <Info className="w-3 h-3" /> Exch. Rate
                      </span>
                      <span>$1 = ₹{exchangeRate.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-gray-800/40 pt-2.5">
                    <span className="text-gray-400">Subtotal ({currency})</span>
                    <span className="font-semibold text-white">{symbol}{activePriceBase.toFixed(currency === 'INR' ? 0 : 2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax ({pricing.tax_percent}%)</span>
                    <span className="font-semibold text-white">{symbol}{taxAmount.toFixed(currency === 'INR' ? 0 : 2)}</span>
                  </div>

                  <div className="flex justify-between border-t border-gray-800 pt-2.5 text-sm font-bold">
                    <span className="text-white">Grand Total</span>
                    <span className="text-blue-400">{symbol}{totalAmount.toFixed(currency === 'INR' ? 0 : 2)}</span>
                  </div>
                </div>

                {/* Razorpay Button */}
                <button
                  onClick={startPayment}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
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
    </main>
  );
}
