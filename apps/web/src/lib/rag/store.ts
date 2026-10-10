/**
 * WorkspaceRagStore
 * IndexedDB-backed persistence layer for the RAG system.
 * All operations are workspace-scoped. Cross-workspace access is rejected at this layer.
 */

import type { RagDocument, DocumentChunk, WorkspaceId } from './types';

const DB_NAME = 'synaptix_rag_store';
const DB_VERSION = 1;

const STORE_DOCUMENTS = 'rag_documents';
const STORE_CHUNKS = 'rag_chunks';

class WorkspaceRagStore {
  private db: IDBDatabase | null = null;
  private memDocs: Map<string, RagDocument> = new Map();
  private memChunks: Map<string, DocumentChunk> = new Map();

  private isMemoryOnly(): boolean {
    return typeof indexedDB === 'undefined';
  }

  async open(): Promise<IDBDatabase> {
    if (this.isMemoryOnly()) {
      return null as unknown as IDBDatabase;
    }
    if (this.db) return this.db;

    return new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;

        // Documents store
        if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
          const docStore = db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' });
          docStore.createIndex('by_workspace', 'workspaceId');
          docStore.createIndex('by_org_workspace', ['organizationId', 'workspaceId']);
          docStore.createIndex('by_content_hash', 'contentHash');
          docStore.createIndex('by_status', 'status');
        }

        // Chunks store
        if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
          const chunkStore = db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' });
          chunkStore.createIndex('by_document', 'documentId');
          chunkStore.createIndex('by_workspace', 'workspaceId');
          chunkStore.createIndex('by_org_workspace', ['organizationId', 'workspaceId']);
        }
      };

      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      req.onerror = () => reject(req.error);
    });
  }

  // ── Documents ──────────────────────────────────────────────────────────────

  async saveDocument(doc: RagDocument): Promise<void> {
    if (this.isMemoryOnly()) {
      this.memDocs.set(doc.id, { ...doc });
      return;
    }
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCUMENTS, 'readwrite');
      const req = tx.objectStore(STORE_DOCUMENTS).put(doc);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getDocument(id: string, workspaceId: WorkspaceId): Promise<RagDocument | null> {
    if (this.isMemoryOnly()) {
      const doc = this.memDocs.get(id);
      if (!doc || doc.workspaceId !== workspaceId) return null;
      return { ...doc };
    }
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCUMENTS, 'readonly');
      const req = tx.objectStore(STORE_DOCUMENTS).get(id);
      req.onsuccess = () => {
        const doc = req.result as RagDocument | undefined;
        // Enforce workspace isolation even on direct ID lookup
        if (!doc || doc.workspaceId !== workspaceId) {
          resolve(null);
        } else {
          resolve(doc);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getDocumentsByWorkspace(workspaceId: WorkspaceId): Promise<RagDocument[]> {
    if (this.isMemoryOnly()) {
      return Array.from(this.memDocs.values())
        .filter((d) => d.workspaceId === workspaceId)
        .map((d) => ({ ...d }));
    }
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCUMENTS, 'readonly');
      const index = tx.objectStore(STORE_DOCUMENTS).index('by_workspace');
      const req = index.getAll(workspaceId);
      req.onsuccess = () => resolve((req.result as RagDocument[]) || []);
      req.onerror = () => reject(req.error);
    });
  }

  async findByContentHash(contentHash: string, workspaceId: WorkspaceId): Promise<RagDocument | null> {
    const docs = await this.getDocumentsByWorkspace(workspaceId);
    return docs.find((d) => d.contentHash === contentHash) ?? null;
  }

  async findByFilename(filename: string, workspaceId: WorkspaceId): Promise<RagDocument | null> {
    const docs = await this.getDocumentsByWorkspace(workspaceId);
    return docs.find((d) => d.filename.toLowerCase() === filename.toLowerCase()) ?? null;
  }

  /**
   * Cleans up stale / orphaned duplicate records for the same filename within a workspace,
   * keeping the best/latest ready version.
   */
  async cleanupDuplicates(workspaceId: WorkspaceId): Promise<void> {
    const docs = await this.getDocumentsByWorkspace(workspaceId);
    const byFilename = new Map<string, RagDocument[]>();
    for (const doc of docs) {
      const key = doc.filename.toLowerCase();
      const list = byFilename.get(key) || [];
      list.push(doc);
      byFilename.set(key, list);
    }

    for (const [, list] of byFilename.entries()) {
      if (list.length > 1) {
        // Sort: READY first, then newest
        list.sort((a, b) => {
          if (a.status === 'READY' && b.status !== 'READY') return -1;
          if (b.status === 'READY' && a.status !== 'READY') return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        // Keep list[0], delete the rest
        for (let i = 1; i < list.length; i++) {
          await this.deleteDocument(list[i].id, workspaceId);
        }
      }
    }
  }

  async updateDocumentStatus(
    id: string,
    workspaceId: WorkspaceId,
    status: RagDocument['status'],
    extra?: Partial<RagDocument>
  ): Promise<void> {
    const doc = await this.getDocument(id, workspaceId);
    if (!doc) throw new Error(`Document ${id} not found in workspace ${workspaceId}`);
    const updated: RagDocument = {
      ...doc,
      ...extra,
      status,
      updatedAt: new Date().toISOString(),
    };
    await this.saveDocument(updated);
  }

  async deleteDocument(id: string, workspaceId: WorkspaceId): Promise<void> {
    const doc = await this.getDocument(id, workspaceId);
    if (!doc) throw new Error(`Document ${id} not found in workspace ${workspaceId}`);

    // Delete chunks first
    await this.deleteChunksByDocument(id, workspaceId);

    if (this.isMemoryOnly()) {
      this.memDocs.delete(id);
      return;
    }

    // Delete document record
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCUMENTS, 'readwrite');
      const req = tx.objectStore(STORE_DOCUMENTS).delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ── Chunks ────────────────────────────────────────────────────────────────

  async saveChunks(chunks: DocumentChunk[]): Promise<void> {
    if (this.isMemoryOnly()) {
      for (const chunk of chunks) {
        this.memChunks.set(chunk.id, { ...chunk });
      }
      return;
    }
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHUNKS, 'readwrite');
      const store = tx.objectStore(STORE_CHUNKS);
      let pending = chunks.length;
      if (pending === 0) { resolve(); return; }

      for (const chunk of chunks) {
        const req = store.put(chunk);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          pending--;
          if (pending === 0) resolve();
        };
      }
    });
  }

  async getChunksByWorkspace(workspaceId: WorkspaceId): Promise<DocumentChunk[]> {
    if (this.isMemoryOnly()) {
      return Array.from(this.memChunks.values())
        .filter((c) => c.workspaceId === workspaceId)
        .map((c) => ({ ...c }));
    }
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHUNKS, 'readonly');
      const index = tx.objectStore(STORE_CHUNKS).index('by_workspace');
      const req = index.getAll(workspaceId);
      req.onsuccess = () => resolve((req.result as DocumentChunk[]) || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getChunksByDocument(documentId: string, workspaceId: WorkspaceId): Promise<DocumentChunk[]> {
    const chunks = await this.getChunksByWorkspace(workspaceId);
    // Additional filter to ensure document belongs to this workspace
    return chunks.filter((c) => c.documentId === documentId && c.workspaceId === workspaceId);
  }

  async deleteChunksByDocument(documentId: string, workspaceId: WorkspaceId): Promise<void> {
    const chunks = await this.getChunksByDocument(documentId, workspaceId);
    if (this.isMemoryOnly()) {
      for (const c of chunks) {
        this.memChunks.delete(c.id);
      }
      return;
    }
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHUNKS, 'readwrite');
      const store = tx.objectStore(STORE_CHUNKS);
      let pending = chunks.length;
      if (pending === 0) { resolve(); return; }

      for (const chunk of chunks) {
        const req = store.delete(chunk.id);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          pending--;
          if (pending === 0) resolve();
        };
      }
    });
  }

  async getChunkCount(workspaceId: WorkspaceId): Promise<number> {
    const chunks = await this.getChunksByWorkspace(workspaceId);
    return chunks.length;
  }

  /** Clears memory state (useful for tests) */
  clearMemory(): void {
    this.memDocs.clear();
    this.memChunks.clear();
  }
}

// Singleton instance
export const ragStore = new WorkspaceRagStore();
