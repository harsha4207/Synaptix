import React, { useState } from 'react';
import { X, Cloud, Check } from 'lucide-react';
import { WorkspaceItem } from '../../types/workspace';

interface ConnectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceItem;
  onConnectSource: (sourceName: string) => void;
}

export const ConnectSourceModal: React.FC<ConnectSourceModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onConnectSource,
}) => {
  const [selectedSource, setSelectedSource] = useState('Amazon S3 Bucket');

  if (!isOpen) return null;

  const sources = [
    { name: 'Amazon S3 Bucket', desc: 'Sync enterprise documents & PDF manifests from AWS' },
    { name: 'Google Cloud Storage', desc: 'Automated document ingestion from GCP buckets' },
    { name: 'Snowflake Data Warehouse', desc: 'Direct relational database & view connection' },
    { name: 'REST API Sync Pipeline', desc: 'Continuous webhook sync for active records' },
  ];

  const handleConnect = () => {
    onConnectSource(selectedSource);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title-group">
            <div className="modal-icon-badge blue">
              <Cloud size={20} />
            </div>
            <div>
              <h3>Connect External Source to {workspace.name}</h3>
              <p>Configure automated data synchronization boundaries</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="sources-selection-list">
          {sources.map((src) => (
            <div
              key={src.name}
              className={`source-connect-card ${selectedSource === src.name ? 'active' : ''}`}
              onClick={() => setSelectedSource(src.name)}
            >
              <div className="source-info">
                <span className="source-title">{src.name}</span>
                <p className="source-desc">{src.desc}</p>
              </div>
              {selectedSource === src.name && <Check size={16} className="check-icon-blue" />}
            </div>
          ))}
        </div>

        <div className="modal-actions-row">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button type="button" onClick={handleConnect} className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem' }}>
            Connect {selectedSource.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};
