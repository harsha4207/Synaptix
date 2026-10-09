import React from 'react';
import { FileText, Database, ExternalLink, Trash2 } from 'lucide-react';
import { EvidenceBadge } from './StatusBadge';

interface DocumentCardProps {
  title: string;
  fileType: 'PDF' | 'CSV' | 'DOCX' | 'JSON' | 'XLSX';
  fileSize: string;
  uploadedAt: string;
  verifiedHash?: string;
  onPreview?: () => void;
  onDelete?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  fileType,
  fileSize,
  uploadedAt,
  verifiedHash,
  onPreview,
  onDelete,
}) => {
  return (
    <div className="ds-document-card">
      <div className="doc-card-header">
        <div className="doc-type-badge">
          {fileType === 'CSV' || fileType === 'XLSX' || fileType === 'JSON' ? (
            <Database size={16} />
          ) : (
            <FileText size={16} />
          )}
          <span>{fileType}</span>
        </div>
        {verifiedHash && <EvidenceBadge hash={verifiedHash} />}
      </div>

      <h4 className="doc-card-title">{title}</h4>
      
      <div className="doc-card-meta">
        <span>{fileSize}</span>
        <span className="dot-sep">•</span>
        <span>{uploadedAt}</span>
      </div>

      <div className="doc-card-actions">
        {onPreview && (
          <button type="button" onClick={onPreview} className="doc-action-btn">
            <ExternalLink size={14} /> View
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="doc-action-btn danger">
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>
    </div>
  );
};
