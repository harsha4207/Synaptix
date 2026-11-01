import React from 'react';
import { Database, RefreshCw, UploadCloud, ArrowRight } from 'lucide-react';

interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  title = 'No Domain Activity In Selected Window',
  description = 'No telemetry records or workflow events were recorded for the selected time horizon. Broaden the date filter or ingest documents to establish baseline models.',
  actionText = 'Reset to Last 30 Days',
  onAction,
  secondaryActionText = 'Ingest Documents',
  onSecondaryAction,
}) => {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '56px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        margin: '24px 0',
        boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: '#F1F5F9',
          color: '#1769E0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Database size={24} />
      </div>

      <div style={{ maxWidth: '460px' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#0F172A',
            marginBottom: '6px',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: '#64748B',
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onAction && actionText && (
          <button
            type="button"
            onClick={onAction}
            className="dash-btn-primary"
          >
            <RefreshCw size={14} />
            <span>{actionText}</span>
          </button>
        )}
        {onSecondaryAction && secondaryActionText && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="dash-btn-ghost"
          >
            <UploadCloud size={14} />
            <span>{secondaryActionText}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

