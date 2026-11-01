import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, HelpCircle, ArrowUpRight } from 'lucide-react';
import { KpiMetric } from './types';

interface MetricCardProps {
  metric: KpiMetric;
  onClick?: () => void;
  staggerIndex?: number;
}

// Gentle numerical count-up component based on RAF
const AnimatedValue: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}> = ({ value, prefix = '', suffix = '', duration = 650 }) => {
  const [displayVal, setDisplayVal] = useState<number>(() => (value < 10 ? value : 0));

  useEffect(() => {
    // If value is a floating point (e.g. 99.4), we preserve 1 decimal
    const isFloat = value % 1 !== 0;
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Quad ease-out
      const eased = progress * (2 - progress);
      const current = eased * value;

      setDisplayVal(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formatted = displayVal.toLocaleString(undefined, {
    minimumFractionDigits: value % 1 !== 0 ? 1 : 0,
    maximumFractionDigits: 1,
  });

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export const MetricCard: React.FC<MetricCardProps> = ({ metric, onClick, staggerIndex = 1 }) => {
  const Icon = metric.icon;
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`dash-card dash-stagger-${Math.min(staggerIndex, 5)}`}
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '142px',
        cursor: isClickable ? 'pointer' : 'default',
        position: 'relative',
        outline: 'none',
      }}
      title={metric.tooltip}
    >
      {/* CARD HEADER: LABEL + ICON CONTAINER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.3,
          }}
        >
          {metric.label}
        </span>

        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#F1F5F9',
            color: '#1769E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 180ms ease, color 180ms ease',
          }}
        >
          <Icon size={16} />
        </div>
      </div>

      {/* NUMERICAL VALUE & TREND */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0B1F3A',
            letterSpacing: '-0.02em',
            fontFeatureSettings: '"tnum"',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.2,
          }}
        >
          <AnimatedValue
            value={metric.value}
            prefix={metric.prefix}
            suffix={metric.suffix}
          />
        </div>

        {metric.trend && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '11px',
              fontWeight: 600,
              color: metric.trend.isPositive ? '#16A34A' : '#DC2626',
              background: metric.trend.isPositive ? '#F0FDF4' : '#FEF2F2',
              padding: '1px 6px',
              borderRadius: '4px',
              border: `1px solid ${metric.trend.isPositive ? '#BBF7D0' : '#FECACA'}`,
            }}
            title={metric.trend.label}
          >
            {metric.trend.isPositive ? (
              <TrendingUp size={11} />
            ) : (
              <TrendingDown size={11} />
            )}
            {metric.trend.value > 0 ? `+${metric.trend.value}%` : `${metric.trend.value}%`}
          </span>
        )}
      </div>

      {/* CARD FOOTER: SUBTEXT & JUMP HINT */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #F8FAFC',
          fontSize: '11px',
          color: '#64748B',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {metric.subtext}
        </span>

        {isClickable && (
          <ArrowUpRight
            size={12}
            style={{ color: '#94A3B8', flexShrink: 0, marginLeft: '4px' }}
          />
        )}
      </div>
    </div>
  );
};

