'use client';

import React from 'react';
import type { ChartPoint } from '@/lib/farmAnalytics';

interface SimpleLineChartProps {
  data: ChartPoint[];
  title: string;
  subtitle?: string;
  color?: string;
  unit?: string;
  secondSeries?: ChartPoint[];
  secondColor?: string;
  secondLabel?: string;
}

export default function SimpleLineChart({
  data,
  title,
  subtitle,
  color = '#2d6a4f',
  unit = '',
  secondSeries,
  secondColor = '#e76f51',
  secondLabel,
}: SimpleLineChartProps) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 mt-6 text-center">No data yet</p>
      </div>
    );
  }

  const allValues = [...data.map((d) => d.value), ...(secondSeries?.map((d) => d.value) || [])];
  const max = Math.max(...allValues, 1) * 1.15;
  const width = 400;
  const height = 160;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const chartW = width - pad.l - pad.r;
  const chartH = height - pad.t - pad.b;

  const toPoints = (series: ChartPoint[]) =>
    series.map((p, i) => ({
      x: pad.l + (i / Math.max(series.length - 1, 1)) * chartW,
      y: pad.t + chartH - (p.value / max) * chartH,
    }));

  const path = (pts: { x: number; y: number }[]) =>
    pts.length ? `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') : '';

  const pts1 = toPoints(data);
  const pts2 = secondSeries ? toPoints(secondSeries) : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-sm text-slate-800">{title}</h4>
          {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
        </div>
        {secondSeries && (
          <div className="flex gap-3 text-[9px]">
            <span className="flex items-center gap-1"><span className="w-2 h-0.5" style={{ background: color }} /> Primary</span>
            {secondLabel && (
              <span className="flex items-center gap-1"><span className="w-2 h-0.5" style={{ background: secondColor }} /> {secondLabel}</span>
            )}
          </div>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {[0, 0.5, 1].map((f) => {
          const y = pad.t + chartH - f * chartH;
          return (
            <g key={f}>
              <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={pad.l - 4} y={y + 3} fontSize="8" textAnchor="end" fill="#94a3b8">
                {Math.round(max * f)}
              </text>
            </g>
          );
        })}
        {path(pts1) && <path d={path(pts1)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />}
        {path(pts2) && <path d={path(pts2)} fill="none" stroke={secondColor} strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />}
        {pts1.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
        ))}
        {data.map((d, i) => (
          <text
            key={d.label}
            x={pts1[i]?.x || 0}
            y={height - 6}
            fontSize="8"
            textAnchor="middle"
            fill="#64748b"
          >
            {d.label}
          </text>
        ))}
      </svg>
      {unit && <p className="text-[9px] text-slate-400 text-right">Unit: {unit}</p>}
    </div>
  );
}
