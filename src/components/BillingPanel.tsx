'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  FileText,
  Info,
  Loader2,
  Search,
  Smartphone,
  Star,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { BRAND, formatKes } from '@/lib/brand';
import { BillingPlan, PLAN_CARDS, PLAN_COMPARISON, PLAN_RANK } from '@/lib/plans';

interface BillingPanelProps {
  activePlan: string;
  isSubscribed: boolean;
  user: {
    subscription?: { endDate?: string } | null;
    phone?: string | null;
  } | null;
  subscriptionDaysLeft: number | null;
  billingPhone: string;
  setBillingPhone: (v: string) => void;
  billingPaying: boolean;
  selectedBillingPlan: BillingPlan | null;
  setSelectedBillingPlan: (p: BillingPlan | null) => void;
  paymentSuccess: { plan: string; expiresAt: string } | null;
  billingError: string | null;
  setBillingError: (msg: string | null) => void;
  showMpesaSimulator: boolean;
  onPay: () => void;
  refreshTrigger?: number;
}

export default function BillingPanel({
  activePlan,
  isSubscribed,
  user,
  subscriptionDaysLeft,
  billingPhone,
  setBillingPhone,
  billingPaying,
  selectedBillingPlan,
  setSelectedBillingPlan,
  paymentSuccess,
  billingError,
  setBillingError,
  showMpesaSimulator,
  onPay,
  refreshTrigger = 0,
}: BillingPanelProps) {
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historySearchInput, setHistorySearchInput] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const currentRank = PLAN_RANK[activePlan as keyof typeof PLAN_RANK] ?? 0;
  const currentPlanInfo = PLAN_CARDS[activePlan as keyof typeof PLAN_CARDS] || PLAN_CARDS.BASIC;
  const phoneValid = billingPhone.replace(/\D/g, '').length >= 9;
  const selectedPlan = selectedBillingPlan ? PLAN_CARDS[selectedBillingPlan] : null;
  const canUpgrade = Boolean(selectedBillingPlan && PLAN_RANK[selectedBillingPlan] > currentRank);

  let progressStep = 1;
  if (phoneValid) progressStep = 2;
  if (phoneValid && canUpgrade) progressStep = 3;
  if (billingPaying || showMpesaSimulator || hasPendingPayment) progressStep = 3;
  if (paymentSuccess) progressStep = 4;

  const progressSteps = [
    { num: 1, label: 'Phone Number' },
    { num: 2, label: 'Choose Plan' },
    { num: 3, label: 'Pay' },
    { num: 4, label: 'Complete' },
  ];

  const loadPaymentHistory = useCallback(async (page: number, search: string) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '5',
      });
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/payments/history?${params}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
        setPagination(data.pagination);
        setHasPendingPayment(!!data.hasPendingPayment);
      }
    } catch {
      setBillingError('Could not load payment history. Try again.');
    } finally {
      setHistoryLoading(false);
    }
  }, [setBillingError]);

  useEffect(() => {
    loadPaymentHistory(historyPage, historySearch);
  }, [historyPage, historySearch, refreshTrigger, loadPaymentHistory]);

  useEffect(() => {
    const t = setTimeout(() => {
      setHistoryPage(1);
      setHistorySearch(historySearchInput);
    }, 350);
    return () => clearTimeout(t);
  }, [historySearchInput]);

  const renderCompareCell = (val: boolean | string) => {
    if (typeof val === 'boolean') {
      return val
        ? <Check size={15} className="text-emerald-600 mx-auto" />
        : <XCircle size={15} className="text-slate-300 mx-auto" />;
    }
    return <span className="text-slate-600 font-medium">{val}</span>;
  };

  const progressPercent = Math.min(100, ((progressStep - 1) / 3) * 100);

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800">Upgrade Your Subscription</h2>
        <p className="text-sm text-slate-500 mt-1">Choose a plan and pay securely with M-Pesa.</p>
      </div>

      {billingError && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-800 animate-scale-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Something went wrong</p>
            <p className="text-xs mt-0.5 text-rose-700">{billingError}</p>
          </div>
          <button
            type="button"
            onClick={() => setBillingError(null)}
            className="text-rose-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {hasPendingPayment && !paymentSuccess && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 status-pending animate-fade-in">
          <Loader2 size={18} className="animate-spin text-amber-600 shrink-0" />
          <p>
            <strong>Payment pending</strong> — complete the M-Pesa prompt on your phone or use the sandbox simulator if testing locally.
          </p>
        </div>
      )}

      {/* Current plan summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4 card-hover animate-fade-in-up stagger-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Star size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Plan</p>
            <p className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {currentPlanInfo.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-xs">
          <div>
            <p className="text-slate-400 font-semibold">Status</p>
            <p className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isSubscribed ? 'Active' : 'Free Trial'}
            </p>
          </div>
          {user?.subscription?.endDate && (
            <>
              <div>
                <p className="text-slate-400 font-semibold">Expires</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {new Date(user.subscription.endDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Remaining</p>
                <p className="font-bold text-slate-800 mt-0.5">{subscriptionDaysLeft} days</p>
              </div>
            </>
          )}
        </div>
      </div>

      {paymentSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4 animate-success-pop">
          <div className="flex items-center gap-2">
            <CheckCircle size={22} className="text-emerald-600" />
            <h3 className="font-extrabold text-emerald-900">Payment Successful</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-emerald-700/70 text-xs">Plan Activated</p>
              <p className="font-black text-emerald-900 text-lg">
                {BRAND.paymentLabel(paymentSuccess.plan)}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Expires:{' '}
                {new Date(paymentSuccess.expiresAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-emerald-700/70 text-xs font-semibold mb-2">New Features</p>
              <ul className="space-y-1">
                {(PLAN_CARDS[paymentSuccess.plan as keyof typeof PLAN_CARDS]?.unlocks || []).map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-emerald-800">
                    <Check size={12} className="text-emerald-600" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-100" />
          <div
            className="absolute top-4 left-8 h-0.5 bg-accent billing-progress-bar transition-all duration-500"
            style={{ ['--billing-progress' as string]: `${progressPercent}%`, width: `${progressPercent}%`, maxWidth: 'calc(100% - 4rem)' }}
          />
          {progressSteps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-1.5 z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
                  progressStep >= s.num
                    ? 'bg-accent border-accent text-primary scale-110 shadow-md shadow-accent/30'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {progressStep > s.num ? <Check size={14} /> : s.num}
              </div>
              <span
                className={`text-[10px] font-bold hidden sm:block transition-colors ${
                  progressStep >= s.num ? 'text-primary' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 animate-fade-in-up stagger-3">
        <span className="font-semibold text-slate-600">How it works:</span> Enter your M-Pesa number, choose a plan, and tap Pay with M-Pesa.
        You&apos;ll receive an STK prompt showing <strong>{BRAND.name}</strong>. Once confirmed, your subscription activates automatically.
      </p>

      {/* Phone number */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 card-hover animate-fade-in-up stagger-3">
        <div className="flex items-center gap-2">
          <Smartphone size={18} className="text-primary" />
          <h3 className="font-bold text-slate-800">M-Pesa Phone Number</h3>
        </div>
        <input
          id="billing-phone-input"
          type="tel"
          value={billingPhone}
          onChange={(e) => {
            setBillingPhone(e.target.value);
            setBillingError(null);
          }}
          className={`block w-full px-4 py-3 border rounded-xl text-slate-800 text-sm bg-slate-50 outline-none transition-all ${
            phoneValid ? 'border-emerald-200 focus:border-accent' : 'border-slate-200 focus:border-accent'
          }`}
          placeholder="0711XXXXXXXX"
          aria-invalid={!phoneValid && billingPhone.length > 0}
        />
        <p className="text-xs text-slate-400">
          We&apos;ll send an STK Push to this number.
        </p>
      </div>

      {/* Choose plan */}
      <div className="space-y-3 animate-fade-in-up stagger-4">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-primary" />
          <h3 className="font-bold text-slate-800">Choose Your Plan</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className={`rounded-2xl p-5 border flex flex-col transition-all duration-300 ${
              activePlan === 'BASIC' ? 'border-accent bg-emerald-50/40' : 'border-slate-100 bg-white'
            }`}
          >
            <h4 className="font-bold text-slate-800">Basic</h4>
            <p className="text-xl font-black text-primary mt-2">
              KES 500<span className="text-xs font-normal text-slate-400">/month</span>
            </p>
            <ul className="space-y-1.5 mt-4 text-xs text-slate-600 flex-1">
              {PLAN_CARDS.BASIC.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check size={12} className="text-accent shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <button disabled className="mt-5 w-full py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed">
              {activePlan === 'BASIC' ? 'Current Plan' : 'Included'}
            </button>
          </div>

          <div
            onClick={() => currentRank < 1 && setSelectedBillingPlan('STANDARD')}
            className={`rounded-2xl p-5 border flex flex-col cursor-pointer transition-all duration-300 relative card-hover ${
              selectedBillingPlan === 'STANDARD'
                ? 'border-accent ring-2 ring-accent/30 bg-emerald-50/30 animate-plan-select'
                : activePlan === 'STANDARD'
                  ? 'border-blue-400 bg-blue-50/30'
                  : 'border-slate-100 bg-gradient-to-b from-emerald-50/50 to-white hover:border-accent/50 hover:-translate-y-1'
            } ${currentRank >= 1 ? 'opacity-80 cursor-default' : ''}`}
          >
            {activePlan !== 'STANDARD' && currentRank < 1 && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold bg-accent text-primary px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                <Star size={10} fill="currentColor" /> MOST POPULAR
              </span>
            )}
            <h4 className="font-bold text-slate-800 mt-1">Standard</h4>
            <p className="text-xl font-black text-primary mt-2">
              KES 1,500<span className="text-xs font-normal text-slate-400">/month</span>
            </p>
            <ul className="space-y-1.5 mt-4 text-xs text-slate-600 flex-1">
              {PLAN_CARDS.STANDARD.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check size={12} className="text-accent shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={currentRank >= 1}
              onClick={(e) => {
                e.stopPropagation();
                if (currentRank < 1) setSelectedBillingPlan('STANDARD');
              }}
              className={`mt-5 w-full py-2.5 text-xs font-bold rounded-xl transition-colors ${
                activePlan === 'STANDARD'
                  ? 'bg-blue-100 text-blue-800 cursor-default'
                  : selectedBillingPlan === 'STANDARD'
                    ? 'bg-accent text-primary'
                    : 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
              }`}
            >
              {activePlan === 'STANDARD' ? 'Current Plan' : selectedBillingPlan === 'STANDARD' ? '✓ Selected' : 'Select'}
            </button>
          </div>

          <div
            onClick={() => currentRank < 2 && setSelectedBillingPlan('PREMIUM')}
            className={`rounded-2xl p-5 border flex flex-col cursor-pointer transition-all duration-300 card-hover ${
              selectedBillingPlan === 'PREMIUM'
                ? 'border-accent ring-2 ring-accent/30 bg-emerald-50/30 animate-plan-select'
                : activePlan === 'PREMIUM'
                  ? 'border-amber-400 bg-amber-50/30'
                  : 'border-slate-100 bg-white hover:border-accent/50 hover:-translate-y-1'
            } ${currentRank >= 2 ? 'opacity-80 cursor-default' : ''}`}
          >
            <h4 className="font-bold text-slate-800">Premium</h4>
            <p className="text-xl font-black text-primary mt-2">
              KES 3,500<span className="text-xs font-normal text-slate-400">/month</span>
            </p>
            <ul className="space-y-1.5 mt-4 text-xs text-slate-600 flex-1">
              {PLAN_CARDS.PREMIUM.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check size={12} className="text-accent shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={currentRank >= 2}
              onClick={(e) => {
                e.stopPropagation();
                if (currentRank < 2) setSelectedBillingPlan('PREMIUM');
              }}
              className={`mt-5 w-full py-2.5 text-xs font-bold rounded-xl transition-colors ${
                activePlan === 'PREMIUM'
                  ? 'bg-amber-100 text-amber-800 cursor-default'
                  : selectedBillingPlan === 'PREMIUM'
                    ? 'bg-accent text-primary'
                    : 'bg-slate-800 text-white hover:bg-slate-900 cursor-pointer'
              }`}
            >
              {activePlan === 'PREMIUM' ? 'Current Plan' : selectedBillingPlan === 'PREMIUM' ? '✓ Selected' : 'Upgrade'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mt-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left p-3 font-bold text-slate-500">Feature</th>
                <th className="p-3 font-bold text-slate-500 text-center">Basic</th>
                <th className="p-3 font-bold text-slate-500 text-center">Standard</th>
                <th className="p-3 font-bold text-slate-500 text-center">Premium</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-slate-50">
                  <td className="p-3 font-medium text-slate-700">{row.feature}</td>
                  <td className="p-3 text-center">{renderCompareCell(row.basic)}</td>
                  <td className="p-3 text-center">{renderCompareCell(row.standard)}</td>
                  <td className="p-3 text-center">{renderCompareCell(row.premium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canUpgrade && selectedPlan && selectedBillingPlan && (
        <div className="bg-white rounded-2xl border-2 border-accent/30 shadow-sm p-5 space-y-4 animate-scale-in">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-primary" />
            <h3 className="font-bold text-slate-800">Selected Plan</h3>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-2xl font-black text-slate-800">{selectedPlan.name}</p>
              <p className="text-lg font-bold text-amber-700 mt-1">
                KES {selectedPlan.testPrice}{' '}
                <span className="text-xs font-normal text-slate-400">(Sandbox)</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Production price: KES {selectedPlan.price.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-1">
              <button
                type="button"
                onClick={onPay}
                disabled={billingPaying || !phoneValid}
                className="px-8 py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {billingPaying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Smartphone size={16} /> Pay with M-Pesa
                  </>
                )}
              </button>
            </div>
          </div>
          {!phoneValid && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Enter your M-Pesa phone number above to continue.
            </p>
          )}
        </div>
      )}

      {currentRank >= 2 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-800 text-center font-semibold">
          You&apos;re on the highest plan. No upgrade needed.
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 animate-fade-in">
        <div className="flex items-center gap-2 font-bold mb-3">
          <Info size={16} className="text-blue-600" />
          <span>Sandbox Mode</span>
        </div>
        <p className="text-blue-800 mb-3">You&apos;re testing payments. Charges below are for development only.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-blue-800 mb-1.5">Actual Prices</p>
            <div className="space-y-0.5 font-mono text-[11px]">
              <p>Basic.......KES 500</p>
              <p>Standard....KES 1,500</p>
              <p>Premium.....KES 3,500</p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-blue-800 mb-1.5">Test Charges</p>
            <div className="space-y-0.5 font-mono text-[11px]">
              <p>Basic.......KES 1</p>
              <p>Standard....KES 2</p>
              <p>Premium.....KES 3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment history with search + pagination */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <span className="font-bold text-sm text-slate-800">Payment History</span>
            {pagination.total > 0 && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                {pagination.total}
              </span>
            )}
          </div>
          {showPaymentHistory ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </button>

        {showPaymentHistory && (
          <div className="border-t border-slate-100 p-4 space-y-4 animate-fade-in">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={historySearchInput}
                onChange={(e) => setHistorySearchInput(e.target.value)}
                placeholder="Search receipt, plan, or status..."
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none transition-colors"
              />
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-xs">
                <Loader2 size={16} className="animate-spin" />
                Loading transactions...
              </div>
            ) : payments.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="pb-2 font-bold">Date</th>
                        <th className="pb-2 font-bold">Receipt</th>
                        <th className="pb-2 font-bold">Plan</th>
                        <th className="pb-2 font-bold">Amount</th>
                        <th className="pb-2 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p: any, idx: number) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-50 animate-fade-in"
                          style={{ animationDelay: `${idx * 40}ms` }}
                        >
                          <td className="py-2.5 text-slate-500 whitespace-nowrap">
                            {new Date(p.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 font-mono text-[10px]">{p.mpesaReceiptNumber || '—'}</td>
                          <td className="py-2.5 font-semibold uppercase">{p.plan}</td>
                          <td className="py-2.5">KES {formatKes(p.amount)}</td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                p.status === 'SUCCESS'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : p.status === 'FAILED'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                              } ${p.status === 'PENDING' ? 'status-pending' : ''}`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400">
                      Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!pagination.hasPrev || historyLoading}
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>
                      <button
                        type="button"
                        disabled={!pagination.hasNext || historyLoading}
                        onClick={() => setHistoryPage((p) => p + 1)}
                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                {historySearch ? 'No payments match your search.' : 'No payments yet.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
