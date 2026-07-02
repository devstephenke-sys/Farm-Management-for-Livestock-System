'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full flex flex-col items-center justify-center gap-2">
        <span className="text-3xl opacity-30">📊</span>
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 text-center">No data yet</p>
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
        <div className="space-y-3">
          {data.map((d, i) => {
            const isHovered = hoveredIndex === i;
            const pct = Math.max(2, (d.value / max) * 100);
            return (
              <div
                key={d.label}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className={`font-semibold truncate max-w-[60%] transition-colors ${isHovered ? 'text-slate-800' : 'text-slate-600'}`}>
                    {d.label}
                  </span>
                  <span className={`font-bold transition-colors ${isHovered ? 'text-primary' : 'text-slate-500'}`}>
                    {d.value}{unit ? ` ${unit}` : ''}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      opacity: isHovered ? 1 : 0.75,
                      boxShadow: isHovered ? `0 0 8px ${CHART_COLORS[i % CHART_COLORS.length]}55` : 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical bar chart
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-sm text-slate-800">{title}</h4>
          {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
        </div>
        {hoveredIndex !== null && (
          <div className="text-right animate-fade-in">
            <p className="text-[10px] text-slate-400 font-semibold">{data[hoveredIndex]?.label}</p>
            <p className="text-sm font-extrabold text-primary">
              {data[hoveredIndex]?.value}{unit ? ` ${unit}` : ''}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => {
          const isHovered = hoveredIndex === i;
          const heightPct = Math.max(8, (d.value / max) * 100);
          return (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center gap-1 min-w-0 cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className={`text-[9px] font-bold transition-all duration-200 ${
                  isHovered ? 'text-primary scale-110' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                }`}
              >
                {d.value}
              </span>
              <div
                className="w-full rounded-t-lg transition-all duration-300 ease-out"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: i === 0 ? color : CHART_COLORS[i % CHART_COLORS.length],
                  opacity: hoveredIndex === null ? 0.8 : isHovered ? 1 : 0.35,
                  transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                  boxShadow: isHovered
                    ? `0 -4px 12px ${i === 0 ? color : CHART_COLORS[i % CHART_COLORS.length]}55`
                    : 'none',
                  minHeight: d.value > 0 ? '8px' : '2px',
                }}
              />
              <span className={`text-[8px] text-center truncate w-full transition-colors ${isHovered ? 'text-slate-700 font-bold' : 'text-slate-400'}`}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
