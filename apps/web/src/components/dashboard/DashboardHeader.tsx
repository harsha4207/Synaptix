import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { WorkspaceItem, UserProfileInfo } from '../../types/workspace';
import { DateRangeKey } from './types';
import { DateRangeSelector } from './DateRangeSelector';

interface DashboardHeaderProps {
  workspace: WorkspaceItem;
  currentUser?: UserProfileInfo;
  userEmail?: string;
  dateRange: DateRangeKey;
  onDateRangeChange: (range: DateRangeKey) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastRefreshedText: string;
  onNavigateToCommand?: () => void;
  onNavigateToData?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  workspace,
  currentUser,
  userEmail,
  dateRange,
  onDateRangeChange,
  onRefresh,
  isRefreshing,
  lastRefreshedText,
  onNavigateToCommand,
  onNavigateToData,
}) => {
  // Compute contextual time-of-day personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentUser?.name
    ? currentUser.name.split(' ')[0]
    : userEmail
    ? userEmail.split('@')[0].split('.')[0]
    : 'Lead Analyst';

  return (
    <header
      className="dash-stagger-1"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* TOP ROW: BREADCRUMB / DOMAIN CONTEXT & STATUS TELEMETRY */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '12px',
        }}
      >
        {/* Left: Breadcrumb & Isolation Scope */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
            Enterprise Command
          </span>
          <ChevronRight size={12} style={{ color: '#94A3B8' }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: workspace.colorAccent || '#1769E0',
              background: `${workspace.colorAccent || '#1769E0'}14`,
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {workspace.name} Domain
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#059669',
              background: '#ECFDF5',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #A7F3D0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}
            title="Boundary isolation verified: No data leakage across tenants"
          >
            <ShieldCheck size={12} />
            Strict Isolation Active
          </span>
        </div>

        {/* Right: Live Telemetry Status & Last Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              fontSize: '11px',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
              }}
            />
            Live Telemetry
          </span>

          <span
            style={{
              fontSize: '11px',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Clock size={12} />
            {lastRefreshedText}
          </span>
        </div>
      </div>

      {/* BOTTOM ROW: GREETING, TITLE, CONTROLS (DATE SELECTOR & REFRESH) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Title and Short Subtitle */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '2px' }}>
            {getGreeting()}, {displayName}
          </div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0B1F3A',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {workspace.name} Intelligence Console
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#64748B',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            Operational telemetry, knowledge ingestion velocity, and governed agent pipeline execution.
          </p>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {/* Date Range Selector */}
          <DateRangeSelector value={dateRange} onChange={onDateRangeChange} />

          {/* Refresh Action Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="dash-btn-ghost"
            title="Refresh workspace telemetry"
            style={{ height: '32px' }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
              }}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {/* Quick Command Launcher */}
          {onNavigateToCommand && (
            <button
              type="button"
              onClick={onNavigateToCommand}
              className="dash-btn-primary"
              style={{ height: '32px', padding: '0 12px' }}
              title="Open Command Center for AI reasoning"
            >
              <Sparkles size={13} />
              <span>Ask Synaptix</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

