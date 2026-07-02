'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
    series: 'primary' | 'secondary';
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h4 className="font-bold text-sm text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 mt-6 text-center">No data yet</p>
      </div>
    );
  }

  const allValues = [...data.map((d) => d.value), ...(secondSeries?.map((d) => d.value) || [])];
  const max = Math.max(...allValues, 1) * 1.2;
  const width = 400;
  const height = 180;
  const pad = { l: 40, r: 16, t: 16, b: 32 };
  const chartW = width - pad.l - pad.r;
  const chartH = height - pad.t - pad.b;

  const toPoints = (series: ChartPoint[]) =>
    series.map((p, i) => ({
      x: pad.l + (i / Math.max(series.length - 1, 1)) * chartW,
      y: pad.t + chartH - (p.value / max) * chartH,
      value: p.value,
      label: p.label,
    }));

  const path = (pts: { x: number; y: number }[]) =>
    pts.length ? `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') : '';

  const areaPath = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return '';
    const line = path(pts);
    return `${line} L ${pts[pts.length - 1].x} ${pad.t + chartH} L ${pts[0].x} ${pad.t + chartH} Z`;
  };

  const pts1 = toPoints(data);
  const pts2: { x: number; y: number; value: number; label: string }[] = secondSeries ? toPoints(secondSeries) : [];

  // Y axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * width;

      // Find nearest point in pts1
      let minDist = Infinity;
      let nearest: typeof pts1[0] | null = null;
      let nearestSeries: 'primary' | 'secondary' = 'primary';

      for (const p of pts1) {
        const d = Math.abs(p.x - svgX);
        if (d < minDist) {
          minDist = d;
          nearest = p;
          nearestSeries = 'primary';
        }
      }
      for (const p of pts2) {
        const d = Math.abs(p.x - svgX);
        if (d < minDist) {
          minDist = d;
          nearest = p;
          nearestSeries = 'secondary';
        }
      }

      if (nearest && minDist < 30) {
        setTooltip({ x: nearest.x, y: nearest.y, value: nearest.value, label: nearest.label, series: nearestSeries });
      } else {
        setTooltip(null);
      }
    },
    [pts1, pts2, width]
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-sm text-slate-800">{title}</h4>
          {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 text-[9px] flex-wrap justify-end">
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 rounded inline-block" style={{ background: color }} />
            <span className="text-slate-500 font-semibold">Primary</span>
          </span>
          {secondSeries && secondLabel && (
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5 rounded inline-block border-dashed border-t-2" style={{ borderColor: secondColor }} />
              <span className="text-slate-500 font-semibold">{secondLabel}</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Gradient defs */}
          <defs>
            <linearGradient id="lineGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
            {secondSeries && (
              <linearGradient id="lineGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={secondColor} stopOpacity="0.12" />
                <stop offset="100%" stopColor={secondColor} stopOpacity="0.01" />
              </linearGradient>
            )}
          </defs>

          {/* Y-axis grid lines */}
          {yTicks.map((f) => {
            const y = pad.t + chartH - f * chartH;
            return (
              <g key={f}>
                <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={pad.l - 5} y={y + 3} fontSize="8" textAnchor="end" fill="#94a3b8">
                  {Math.round(max * f)}
                </text>
              </g>
            );
          })}

          {/* Area fills */}
          {areaPath(pts1) && <path d={areaPath(pts1)} fill="url(#lineGrad1)" />}
          {pts2.length > 0 && areaPath(pts2) && <path d={areaPath(pts2)} fill="url(#lineGrad2)" />}

          {/* Lines */}
          {path(pts1) && (
            <path d={path(pts1)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {path(pts2) && (
            <path d={path(pts2)} fill="none" stroke={secondColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" />
          )}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={d.label}
              x={pts1[i]?.x || 0}
              y={height - 8}
              fontSize="8"
              textAnchor="middle"
              fill={tooltip?.label === d.label ? '#1e293b' : '#94a3b8'}
              fontWeight={tooltip?.label === d.label ? 'bold' : 'normal'}
            >
              {d.label}
            </text>
          ))}

          {/* Crosshair + dots on hover */}
          {tooltip && (
            <>
              {/* Vertical crosshair */}
              <line
                x1={tooltip.x}
                y1={pad.t}
                x2={tooltip.x}
                y2={pad.t + chartH}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Active dot — primary */}
              {pts1.find((p) => p.label === tooltip.label) && (
                <circle
                  cx={tooltip.x}
                  cy={tooltip.y}
                  r="5"
                  fill="white"
                  stroke={color}
                  strokeWidth="2.5"
                />
              )}

              {/* Tooltip card */}
              <g>
                <rect
                  x={Math.min(tooltip.x - 35, width - pad.r - 75)}
                  y={tooltip.y - 44}
                  width="74"
                  height="34"
                  rx="7"
                  fill="#1e293b"
                  opacity="0.93"
                />
                <text
                  x={Math.min(tooltip.x - 35, width - pad.r - 75) + 37}
                  y={tooltip.y - 28}
                  fontSize="9"
                  textAnchor="middle"
                  fill="#94a3b8"
                >
                  {tooltip.label}
                </text>
                <text
                  x={Math.min(tooltip.x - 35, width - pad.r - 75) + 37}
                  y={tooltip.y - 16}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="white"
                >
                  {tooltip.value}{unit ? ` ${unit}` : ''}
                </text>
              </g>
            </>
          )}

          {/* Resting dots */}
          {pts1.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={tooltip?.label === p.label ? 0 : 3}
              fill="white"
              stroke={color}
              strokeWidth="2"
            />
          ))}
          {pts2.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={tooltip?.label === p.label ? 0 : 2.5}
              fill="white"
              stroke={secondColor}
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>

      {unit && <p className="text-[9px] text-slate-400 text-right">Unit: {unit}</p>}
    </div>
  );
}
