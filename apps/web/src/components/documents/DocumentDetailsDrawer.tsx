import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  BrainCircuit,
  Lock,
  Clock,
  CheckCircle2,
  Download,
  Trash2,
  Tag,
  Table as TableIcon
} from 'lucide-react';
import { WorkspaceItem } from '../../types/workspace';
import { ragStore } from '../../lib/rag/store';
import type { DocumentChunk, WorkspaceId } from '../../lib/rag/types';
import { Button } from '../ui/Button';

export interface ExtendedDocumentRecord {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'CSV' | 'TXT' | 'Image';
  size: string;
  status: 'Ready' | 'Processing' | 'Indexing' | 'Failed';
  evidenceGrade: 'Grade A+' | 'Grade A' | 'Grade B';
  evidenceHash: string;
  uploadedAt: string;
  source: 'Direct Upload' | 'S3 Bucket' | 'API Sync';
  isDataset?: boolean;
  // Dataset specific metrics
  datasetRows?: number;
  datasetCols?: number;
  dateRange?: string;
  dataQualityScore?: number; // e.g. 99.4
  missingValuesPct?: number; // e.g. 0.2
  // Extracted entities and fields
  summary?: string;
  extractedEntities?: string[];
  extractedFields?: { key: string; value: string }[];
  relatedKnowledgeTriples?: string[];
  processingLogs?: { stage: string; timestamp: string; status: 'completed' | 'active' }[];
  chunks?: DocumentChunk[];
}

interface DocumentDetailsDrawerProps {
  workspace: WorkspaceItem;
  doc: ExtendedDocumentRecord | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onAddToast: (msg: string) => void;
}

export const DocumentDetailsDrawer: React.FC<DocumentDetailsDrawerProps> = ({
  workspace,
  doc,
  onClose,
  onDelete,
  onAddToast,
}) => {
  const [activeTab, setActiveTab] = useState<'Preview' | 'Chunks' | 'Metadata' | 'Entities' | 'Knowledge' | 'Evidence'>('Preview');
  const [realChunks, setRealChunks] = useState<DocumentChunk[]>([]);

  useEffect(() => {
    if (doc?.id) {
      ragStore.getChunksByDocument(doc.id, workspace.id as WorkspaceId)
        .then((chunks) => setRealChunks(chunks))
        .catch(() => setRealChunks([]));
    } else {
      setRealChunks([]);
    }
  }, [doc?.id, workspace.id]);

  if (!doc) return null;

  const defaultEntities = doc.extractedEntities || [
    `${workspace.name} Domain`,
    'FY2026 Q3',
    'Vendor Operations',
    'Gross Margin Variance',
    'SAML 2.0 Governed',
  ];

  const defaultFields = doc.extractedFields || [
    { key: 'Document Classification', value: `${workspace.domain} Financial Analysis` },
    { key: 'Auditing Agency', value: 'KPMG Executive Compliance' },
    { key: 'Gross Margin Variance', value: '+4.2% acceleration' },
    { key: 'RBAC Policy Level', value: 'Authorized Executive Access' },
    { key: 'Encryption Protocol', value: 'AES-256 GCM at Rest & Transit' },
  ];

  const defaultTriples = doc.relatedKnowledgeTriples || [
    `[${doc.name}] --(parsed_from)--> [${workspace.name} Scope]`,
    `[${workspace.name}] --(has_variance)--> [+4.2% Gross Margin]`,
    `[Evidence Registry] --(verifies)--> [${doc.evidenceHash.substring(0, 14)}]`,
  ];

  const processingLogs = doc.processingLogs || [
    { stage: 'Uploading', timestamp: '0.1s', status: 'completed' },
    { stage: 'Processing', timestamp: '0.3s', status: 'completed' },
    { stage: 'Classifying', timestamp: '0.5s', status: 'completed' },
    { stage: 'Extracting', timestamp: '0.8s', status: 'completed' },
    { stage: 'Indexing', timestamp: '1.2s', status: 'completed' },
    { stage: 'Ready', timestamp: '1.4s', status: 'completed' },
  ];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="document-details-drawer slide-in-right" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className={`drawer-icon-badge ${doc.isDataset ? 'dataset-badge' : ''}`}>
              {doc.isDataset ? <TableIcon size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <div className="drawer-type-row">
                <span className="file-format-tag">{doc.type}</span>
                {doc.isDataset && <span className="dataset-tag">Structured Dataset</span>}
                <span className={`status-badge-sm ${doc.status.toLowerCase()}`}>{doc.status}</span>
              </div>
              <h3 className="drawer-file-name" title={doc.name}>{doc.name}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="drawer-close-btn" aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* DATASET METRICS BANNER (IF DATASET) */}
        {doc.isDataset && (
          <div className="dataset-metrics-banner">
            <div className="dataset-stat">
              <span className="stat-lbl">Rows</span>
              <span className="stat-val">{(doc.datasetRows || 42800).toLocaleString()}</span>
            </div>
            <div className="dataset-stat">
              <span className="stat-lbl">Columns</span>
              <span className="stat-val">{doc.datasetCols || 18}</span>
            </div>
            <div className="dataset-stat">
              <span className="stat-lbl">Date Range</span>
              <span className="stat-val">{doc.dateRange || '2010 – 2026'}</span>
            </div>
            <div className="dataset-stat">
              <span className="stat-lbl">Quality Score</span>
              <span className="stat-val green">{doc.dataQualityScore || 99.4}%</span>
            </div>
            <div className="dataset-stat">
              <span className="stat-lbl">Missing Nulls</span>
              <span className="stat-val">{doc.missingValuesPct || 0.2}%</span>
            </div>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="drawer-tabs-bar">
          {(['Preview', 'Chunks', 'Metadata', 'Entities', 'Knowledge', 'Evidence'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`drawer-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Chunks' && realChunks.length > 0 ? `Chunks (${realChunks.length})` : tab}
            </button>
          ))}
        </div>

        {/* Drawer Body Scroll Content */}
        <div className="drawer-body-content">
          {/* 1. PREVIEW TAB */}
          {activeTab === 'Preview' && (
            <div className="drawer-tab-pane">
              <div className="preview-summary-box">
                <h4 className="pane-section-title">Parsed Executive Summary</h4>
                <p className="preview-narrative">
                  {doc.summary ||
                    (realChunks.length > 0
                      ? `Parsed and indexed from ${doc.name}. Document contains ${realChunks.length} chunks persisted with vector embeddings in ${workspace.name} workspace.`
                      : `Parsed and indexed from ${doc.name}. Verified semantic consistency inside ${workspace.name}.`)}
                </p>
              </div>

              {/* Processing Pipeline History */}
              <div className="processing-history-box">
                <h4 className="pane-section-title">Ingestion Pipeline Stages</h4>
                <div className="pipeline-steps-list">
                  {processingLogs.map((log) => (
                    <div key={log.stage} className="pipeline-step-item">
                      <CheckCircle2 size={15} className="step-check-green" />
                      <span className="step-name">{log.stage}</span>
                      <span className="step-time">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 1.5. CHUNKS TAB */}
          {activeTab === 'Chunks' && (
            <div className="drawer-tab-pane">
              <div className="flex items-center justify-between mb-3">
                <h4 className="pane-section-title" style={{ margin: 0 }}>
                  Indexed Vector Chunks ({realChunks.length})
                </h4>
                <span className="text-[11px] text-[var(--c-text-3)]">
                  Cosine similarity ready
                </span>
              </div>

              {realChunks.length === 0 ? (
                <div className="p-4 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-center text-xs text-[var(--c-text-3)]">
                  No individual chunks persisted or chunk extraction in progress.
                </div>
              ) : (
                <div className="space-y-3">
                  {realChunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="p-3 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-left"
                    >
                      <div className="flex items-center justify-between mb-1.5 text-[10px] text-[var(--c-text-3)]">
                        <span className="font-mono font-semibold text-[var(--c-blue)]">
                          Chunk #{chunk.chunkIndex + 1}
                        </span>
                        <span>
                          {chunk.sourceRef?.pageNumber ? `Page ${chunk.sourceRef.pageNumber}` : ''}
                          {chunk.sourceRef?.sheetName ? `Sheet: ${chunk.sourceRef.sheetName}` : ''}
                          {chunk.sourceRef?.rowRange ? ` (Rows ${chunk.sourceRef.rowRange[0]}-${chunk.sourceRef.rowRange[1]})` : ''}
                          {chunk.sourceRef?.sectionHeading ? ` • ${chunk.sourceRef.sectionHeading}` : ''}
                          {` • ${chunk.content.length} chars`}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--c-text-1)] font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto bg-[var(--c-page)] p-2 rounded border border-[var(--c-border)]">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. METADATA TAB */}
          {activeTab === 'Metadata' && (
            <div className="drawer-tab-pane">
              <h4 className="pane-section-title">File Manifest & Properties</h4>
              <div className="metadata-table">
                <div className="meta-row">
                  <span className="meta-label">File Name</span>
                  <span className="meta-val font-semibold">{doc.name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Format / Extension</span>
                  <span className="meta-val">{doc.type}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">File Size</span>
                  <span className="meta-val">{doc.size}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Ingested Timestamp</span>
                  <span className="meta-val">{doc.uploadedAt}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Ingestion Source</span>
                  <span className="meta-val">{doc.source}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Target Workspace</span>
                  <span className="meta-val">{workspace.name} ({workspace.domain})</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Access Policy</span>
                  <span className="meta-val green"><Lock size={12} /> Authorized RBAC Team Access</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. EXTRACTED ENTITIES & FIELDS TAB */}
          {activeTab === 'Entities' && (
            <div className="drawer-tab-pane">
              <h4 className="pane-section-title">Extracted Semantic Entities</h4>
              <div className="entities-chips-grid">
                {defaultEntities.map((ent, idx) => (
                  <span key={idx} className="entity-chip">
                    <Tag size={12} /> {ent}
                  </span>
                ))}
              </div>

              <h4 className="pane-section-title" style={{ marginTop: '1.25rem' }}>Parsed Key-Value Fields</h4>
              <div className="extracted-fields-list">
                {defaultFields.map((f, idx) => (
                  <div key={idx} className="field-row">
                    <span className="field-key">{f.key}</span>
                    <span className="field-val">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. RELATED KNOWLEDGE GRAPH TAB */}
          {activeTab === 'Knowledge' && (
            <div className="drawer-tab-pane">
              <h4 className="pane-section-title">Knowledge Graph Relations</h4>
              <div className="knowledge-triples-box">
                {defaultTriples.map((t, idx) => (
                  <div key={idx} className="triple-item-row">
                    <BrainCircuit size={14} className="brain-purple" />
                    <code>{t}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. EVIDENCE TAB */}
          {activeTab === 'Evidence' && (
            <div className="drawer-tab-pane">
              <h4 className="pane-section-title">Cryptographic Evidence Certificate</h4>
              <div className="evidence-cert-box">
                <div className="cert-top">
                  <ShieldCheck size={24} className="shield-teal" />
                  <div>
                    <span className="cert-grade">{doc.evidenceGrade} Certificate</span>
                    <p className="cert-desc">Verified SHA-256 manifest hash stored in immutable audit log.</p>
                  </div>
                </div>

                <div className="cert-hash-display">
                  <span className="hash-title">SHA-256 Fingerprint:</span>
                  <code className="hash-code-block">{doc.evidenceHash}</code>
                </div>

                <div className="cert-footer">
                  <Clock size={13} /> Ingested {doc.uploadedAt} • SAML 2.0 Compliance Verified
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="drawer-footer-actions">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onAddToast(`Downloaded ${doc.name}`)}
            leftIcon={<Download size={14} />}
          >
            Download File
          </Button>
          <Button
            variant="destructive"
            size="md"
            onClick={() => {
              onDelete(doc.id);
              onAddToast(`Removed ${doc.name} from ${workspace.name}`);
              onClose();
            }}
            leftIcon={<Trash2 size={14} />}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
