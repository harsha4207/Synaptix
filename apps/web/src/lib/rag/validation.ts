/**
 * File Validation Service
 * Validates uploaded files against security and format requirements.
 */

import type { SupportedFileType, IngestionConfig } from './types';

export const DEFAULT_INGESTION_CONFIG: IngestionConfig = {
  chunkSize: 600,        // ~600 tokens ≈ 2400 chars
  chunkOverlap: 100,     // ~100 tokens ≈ 400 chars
  minChunkLength: 5,     // minimum chars to index a chunk (supports evaluation sheets, tables, scores)
  maxFileSizeBytes: 500 * 1024 * 1024, // 500 MB
  allowedTypes: ['PDF', 'DOCX', 'XLSX', 'CSV', 'TXT', 'MD', 'JSON', 'JPG', 'JPEG', 'PNG'],
};

const EXTENSION_TO_TYPE: Record<string, SupportedFileType> = {
  pdf: 'PDF',
  docx: 'DOCX',
  doc: 'DOCX',
  xlsx: 'XLSX',
  xls: 'XLSX',
  csv: 'CSV',
  txt: 'TXT',
  text: 'TXT',
  md: 'MD',
  markdown: 'MD',
  json: 'JSON',
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
};

const MIME_TO_TYPE: Record<string, SupportedFileType> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLSX',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
  'text/x-markdown': 'MD',
  'application/json': 'JSON',
  'text/json': 'JSON',
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
};

export interface FileValidationResult {
  valid: boolean;
  fileType?: SupportedFileType;
  error?: string;
}

/**
 * Sanitize filename: strip path traversal, limit length, allow safe chars only.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\.\./g, '_')
    .slice(0, 255);
}

/**
 * Detect file type from filename extension or MIME type.
 */
export function detectFileType(file: { name: string; type?: string }): SupportedFileType | undefined {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext && EXTENSION_TO_TYPE[ext]) {
    return EXTENSION_TO_TYPE[ext];
  }
  if (file.type) {
    const normalizedMime = file.type.toLowerCase().trim();
    if (MIME_TO_TYPE[normalizedMime]) {
      return MIME_TO_TYPE[normalizedMime];
    }
  }
  return undefined;
}

/**
 * Validate a File object against the ingestion config.
 */
export function validateFile(file: File, config: IngestionConfig = DEFAULT_INGESTION_CONFIG): FileValidationResult {
  // Size check
  if (file.size > config.maxFileSizeBytes) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds limit of ${config.maxFileSizeBytes / 1024 / 1024} MB`,
    };
  }

  // Empty file check
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Type detection
  const fileType = detectFileType(file);

  if (!fileType) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    return { valid: false, error: `Unsupported file type: .${ext || 'unknown'}` };
  }

  if (!config.allowedTypes.includes(fileType)) {
    return { valid: false, error: `File type ${fileType} is not allowed in this configuration` };
  }

  return { valid: true, fileType };
}

/**
 * Compute SHA-256 hash of an ArrayBuffer.
 */
export async function computeHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'sha256:' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a UUID v4.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
