'use client';

import React, { useState } from 'react';

interface TrendPoint {
  date: string;
  interest: number; // 0-100 relative scale
}

interface KeywordTrendChartProps {
  data: TrendPoint[];
  seed: string;
}

export default function KeywordTrendChart({ data, seed }: KeywordTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-center p-6 border border-dashed border-[hsl(220,10%,20%)] rounded-xl bg-[hsl(220,14%,8%)]">
        <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
          Insufficient historical query volume to compute search interest curve.
        </p>
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 100;
  const minVal = 0;

  // Calculate coordinates for points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.interest / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Build SVG path
  const pathD = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`;
    // Bezier smoothing between points
    const prev = points[index - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  // Build Area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Summary statistics
  const peakInterest = Math.max(...data.map((d) => d.interest));
  const currentInterest = data[data.length - 1]?.interest ?? 0;
  const firstInterest = data[0]?.interest ?? 0;
  const diff = currentInterest - firstInterest;

  return (
    <div className="space-y-4">
      {/* Top Stat Pills */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,18%)] rounded-xl p-3 text-left">
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)] block mb-1">
            Current Interest
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
              {currentInterest}
            </span>
            <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
              / 100
            </span>
          </div>
        </div>

        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,18%)] rounded-xl p-3 text-left">
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)] block mb-1">
            Peak (12-Mo High)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(145,60%,55%)]">
              {peakInterest}
            </span>
            <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
              / 100
            </span>
          </div>
        </div>

        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,18%)] rounded-xl p-3 text-left">
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)] block mb-1">
            Trajectory
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-sm sm:text-base font-bold font-[family-name:var(--font-mono)] ${
                diff > 5
                  ? 'text-[hsl(145,60%,55%)]'
                  : diff < -5
                  ? 'text-[hsl(0,70%,60%)]'
                  : 'text-[hsl(42,95%,55%)]'
              }`}
            >
              {diff > 5 ? `↗ Rising (+${diff})` : diff < -5 ? `↘ Cooling (${diff})` : '→ Steady'}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="bg-[hsl(220,14%,8%)] border border-[hsl(220,10%,18%)] rounded-xl p-3 sm:p-5 relative overflow-hidden">
        {/* Subtle grid lines */}
        <div className="relative w-full aspect-[800/260]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible select-none"
          >
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145,60%,45%)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="hsl(145,60%,45%)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y Axis Grid & Labels */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = paddingTop + chartHeight - (val / 100) * chartHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="hsl(220, 10%, 16%)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-[hsl(40,8%,45%)] font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area */}
            <path d={areaD} fill="url(#emeraldGradient)" />

            {/* Line Path */}
            <path
              d={pathD}
              fill="none"
              stroke="hsl(145, 60%, 55%)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Points */}
            {points.map((p, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx} className="cursor-pointer">
                  {/* Invisible hit target */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {/* Visual point dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5 : 3}
                    fill={isHovered ? 'hsl(40, 20%, 95%)' : 'hsl(145, 60%, 55%)'}
                    stroke="hsl(220, 15%, 8%)"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />

                  {/* Active Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={Math.max(10, Math.min(width - 150, p.x - 70))}
                        y={Math.max(5, p.y - 48)}
                        width="140"
                        height="38"
                        rx="6"
                        fill="hsl(220, 16%, 12%)"
                        stroke="hsl(220, 10%, 25%)"
                      />
                      <text
                        x={Math.max(10, Math.min(width - 150, p.x - 70)) + 70}
                        y={Math.max(5, p.y - 48) + 16}
                        textAnchor="middle"
                        className="text-[10px] fill-[hsl(40,8%,60%)] font-mono"
                      >
                        {p.date}
                      </text>
                      <text
                        x={Math.max(10, Math.min(width - 150, p.x - 70)) + 70}
                        y={Math.max(5, p.y - 48) + 30}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-[hsl(145,60%,55%)] font-mono"
                      >
                        Interest: {p.interest} / 100
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* X Axis Labels */}
            {points
              .filter((_, idx) => idx % Math.ceil(points.length / 6) === 0 || idx === points.length - 1)
              .map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  className="text-[10px] fill-[hsl(40,8%,45%)] font-mono"
                >
                  {p.date}
                </text>
              ))}
          </svg>
        </div>

        {/* Honesty Constraint Disclaimer */}
        <div className="mt-4 pt-3 border-t border-[hsl(220,10%,16%)] flex items-start sm:items-center justify-between gap-2 text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
          <span>
            ⚖️ <strong>Relative interest (0–100 scale)</strong> over time via Google Trends. Not absolute monthly search volume.
          </span>
          <span className="shrink-0 text-[hsl(145,60%,55%)]">Live Grounded</span>
        </div>
      </div>
    </div>
  );
}
