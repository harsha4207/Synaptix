/**
 * RagKnowledgeSearchPanel
 * Integrates workspace RAG search into the KnowledgeModule.
 * Shows real chunk results from the workspace index.
 */

import React, { useState } from 'react';
import {
  Search,
  FileText,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { useRag } from '../../lib/rag/RagContext';
import type { WorkspaceId, RetrievedChunk } from '../../lib/rag/types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface RagKnowledgeSearchPanelProps {
  workspaceId: WorkspaceId;
  onAddToast: (msg: string) => void;
}

function ChunkResultCard({
  result,
  index,
}: {
  result: RetrievedChunk;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const loc = result.chunk.sourceRef;
  const locStr = [
    loc.pageNumber !== undefined ? `Page ${loc.pageNumber}` : null,
    loc.sheetName ? `Sheet: ${loc.sheetName}` : null,
    loc.rowRange ? `Rows ${loc.rowRange[0]}–${loc.rowRange[1]}` : null,
    loc.sectionHeading ? `§ ${loc.sectionHeading}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const scorePercent = Math.round(result.score * 100);

  return (
    <div className="border border-[var(--c-border)] rounded-lg overflow-hidden bg-[var(--c-surface)]">
      <button
        type="button"
        className="w-full text-left px-3 py-3 flex items-start gap-3 hover:bg-[var(--c-surface-2)] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--c-blue-soft)] text-[var(--c-blue)] flex items-center justify-center text-[10px] font-bold mt-0.5">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--c-text-1)] truncate max-w-[220px]">
              {result.document.filename}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background:
                  scorePercent >= 40
                    ? 'var(--c-success-bg)'
                    : scorePercent >= 20
                    ? 'var(--c-blue-soft)'
                    : 'var(--c-surface-2)',
                color:
                  scorePercent >= 40
                    ? 'var(--c-success)'
                    : scorePercent >= 20
                    ? 'var(--c-blue)'
                    : 'var(--c-text-3)',
              }}
            >
              {scorePercent}% relevant
            </span>
          </div>

          {locStr && (
            <p className="text-[10px] text-[var(--c-text-3)] mt-0.5">{locStr}</p>
          )}

          <p className="text-[11px] text-[var(--c-text-2)] mt-1 line-clamp-2">
            {result.chunk.content.slice(0, 160)}
            {result.chunk.content.length > 160 && '...'}
          </p>
        </div>

        <span className="text-[var(--c-text-3)] flex-shrink-0 mt-1">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[var(--c-border)] bg-[var(--c-page)]">
          <p className="text-[11px] text-[var(--c-text-2)] mt-2 leading-relaxed whitespace-pre-line font-mono">
            {result.chunk.content}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[10px] text-[var(--c-text-3)]">
              Chunk #{result.chunk.chunkIndex} · {result.chunk.content.length} chars
            </span>
            <span className="text-[10px] text-[var(--c-text-3)]">
              Semantic: {Math.round(result.semanticScore * 100)}% · Keyword: {Math.round(result.keywordScore * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export const RagKnowledgeSearchPanel: React.FC<RagKnowledgeSearchPanelProps> = ({
  workspaceId,
  onAddToast,
}) => {
  const { state, setWorkspace, searchKnowledge } = useRag();
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    setWorkspace(workspaceId);
  }, [workspaceId, setWorkspace]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    await searchKnowledge(query);
    onAddToast(`Searched ${workspaceId} workspace: "${query.slice(0, 40)}"`);
  };

  const { searchResults, isSearching, documents } = state;
  const indexedCount = documents.filter((d) => d.status === 'READY').length;

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={15} className="text-[var(--c-blue)]" />
        <h3 className="text-sm font-semibold text-[var(--c-text-1)]">
          RAG Knowledge Search
        </h3>
        <Badge variant="blue" size="sm">
          {indexedCount} docs indexed
        </Badge>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-[var(--c-text-3)]">
          <ShieldCheck size={11} className="text-[var(--c-success)]" />
          {workspaceId} boundary
        </span>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${workspaceId} workspace knowledge...`}
          leftIcon={<Search size={14} />}
          className="flex-1 h-9 text-xs"
        />
        <Button
          type="submit"
          variant="blue"
          size="sm"
          className="h-9 px-4"
          disabled={!query.trim() || isSearching}
        >
          {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
        </Button>
      </form>

      {/* No Documents Warning */}
      {indexedCount === 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--c-surface-2)] border border-[var(--c-border)]">
          <AlertTriangle size={14} className="text-[var(--c-warn,#d97706)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[var(--c-text-1)]">No documents indexed</p>
            <p className="text-[11px] text-[var(--c-text-2)] mt-0.5">
              Upload documents in the Documents & Data section to enable knowledge search.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-[var(--c-text-3)]">
            Found {searchResults.length} relevant sections
          </p>
          {searchResults.map((result, i) => (
            <ChunkResultCard key={result.chunk.id} result={result} index={i} />
          ))}
        </div>
      )}

      {/* Empty Results */}
      {!isSearching && searchResults.length === 0 && query && indexedCount > 0 && (
        <div className="text-center py-8 text-[var(--c-text-3)] text-xs">
          <FileText size={28} className="mx-auto mb-2 opacity-30" />
          <p>No matching content found for "{query}"</p>
          <p className="mt-1">Try different keywords or upload more relevant documents.</p>
        </div>
      )}
    </div>
  );
};
