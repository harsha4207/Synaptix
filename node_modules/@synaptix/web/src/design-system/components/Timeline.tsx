import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { StatusBadge, StatusType, EvidenceBadge } from './StatusBadge';

export interface TimelineItem {
  id: string;
  stage: 'UNDERSTAND' | 'ORGANIZE' | 'REASON' | 'ANALYZE' | 'PLAN' | 'GOVERN' | 'ACT' | 'VERIFY' | 'EVOLVE';
  title: string;
  description: string;
  timestamp: string;
  status: StatusType;
  evidenceHash?: string;
  actor?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, title = 'Audit & Execution Timeline' }) => {
  return (
    <div className="ds-timeline-container">
      {title && <h3 className="timeline-section-title">{title}</h3>}

      <div className="timeline-list">
        {items.map((item, idx) => (
          <div key={item.id} className="timeline-item">
            {/* Left Line & Bullet */}
            <div className="timeline-axis">
              <div className={`timeline-bullet ${item.status}`}>
                <CheckCircle2 size={14} />
              </div>
              {idx < items.length - 1 && <div className="timeline-line" />}
            </div>

            {/* Content */}
            <div className="timeline-content-card">
              <div className="timeline-item-header">
                <span className="stage-pill">{item.stage}</span>
                <StatusBadge status={item.status} size="sm" />
                <span className="timeline-time">{item.timestamp}</span>
              </div>

              <h4 className="timeline-item-title">{item.title}</h4>
              <p className="timeline-item-desc">{item.description}</p>

              <div className="timeline-item-footer">
                {item.actor && <span className="actor-tag">Actor: {item.actor}</span>}
                {item.evidenceHash && <EvidenceBadge hash={item.evidenceHash} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
