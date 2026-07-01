'use client';

import React from 'react';

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
  color = '#2d6a4f', // Default jade green
}: ProductionChartProps) {
  // Fallback if no data
  if (!data || data.length === 0) {
    return (
      <div className="h-64 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-white text-slate-400 p-6">
        <span className="text-3xl mb-2">📊</span>
        <p className="text-sm font-semibold">No production records recorded yet</p>
        <p className="text-xs text-slate-400 mt-1">Logs will populate this chart trend automatically.</p>
      </div>
    );
  }

  // Take last 7 data points for clean plotting, reverse to display chronologically (past -> present)
  const chartPoints = [...data].slice(0, 7).reverse();

  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value to scale Y-axis
  const values = chartPoints.map((p) => p.value);
  const maxValue = Math.max(...values, 5); // default min max value is 5 to prevent divide by zero
  const maxScaled = Math.ceil(maxValue * 1.15); // Add 15% headroom

  // Calculate coordinates
  const points = chartPoints.map((p, index) => {
    const x = paddingLeft + (index / (chartPoints.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.value / maxScaled) * chartHeight;
    return { x, y, val: p.value, label: p.date };
  });

  // Generate SVG path for polyline area and stroke line
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
    areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  // Generate Y-axis grid labels (3 intervals)
  const yGridValues = [0, Math.round(maxScaled / 2), maxScaled];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-slate-800 text-base">{title}</h4>
          <p className="text-xs text-slate-400">Weekly trend ({unit})</p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase">
          7-Day Logs
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Y-axis Grid Lines & Labels */}
          {yGridValues.map((val, idx) => {
            const y = paddingTop + chartHeight - (val / maxScaled) * chartHeight;
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area under the path (gradient simulated or solid opacity) */}
          {areaD && (
            <path
              d={areaD}
              fill={color}
              fillOpacity="0.08"
            />
          )}

          {/* Stroke Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points (Dots and hover text labels) */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="white"
                stroke={color}
                strokeWidth="2.5"
                className="transition-all duration-150 group-hover:r-[6.5]"
              />
              {/* Tooltip background card */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                <rect
                  x={p.x - 30}
                  y={p.y - 32}
                  width="60"
                  height="22"
                  rx="6"
                  fill="#1e293b"
                />
                <text
                  x={p.x}
                  y={p.y - 18}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.val} {unit}
                </text>
              </g>
            </g>
          ))}

          {/* X-axis labels (Dates) */}
          {points.map((p, idx) => {
            // Shorten date format for layout fit e.g. "2026-06-24" to "24 Jun"
            let label = p.label;
            try {
              const d = new Date(p.label);
              if (!isNaN(d.getTime())) {
                label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
              }
            } catch (e) {}

            return (
              <text
                key={idx}
                x={p.x}
                y={height - 8}
                fill="#64748b"
                fontSize="9"
                textAnchor="middle"
                fontWeight="500"
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
