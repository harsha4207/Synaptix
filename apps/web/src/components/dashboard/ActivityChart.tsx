import React, { useState } from 'react';
import { AiActivityPoint } from './types';

interface ActivityChartProps {
  data: AiActivityPoint[];
  title?: string;
  subtitle?: string;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  data,
  title = 'AI Reasoning Activity Over Time',
  subtitle = 'Daily requests processed across boundary and verified grounding rate',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
        No telemetry data available for this range.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(...data.map((d) => d.requests), 10) * 1.15;
  const minVal = 0;

  const getX = (i: number) => {
    if (data.length <= 1) return padLeft + chartW / 2;
    return padLeft + (i / (data.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  };

  // Generate SVG path for line
  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.requests)}`).join(' ');
  const areaPoints = `${getX(0)},${padTop + chartH} ` + linePoints + ` ${getX(data.length - 1)},${padTop + chartH}`;

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '12px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#0F172A',
              margin: '0 0 2px 0',
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            {subtitle}
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#1769E0' }} />
            <span>AI Requests</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            <span>Grounded (99%)</span>
          </div>
        </div>
      </div>

      {/* SVG CHART */}
      <div style={{ position: 'relative', width: '100%', flex: 1 }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', overflow: 'visible', display: 'block' }}
        >
          <defs>
            <linearGradient id="aiActivityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1769E0" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1769E0" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Y-AXIS GRID LINES (4 steps) */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = padTop + chartH * (1 - ratio);
            const val = Math.round(minVal + ratio * (maxVal - minVal));
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? 'none' : '3,3'}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* GRADIENT AREA */}
          <polygon points={areaPoints} fill="url(#aiActivityGrad)" />

          {/* PRIMARY LINE */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#1769E0"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* DATA POINTS & INTERACTIVE HITBOXES */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.requests);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Vertical guide on hover */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + chartH}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Visible dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? '#1769E0' : '#FFFFFF'}
                  stroke="#1769E0"
                  strokeWidth={isHovered ? 2.5 : 1.8}
                  style={{ transition: 'all 120ms ease' }}
                />

                {/* X-Axis label */}
                {(i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0) && (
                  <text
                    x={cx}
                    y={padTop + chartH + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748B"
                    fontFamily="Inter, sans-serif"
                  >
                    {d.label}
                  </text>
                )}

                {/* Invisible hover hitbox */}
                <rect
                  x={cx - chartW / (data.length * 2)}
                  y={padTop}
                  width={chartW / data.length}
                  height={chartH + padBottom}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* FLOATING TOOLTIP */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: `${Math.min(Math.max((getX(hoveredIndex) / width) * 100, 15), 85)}%`,
              transform: 'translateX(-50%)',
              background: '#0B1F3A',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11px',
              boxShadow: '0 4px 14px rgba(11, 31, 58, 0.25)',
              pointerEvents: 'none',
              zIndex: 20,
              minWidth: '150px',
              border: '1px solid #1E3A8A',
            }}
          >
            <div style={{ fontWeight: 600, color: '#93C5FD', marginBottom: '4px' }}>
              {hoveredPoint.dateStr}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: '#CBD5E1' }}>AI Requests:</span>
              <strong style={{ color: '#FFFFFF' }}>{hoveredPoint.requests.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '2px' }}>
              <span style={{ color: '#CBD5E1' }}>Grounding:</span>
              <strong style={{ color: '#34D399' }}>{hoveredPoint.groundedPct}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '2px' }}>
              <span style={{ color: '#CBD5E1' }}>Avg Latency:</span>
              <span style={{ color: '#E2E8F0' }}>{hoveredPoint.avgLatencyMs}ms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

