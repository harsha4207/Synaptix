/**
 * TF-IDF Embedding Service
 * Browser-native TF-IDF embedding provider for workspace-local vector search.
 * No external API required.
 *
 * Strategy:
 *  1. Build vocabulary from all chunks in a workspace
 *  2. Compute TF-IDF vectors per chunk
 *  3. Use cosine similarity for retrieval
 *  4. Hybrid: combine with keyword overlap score
 */

import type { DocumentChunk, RetrievedChunk, RagDocument } from './types';

// Common English stop words to exclude from TF-IDF
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'as',
  'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
  'we', 'our', 'you', 'your', 'i', 'my', 'me', 'he', 'she', 'his', 'her',
  'not', 'no', 'so', 'if', 'then', 'than', 'when', 'where', 'who', 'which',
  'what', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'other',
  'some', 'such', 'only', 'own', 'same', 'also', 'just', 'because', 'while',
]);

/**
 * Tokenize text to normalized terms.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s$%.-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Compute term frequency for a token list.
 */
function computeTF(tokens: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const token of tokens) {
    counts[token] = (counts[token] ?? 0) + 1;
  }
  const total = tokens.length || 1;
  const tf: Record<string, number> = {};
  for (const [term, count] of Object.entries(counts)) {
    tf[term] = count / total;
  }
  return tf;
}

/**
 * Compute IDF map from a collection of token lists.
 */
function computeIDF(tokenLists: string[][]): Record<string, number> {
  const N = tokenLists.length || 1;
  const docFreq: Record<string, number> = {};

  for (const tokens of tokenLists) {
    const unique = new Set(tokens);
    for (const token of unique) {
      docFreq[token] = (docFreq[token] ?? 0) + 1;
    }
  }

  const idf: Record<string, number> = {};
  for (const [term, df] of Object.entries(docFreq)) {
    idf[term] = Math.log(N / df) + 1;
  }
  return idf;
}

/**
 * Compute TF-IDF vector for a token list given an IDF map.
 */
function computeTFIDF(tokens: string[], idf: Record<string, number>): Record<string, number> {
  const tf = computeTF(tokens);
  const tfidf: Record<string, number> = {};
  for (const [term, tfScore] of Object.entries(tf)) {
    const idfScore = idf[term] ?? 1;
    tfidf[term] = tfScore * idfScore;
  }
  return tfidf;
}

/**
 * Cosine similarity between two sparse TF-IDF vectors.
 */
function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, aVal] of Object.entries(a)) {
    const bVal = b[term] ?? 0;
    dotProduct += aVal * bVal;
    normA += aVal * aVal;
  }

  for (const bVal of Object.values(b)) {
    normB += bVal * bVal;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Keyword overlap score (Jaccard-like).
 */
function keywordOverlapScore(queryTokens: Set<string>, chunkTokens: Set<string>): number {
  if (queryTokens.size === 0) return 0;
  let intersection = 0;
  for (const token of queryTokens) {
    if (chunkTokens.has(token)) intersection++;
  }
  return intersection / queryTokens.size;
}

export interface EmbeddingSearchOptions {
  topK?: number;
  similarityThreshold?: number;
  documentIdFilter?: string[];
}

/**
 * Embed chunks: given the full list of chunks in a workspace,
 * compute and attach TF-IDF embeddings.
 * Returns updated chunks with the embedding field populated.
 */
export function embedChunks(chunks: Omit<{ content: string }, never>[]): Record<string, number>[] {
  const tokenLists = (chunks as { content: string }[]).map((c) => tokenize(c.content));
  const idf = computeIDF(tokenLists);
  return tokenLists.map((tokens) => computeTFIDF(tokens, idf));
}

/**
 * Search chunks using hybrid TF-IDF + keyword retrieval.
 * IMPORTANT: only accepts pre-filtered workspace chunks — caller must ensure
 * workspace isolation before passing chunks to this function.
 */
export function searchChunks(
  query: string,
  workspaceChunks: DocumentChunk[],
  documentMap: Map<string, RagDocument>,
  options: EmbeddingSearchOptions = {}
): RetrievedChunk[] {
  const {
    topK = 10,
    similarityThreshold = 0.05,
    documentIdFilter,
  } = options;

  if (workspaceChunks.length === 0) return [];

  // Filter by document if requested
  const candidates = documentIdFilter?.length
    ? workspaceChunks.filter((c) => documentIdFilter.includes(c.documentId))
    : workspaceChunks;

  if (candidates.length === 0) return [];

  // Only search chunks from READY documents
  const readyCandidates = candidates.filter((c) => {
    const doc = documentMap.get(c.documentId);
    return doc?.status === 'READY';
  });

  if (readyCandidates.length === 0) return [];

  // Build IDF from all workspace chunks (not just candidates — corpus-level IDF)
  const allTokenLists = workspaceChunks.map((c) => tokenize(c.content));
  const idf = computeIDF(allTokenLists);

  // Query vector
  const queryTokens = tokenize(query);
  const queryVector = computeTFIDF(queryTokens, idf);
  const queryTokenSet = new Set(queryTokens);

  // Score each candidate
  const results: RetrievedChunk[] = [];

  for (const chunk of readyCandidates) {
    // Use stored embedding or recompute on-the-fly
    let chunkVector: Record<string, number> = chunk.embedding;
    if (!chunkVector || Object.keys(chunkVector).length === 0) {
      const chunkTokens = tokenize(chunk.content);
      chunkVector = computeTFIDF(chunkTokens, idf);
    }

    const semanticScore = cosineSimilarity(queryVector, chunkVector);
    const chunkTokenSet = new Set(tokenize(chunk.content));
    const kw = keywordOverlapScore(queryTokenSet, chunkTokenSet);

    // Combined score: 70% semantic + 30% keyword
    const score = semanticScore * 0.7 + kw * 0.3;

    if (score >= similarityThreshold) {
      const doc = documentMap.get(chunk.documentId);
      if (doc) {
        results.push({
          chunk,
          document: doc,
          score,
          semanticScore,
          keywordScore: kw,
        });
      }
    }
  }

  // Sort by score descending, take topK
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

/**
 * Compute TF-IDF embedding for a single chunk given a corpus of all chunk token lists.
 * Used during ingestion when adding a new chunk to a workspace.
 */
export function computeChunkEmbedding(
  chunkContent: string,
  allChunkContents: string[]
): Record<string, number> {
  const allTokenLists = allChunkContents.map(tokenize);
  const idf = computeIDF(allTokenLists);
  const chunkTokens = tokenize(chunkContent);
  return computeTFIDF(chunkTokens, idf);
}
