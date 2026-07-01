'use client';

import React, { useMemo, useState } from 'react';
import { Plus, XCircle, Search } from 'lucide-react';
import SimpleBarChart from '@/components/charts/SimpleBarChart';
import SimplePieChart from '@/components/charts/SimplePieChart';
import SimpleLineChart from '@/components/charts/SimpleLineChart';
import {
  computeFinancialKpis,
  monthlyIncomeExpenseSeries,
  categoryBreakdown,
  monthlyCashFlow,
  formatKesShort,
} from '@/lib/farmAnalytics';

interface FinancialDashboardPanelProps {
  transactions: any[];
  showAddTransaction: boolean;
  setShowAddTransaction: (v: boolean) => void;
  newTransaction: {
    type: string;
    category: string;
    amount: string;
    description: string;
    date: string;
  };
  setNewTransaction: React.Dispatch<
    React.SetStateAction<{
      type: string;
      category: string;
      amount: string;
      description: string;
      date: string;
    }>
  >;
  onSubmitTransaction: (e: React.FormEvent) => void;
}

export default function FinancialDashboardPanel({
  transactions,
  showAddTransaction,
  setShowAddTransaction,
  newTransaction,
  setNewTransaction,
  onSubmitTransaction,
}: FinancialDashboardPanelProps) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const financial = computeFinancialKpis(transactions);
  const { income, expense, profit } = monthlyIncomeExpenseSeries(transactions);
  const expensePie = categoryBreakdown(transactions, 'EXPENSE');
  const incomePie = categoryBreakdown(transactions, 'INCOME');
  const cashFlow = monthlyCashFlow(transactions);

  const categories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    return [...set].sort();
  }, [transactions]);

  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) return false;
      if (dateFrom && new Date(tx.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(tx.date) > new Date(dateTo + 'T23:59:59')) return false;
      if (search) {
        const q = search.toLowerCase();
        const ref = `TX-${tx.id}`.toLowerCase();
        if (
          !ref.includes(q) &&
          !(tx.description || '').toLowerCase().includes(q) &&
          !(tx.category || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, search, dateFrom, dateTo]);

  let runningBalance = 0;
  const ledgerRows = [...filteredTx]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((tx) => {
      const credit = tx.type === 'INCOME' ? tx.amount : 0;
      const debit = tx.type === 'EXPENSE' ? tx.amount : 0;
      runningBalance += credit - debit;
      return { ...tx, credit, debit, balance: runningBalance };
    })
    .reverse();

  return (
    <div className="space-y-6 text-xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Total Income', formatKesShort(financial.income), 'text-emerald-600'],
          ['Total Expenses', formatKesShort(financial.expense), 'text-rose-500'],
          ['Net Profit', formatKesShort(financial.net), financial.net >= 0 ? 'text-primary' : 'text-rose-600'],
          ['Profit Margin', `${financial.profitMargin}%`, 'text-slate-800'],
          ['Monthly Income', formatKesShort(financial.monthIncome), 'text-emerald-700'],
          ['Monthly Expenses', formatKesShort(financial.monthExpense), 'text-rose-600'],
          ['Monthly Profit', formatKesShort(financial.monthProfit), 'text-primary'],
          ['Cash Balance', formatKesShort(financial.cashBalance), 'text-slate-800'],
        ].map(([label, val, cls]) => (
          <div key={String(label)} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
            <p className={`text-lg font-black mt-1 ${cls}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SimpleLineChart
          title="Income vs Expenses"
          subtitle="Monthly comparison"
          data={income}
          secondSeries={expense}
          secondLabel="Expenses"
          unit="KES"
        />
        <SimpleLineChart title="Profit Trend" data={profit} unit="KES" color="#40916c" />
        <SimplePieChart data={expensePie} title="Expense Breakdown" subtitle="Where your money goes" />
        <SimplePieChart data={incomePie} title="Revenue Sources" />
        <SimpleBarChart data={cashFlow} title="Monthly Cash Flow (Net)" unit="KES" />
        <SimpleBarChart data={expensePie.slice(0, 6)} title="Feed & Cost Analysis" horizontal unit="KES" />
      </div>

      <div className={`grid gap-6 ${showAddTransaction ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 ${showAddTransaction ? 'lg:col-span-2' : ''}`}>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h4 className="font-extrabold text-base text-slate-800">Financial Ledger</h4>
            <button
              type="button"
              onClick={() => setShowAddTransaction(!showAddTransaction)}
              className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {showAddTransaction ? <XCircle size={14} /> : <Plus size={14} />}
              <span>{showAddTransaction ? 'Close Form' : 'Record Transaction'}</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-2 bg-slate-50">
              <option value="ALL">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-2 bg-slate-50">
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-2 bg-slate-50" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-2 bg-slate-50" />
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search ref, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-lg bg-slate-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50">
                  <th className="p-2">Date</th>
                  <th className="p-2">Reference</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right">Debit</th>
                  <th className="p-2 text-right">Credit</th>
                  <th className="p-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.length ? (
                  ledgerRows.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="p-2 text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="p-2 font-mono text-[10px]">TX-{tx.id}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-2 font-semibold">{tx.category.replace(/_/g, ' ')}</td>
                      <td className="p-2 text-slate-500 max-w-[140px] truncate">{tx.description || '—'}</td>
                      <td className="p-2 text-right text-rose-700 font-bold">{tx.debit ? `KES ${tx.debit.toLocaleString()}` : '—'}</td>
                      <td className="p-2 text-right text-emerald-700 font-bold">{tx.credit ? `KES ${tx.credit.toLocaleString()}` : '—'}</td>
                      <td className="p-2 text-right font-bold text-slate-800">KES {tx.balance.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">No transactions match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAddTransaction && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 animate-fade-in">
            <h4 className="font-extrabold text-base text-slate-800">Record Cash Flow</h4>
            <p className="text-slate-400">Log income or expenses to update charts and ledger balance.</p>
            <form onSubmit={onSubmitTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Flow Type</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTransaction({
                        ...newTransaction,
                        type: val,
                        category: val === 'INCOME' ? 'MILK_SALES' : 'FEED',
                      });
                    }}
                    className="block w-full px-2 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Category</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="block w-full px-2 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                  >
                    {newTransaction.type === 'INCOME' ? (
                      <>
                        <option value="MILK_SALES">Milk Sales</option>
                        <option value="EGG_SALES">Egg Sales</option>
                        <option value="ANIMAL_SALES">Animal Sales</option>
                        <option value="BREEDING_SERVICES">Breeding Services</option>
                        <option value="OTHER">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="FEED">Feed</option>
                        <option value="MEDICATION">Medication</option>
                        <option value="VET_SERVICES">Veterinary</option>
                        <option value="LABOUR">Labour</option>
                        <option value="TRANSPORT">Transport</option>
                        <option value="OTHER">Other Expenses</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <input type="date" value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50" />
              <input type="number" step="0.01" placeholder="Amount (KES)" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50" />
              <textarea rows={2} placeholder="Description" value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50" />
              <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl cursor-pointer">Submit Cash Entry</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
