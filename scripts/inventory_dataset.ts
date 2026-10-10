import fs from 'node:fs';
import path from 'node:path';

interface InventoryItem {
  relativePath: string;
  fileName: string;
  extension: string;
  detectedFormat: string;
  mimeType: string;
  sizeBytes: number;
  datasetCategory: string;
  proposedWorkspace: string;
  proposedIngestionMethod: string;
  validationStatus: 'VALID' | 'INVALID' | 'EMPTY' | 'UNSUPPORTED' | 'EXCLUDED_EVALUATION';
  exclusionReason?: string;
}

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.json': 'application/json',
  '.jsonl': 'application/x-jsonlines',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

function getMimeType(ext: string): string {
  return MIME_MAP[ext.toLowerCase()] || 'application/octet-stream';
}

function resolveCategoryAndWorkspace(relPath: string, fileName: string): {
  category: string;
  workspace: string;
  method: string;
  isEvaluation: boolean;
  isExcluded: boolean;
  exclusionReason?: string;
} {
  const norm = relPath.replace(/\\/g, '/').toLowerCase();
  const ext = path.extname(fileName).toLowerCase();

  // Evaluation, Manifests, Readmes, Gold standard answers exclusions
  if (norm.includes('15_gold_standard_answers') || norm.includes('gold_standard')) {
    return {
      category: 'Manifests, evaluation questions, expected answers, and supporting artifacts',
      workspace: 'evaluation_eval',
      method: 'Evaluation Benchmark Suite (Do not index into retrieval corpus to avoid answer leakage)',
      isEvaluation: true,
      isExcluded: true,
      exclusionReason: 'Ground truth answer key — reserved for RAG evaluation suite to prevent data leakage',
    };
  }

  if (norm.includes('14_rag_test_questions') || norm.includes('test_qa') || fileName === 'TEST_CASES.md' || fileName === 'ANALYTICS_TEST_QA.json') {
    return {
      category: 'Manifests, evaluation questions, expected answers, and supporting artifacts',
      workspace: 'evaluation_eval',
      method: 'Evaluation Benchmark Suite (Do not index into retrieval corpus)',
      isEvaluation: true,
      isExcluded: true,
      exclusionReason: 'Evaluation questions & test specifications — reserved for evaluation regression suite',
    };
  }

  if (
    fileName.toLowerCase() === 'readme.md' ||
    fileName.toLowerCase().includes('manifest') ||
    fileName.toLowerCase() === 'dataset_catalog.csv' ||
    fileName.toLowerCase() === 'validation_report.md' ||
    fileName.toLowerCase() === 'synthetic_data_notice.md' ||
    fileName.toLowerCase() === 'known_issues.md'
  ) {
    return {
      category: 'Manifests, evaluation questions, expected answers, and supporting artifacts',
      workspace: 'system_artifacts',
      method: 'System Documentation / Metadata (Exempt from business knowledge indexing)',
      isEvaluation: false,
      isExcluded: true,
      exclusionReason: 'Repository manifest / Readme / Documentation artifact',
    };
  }

  // Workspace-specific dummy data
  if (norm.includes('synaptix_dummy_data/finance') || norm.includes('04_finance_and_accounting') || norm.includes('bi_analytics_dataset')) {
    const isStructured = ['.csv', '.xlsx'].includes(ext);
    return {
      category: isStructured ? 'Structured analytics datasets' : 'Finance and business knowledge',
      workspace: 'finance',
      method: isStructured ? 'Structured Data Parser + Aggregation Schema' : (ext === '.pdf' ? 'PDF Text Extractor' : 'Document Extractor'),
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('synaptix_dummy_data/research') || norm.includes('09_data_governance') || norm.includes('12_ai_governance')) {
    return {
      category: 'Research documents',
      workspace: 'research',
      method: ext === '.pdf' ? 'PDF Text Extractor' : 'Document Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('synaptix_dummy_data/healthcare')) {
    return {
      category: 'Healthcare documents',
      workspace: 'healthcare',
      method: ext === '.pdf' ? 'PDF Text Extractor' : 'Document Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('synaptix_dummy_data/education')) {
    return {
      category: 'Education documents',
      workspace: 'education',
      method: ext === '.pdf' ? 'PDF Text Extractor' : 'Document Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('synaptix_dummy_data/business') || norm.includes('07_procurement_and_vendors')) {
    return {
      category: 'Business and Custom Operations documents',
      workspace: 'business',
      method: ext === '.pdf' ? 'PDF Text Extractor' : 'Document Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('synaptix_dummy_data/custom_operations') || norm.includes('08_operations_and_sops')) {
    return {
      category: 'Company policies, regulations, and SOPs',
      workspace: 'custom_operations',
      method: 'Document Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('01_company_profile') || norm.includes('02_organization_and_roles')) {
    return {
      category: 'Organizational profiles and governance documents',
      workspace: 'business',
      method: 'Document Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('03_hr_policies') || norm.includes('05_legal_and_compliance') || norm.includes('06_information_security') || norm.includes('11_risk_and_audit')) {
    return {
      category: 'Company policies, regulations, and SOPs',
      workspace: 'business',
      method: 'Policy Document Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('13_structured_datasets')) {
    return {
      category: 'Structured analytics datasets',
      workspace: 'business',
      method: 'Structured CSV / Sheet Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('synaptix_ingestion_test_pack')) {
    const isImg = ['.jpg', '.jpeg', '.png'].includes(ext);
    return {
      category: 'OCR and document-ingestion test files',
      workspace: 'custom_operations',
      method: isImg ? 'OCR Image Extractor (Tesseract.js)' : 'Multi-format Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  if (norm.includes('16_conflict_and_version_tests') || norm.includes('17_ingestion_edge_cases')) {
    return {
      category: 'OCR and document-ingestion test files',
      workspace: 'custom_operations',
      method: 'Edge-Case / Version-aware Document Extractor',
      isEvaluation: false,
      isExcluded: false,
    };
  }

  return {
    category: 'Business and Custom Operations documents',
    workspace: 'business',
    method: 'General Document Extractor',
    isEvaluation: false,
    isExcluded: false,
  };
}

function scanDir(baseDir: string, currentDir: string, list: InventoryItem[] = []): InventoryItem[] {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      scanDir(baseDir, fullPath, list);
    } else if (entry.isFile()) {
      const relPath = path.relative(baseDir, fullPath);
      const ext = path.extname(entry.name);
      const stat = fs.statSync(fullPath);
      const mime = getMimeType(ext);

      const mapping = resolveCategoryAndWorkspace(relPath, entry.name);

      let validationStatus: InventoryItem['validationStatus'] = 'VALID';
      let exclusionReason = mapping.exclusionReason;

      if (stat.size === 0) {
        validationStatus = 'EMPTY';
        exclusionReason = 'File is 0 bytes (empty)';
      } else if (mapping.isExcluded) {
        validationStatus = mapping.isEvaluation ? 'EXCLUDED_EVALUATION' : 'INVALID';
      }

      list.push({
        relativePath: relPath,
        fileName: entry.name,
        extension: ext,
        detectedFormat: ext.replace('.', '').toUpperCase() || 'UNKNOWN',
        mimeType: mime,
        sizeBytes: stat.size,
        datasetCategory: mapping.category,
        proposedWorkspace: mapping.workspace,
        proposedIngestionMethod: mapping.method,
        validationStatus,
        exclusionReason,
      });
    }
  }

  return list;
}

const baseDatasetDir = path.resolve(process.cwd(), 'synaptix_test_data');
console.log(`Scanning dataset in: ${baseDatasetDir}`);
const inventory = scanDir(baseDatasetDir, baseDatasetDir);

const outputPath = path.resolve(process.cwd(), 'dataset_inventory.json');
fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2), 'utf-8');

console.log(`Total files discovered: ${inventory.length}`);
const validForIngestion = inventory.filter((i) => i.validationStatus === 'VALID');
const evaluationFiles = inventory.filter((i) => i.validationStatus === 'EXCLUDED_EVALUATION');
const manifestsAndDocs = inventory.filter((i) => i.validationStatus === 'INVALID' || i.validationStatus === 'EMPTY');

console.log(`Valid for ingestion into corpus: ${validForIngestion.length}`);
console.log(`Evaluation QA & Gold-Standard files: ${evaluationFiles.length}`);
console.log(`Manifests, documentation & empty files: ${manifestsAndDocs.length}`);
