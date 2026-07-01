'use client';

import React from 'react';
import type { ChartPoint } from '@/lib/farmAnalytics';
import { CHART_COLORS } from '@/lib/farmAnalytics';

interface SimpleBarChartProps {
  data: ChartPoint[];
  title: string;
  subtitle?: string;
  horizontal?: boolean;
  unit?: string;
  color?: string;
}

export default function SimpleBarChart({
  data,
  title,
  subtitle,
  horizontal = false,
  unit = '',
  color = CHART_COLORS[0],
}: SimpleBarChartProps) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full">
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 mt-6 text-center">No data yet</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
        <div>
          <h4 className="font-bold text-sm text-slate-800">{title}</h4>
          {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
        </div>
        <div className="space-y-2.5">
          {data.map((d, i) => (
            <div key={d.label}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-semibold text-slate-600 truncate max-w-[60%]">{d.label}</span>
                <span className="text-slate-500">{d.value}{unit ? ` ${unit}` : ''}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(d.value / max) * 100}%`,
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      <div>
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[9px] font-bold text-slate-500">{d.value}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.max(8, (d.value / max) * 100)}%`,
                backgroundColor: i === 0 ? color : CHART_COLORS[i % CHART_COLORS.length],
                minHeight: d.value > 0 ? '8px' : '2px',
              }}
            />
            <span className="text-[8px] text-slate-400 text-center truncate w-full">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
