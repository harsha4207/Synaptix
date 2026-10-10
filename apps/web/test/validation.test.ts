import { describe, it, expect } from 'vitest';
import {
  sanitizeFilename,
  validateFile,
  computeHash,
  generateId,
  DEFAULT_INGESTION_CONFIG,
} from '../src/lib/rag/validation';

describe('RAG Validation and Security Service', () => {
  it('sanitizes unsafe filenames and prevents path traversal', () => {
    const maliciousName = '../../etc/passwd..\\..\\malicious.pdf';
    const sanitized = sanitizeFilename(maliciousName);

    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/');
    expect(sanitized).not.toContain('\\');
  });

  it('sanitizes illegal characters in filenames', () => {
    const raw = 'report:2026*final?"<>|test.docx';
    const sanitized = sanitizeFilename(raw);

    expect(sanitized).toBe('report_2026_final_____test.docx');
  });

  it('validates supported file types correctly', () => {
    const validFile = new File(['sample content'], 'financial_report.pdf', {
      type: 'application/pdf',
    });
    const result = validateFile(validFile);

    expect(result.valid).toBe(true);
    expect(result.fileType).toBe('PDF');
  });

  it('rejects unsupported file extensions', () => {
    const invalidFile = new File(['binary code'], 'malicious_script.exe', {
      type: 'application/octet-stream',
    });
    const result = validateFile(invalidFile);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported file type');
  });

  it('rejects empty files', () => {
    const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
    const result = validateFile(emptyFile);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects files exceeding size limits', () => {
    const largeFile = new File(['content'], 'huge.pdf', { type: 'application/pdf' });
    // Mock size property
    Object.defineProperty(largeFile, 'size', { value: 600 * 1024 * 1024 });

    const result = validateFile(largeFile, {
      ...DEFAULT_INGESTION_CONFIG,
      maxFileSizeBytes: 100 * 1024 * 1024,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds limit');
  });

  it('computes deterministic SHA-256 hash', async () => {
    const encoder = new TextEncoder();
    const buffer1 = encoder.encode('Deterministic Synaptix Test Data').buffer;
    const buffer2 = encoder.encode('Deterministic Synaptix Test Data').buffer;
    const buffer3 = encoder.encode('Different Data').buffer;

    const hash1 = await computeHash(buffer1);
    const hash2 = await computeHash(buffer2);
    const hash3 = await computeHash(buffer3);

    expect(hash1).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('generates unique valid UUIDs', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
