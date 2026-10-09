import React from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  label,
  className = '',
  style,
}) => {
  if (label && orientation === 'horizontal') {
    return (
      <div className={`divider ${className}`.trim()} style={style} role="separator">
        <span>{label}</span>
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={className}
        style={{
          width: '1px',
          backgroundColor: 'var(--c-border)',
          alignSelf: 'stretch',
          ...style,
        }}
      />
    );
  }

  return (
    <hr
      className={`hr ${className}`.trim()}
      role="separator"
      style={{
        border: 'none',
        borderTop: '1px solid var(--c-border)',
        margin: 'var(--sp-4) 0',
        ...style,
      }}
    />
  );
};
