'use client';

import React from 'react';
import {
  Users,
  HeartPulse,
  Baby,
  Milk,
  TrendingUp,
  TrendingDown,
  Coins,
  Package,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import ProductionChart from '@/components/ProductionChart';
import SimpleLineChart from '@/components/charts/SimpleLineChart';
import SimplePieChart from '@/components/charts/SimplePieChart';
import {
  computeHerdKpis,
  computeFinancialKpis,
  computeMilkKpis,
  monthlyIncomeExpenseSeries,
  formatKesShort,
} from '@/lib/farmAnalytics';

interface FarmPerformanceDashboardProps {
  animals: any[];
  transactions: any[];
  scheduleEvents: any[];
  inventoryItems: any[];
  notifications: any[];
  upcomingSchedule: any[];
  milkChartData: { date: string; value: number }[];
  onNavigate: (tab: string) => void;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'emerald',
  alert = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: 'emerald' | 'rose' | 'blue' | 'amber';
  alert?: boolean;
}) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2 ${alert ? 'ring-1 ring-rose-200' : ''}`}>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[accent]}`}>
          <Icon size={18} />
        </div>
        {alert && <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">ALERT</span>}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  );
}

export default function FarmPerformanceDashboard({
  animals,
  transactions,
  scheduleEvents,
  inventoryItems,
  notifications,
  upcomingSchedule,
  milkChartData,
  onNavigate,
}: FarmPerformanceDashboardProps) {
  const herd = computeHerdKpis(animals);
  const financial = computeFinancialKpis(transactions);
  const milk = computeMilkKpis(animals);
  const { income, expense, profit } = monthlyIncomeExpenseSeries(transactions);
  const lowStock = inventoryItems.filter((i) => i.quantity <= i.lowStockThreshold);
  const attentionCount = herd.sick + upcomingSchedule.length + lowStock.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] rounded-2xl p-6 text-white">
        <h3 className="text-lg font-black">Farm Performance Snapshot</h3>
        <p className="text-sm text-white/70 mt-1">
          Herd health, milk output, and finances at a glance — built for quick decisions.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-white/60 uppercase font-bold">Herd Size</p>
            <p className="text-xl font-black mt-1">{herd.totalLivestock}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-white/60 uppercase font-bold">Milk Today</p>
            <p className="text-xl font-black mt-1">{milk.today.toFixed(1)} L</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-white/60 uppercase font-bold">Income (Month)</p>
            <p className="text-xl font-black mt-1">{formatKesShort(financial.monthIncome)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-white/60 uppercase font-bold">Net Profit</p>
            <p className={`text-xl font-black mt-1 ${financial.monthProfit >= 0 ? 'text-accent' : 'text-rose-300'}`}>
              {formatKesShort(financial.monthProfit)}
            </p>
          </div>
        </div>
      </div>

      {attentionCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertTriangle className="text-amber-600 shrink-0" size={20} />
          <div className="text-xs text-amber-900">
            <p className="font-bold">Animals & tasks needing attention</p>
            <p className="mt-0.5">
              {herd.sick > 0 && `${herd.sick} sick · `}
              {upcomingSchedule.length > 0 && `${upcomingSchedule.length} upcoming reminders · `}
              {lowStock.length > 0 && `${lowStock.length} low stock items`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Livestock" value={herd.totalLivestock} icon={Users} />
        <KpiCard label="Healthy" value={herd.healthy} icon={HeartPulse} accent="emerald" />
        <KpiCard label="Sick" value={herd.sick} icon={HeartPulse} accent="rose" alert={herd.sick > 0} />
        <KpiCard label="Pregnant" value={herd.pregnant} icon={Baby} accent="blue" />
        <KpiCard label="Milk Cows" value={herd.milkProducers} icon={Milk} accent="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="Income vs Expenses"
          subtitle="Last 6 months — primary decision chart"
          data={income}
          secondSeries={expense}
          secondLabel="Expenses"
          unit="KES"
        />
        <SimpleLineChart
          title="Profit Trend"
          subtitle="Income minus expenses"
          data={profit}
          color="#40916c"
          unit="KES"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductionChart data={milkChartData} title="Herd Milk Production" unit="Liters" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
          <h4 className="font-bold text-sm text-slate-800">Quick Actions</h4>
          <div className="space-y-2">
            {[
              { tab: 'herd', label: 'Register Livestock' },
              { tab: 'production', label: 'Log Milk Yield' },
              { tab: 'financials', label: 'Record Transaction' },
              { tab: 'scheduler', label: 'Schedule Vaccination' },
              { tab: 'analytics', label: 'Full Analytics' },
            ].map((a) => (
              <button
                key={a.tab}
                type="button"
                onClick={() => onNavigate(a.tab)}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer text-left"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <TrendingUp size={16} />
            <h5 className="font-bold text-xs">Recent Notifications</h5>
          </div>
          {notifications.slice(0, 3).map((n) => (
            <p key={n.id} className="text-[11px] text-slate-500 border-b border-slate-50 pb-2">
              <span className="font-semibold text-slate-700">{n.title}</span> — {n.message}
            </p>
          ))}
          {!notifications.length && <p className="text-xs text-slate-400">No notifications</p>}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-700">
            <Calendar size={16} />
            <h5 className="font-bold text-xs">Upcoming Tasks</h5>
          </div>
          {upcomingSchedule.slice(0, 3).map((e) => (
            <p key={e.id} className="text-[11px] text-slate-500">
              {e.title} · Due {new Date(e.dueDate).toLocaleDateString()}
            </p>
          ))}
          {!upcomingSchedule.length && <p className="text-xs text-slate-400">Nothing scheduled</p>}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700">
            <Package size={16} />
            <h5 className="font-bold text-xs">Low Stock Alerts</h5>
          </div>
          {lowStock.slice(0, 3).map((i) => (
            <p key={i.id} className="text-[11px] text-slate-500">
              {i.name}: {i.quantity} {i.unit} left
            </p>
          ))}
          {!lowStock.length && <p className="text-xs text-slate-400">Stock levels OK</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Monthly Expenses" value={formatKesShort(financial.monthExpense)} icon={TrendingDown} accent="rose" />
        <KpiCard label="Cash Balance" value={formatKesShort(financial.cashBalance)} icon={Coins} />
        <KpiCard label="Profit Margin" value={`${financial.profitMargin}%`} icon={TrendingUp} accent="emerald" />
        <KpiCard label="Mortality Rate" value={`${herd.mortalityRate}%`} icon={HeartPulse} accent={herd.mortalityRate > 5 ? 'rose' : 'emerald'} />
      </div>
    </div>
  );
}
