/**
 * Text Extraction Service
 * Extracts text from various file formats with metadata preservation.
 * Uses:
 *   - pdfjs-dist for PDFs (text extraction + page numbers)
 *   - mammoth for DOCX (headings, paragraphs, tables)
 *   - xlsx (SheetJS) for XLSX and CSV
 *   - Tesseract.js for images (OCR)
 *   - Native FileReader for TXT, MD, JSON
 */

import type { SupportedFileType, DocumentMetadata } from './types';

export interface ExtractionResult {
  /** Flat extracted text, normalized */
  text: string;
  /** Structured sections for chunk-aware splitting */
  sections: ExtractedSection[];
  metadata: DocumentMetadata;
  ocrApplied: boolean;
  error?: string;
}

export interface ExtractedSection {
  /** Type of content section */
  type: 'heading' | 'paragraph' | 'table' | 'page' | 'sheet' | 'row_group';
  /** The text content */
  content: string;
  /** Source reference */
  pageNumber?: number;
  sheetName?: string;
  rowStart?: number;
  rowEnd?: number;
  heading?: string;
}

/** Rows per sheet group for XLSX/CSV chunking */
const SHEET_ROW_GROUP_SIZE = 50;

// ── PDF Extraction ────────────────────────────────────────────────────────────

async function extractPdf(file: File): Promise<ExtractionResult> {
  try {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    // Use bundled worker from CDN to avoid complex bundler config
    GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const sections: ExtractedSection[] = [];
    const textParts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: unknown) => {
          const textItem = item as { str?: string };
          return typeof textItem?.str === 'string' ? textItem.str : '';
        })
        .join(' ')
        .trim();

      if (pageText.length > 20) {
        sections.push({
          type: 'page',
          content: pageText,
          pageNumber: pageNum,
        });
        textParts.push(pageText);
      }
    }

    const fullText = textParts.join('\n\n');

    // Check if PDF was scanned (insufficient text)
    const avgCharsPerPage = fullText.length / numPages;
    const needsOcr = avgCharsPerPage < 100 && numPages > 0;

    if (needsOcr) {
      // For scanned PDFs: attempt OCR on first page as a signal
      return {
        text: fullText.length > 50 ? fullText : '[Scanned PDF — OCR required for full extraction]',
        sections,
        metadata: { pageCount: numPages, title: file.name },
        ocrApplied: false,
      };
    }

    return {
      text: fullText,
      sections,
      metadata: {
        pageCount: numPages,
        title: file.name,
        summary: fullText.slice(0, 300),
      },
      ocrApplied: false,
    };
  } catch (err) {
    return {
      text: '',
      sections: [],
      metadata: {},
      ocrApplied: false,
      error: `PDF extraction failed: ${(err as Error).message}`,
    };
  }
}

// ── DOCX Extraction ───────────────────────────────────────────────────────────

async function extractDocx(file: File): Promise<ExtractionResult> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();

    // Extract raw text
    const rawResult = await mammoth.extractRawText({ arrayBuffer });
    const rawText = (rawResult.value || '').trim();

    // Also extract HTML to preserve structured tables, headings, and lists
    let html = '';
    try {
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      html = htmlResult.value || '';
    } catch {
      html = '';
    }

    const sections: ExtractedSection[] = [];
    const headings: string[] = [];

    if (html && typeof DOMParser !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyChildren = Array.from(doc.body.children);

        let currentHeading: string | undefined;
        let paragraphBuffer: string[] = [];

        for (const el of bodyChildren) {
          const tagName = el.tagName.toLowerCase();
          const text = (el.textContent || '').trim();
          if (!text) continue;

          if (/^h[1-6]$/.test(tagName)) {
            if (paragraphBuffer.length > 0) {
              sections.push({
                type: 'paragraph',
                content: paragraphBuffer.join('\n\n'),
                heading: currentHeading,
              });
              paragraphBuffer = [];
            }
            currentHeading = text;
            headings.push(text);
          } else if (tagName === 'table') {
            if (paragraphBuffer.length > 0) {
              sections.push({
                type: 'paragraph',
                content: paragraphBuffer.join('\n\n'),
                heading: currentHeading,
              });
              paragraphBuffer = [];
            }
            // Parse table rows and cells
            const rows = Array.from(el.querySelectorAll('tr'));
            if (rows.length > 0) {
              const tableLines: string[] = [];
              const headers: string[] = [];
              const firstRowCells = Array.from(rows[0].querySelectorAll('th, td')).map((c) => (c.textContent || '').trim());

              const isHeaderRow = rows[0].querySelector('th') !== null || rows.length > 1;
              if (isHeaderRow && firstRowCells.some(Boolean)) {
                headers.push(...firstRowCells);
                tableLines.push(`Columns: ${headers.filter(Boolean).join(' | ')}`);
              }

              const dataRows = isHeaderRow ? rows.slice(1) : rows;
              for (const row of dataRows) {
                const cells = Array.from(row.querySelectorAll('td, th')).map((c) => (c.textContent || '').trim());
                if (cells.some(Boolean)) {
                  if (headers.length > 0) {
                    const rowDesc = cells.map((cell, idx) => `${headers[idx] || `Col ${idx + 1}`}: ${cell}`).join(' | ');
                    tableLines.push(rowDesc);
                  } else {
                    tableLines.push(cells.join(' | '));
                  }
                }
              }

              if (tableLines.length > 0) {
                sections.push({
                  type: 'table',
                  content: tableLines.join('\n'),
                  heading: currentHeading,
                });
              }
            }
          } else {
            // p, ul, ol, div, etc.
            paragraphBuffer.push(text);
          }
        }

        if (paragraphBuffer.length > 0) {
          sections.push({
            type: 'paragraph',
            content: paragraphBuffer.join('\n\n'),
            heading: currentHeading,
          });
        }
      } catch {
        // Fallback to text lines below if DOMParser throws
      }
    }

    // If HTML parsing yielded no sections or failed, parse rawText
    if (sections.length === 0 && rawText.length > 0) {
      const paragraphs = rawText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      if (paragraphs.length > 0) {
        for (const p of paragraphs) {
          sections.push({
            type: 'paragraph',
            content: p,
          });
        }
      } else {
        sections.push({
          type: 'paragraph',
          content: rawText,
        });
      }
    }

    if (!rawText && sections.length === 0) {
      return {
        text: '',
        sections: [],
        metadata: {},
        ocrApplied: false,
        error: 'DOCX document contains no extractable text or tables.',
      };
    }

    return {
      text: rawText || sections.map((s) => s.content).join('\n\n'),
      sections,
      metadata: {
        title: file.name,
        headings: [...new Set(headings)],
        summary: (rawText || sections[0]?.content || '').slice(0, 300),
      },
      ocrApplied: false,
    };
  } catch (err) {
    return {
      text: '',
      sections: [],
      metadata: {},
      ocrApplied: false,
      error: `DOCX extraction failed: ${(err as Error).message}`,
    };
  }
}

// ── XLSX Extraction ───────────────────────────────────────────────────────────

async function extractXlsx(file: File): Promise<ExtractionResult> {
  try {
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetNames = workbook.SheetNames;
    const sections: ExtractedSection[] = [];
    const textParts: string[] = [];
    let totalRows = 0;
    const allColumnNames: string[] = [];

    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as string[][];

      if (rows.length === 0) continue;

      // First row = headers
      const headers = (rows[0] || []).map((h) => String(h).trim()).filter(Boolean);
      allColumnNames.push(...headers);

      const dataRows = rows.slice(1);
      totalRows += dataRows.length;

      const headerLine = `Sheet: ${sheetName} | Columns: ${headers.join(', ')}`;
      textParts.push(headerLine);

      // Group rows into sections
      for (let i = 0; i < dataRows.length; i += SHEET_ROW_GROUP_SIZE) {
        const group = dataRows.slice(i, i + SHEET_ROW_GROUP_SIZE);
        const groupText = group
          .map((row) =>
            headers.map((h, hIdx) => `${h}: ${String((row as unknown[])[hIdx] ?? '').trim()}`).join(' | ')
          )
          .filter((r) => r.trim().length > 5)
          .join('\n');

        if (groupText.trim().length > 0) {
          const rowStart = i + 2; // 1-indexed, skip header
          const rowEnd = Math.min(i + SHEET_ROW_GROUP_SIZE + 1, dataRows.length + 1);
          sections.push({
            type: 'sheet',
            content: `${headerLine}\n${groupText}`,
            sheetName,
            rowStart,
            rowEnd,
          });
          textParts.push(groupText);
        }
      }
    }

    return {
      text: textParts.join('\n\n'),
      sections,
      metadata: {
        sheetNames,
        rowCount: totalRows,
        columnNames: [...new Set(allColumnNames)],
        summary: `Workbook with ${sheetNames.length} sheet(s): ${sheetNames.join(', ')}. ${totalRows} data rows.`,
      },
      ocrApplied: false,
    };
  } catch (err) {
    return {
      text: '',
      sections: [],
      metadata: {},
      ocrApplied: false,
      error: `XLSX extraction failed: ${(err as Error).message}`,
    };
  }
}

// ── CSV Extraction ────────────────────────────────────────────────────────────

async function extractCsv(file: File): Promise<ExtractionResult> {
  try {
    const XLSX = await import('xlsx');
    const text = await file.text();
    const workbook = XLSX.read(text, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as string[][];

    if (rows.length === 0) {
      return { text: '', sections: [], metadata: {}, ocrApplied: false, error: 'CSV is empty' };
    }

    const headers = (rows[0] || []).map((h) => String(h).trim()).filter(Boolean);
    const dataRows = rows.slice(1).filter((r) => (r as unknown[]).some((cell) => String(cell).trim().length > 0));

    const sections: ExtractedSection[] = [];
    const textParts: string[] = [];
    const headerLine = `Columns: ${headers.join(', ')}`;
    textParts.push(headerLine);

    for (let i = 0; i < dataRows.length; i += SHEET_ROW_GROUP_SIZE) {
      const group = dataRows.slice(i, i + SHEET_ROW_GROUP_SIZE);
      const groupText = group
        .map((row) =>
          headers.map((h, hIdx) => `${h}: ${String((row as unknown[])[hIdx] ?? '').trim()}`).join(' | ')
        )
        .filter((r) => r.trim().length > 5)
        .join('\n');

      if (groupText.trim().length > 0) {
        sections.push({
          type: 'row_group',
          content: `${headerLine}\n${groupText}`,
          rowStart: i + 2,
          rowEnd: Math.min(i + SHEET_ROW_GROUP_SIZE + 1, dataRows.length + 1),
        });
        textParts.push(groupText);
      }
    }

    return {
      text: textParts.join('\n\n'),
      sections,
      metadata: {
        rowCount: dataRows.length,
        columnNames: headers,
        summary: `CSV with ${dataRows.length} rows and ${headers.length} columns: ${headers.join(', ')}`,
      },
      ocrApplied: false,
    };
  } catch (err) {
    return {
      text: '',
      sections: [],
      metadata: {},
      ocrApplied: false,
      error: `CSV extraction failed: ${(err as Error).message}`,
    };
  }
}

// ── TXT / MD / JSON Extraction ────────────────────────────────────────────────

async function extractText(file: File, fileType: SupportedFileType): Promise<ExtractionResult> {
  try {
    const text = await file.text();
    const sections: ExtractedSection[] = [];

    if (fileType === 'JSON') {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        return { text: '', sections: [], metadata: {}, ocrApplied: false, error: 'Invalid JSON' };
      }

      const prettyText = JSON.stringify(parsed, null, 2);
      sections.push({ type: 'paragraph', content: prettyText });
      return {
        text: prettyText,
        sections,
        metadata: { summary: text.slice(0, 200) },
        ocrApplied: false,
      };
    }

    // TXT / MD: split by headings and paragraphs
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
    let currentHeading: string | undefined;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      const isMarkdownHeading = /^#{1,6}\s/.test(trimmed);
      const isShortLine = trimmed.length < 80 && !trimmed.endsWith('.') && !trimmed.includes('\n');

      if (isMarkdownHeading) {
        currentHeading = trimmed.replace(/^#{1,6}\s/, '');
        sections.push({ type: 'heading', content: currentHeading });
      } else if (isShortLine && paragraphs.indexOf(para) === 0) {
        currentHeading = trimmed;
        sections.push({ type: 'heading', content: trimmed });
      } else {
        sections.push({ type: 'paragraph', content: trimmed, heading: currentHeading });
      }
    }

    const headings = sections.filter((s) => s.type === 'heading').map((s) => s.content);

    return {
      text,
      sections,
      metadata: {
        headings: headings.slice(0, 20),
        summary: text.slice(0, 300),
      },
      ocrApplied: false,
    };
  } catch (err) {
    return {
      text: '',
      sections: [],
      metadata: {},
      ocrApplied: false,
      error: `Text extraction failed: ${(err as Error).message}`,
    };
  }
}

// ── Image OCR ─────────────────────────────────────────────────────────────────

async function extractImage(file: File): Promise<ExtractionResult> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const url = URL.createObjectURL(file);

    try {
      const {
        data: { text },
      } = await worker.recognize(url);

      const sections: ExtractedSection[] = text.trim()
        ? [{ type: 'paragraph', content: text.trim() }]
        : [];

      return {
        text: text.trim(),
        sections,
        metadata: { summary: text.slice(0, 200) },
        ocrApplied: true,
      };
    } finally {
      URL.revokeObjectURL(url);
      await worker.terminate();
    }
  } catch (err) {
    return {
      text: '',
      sections: [],
      metadata: {},
      ocrApplied: true,
      error: `OCR failed: ${(err as Error).message}`,
    };
  }
}

// ── Main Dispatcher ───────────────────────────────────────────────────────────

export async function extractTextFromFile(
  file: File,
  fileType: SupportedFileType
): Promise<ExtractionResult> {
  switch (fileType) {
    case 'PDF':
      return extractPdf(file);
    case 'DOCX':
      return extractDocx(file);
    case 'XLSX':
      return extractXlsx(file);
    case 'CSV':
      return extractCsv(file);
    case 'TXT':
    case 'MD':
    case 'JSON':
      return extractText(file, fileType);
    case 'JPG':
    case 'JPEG':
    case 'PNG':
      return extractImage(file);
    default:
      return {
        text: '',
        sections: [],
        metadata: {},
        ocrApplied: false,
        error: `Unsupported file type: ${fileType}`,
      };
  }
}
