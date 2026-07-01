'use client';

import React from 'react';
import type { ChartPoint } from '@/lib/farmAnalytics';
import { CHART_COLORS } from '@/lib/farmAnalytics';

interface SimplePieChartProps {
  data: ChartPoint[];
  title: string;
  subtitle?: string;
}

export default function SimplePieChart({ data, title, subtitle }: SimplePieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!total) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full">
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 mt-6 text-center">No data yet</p>
      </div>
    );
  }

  let cumulative = 0;
  const slices = data.map((d, i) => {
    const start = cumulative;
    cumulative += (d.value / total) * 100;
    return { ...d, start, end: cumulative, color: CHART_COLORS[i % CHART_COLORS.length] };
  });

  const gradient = slices
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(', ');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      <div>
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 rounded-full shrink-0"
          style={{ background: `conic-gradient(${gradient})` }}
        />
        <div className="space-y-1.5 flex-1 min-w-0">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-slate-600 truncate flex-1">{s.label}</span>
              <span className="font-bold text-slate-800">{Math.round((s.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
