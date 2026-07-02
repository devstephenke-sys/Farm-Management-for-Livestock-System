'use client';

import React, { useState } from 'react';
import type { ChartPoint } from '@/lib/farmAnalytics';
import { CHART_COLORS } from '@/lib/farmAnalytics';

interface SimplePieChartProps {
  data: ChartPoint[];
  title: string;
  subtitle?: string;
}

// Convert percentage arcs to SVG path d-string for a donut slice
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, innerR: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const si = polarToCartesian(cx, cy, innerR, startDeg);
  const ei = polarToCartesian(cx, cy, innerR, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${s.x} ${s.y}`,
    `A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`,
    `L ${ei.x} ${ei.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${si.x} ${si.y}`,
    'Z',
  ].join(' ');
}

export default function SimplePieChart({ data, title, subtitle }: SimplePieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (!total) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full flex flex-col items-center justify-center gap-2">
        <span className="text-3xl opacity-30">🥧</span>
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 text-center">No data yet</p>
      </div>
    );
  }

  const cx = 80;
  const cy = 80;
  const R = 68;
  const innerR = 42; // Donut hole radius

  // Build slices with start/end angles
  let cumulative = 0;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const startDeg = cumulative * 360;
    cumulative += pct;
    const endDeg = cumulative * 360;
    return {
      ...d,
      pct,
      startDeg,
      endDeg,
      color: CHART_COLORS[i % CHART_COLORS.length],
      index: i,
    };
  });

  const hoveredSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      <div>
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        {/* Donut SVG */}
        <div className="relative shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160" className="overflow-visible">
            {slices.map((s) => {
              const isHovered = hoveredIndex === s.index;
              // Push outward on hover
              const offsetAngle = (s.startDeg + s.endDeg) / 2;
              const offsetRad = ((offsetAngle - 90) * Math.PI) / 180;
              const tx = isHovered ? Math.cos(offsetRad) * 6 : 0;
              const ty = isHovered ? Math.sin(offsetRad) * 6 : 0;

              return (
                <path
                  key={s.index}
                  d={slicePath(cx, cy, R, innerR, s.startDeg, s.endDeg)}
                  fill={s.color}
                  opacity={hoveredIndex === null ? 0.88 : isHovered ? 1 : 0.4}
                  transform={`translate(${tx}, ${ty})`}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    filter: isHovered ? `drop-shadow(0 4px 10px ${s.color}88)` : 'none',
                  }}
                  onMouseEnter={() => setHoveredIndex(s.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* Center text — shows hovered slice value or total */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {hoveredSlice ? hoveredSlice.label : 'Total'}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">
              {hoveredSlice
                ? `${Math.round(hoveredSlice.pct * 100)}%`
                : total}
            </text>
            {hoveredSlice && (
              <text x={cx} y={cy + 22} textAnchor="middle" fontSize="8" fill="#64748b">
                {hoveredSlice.value} units
              </text>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 min-w-[120px]">
          {slices.map((s) => {
            const isHovered = hoveredIndex === s.index;
            return (
              <div
                key={s.label}
                className="flex items-center gap-2 text-[10px] cursor-pointer rounded-lg px-1.5 py-1 transition-colors"
                style={{
                  backgroundColor: isHovered ? `${s.color}15` : 'transparent',
                }}
                onMouseEnter={() => setHoveredIndex(s.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                  style={{
                    backgroundColor: s.color,
                    transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                  }}
                />
                <span className={`flex-1 truncate transition-colors ${isHovered ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                  {s.label}
                </span>
                <span className={`font-bold transition-colors ${isHovered ? 'text-slate-900' : 'text-slate-600'}`}>
                  {Math.round(s.pct * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
