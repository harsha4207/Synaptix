import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Search,
  BrainCircuit,
  Database,
  FileText,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Hash,
  BookOpen
} from 'lucide-react';
import { ragStore } from '../../lib/rag/store';
import { searchChunks } from '../../lib/rag/embedding';
import type { DocumentChunk, RagDocument, WorkspaceId } from '../../lib/rag/types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

interface RagMemoryInspectorProps {
  workspaceId: WorkspaceId;
  workspaceName: string;
  onSelectDoc?: (docId: string) => void;
  onAddToast?: (msg: string) => void;
}

export const RagMemoryInspector: React.FC<RagMemoryInspectorProps> = ({
  workspaceId,
  workspaceName,
  onSelectDoc,
  onAddToast,
}) => {
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [docs, setDocs] = useState<RagDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocFilter, setSelectedDocFilter] = useState('ALL');

  // Interactive Live Query Simulation
  const [testQuery, setTestQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ chunk: DocumentChunk; score: number }>>([]);

  // Load all chunks and docs for this workspace
  const loadMemoryData = async () => {
    setLoading(true);
    try {
      const [allChunks, allDocs] = await Promise.all([
        ragStore.getChunksByWorkspace(workspaceId),
        ragStore.listDocuments(workspaceId),
      ]);
      setChunks(allChunks);
      setDocs(allDocs);
    } catch (err) {
      console.error('Failed to load RAG memory vectors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemoryData();
  }, [workspaceId]);

  // Document ID -> Doc Map
  const docMap = useMemo(() => {
    const map = new Map<string, RagDocument>();
    docs.forEach((d) => map.set(d.id, d));
    return map;
  }, [docs]);

  // Filtered Chunks
  const filteredChunks = useMemo(() => {
    return chunks.filter((c) => {
      if (selectedDocFilter !== 'ALL' && c.documentId !== selectedDocFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const contentMatch = c.content.toLowerCase().includes(query);
        const docName = docMap.get(c.documentId)?.filename.toLowerCase() || '';
        const docMatch = docName.includes(query);
        const sectionMatch = c.sourceRef?.sectionHeading?.toLowerCase().includes(query) || false;
        return contentMatch || docMatch || sectionMatch;
      }
      return true;
    });
  }, [chunks, selectedDocFilter, searchQuery, docMap]);

  // Execute Live RAG Query Simulation
  const handleRunTestQuery = () => {
    if (!testQuery.trim() || chunks.length === 0) return;
    setIsSearching(true);
    try {
      const results = searchChunks(testQuery, chunks, {
        topK: 6,
        minSimilarity: 0.05,
      });
      setSearchResults(results);
      onAddToast?.(`Retrieved ${results.length} semantic memory match(es) from RAG vector store.`);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Preset query chips
  const presetQueries = [
    'Executive summary and major objectives',
    'Financial metrics, revenues, and expenditures',
    'Compliance policies and operational guidelines',
    'Risk factors and audit findings',
  ];

  const totalChars = useMemo(() => chunks.reduce((acc, c) => acc + c.content.length, 0), [chunks]);
  const estimatedTokens = Math.round(totalChars / 4);

  return (
    <div className="space-y-6">
      {/* 1. TOP METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[var(--c-blue-soft)] text-[var(--c-blue)] flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[var(--c-text-3)] font-semibold uppercase tracking-wider">
              Memory Vectors
            </span>
            <div className="text-lg font-bold text-[var(--c-text-1)]">
              {chunks.length.toLocaleString()} Chunks
            </div>
          </div>
        </div>

        <div className="p-4 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[var(--c-blue-soft)] text-[var(--c-blue)] flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[var(--c-text-3)] font-semibold uppercase tracking-wider">
              Source Documents
            </span>
            <div className="text-lg font-bold text-[var(--c-text-1)]">
              {docs.length.toLocaleString()} Indexed
            </div>
          </div>
        </div>

        <div className="p-4 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <BrainCircuit size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[var(--c-text-3)] font-semibold uppercase tracking-wider">
              Memory Density
            </span>
            <div className="text-lg font-bold text-[var(--c-text-1)]">
              ~{estimatedTokens.toLocaleString()} Tokens
            </div>
          </div>
        </div>

        <div className="p-4 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[var(--c-text-3)] font-semibold uppercase tracking-wider">
              Vector Space
            </span>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={13} /> {workspaceName} Bound
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE RAG MEMORY QUERY SIMULATOR */}
      <div className="p-5 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--c-blue)]" />
            <h3 className="text-sm font-bold text-[var(--c-text-1)]">
              RAG Memory Query Simulator
            </h3>
          </div>
          <span className="text-[11px] text-[var(--c-text-3)]">
            Test vector retrieval live against stored memory
          </span>
        </div>

        <p className="text-xs text-[var(--c-text-2)] mb-3 leading-relaxed">
          Type any inquiry to inspect which vector memory chunks are retrieved by the cosine-similarity ranker for question answering.
        </p>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-3)]" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunTestQuery()}
              placeholder="e.g. What are the key policies and financial metrics in this workspace?"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[var(--c-page)] border border-[var(--c-border)] text-[var(--c-text-1)] placeholder-[var(--c-text-3)] focus:border-[var(--c-blue)] focus:outline-none"
            />
          </div>
          <Button
            variant="blue"
            size="sm"
            onClick={handleRunTestQuery}
            disabled={!testQuery.trim() || chunks.length === 0 || isSearching}
            leftIcon={isSearching ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
          >
            Search Memory
          </Button>
        </div>

        {/* Preset Query Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="text-[var(--c-text-3)] mr-1">Suggested Tests:</span>
          {presetQueries.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTestQuery(pq);
                setTimeout(() => {
                  if (chunks.length > 0) {
                    const results = searchChunks(pq, chunks, { topK: 6, minSimilarity: 0.05 });
                    setSearchResults(results);
                  }
                }, 50);
              }}
              className="px-2.5 py-1 rounded-full bg-[var(--c-page)] border border-[var(--c-border)] text-[var(--c-text-2)] hover:border-[var(--c-blue)] hover:text-[var(--c-blue)] transition-colors cursor-pointer"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--c-border)] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-text-1)] mb-2">
              <span>Retrieved Memory Evidence ({searchResults.length} matches)</span>
              <button
                type="button"
                onClick={() => setSearchResults([])}
                className="text-[11px] text-[var(--c-text-3)] hover:text-[var(--c-danger)]"
              >
                Clear Results
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map(({ chunk, score }, idx) => {
                const parentDoc = docMap.get(chunk.documentId);
                const matchPct = Math.round(score * 100);
                return (
                  <div
                    key={chunk.id}
                    className="p-3 bg-[var(--c-page)] border border-[var(--c-border)] rounded-lg hover:border-[var(--c-blue)] transition-all cursor-pointer group"
                    onClick={() => onSelectDoc?.(chunk.documentId)}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[10px]">
                      <span className="font-semibold text-[var(--c-blue)] truncate max-w-[200px]" title={parentDoc?.filename || 'Document'}>
                        {parentDoc?.filename || 'Document'} • Chunk #{chunk.chunkIndex + 1}
                      </span>
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                        matchPct > 40 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[var(--c-blue-soft)] text-[var(--c-blue)]'
                      }`}>
                        {matchPct}% Relevance
                      </span>
                    </div>

                    <p className="text-xs text-[var(--c-text-1)] font-mono line-clamp-3 leading-relaxed">
                      {chunk.content}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--c-border)] text-[10px] text-[var(--c-text-3)]">
                      <span>
                        {chunk.sourceRef?.pageNumber ? `Page ${chunk.sourceRef.pageNumber}` : ''}
                        {chunk.sourceRef?.sheetName ? `Sheet: ${chunk.sourceRef.sheetName}` : ''}
                      </span>
                      <span className="group-hover:text-[var(--c-blue)] flex items-center gap-0.5">
                        Inspect Document <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. ALL STORED MEMORY VECTORS LIST */}
      <div className="doc-manifest-card">
        <div className="p-4 border-b border-[var(--c-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--c-text-1)] flex items-center gap-2">
              <Database size={16} className="text-[var(--c-blue)]" />
              RAG Vector Memory Store ({filteredChunks.length} chunks)
            </h3>
            <p className="text-xs text-[var(--c-text-3)] mt-0.5">
              Live index of all text chunks persisted in {workspaceName} memory
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Document */}
            <div className="relative">
              <select
                value={selectedDocFilter}
                onChange={(e) => setSelectedDocFilter(e.target.value)}
                className="text-xs py-1.5 pl-3 pr-7 rounded-md bg-[var(--c-page)] border border-[var(--c-border)] text-[var(--c-text-1)] focus:outline-none focus:border-[var(--c-blue)]"
              >
                <option value="ALL">All Documents ({docs.length})</option>
                {docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.chunkCount} chunks)
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--c-text-3)]" />
            </div>

            {/* Keyword Search Filter */}
            <div className="relative w-48 sm:w-60">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--c-text-3)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vector text..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-[var(--c-page)] border border-[var(--c-border)] text-[var(--c-text-1)] placeholder-[var(--c-text-3)] focus:outline-none focus:border-[var(--c-blue)]"
              />
            </div>
          </div>
        </div>

        {/* Chunks List */}
        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-[var(--c-text-3)]">
              <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-[var(--c-blue)]" />
              Loading vector memory store...
            </div>
          ) : filteredChunks.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--c-text-3)]">
              <Layers size={24} className="mx-auto mb-2 text-[var(--c-text-3)]" />
              {chunks.length === 0
                ? 'No documents have been indexed into RAG memory yet. Upload files above to populate memory vectors.'
                : 'No memory chunks match the active filter.'}
            </div>
          ) : (
            filteredChunks.map((chunk) => {
              const parentDoc = docMap.get(chunk.documentId);
              return (
                <div
                  key={chunk.id}
                  className="p-3.5 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg hover:border-[var(--c-blue)] transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[var(--c-blue)] bg-[var(--c-blue-soft)] px-2 py-0.5 rounded">
                        Chunk #{chunk.chunkIndex + 1}
                      </span>
                      <span
                        className="text-xs font-semibold text-[var(--c-text-1)] group-hover:text-[var(--c-blue)] transition-colors cursor-pointer"
                        onClick={() => onSelectDoc?.(chunk.documentId)}
                        title="Click to view full document"
                      >
                        {parentDoc?.filename || 'Document'}
                      </span>
                      {parentDoc && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--c-surface-2)] text-[var(--c-text-2)] border border-[var(--c-border)]">
                          {parentDoc.fileType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[var(--c-text-3)]">
                      <span>
                        {chunk.sourceRef?.pageNumber ? `Page ${chunk.sourceRef.pageNumber} • ` : ''}
                        {chunk.sourceRef?.sheetName ? `Sheet ${chunk.sourceRef.sheetName} • ` : ''}
                        {chunk.sourceRef?.rowRange ? `Rows ${chunk.sourceRef.rowRange[0]}-${chunk.sourceRef.rowRange[1]} • ` : ''}
                        {`${chunk.content.length} chars`}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectDoc?.(chunk.documentId)}
                        className="text-[var(--c-blue)] hover:underline flex items-center gap-0.5 font-medium ml-1"
                      >
                        Inspect <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--c-text-1)] font-mono whitespace-pre-wrap leading-relaxed bg-[var(--c-page)] p-3 rounded border border-[var(--c-border)] select-text">
                    {chunk.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
