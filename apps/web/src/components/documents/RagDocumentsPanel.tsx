/**
 * RagDocumentsPanel
 * Integrates the real RAG ingestion pipeline into the DocumentsModule.
 * Shows live processing status, real ingestion pipeline stages, and indexed document list.
 */

import React, { useEffect, useState } from 'react';
import {
  Upload,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Trash2,
  FileText,
  RefreshCw,
  Database,
  Eye,
  XCircle,
} from 'lucide-react';
import { useRag } from '../../lib/rag/RagContext';
import type { RagDocumentWithProgress } from '../../lib/rag/RagContext';
import type { WorkspaceId } from '../../lib/rag/types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface RagDocumentsPanelProps {
  workspaceId: WorkspaceId;
  onAddToast: (msg: string) => void;
  onSelectDoc?: (doc: RagDocumentWithProgress) => void;
}

const PIPELINE_STAGES = [
  'UPLOADED',
  'VALIDATING',
  'EXTRACTING',
  'CHUNKING',
  'EMBEDDING',
  'INDEXING',
  'READY',
] as const;

const STAGE_LABELS: Record<string, string> = {
  UPLOADED: 'Uploading',
  VALIDATING: 'Validating',
  EXTRACTING: 'Extracting',
  CHUNKING: 'Chunking',
  EMBEDDING: 'Embedding',
  INDEXING: 'Indexing',
  READY: 'Ready',
  FAILED: 'Failed',
  RETRYING: 'Retrying',
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'READY') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--c-success-bg)] text-[var(--c-success)] border border-[var(--c-success-border)]">
        <CheckCircle2 size={11} /> Ready
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--c-danger-bg)] text-[var(--c-danger)] border border-[var(--c-danger-border)]">
        <XCircle size={11} /> Failed
      </span>
    );
  }
  if (status === 'RETRYING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--c-warn-bg,#fffbeb)] text-[var(--c-warn,#d97706)] border border-[var(--c-warn-border,#fde68a)]">
        <RefreshCw size={11} className="animate-spin" /> Retrying
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--c-blue-soft)] text-[var(--c-blue)] border border-[var(--c-blue-border,#bfdbfe)]">
      <Loader2 size={11} className="animate-spin" /> {STAGE_LABELS[status] ?? status}
    </span>
  );
}

function PipelineProgress({
  status,
  progressPct,
  progressMessage,
}: {
  status: string;
  progressPct?: number;
  progressMessage?: string;
}) {
  const activeIdx = PIPELINE_STAGES.indexOf(status as typeof PIPELINE_STAGES[number]);

  return (
    <div className="mt-2 space-y-2">
      {progressMessage && (
        <p className="text-[10px] text-[var(--c-text-2)]">{progressMessage}</p>
      )}
      <div className="flex gap-1 flex-wrap">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isPassed = activeIdx > idx;
          const isCurrent = activeIdx === idx && status !== 'READY';

          return (
            <span
              key={stage}
              className={`text-[9px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                isPassed
                  ? 'bg-[var(--c-success-bg)] text-[var(--c-success)]'
                  : isCurrent
                  ? 'bg-[var(--c-blue-soft)] text-[var(--c-blue)] animate-pulse'
                  : 'bg-[var(--c-surface-2)] text-[var(--c-text-3)]'
              }`}
            >
              {STAGE_LABELS[stage]}
            </span>
          );
        })}
      </div>
      {progressPct !== undefined && progressPct < 100 && (
        <div className="w-full h-1 bg-[var(--c-surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--c-blue)] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export const RagDocumentsPanel: React.FC<RagDocumentsPanelProps> = ({
  workspaceId,
  onAddToast,
  onSelectDoc,
}) => {
  const { state, setWorkspace, uploadFile, deleteDocument, refreshDocuments } = useRag();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Set workspace context when component mounts or workspace changes
  useEffect(() => {
    setWorkspace(workspaceId);
  }, [workspaceId, setWorkspace]);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onAddToast(`Uploading ${file.name} to ${workspaceId} workspace...`);
    const docId = await uploadFile(file);
    if (docId) {
      onAddToast(`✓ ${file.name} indexed successfully in ${workspaceId}`);
    } else {
      onAddToast(`✗ Failed to index ${file.name}`);
    }

    // Clear input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    onAddToast(`Uploading ${file.name} to ${workspaceId} workspace...`);
    const docId = await uploadFile(file);
    if (docId) {
      onAddToast(`✓ ${file.name} indexed successfully in ${workspaceId}`);
    } else {
      onAddToast(`✗ Failed to index ${file.name}`);
    }
  };

  const handleDeleteDoc = async (doc: RagDocumentWithProgress, e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.status !== 'READY' && doc.status !== 'FAILED') {
      onAddToast('Cannot delete a document that is still processing');
      return;
    }
    await deleteDocument(doc.id);
    onAddToast(`Removed ${doc.filename} from ${workspaceId} index`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDocuments();
    setIsRefreshing(false);
    onAddToast('Document index refreshed');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const ragDocs = state.documents;
  const readyCount = ragDocs.filter((d) => d.status === 'READY').length;
  const processingCount = ragDocs.filter(
    (d) => !['READY', 'FAILED'].includes(d.status)
  ).length;

  return (
    <div
      className="space-y-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header Stats */}
      <div className="flex items-center justify-between px-1 py-1 min-h-[40px]">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[var(--c-text-2)] bg-[var(--c-surface-2)] border border-[var(--c-border)] rounded-md px-2.5 py-1.5">
            <Database size={13} className="text-[var(--c-blue)]" />
            <span>
              <strong className="text-[var(--c-text-1)]">{readyCount}</strong> Indexed
            </span>
          </div>
          {processingCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-[var(--c-blue)]">
              <Loader2 size={12} className="animate-spin" />
              <span>{processingCount} processing</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 px-2.5 text-xs"
            aria-label="Refresh document index"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>

          <label className="cursor-pointer shrink-0">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.json,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
            />
            <Button variant="blue" size="sm" className="pointer-events-none whitespace-nowrap" leftIcon={<Upload size={13} />}>
              Upload &amp; Index
            </Button>
          </label>
        </div>
      </div>

      {/* Document List or Unified Interactive Dropzone Empty State */}
      {ragDocs.length === 0 ? (
        <label
          className={`flex flex-col items-center py-16 px-6 text-center gap-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging
              ? 'border-[var(--c-blue)] bg-[var(--c-blue-soft)]'
              : 'border-[var(--c-border-2)] hover:border-[var(--c-blue)] bg-[var(--c-surface-2)]/40 hover:bg-[var(--c-blue-soft)]/30'
          }`}
        >
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.json,.jpg,.jpeg,.png"
            onChange={handleFileInputChange}
          />
          <div className="w-14 h-14 rounded-full bg-[var(--c-blue-soft)] text-[var(--c-blue)] flex items-center justify-center shadow-sm">
            <Upload size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--c-text-1)] mb-1.5">
              Drag and drop files here, or <span className="text-[var(--c-blue)] hover:underline font-bold">browse your computer</span>
            </p>
            <p className="text-xs text-[var(--c-text-2)] max-w-md leading-relaxed">
              Supported formats: <strong className="text-[var(--c-text-1)] font-semibold">PDF, DOCX, XLSX, CSV, TXT, Markdown, JSON, PNG, JPG</strong>
            </p>
            <p className="text-xs text-[var(--c-text-3)] mt-1">Up to 500 MB per file</p>
          </div>
        </label>
      ) : (
        <div className="space-y-2">
          {ragDocs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg p-3 hover:border-[var(--c-blue)] transition-all cursor-pointer"
              onClick={() => onSelectDoc?.(doc)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 mt-0.5 rounded bg-[var(--c-surface-2)] flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-[var(--c-text-2)]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-semibold text-[var(--c-text-1)] truncate max-w-[260px]"
                        title={doc.filename}
                      >
                        {doc.filename}
                      </span>
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--c-surface-2)] text-[var(--c-text-2)] border border-[var(--c-border)] shrink-0">
                        {doc.fileType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--c-text-3)]">
                      <span>{formatBytes(doc.sizeBytes)}</span>
                      {doc.chunkCount > 0 && (
                        <span>{doc.chunkCount} chunks indexed</span>
                      )}
                      {doc.ocrApplied && (
                        <Badge variant="blue" size="sm" className="text-[9px]">
                          OCR
                        </Badge>
                      )}
                      <span>{new Date(doc.uploadedAt).toLocaleTimeString()}</span>
                    </div>

                    {/* Pipeline progress for in-flight documents */}
                    {doc.status !== 'READY' && doc.status !== 'FAILED' && (
                      <PipelineProgress
                        status={doc.status}
                        progressPct={doc.progressPct}
                        progressMessage={doc.progressMessage}
                      />
                    )}

                    {/* Error message for failed */}
                    {doc.status === 'FAILED' && doc.errorMessage && (
                      <div className="mt-2 flex items-start gap-1.5 text-[10px] text-[var(--c-danger)]">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                        <span>{doc.errorMessage}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <StatusBadge status={doc.status} />

                  {doc.status === 'READY' && (
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-[var(--c-text-3)] hover:text-[var(--c-blue)] hover:bg-[var(--c-blue-soft)]"
                      title="Inspect document"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDoc?.(doc);
                      }}
                    >
                      <Eye size={13} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-[var(--c-text-3)] hover:text-[var(--c-danger)] hover:bg-[var(--c-danger-bg)]"
                    title="Delete from index"
                    onClick={(e) => handleDeleteDoc(doc, e)}
                    disabled={!['READY', 'FAILED'].includes(doc.status)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
