import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  retryLabel = 'Retry',
  className = '',
}) => {
  return (
    <div
      className={`error-state-card ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--sp-10) var(--sp-6)',
        backgroundColor: 'var(--c-danger-bg)',
        border: '1px solid var(--c-danger-border)',
        borderRadius: 'var(--r-xl)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--c-danger)',
          marginBottom: 'var(--sp-3)',
        }}
      >
        <AlertTriangle size={24} />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: 'var(--c-danger)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {message && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--c-text-2)',
            maxWidth: '440px',
            marginTop: 'var(--sp-2)',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      )}
      {onRetry && (
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw size={14} />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
