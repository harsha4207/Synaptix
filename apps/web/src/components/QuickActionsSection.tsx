import React from 'react';
import { MessageSquarePlus, UploadCloud, FolderPlus, ArrowRight } from 'lucide-react';

interface QuickActionsSectionProps {
  onFocusCommandInput: () => void;
  onUploadDataClick: () => void;
  onCreateWorkspaceClick: () => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onFocusCommandInput,
  onUploadDataClick,
  onCreateWorkspaceClick,
}) => {
  return (
    <section className="quick-actions-bar-section" aria-label="Quick Actions">
      <div className="quick-actions-bar-container">
        {/* Action 1: Ask Synaptix */}
        <button
          type="button"
          onClick={onFocusCommandInput}
          className="quick-action-bar-btn"
          title="Focus command center"
        >
          <div className="action-bar-icon blue">
            <MessageSquarePlus size={18} />
          </div>
          <div className="action-bar-text">
            <span className="action-bar-title">Ask Synaptix</span>
            <span className="action-bar-desc">Focus command center</span>
          </div>
          <ArrowRight size={14} className="action-bar-arrow" />
        </button>

        <div className="action-bar-divider" aria-hidden="true" />

        {/* Action 2: Upload Data */}
        <button
          type="button"
          onClick={onUploadDataClick}
          className="quick-action-bar-btn"
          title="Ingest documents & datasets"
        >
          <div className="action-bar-icon cyan">
            <UploadCloud size={18} />
          </div>
          <div className="action-bar-text">
            <span className="action-bar-title">Upload Data</span>
            <span className="action-bar-desc">Ingest docs & data</span>
          </div>
          <ArrowRight size={14} className="action-bar-arrow" />
        </button>

        <div className="action-bar-divider" aria-hidden="true" />

        {/* Action 3: Create Workspace */}
        <button
          type="button"
          onClick={onCreateWorkspaceClick}
          className="quick-action-bar-btn"
          title="Add new domain boundary"
        >
          <div className="action-bar-icon navy">
            <FolderPlus size={18} />
          </div>
          <div className="action-bar-text">
            <span className="action-bar-title">Create Workspace</span>
            <span className="action-bar-desc">New domain boundary</span>
          </div>
          <ArrowRight size={14} className="action-bar-arrow" />
        </button>
      </div>
    </section>
  );
};
