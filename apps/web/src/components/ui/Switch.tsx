import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
  className = '',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: description ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: 'var(--sp-4)',
      }}
      className={className}
    >
      {(label || description) && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {label && (
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--c-text-1)',
              }}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--c-text-2)',
                marginTop: '2px',
              }}
            >
              {description}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        id={id}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: '38px',
          height: '22px',
          borderRadius: 'var(--r-full)',
          backgroundColor: checked ? 'var(--c-blue)' : 'var(--c-border-2)',
          position: 'relative',
          padding: '2px',
          transition: 'background-color var(--t-fast)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          flexShrink: 0,
          border: 'none',
        }}
      >
        <span
          style={{
            display: 'block',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform var(--t-fast)',
          }}
        />
      </button>
    </div>
  );
};
