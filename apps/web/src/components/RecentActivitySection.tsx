import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { RecentActivityItem } from '../types/workspace';

interface RecentActivitySectionProps {
  activities: RecentActivityItem[];
  onSelectWorkspace: (workspaceId: string) => void;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  activities,
  onSelectWorkspace,
}) => {
  return (
    <div className="recent-activity-card" aria-label="Cross-Workspace Recent Activity">
      <div className="card-section-header">
        <h3 className="card-section-title">Recent Activity</h3>
        <span className="card-subtitle-tag">Authorized Workspaces</span>
      </div>

      {activities.length === 0 ? (
        <div className="activity-empty-state">
          <Clock size={20} className="empty-clock-icon" />
          <p>Your recent activity will appear here as you work across domains.</p>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((act) => (
            <div
              key={act.id}
              className="activity-item"
              onClick={() => onSelectWorkspace(act.workspaceId)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectWorkspace(act.workspaceId);
                }
              }}
            >
              <div className="activity-status-col">
                {act.status === 'completed' ? (
                  <CheckCircle2 size={16} className="status-icon completed" />
                ) : (
                  <AlertCircle size={16} className="status-icon pending" />
                )}
              </div>

              <div className="activity-details-col">
                <div className="activity-top-line">
                  <span className="activity-domain-pill">{act.workspaceName}</span>
                  <span className="activity-type-label">{act.activityType}</span>
                </div>
                <p className="activity-desc">{act.description}</p>
              </div>

              <div className="activity-time-col">
                <span className="activity-time-text">{act.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
