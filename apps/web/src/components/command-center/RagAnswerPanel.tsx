/**
 * RagAnswerPanel
 * Displays a RAG-grounded answer with source citations in the Command Center.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Info,
} from 'lucide-react';
import type { RagAnswer, RagCitation } from '../../lib/rag/types';
import { Badge } from '../ui/Badge';

interface RagAnswerPanelProps {
  answer: RagAnswer;
  onAddToast: (msg: string) => void;
}

function CitationCard({ citation, index }: { citation: RagCitation; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const loc = citation.location;
  const locationStr = [
    loc.pageNumber !== undefined ? `Page ${loc.pageNumber}` : null,
    loc.sheetName ? `Sheet: ${loc.sheetName}` : null,
    loc.rowRange ? `Rows ${loc.rowRange[0]}–${loc.rowRange[1]}` : null,
    loc.sectionHeading ? `§ ${loc.sectionHeading}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const scorePercent = Math.round(citation.relevanceScore * 100);

  return (
    <div className="border border-[var(--c-border)] rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-[var(--c-surface-2)] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--c-blue-soft)] text-[var(--c-blue)] flex items-center justify-center text-[10px] font-bold mt-0.5">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--c-text-1)] truncate max-w-[220px]">
              {citation.filename}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--c-surface-2)] text-[var(--c-text-2)] border border-[var(--c-border)] font-mono shrink-0">
              {scorePercent}% match
            </span>
          </div>
          {locationStr && (
            <p className="text-[10px] text-[var(--c-text-3)] mt-0.5">{locationStr}</p>
          )}
        </div>

        <span className="text-[var(--c-text-3)] flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[var(--c-border)] bg-[var(--c-page)]">
          <p className="text-[11px] text-[var(--c-text-2)] mt-2 leading-relaxed font-mono">
            {citation.excerpt}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-[var(--c-text-3)]">
              Document ID: {citation.documentId.slice(0, 8)}...
            </span>
            <ExternalLink size={11} className="text-[var(--c-text-3)]" />
          </div>
        </div>
      )}
    </div>
  );
}

export const RagAnswerPanel: React.FC<RagAnswerPanelProps> = ({ answer, onAddToast }) => {
  const confidenceConfig = {
    HIGH: { label: 'High Confidence', color: 'text-[var(--c-success)]', bg: 'bg-[var(--c-success-bg)]' },
    MEDIUM: { label: 'Medium Confidence', color: 'text-[var(--c-warn,#d97706)]', bg: 'bg-[var(--c-warn-bg,#fffbeb)]' },
    LOW: { label: 'Low Confidence', color: 'text-[var(--c-text-2)]', bg: 'bg-[var(--c-surface-2)]' },
    INSUFFICIENT: { label: 'Insufficient Evidence', color: 'text-[var(--c-danger)]', bg: 'bg-[var(--c-danger-bg)]' },
  };

  const conf = confidenceConfig[answer.confidenceLevel];

  return (
    <div className="rag-answer-panel space-y-4 animate-fade-in">
      {/* Answer Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--c-blue-soft)] flex items-center justify-center flex-shrink-0">
            <BrainCircuit size={15} className="text-[var(--c-blue)]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--c-text-1)]">Synaptix RAG Answer</p>
            <p className="text-[10px] text-[var(--c-text-3)]">
              {answer.workspaceId} workspace · {answer.contextChunkCount} evidence sections
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${conf.bg} ${conf.color}`}
        >
          {answer.hasSufficientEvidence ? (
            <CheckCircle2 size={11} />
          ) : (
            <AlertTriangle size={11} />
          )}
          {conf.label}
        </span>
      </div>

      {/* Insufficient Evidence Warning */}
      {!answer.hasSufficientEvidence && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--c-danger-bg)] border border-[var(--c-danger-border,#fecaca)]">
          <AlertTriangle size={14} className="text-[var(--c-danger)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[var(--c-danger)]">Insufficient Evidence</p>
            <p className="text-[11px] text-[var(--c-danger)] mt-0.5 opacity-80">
              Fewer than 2 relevant evidence sections were found. Upload more documents related
              to your query for more grounded answers.
            </p>
          </div>
        </div>
      )}

      {/* Answer Text */}
      <div className="p-3.5 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)]">
        <p className="text-xs text-[var(--c-text-1)] leading-relaxed whitespace-pre-line">
          {answer.answer}
        </p>
      </div>

      {/* Source Citations */}
      {answer.citations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-[var(--c-blue)]" />
            <h4 className="text-xs font-semibold text-[var(--c-text-1)]">
              Source Citations ({answer.citations.length})
            </h4>
            <Badge variant="blue" size="sm">Traceable</Badge>
          </div>
          <div className="space-y-1.5">
            {answer.citations.map((citation, i) => (
              <CitationCard key={citation.chunkId} citation={citation} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Retrieval Metadata */}
      <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-[var(--c-border)]">
        <span className="flex items-center gap-1 text-[10px] text-[var(--c-text-3)]">
          <ShieldCheck size={11} className="text-[var(--c-success)]" />
          Workspace-isolated retrieval
        </span>
        <span className="text-[10px] text-[var(--c-text-3)]">
          Retrieved: {answer.retrievedChunkCount} chunks
        </span>
        <span className="text-[10px] text-[var(--c-text-3)]">
          Retrieval: {answer.retrievalMs}ms
        </span>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] text-[var(--c-text-3)] hover:text-[var(--c-text-1)] transition-colors ml-auto"
          onClick={() => onAddToast(`RAG Answer ID: ${answer.id}`)}
        >
          <Info size={11} />
          <span>Request ID</span>
        </button>
      </div>
    </div>
  );
};
