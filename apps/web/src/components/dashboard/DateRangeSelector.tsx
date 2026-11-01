import React from 'react';
import { Calendar } from 'lucide-react';
import { DateRangeKey, DateRangeOption } from './types';

interface DateRangeSelectorProps {
  value: DateRangeKey;
  onChange: (key: DateRangeKey) => void;
}

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { key: '7d', label: '7D', description: 'Last 7 Days', days: 7 },
  { key: '30d', label: '30D', description: 'Last 30 Days', days: 30 },
  { key: 'qtd', label: 'QTD', description: 'Quarter to Date', days: 90 },
  { key: 'ytd', label: 'YTD', description: 'Year to Date', days: 365 },
  { key: 'all', label: 'All', description: 'All Time Historical', days: 730 },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ value, onChange }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#F1F5F9',
        borderRadius: '8px',
        padding: '3px',
        border: '1px solid #E2E8F0',
        gap: '2px',
      }}
      role="group"
      aria-label="Date range selector"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 6px',
          color: '#64748B',
        }}
        title="Filter dashboard time horizon"
      >
        <Calendar size={13} />
      </div>

      {DATE_RANGE_OPTIONS.map((opt) => {
        const isSelected = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            title={opt.description}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? '#1769E0' : '#64748B',
              background: isSelected ? '#FFFFFF' : 'transparent',
              border: isSelected ? '1px solid #CBD5E1' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 160ms ease',
              boxShadow: isSelected ? '0 1px 2px rgba(11, 31, 58, 0.05)' : 'none',
              outline: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

