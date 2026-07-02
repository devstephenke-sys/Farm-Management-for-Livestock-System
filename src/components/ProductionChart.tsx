'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface ProductionChartProps {
  data: ChartDataPoint[];
  title: string;
  unit: string;
  color?: string;
}

export default function ProductionChart({
  data,
  title,
  unit,
  color = '#2d6a4f',
}: ProductionChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
    idx: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-white text-slate-400 p-6">
        <span className="text-3xl mb-2">📊</span>
        <p className="text-sm font-semibold">No production records recorded yet</p>
        <p className="text-xs text-slate-400 mt-1">Logs will populate this chart automatically.</p>
      </div>
    );
  }

  const chartPoints = [...data].slice(0, 7).reverse();

  const width = 500;
  const height = 220;
  const paddingLeft = 44;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 36;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = chartPoints.map((p) => p.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values);
  const maxScaled = Math.ceil(maxValue * 1.2);

  const pts: { x: number; y: number; val: number; label: string }[] = chartPoints.map((p, index) => {
    const x = paddingLeft + (index / (chartPoints.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.value / maxScaled) * chartHeight;
    return { x, y, val: p.value, label: p.date };
  });

  // Smooth bezier path
  const smoothPath = (points: typeof pts) => {
    if (points.length < 2) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cp1x = points[i].x + (points[i + 1].x - points[i].x) * 0.4;
      const cp1y = points[i].y;
      const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) * 0.4;
      const cp2y = points[i + 1].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
    }
    return d;
  };

  const pathD = smoothPath(pts);
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${paddingTop + chartHeight} L ${pts[0].x} ${paddingTop + chartHeight} Z`;

  const yGridValues = [0, Math.round(maxScaled * 0.25), Math.round(maxScaled * 0.5), Math.round(maxScaled * 0.75), maxScaled];

  // Stats
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const latest = values[values.length - 1] ?? 0;
  const trend = values.length >= 2 ? values[values.length - 1] - values[values.length - 2] : 0;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * width;

      let minDist = Infinity;
      let nearest: { x: number; y: number; val: number; label: string } | null = null;
      let nearestIdx = -1;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const d = Math.abs(p.x - svgX);
        if (d < minDist) {
          minDist = d;
          nearest = p;
          nearestIdx = i;
        }
      }

      if (nearest && minDist < 40) {
        let label = nearest.label;
        try {
          const dt = new Date(nearest.label);
          if (!isNaN(dt.getTime())) {
            label = dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          }
        } catch {}
        setTooltip({ x: nearest.x, y: nearest.y, value: nearest.val, label, idx: nearestIdx });
      } else {
        setTooltip(null);
      }
    },
    [pts, width]
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h4 className="font-extrabold text-slate-800 text-base">{title}</h4>
          <p className="text-xs text-slate-400">Weekly trend ({unit})</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Latest</p>
            <p className="font-extrabold text-slate-800">{latest} {unit}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">7-Day Avg</p>
            <p className="font-extrabold text-slate-800">{avg} {unit}</p>
          </div>
          <div
            className={`text-right px-2.5 py-1.5 rounded-xl text-xs font-extrabold ${
              trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} {unit}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yGridValues.map((val, idx) => {
            const y = paddingTop + chartHeight - (val / maxScaled) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke={idx === 0 ? '#e2e8f0' : '#f1f5f9'}
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? '0' : '4 4'}
                />
                <text
                  x={paddingLeft - 7}
                  y={y + 3.5}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#prodGradient)" />

          {/* Stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Crosshair */}
          {tooltip && (
            <line
              x1={tooltip.x}
              y1={paddingTop}
              x2={tooltip.x}
              y2={paddingTop + chartHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Data dots */}
          {pts.map((p, idx) => {
            const isActive = tooltip?.idx === idx;
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 6 : 4}
                  fill="white"
                  stroke={color}
                  strokeWidth={isActive ? 3 : 2}
                  className="transition-all duration-150"
                  style={{
                    filter: isActive ? `drop-shadow(0 0 6px ${color}88)` : 'none',
                  }}
                />
              </g>
            );
          })}

          {/* Tooltip card */}
          {tooltip && (
            <g>
              <rect
                x={Math.min(Math.max(tooltip.x - 38, paddingLeft), width - paddingRight - 76)}
                y={tooltip.y - 52}
                width="76"
                height="38"
                rx="8"
                fill="#1e293b"
                opacity="0.93"
              />
              <text
                x={Math.min(Math.max(tooltip.x - 38, paddingLeft), width - paddingRight - 76) + 38}
                y={tooltip.y - 35}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
              >
                {tooltip.label}
              </text>
              <text
                x={Math.min(Math.max(tooltip.x - 38, paddingLeft), width - paddingRight - 76) + 38}
                y={tooltip.y - 21}
                fill="white"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                {tooltip.value} {unit}
              </text>
            </g>
          )}

          {/* X-axis labels */}
          {pts.map((p, idx) => {
            let label = p.label;
            try {
              const d = new Date(p.label);
              if (!isNaN(d.getTime())) {
                label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
              }
            } catch {}
            const isActive = tooltip?.idx === idx;
            return (
              <text
                key={idx}
                x={p.x}
                y={height - 8}
                fill={isActive ? '#334155' : '#94a3b8'}
                fontSize="9"
                textAnchor="middle"
                fontWeight={isActive ? 'bold' : '500'}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
