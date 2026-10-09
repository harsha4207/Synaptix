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
    <div className="quick-actions-card" aria-label="Quick Actions">
      <div className="card-section-header">
        <h3 className="card-section-title">Quick Actions</h3>
        <span className="card-subtitle-tag">Global Shortcuts</span>
      </div>

      <div className="quick-actions-list">
        {/* Ask Synaptix */}
        <button type="button" onClick={onFocusCommandInput} className="quick-action-item">
          <div className="action-icon-circle blue">
            <MessageSquarePlus size={18} />
          </div>
          <div className="action-text">
            <h4>Ask Synaptix</h4>
            <p>Focus command center</p>
          </div>
          <ArrowRight size={14} className="action-arrow" />
        </button>

        {/* Upload Data */}
        <button type="button" onClick={onUploadDataClick} className="quick-action-item">
          <div className="action-icon-circle cyan">
            <UploadCloud size={18} />
          </div>
          <div className="action-text">
            <h4>Upload Data</h4>
            <p>Ingest documents & datasets</p>
          </div>
          <ArrowRight size={14} className="action-arrow" />
        </button>

        {/* Create Workspace */}
        <button type="button" onClick={onCreateWorkspaceClick} className="quick-action-item">
          <div className="action-icon-circle navy">
            <FolderPlus size={18} />
          </div>
          <div className="action-text">
            <h4>Create Workspace</h4>
            <p>Add new domain boundary</p>
          </div>
          <ArrowRight size={14} className="action-arrow" />
        </button>
      </div>
    </div>
  );
};
