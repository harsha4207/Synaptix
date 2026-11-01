import React, { useState } from 'react';
import { WorkflowTrendPoint } from './types';

interface WorkflowChartProps {
  data: WorkflowTrendPoint[];
  title?: string;
  subtitle?: string;
}

export const WorkflowChart: React.FC<WorkflowChartProps> = ({
  data,
  title = 'Workflow Execution & Governance Trends',
  subtitle = 'Autonomous agent runs, human-in-the-loop sign-offs, and failure rates',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
        No execution data recorded for this range.
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

  // Find max total per bucket for stacked bars
  const maxVal = Math.max(
    ...data.map((d) => d.successful + d.gated + d.failed),
    10
  ) * 1.15;
  const minVal = 0;

  const barWidth = Math.min(chartW / data.length - 8, 28);

  const getX = (i: number) => {
    const slotW = chartW / data.length;
    return padLeft + slotW * i + (slotW - barWidth) / 2;
  };

  const getH = (val: number) => {
    return (val / maxVal) * chartH;
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#16A34A' }} />
            <span>Success</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#D97706' }} />
            <span>Sign-Off Gated</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#DC2626' }} />
            <span>Failed</span>
          </div>
        </div>
      </div>

      {/* SVG CHART */}
      <div style={{ position: 'relative', width: '100%', flex: 1 }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', overflow: 'visible', display: 'block' }}
        >
          {/* Y-AXIS GRID LINES */}
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

          {/* STACKED BARS */}
          {data.map((d, i) => {
            const bx = getX(i);
            const successH = getH(d.successful);
            const gatedH = getH(d.gated);
            const failedH = getH(d.failed);

            const yBase = padTop + chartH;
            const ySuccess = yBase - successH;
            const yGated = ySuccess - gatedH;
            const yFailed = yGated - failedH;

            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Background hover highlight */}
                {isHovered && (
                  <rect
                    x={bx - 4}
                    y={padTop}
                    width={barWidth + 8}
                    height={chartH}
                    fill="#F8FAFC"
                    rx="4"
                  />
                )}

                {/* Successful Segment */}
                {successH > 0 && (
                  <rect
                    x={bx}
                    y={ySuccess}
                    width={barWidth}
                    height={successH}
                    fill="#16A34A"
                    rx={gatedH === 0 && failedH === 0 ? '4' : '0'}
                    style={{ transition: 'all 140ms ease' }}
                  />
                )}

                {/* Gated Segment */}
                {gatedH > 0 && (
                  <rect
                    x={bx}
                    y={yGated}
                    width={barWidth}
                    height={gatedH}
                    fill="#D97706"
                    rx={failedH === 0 ? '4' : '0'}
                    style={{ transition: 'all 140ms ease' }}
                  />
                )}

                {/* Failed Segment */}
                {failedH > 0 && (
                  <rect
                    x={bx}
                    y={yFailed}
                    width={barWidth}
                    height={failedH}
                    fill="#DC2626"
                    rx="4"
                    style={{ transition: 'all 140ms ease' }}
                  />
                )}

                {/* X-axis label */}
                <text
                  x={bx + barWidth / 2}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                  fontFamily="Inter, sans-serif"
                >
                  {d.label}
                </text>

                {/* Hitbox */}
                <rect
                  x={bx - 6}
                  y={padTop}
                  width={barWidth + 12}
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
              left: `${Math.min(Math.max(((getX(hoveredIndex) + barWidth / 2) / width) * 100, 18), 82)}%`,
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
              <span style={{ color: '#86EFAC' }}>Successful:</span>
              <strong>{hoveredPoint.successful}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '2px' }}>
              <span style={{ color: '#FCD34D' }}>Sign-Off Gated:</span>
              <strong>{hoveredPoint.gated}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '2px' }}>
              <span style={{ color: '#FCA5A5' }}>Failed:</span>
              <strong>{hoveredPoint.failed}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

