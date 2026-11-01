import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Filter,
  ExternalLink
} from 'lucide-react';
import { DashboardActivityRow } from './types';

interface RecentActivityProps {
  activities: DashboardActivityRow[];
  onNavigateToModule?: (targetModule: string) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onNavigateToModule,
}) => {
  const [filterTag, setFilterTag] = useState<string>('All');

  const filterOptions = ['All', 'Analysis', 'Workflows', 'Ingestion', 'Governance'];

  const filteredActivities = activities.filter((act) => {
    if (filterTag === 'All') return true;
    return act.moduleTag.toLowerCase().includes(filterTag.toLowerCase()) ||
           act.description.toLowerCase().includes(filterTag.toLowerCase());
  });

  return (
    <section
      className="dash-card-static dash-stagger-5"
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
      aria-label="Recent Chronological Activity"
    >
      {/* SECTION HEADER & FILTER PILLS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Activity size={16} style={{ color: '#1769E0' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Recent Organizational Activity
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Chronological audit log across analytics runs, data uploads, and governed actions.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {filterOptions.map((opt) => {
            const isSelected = filterTag === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFilterTag(opt)}
                style={{
                  fontSize: '11px',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? '#1769E0' : '#64748B',
                  background: isSelected ? '#EFF6FF' : 'transparent',
                  border: isSelected ? '1px solid #BFDBFE' : '1px solid transparent',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPACT ROWS LIST */}
      <div
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        {filteredActivities.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
            No recent activity matching the selected filter.
          </div>
        ) : (
          filteredActivities.map((act, idx) => {
            const isCompleted = act.status === 'completed';
            const isPending = act.status === 'pending';
            const isWarning = act.status === 'warning';

            return (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  borderBottom: idx < filteredActivities.length - 1 ? '1px solid #F1F5F9' : 'none',
                  gap: '14px',
                  transition: 'background 120ms ease',
                }}
                className="activity-row-hover"
              >
                {/* Left: Status Icon + Module Tag + Event Description */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  {isCompleted && <CheckCircle2 size={14} style={{ color: '#16A34A', flexShrink: 0 }} />}
                  {isPending && <Clock size={14} style={{ color: '#D97706', flexShrink: 0 }} />}
                  {isWarning && <AlertCircle size={14} style={{ color: '#DC2626', flexShrink: 0 }} />}

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#475569',
                      background: '#F1F5F9',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    {act.moduleTag}
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      color: '#0F172A',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {act.description}
                  </span>
                </div>

                {/* Right: Actor + Timestamp + Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {act.actor}
                  </span>

                  <span style={{ fontSize: '11px', color: '#94A3B8', minWidth: '75px', textAlign: 'right' }}>
                    {act.timestamp}
                  </span>

                  {act.targetModule && onNavigateToModule && (
                    <button
                      type="button"
                      onClick={() => onNavigateToModule(act.targetModule!)}
                      className="dash-btn-ghost"
                      style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
                      title={`Jump to ${act.targetModule} module`}
                    >
                      <span>Open</span>
                      <ExternalLink size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

