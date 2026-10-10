/**
 * Chunking Service
 * Format-aware, paragraph-respecting chunking with configurable size and overlap.
 * Produces DocumentChunk records with full source reference metadata.
 */

import type { DocumentChunk, ChunkSourceRef, WorkspaceId } from './types';
import type { ExtractedSection } from './extraction';
import type { IngestionConfig } from './types';
import { generateId } from './validation';

// Approximate: 1 token ≈ 4 characters
const CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Split a long text block into overlapping chunks.
 * Respects paragraph boundaries by preferring paragraph breaks over word breaks.
 */
function splitIntoChunks(
  text: string,
  chunkSizeTokens: number,
  overlapTokens: number
): string[] {
  const maxChars = chunkSizeTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;

  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChars;

    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }

    // Try to split at a paragraph boundary (\n\n)
    const paragraphBreak = text.lastIndexOf('\n\n', end);
    if (paragraphBreak > start + overlapChars) {
      end = paragraphBreak;
    } else {
      // Fall back to sentence boundary
      const sentenceBreak = text.lastIndexOf('. ', end);
      if (sentenceBreak > start + overlapChars) {
        end = sentenceBreak + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move forward with overlap
    start = Math.max(start + 1, end - overlapChars);
  }

  return chunks.filter((c) => c.trim().length > 0);
}

/**
 * Chunk extracted sections from a document.
 * Each section type is handled appropriately:
 * - Tables and sheet groups are kept whole or minimally split
 * - Paragraphs and pages are split with overlap
 * - Headings are prepended to the following paragraph chunk
 */
export function chunkDocument(
  sections: ExtractedSection[],
  documentId: string,
  workspaceId: WorkspaceId,
  organizationId: string,
  filename: string,
  config: IngestionConfig
): Omit<DocumentChunk, 'embedding' | 'contentHash'>[] {
  const chunks: Omit<DocumentChunk, 'embedding' | 'contentHash'>[] = [];
  let chunkIndex = 0;
  let pendingHeading: string | undefined;

  for (const section of sections) {
    if (!section.content || section.content.trim().length < config.minChunkLength) {
      if (section.type === 'heading') {
        pendingHeading = section.content;
      }
      continue;
    }

    const sourceRef: ChunkSourceRef = {
      filename,
      pageNumber: section.pageNumber,
      sectionHeading: section.heading ?? pendingHeading,
      sheetName: section.sheetName,
      rowRange:
        section.rowStart !== undefined && section.rowEnd !== undefined
          ? [section.rowStart, section.rowEnd]
          : undefined,
    };

    if (section.type === 'heading') {
      pendingHeading = section.content;
      continue;
    }

    // For table/sheet/row_group: try to keep intact if small enough
    if (
      section.type === 'table' ||
      section.type === 'sheet' ||
      section.type === 'row_group'
    ) {
      const sectionTokens = estimateTokens(section.content);
      if (sectionTokens <= config.chunkSize * 1.5) {
        chunks.push({
          id: generateId(),
          documentId,
          workspaceId,
          organizationId,
          chunkIndex: chunkIndex++,
          content: section.content.trim(),
          sourceRef: { ...sourceRef },
          createdAt: new Date().toISOString(),
        });
      } else {
        // Large table: split but keep headers on each chunk
        const lines = section.content.split('\n');
        const headerLine = lines[0];
        const bodyLines = lines.slice(1);
        const subChunks = splitIntoChunks(
          bodyLines.join('\n'),
          config.chunkSize - estimateTokens(headerLine),
          config.chunkOverlap
        );

        for (const sc of subChunks) {
          chunks.push({
            id: generateId(),
            documentId,
            workspaceId,
            organizationId,
            chunkIndex: chunkIndex++,
            content: `${headerLine}\n${sc}`.trim(),
            sourceRef: { ...sourceRef },
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else {
      // page / paragraph: split with overlap
      const content =
        pendingHeading
          ? `${pendingHeading}\n\n${section.content}`
          : section.content;

      pendingHeading = undefined;

      const subChunks = splitIntoChunks(content, config.chunkSize, config.chunkOverlap);

      for (const sc of subChunks) {
        if (sc.trim().length < config.minChunkLength) continue;

        chunks.push({
          id: generateId(),
          documentId,
          workspaceId,
          organizationId,
          chunkIndex: chunkIndex++,
          content: sc.trim(),
          sourceRef: { ...sourceRef },
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // If a pending heading was left at the end without following content, emit it as a chunk if valid length
  if (pendingHeading && pendingHeading.trim().length >= config.minChunkLength) {
    chunks.push({
      id: generateId(),
      documentId,
      workspaceId,
      organizationId,
      chunkIndex: chunkIndex++,
      content: pendingHeading.trim(),
      sourceRef: { filename, sectionHeading: pendingHeading },
      createdAt: new Date().toISOString(),
    });
  }

  return chunks;
}
