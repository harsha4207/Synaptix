import React from 'react';

export interface LoadingStateProps {
  message?: string;
  rows?: number;
  type?: 'spinner' | 'skeleton';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  rows = 3,
  type = 'skeleton',
  className = '',
}) => {
  if (type === 'spinner') {
    return (
      <div
        className={`loading-container ${className}`.trim()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--sp-12) var(--sp-6)',
          gap: 'var(--sp-3)',
        }}
      >
        <div className="spinner spinner-dark" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
        {message && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-2)', fontWeight: 500 }}>
            {message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`skeleton-group ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        padding: 'var(--sp-6)',
        backgroundColor: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 'var(--r-xl)',
      }}
    >
      <div className="skeleton skeleton-heading skeleton-50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`skeleton skeleton-text ${i % 2 === 0 ? 'skeleton-full' : 'skeleton-75'}`}
        />
      ))}
    </div>
  );
};
