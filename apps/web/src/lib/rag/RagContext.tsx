/**
 * RAG Context Provider
 * React context that provides workspace-scoped RAG state to the UI.
 * Manages document ingestion, processing status, and query state.
 */

import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react';
import type {
  RagDocument,
  RagAnswer,
  WorkspaceId,
  ProcessingStatusEvent,
  RetrievedChunk,
  RagSearchParams,
} from './types';
import {
  ingestDocument,
  listWorkspaceDocuments,
  deleteDocument as deleteDocumentService,
} from './ingestion';
import { ragQuery, searchWorkspace } from './retrieval';
import { detectFileType } from './validation';

// ── State ─────────────────────────────────────────────────────────────────────

export interface RagDocumentWithProgress extends RagDocument {
  /** Live progress 0–100 during ingestion */
  progressPct?: number;
  /** Live stage message */
  progressMessage?: string;
}

interface RagState {
  workspaceId: WorkspaceId | null;
  organizationId: string;
  documents: RagDocumentWithProgress[];
  processingDocumentId: string | null;
  lastAnswer: RagAnswer | null;
  searchResults: RetrievedChunk[];
  isQuerying: boolean;
  isSearching: boolean;
  error: string | null;
}

type RagAction =
  | { type: 'SET_WORKSPACE'; workspaceId: WorkspaceId; organizationId: string }
  | { type: 'SET_DOCUMENTS'; documents: RagDocumentWithProgress[] }
  | { type: 'UPSERT_DOCUMENT'; document: RagDocumentWithProgress }
  | { type: 'REMOVE_DOCUMENT'; documentId: string }
  | { type: 'SET_PROCESSING'; documentId: string | null }
  | { type: 'UPDATE_PROGRESS'; documentId: string; status: RagDocument['status']; progressPct?: number; progressMessage?: string; errorMessage?: string }
  | { type: 'SET_ANSWER'; answer: RagAnswer | null }
  | { type: 'SET_SEARCH_RESULTS'; results: RetrievedChunk[] }
  | { type: 'SET_QUERYING'; value: boolean }
  | { type: 'SET_SEARCHING'; value: boolean }
  | { type: 'SET_ERROR'; error: string | null };

function ragReducer(state: RagState, action: RagAction): RagState {
  switch (action.type) {
    case 'SET_WORKSPACE':
      return {
        ...state,
        workspaceId: action.workspaceId,
        organizationId: action.organizationId,
        documents: [],
        lastAnswer: null,
        searchResults: [],
        error: null,
      };

    case 'SET_DOCUMENTS':
      return { ...state, documents: action.documents };

    case 'UPSERT_DOCUMENT': {
      const idx = state.documents.findIndex((d) => d.id === action.document.id);
      if (idx >= 0) {
        const updated = [...state.documents];
        updated[idx] = action.document;
        return { ...state, documents: updated };
      }
      return { ...state, documents: [action.document, ...state.documents] };
    }

    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((d) => d.id !== action.documentId),
      };

    case 'SET_PROCESSING':
      return { ...state, processingDocumentId: action.documentId };

    case 'UPDATE_PROGRESS': {
      const idx = state.documents.findIndex((d) => d.id === action.documentId);
      if (idx < 0) return state;
      const updated = [...state.documents];
      updated[idx] = {
        ...updated[idx],
        status: action.status,
        progressPct: action.progressPct,
        progressMessage: action.progressMessage,
        errorMessage: action.errorMessage,
        updatedAt: new Date().toISOString(),
      };
      return { ...state, documents: updated };
    }

    case 'SET_ANSWER':
      return { ...state, lastAnswer: action.answer };

    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.results };

    case 'SET_QUERYING':
      return { ...state, isQuerying: action.value };

    case 'SET_SEARCHING':
      return { ...state, isSearching: action.value };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    default:
      return state;
  }
}

const initialState: RagState = {
  workspaceId: null,
  organizationId: 'synaptix-enterprise',
  documents: [],
  processingDocumentId: null,
  lastAnswer: null,
  searchResults: [],
  isQuerying: false,
  isSearching: false,
  error: null,
};

// ── Context ───────────────────────────────────────────────────────────────────

interface RagContextValue {
  state: RagState;
  setWorkspace: (workspaceId: WorkspaceId) => void;
  uploadFile: (file: File) => Promise<string | null>;
  deleteDocument: (documentId: string) => Promise<void>;
  askQuestion: (query: string) => Promise<RagAnswer | null>;
  searchKnowledge: (query: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  clearAnswer: () => void;
}

const RagContext = createContext<RagContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export interface RagProviderProps {
  children: React.ReactNode;
  organizationId?: string;
}

export const RagProvider: React.FC<RagProviderProps> = ({
  children,
  organizationId = 'synaptix-enterprise',
}) => {
  const [state, dispatch] = useReducer(ragReducer, {
    ...initialState,
    organizationId,
  });

  const setWorkspace = useCallback(
    (workspaceId: WorkspaceId) => {
      dispatch({ type: 'SET_WORKSPACE', workspaceId, organizationId });
    },
    [organizationId]
  );

  const refreshDocuments = useCallback(async () => {
    if (!state.workspaceId) return;
    try {
      const docs = await listWorkspaceDocuments(state.workspaceId, state.organizationId);
      dispatch({ type: 'SET_DOCUMENTS', documents: docs });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: (err as Error).message });
    }
  }, [state.workspaceId, state.organizationId]);

  // Load documents when workspace changes
  useEffect(() => {
    if (state.workspaceId) {
      refreshDocuments();
    }
  }, [state.workspaceId, refreshDocuments]);

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!state.workspaceId) {
        dispatch({ type: 'SET_ERROR', error: 'No workspace selected' });
        return null;
      }

      // Check if an existing document for this filename exists
      const existingDoc = state.documents.find(
        (d) => d.filename.toLowerCase() === file.name.toLowerCase()
      );
      const tempId = existingDoc ? existingDoc.id : crypto.randomUUID();
      const detectedType = detectFileType(file) || 'TXT';
      const tempDoc: RagDocumentWithProgress = {
        id: tempId,
        workspaceId: state.workspaceId,
        organizationId: state.organizationId,
        filename: file.name,
        fileType: detectedType,
        sizeBytes: file.size,
        contentHash: existingDoc?.contentHash || '',
        status: 'UPLOADED',
        source: 'Direct Upload',
        chunkCount: 0,
        ocrApplied: false,
        uploadedAt: existingDoc ? existingDoc.uploadedAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        progressPct: 0,
        progressMessage: 'Starting upload...',
      };
      dispatch({ type: 'UPSERT_DOCUMENT', document: tempDoc });
      dispatch({ type: 'SET_PROCESSING', documentId: tempId });

      const onStatus = (event: ProcessingStatusEvent) => {
        const progressMap: Record<string, number> = {
          VALIDATING: 10,
          UPLOADED: 15,
          EXTRACTING: 30,
          CHUNKING: 50,
          EMBEDDING: 70,
          INDEXING: 85,
          READY: 100,
          FAILED: 100,
          RETRYING: 20,
        };

        // Update document with progress
        dispatch({
          type: 'UPDATE_PROGRESS',
          documentId: tempId,
          status: event.status,
          progressPct: progressMap[event.status] ?? 50,
          progressMessage: event.message ?? event.status,
          errorMessage: event.errorMessage,
        });
      };

      try {
        const realDocId = await ingestDocument(
          file,
          state.workspaceId,
          state.organizationId,
          onStatus
        );

        // Load authoritative store state
        await refreshDocuments();
        dispatch({ type: 'SET_PROCESSING', documentId: null });
        return realDocId;
      } catch (err) {
        // Refresh authoritative store state on error
        await refreshDocuments();
        dispatch({ type: 'SET_PROCESSING', documentId: null });
        dispatch({ type: 'SET_ERROR', error: (err as Error).message });
        return null;
      }
    },
    [state.workspaceId, state.organizationId, refreshDocuments]
  );

  const deleteDocument_ = useCallback(
    async (documentId: string) => {
      if (!state.workspaceId) return;
      try {
        await deleteDocumentService(documentId, state.workspaceId, state.organizationId);
        dispatch({ type: 'REMOVE_DOCUMENT', documentId });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: (err as Error).message });
      }
    },
    [state.workspaceId, state.organizationId]
  );

  const askQuestion = useCallback(
    async (query: string): Promise<RagAnswer | null> => {
      if (!state.workspaceId || !query.trim()) return null;

      dispatch({ type: 'SET_QUERYING', value: true });
      dispatch({ type: 'SET_ERROR', error: null });

      try {
        const params: RagSearchParams = {
          query,
          workspaceId: state.workspaceId,
          organizationId: state.organizationId,
          topK: 10,
          similarityThreshold: 0.03,
        };

        const answer = await ragQuery(params);
        dispatch({ type: 'SET_ANSWER', answer });
        return answer;
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: (err as Error).message });
        return null;
      } finally {
        dispatch({ type: 'SET_QUERYING', value: false });
      }
    },
    [state.workspaceId, state.organizationId]
  );

  const searchKnowledge = useCallback(
    async (query: string) => {
      if (!state.workspaceId || !query.trim()) return;

      dispatch({ type: 'SET_SEARCHING', value: true });

      try {
        const results = await searchWorkspace({
          query,
          workspaceId: state.workspaceId,
          organizationId: state.organizationId,
          topK: 8,
        });
        dispatch({ type: 'SET_SEARCH_RESULTS', results });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: (err as Error).message });
      } finally {
        dispatch({ type: 'SET_SEARCHING', value: false });
      }
    },
    [state.workspaceId, state.organizationId]
  );

  const clearAnswer = useCallback(() => {
    dispatch({ type: 'SET_ANSWER', answer: null });
    dispatch({ type: 'SET_SEARCH_RESULTS', results: [] });
  }, []);

  return (
    <RagContext.Provider
      value={{
        state,
        setWorkspace,
        uploadFile,
        deleteDocument: deleteDocument_,
        askQuestion,
        searchKnowledge,
        refreshDocuments,
        clearAnswer,
      }}
    >
      {children}
    </RagContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRag(): RagContextValue {
  const ctx = useContext(RagContext);
  if (!ctx) {
    throw new Error('useRag must be used within a RagProvider');
  }
  return ctx;
}
