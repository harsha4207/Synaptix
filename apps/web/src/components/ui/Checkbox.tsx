import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, onChange, disabled, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `cb-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label
        htmlFor={inputId}
        style={{
          display: 'inline-flex',
          alignItems: description ? 'flex-start' : 'center',
          gap: 'var(--sp-2)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          userSelect: 'none',
        }}
        className={className}
      >
        <span
          style={{
            position: 'relative',
            width: '18px',
            height: '18px',
            borderRadius: 'var(--r-sm)',
            border: `1px solid ${checked ? 'var(--c-blue)' : 'var(--c-border-2)'}`,
            backgroundColor: checked ? 'var(--c-blue)' : 'var(--c-surface)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--t-fast)',
            flexShrink: 0,
            marginTop: description ? '2px' : '0',
          }}
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              margin: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            {...props}
          />
          {checked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
        </span>
        {(label || description) && (
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            {label && (
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--c-text-1)',
                  lineHeight: 1.3,
                }}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--c-text-3)',
                  marginTop: '2px',
                }}
              >
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
