import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Cloud,
  Table as TableIcon,
  Search,
  Trash2,
  Download,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { DocumentDetailsDrawer, ExtendedDocumentRecord } from '../components/documents/DocumentDetailsDrawer';
import { DatasetImportModal } from '../components/documents/DatasetImportModal';
import { ConnectSourceModal } from '../components/documents/ConnectSourceModal';
import { PageContainer, PageHeader, PageContent } from '../components/layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { TableRow, TableCell } from '../components/ui/table';

interface DocumentsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({
  workspace,
  onAddToast,
}) => {
  // Initial Mock Document Records matching user prompt requirements
  const initialDocs: ExtendedDocumentRecord[] = [
    {
      id: 'doc-1',
      name: `${workspace.name.toLowerCase()}_FY2026_financial_audit.pdf`,
      type: 'PDF',
      size: '4.8 MB',
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: 'sha256:7f9a2b1c4e7d3a5b6c8d9e0f1a2b3c4d5e6f7a8b',
      uploadedAt: '2 hours ago',
      source: 'Direct Upload',
      isDataset: false,
      summary: `Parsed and indexed from ${workspace.name} FY2026 audit file. Parsed 128 paragraphs, 14 table rows, and verified SAML 2.0 governance compliance.`,
      extractedEntities: [`${workspace.name} Scope`, 'KPMG Compliance', 'Q3 Variance', 'SAML 2.0'],
      extractedFields: [
        { key: 'Classification', value: `${workspace.domain} Audit Manifest` },
        { key: 'Auditing Body', value: 'Executive Compliance Audit' },
        { key: 'Gross Variance', value: '+4.2% Net Positive' },
      ],
    },
    {
      id: 'doc-2',
      name: `${workspace.name.toLowerCase()}_operational_ledger_v3.csv`,
      type: 'CSV',
      size: '14.2 MB',
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: 'sha256:9c4d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
      uploadedAt: '5 hours ago',
      source: 'S3 Bucket',
      isDataset: true,
      datasetRows: 42800,
      datasetCols: 18,
      dateRange: '2010 – 2026',
      dataQualityScore: 99.4,
      missingValuesPct: 0.2,
      summary: `Tabular dataset containing 42,800 operational transaction logs across ${workspace.name} domain boundary. 100% queryable for analytics reasoning.`,
      extractedEntities: ['Transaction Ledger', 'Vendor Operations', '$42.5k Requisition'],
    },
    {
      id: 'doc-3',
      name: `${workspace.name.toLowerCase()}_governance_policy.docx`,
      type: 'DOCX',
      size: '1.2 MB',
      status: 'Ready',
      evidenceGrade: 'Grade A',
      evidenceHash: 'sha256:3a1b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
      uploadedAt: '1 day ago',
      source: 'Direct Upload',
      isDataset: false,
      summary: `Domain governance policy specification defining RBAC permission tiers and automated action approval criteria in ${workspace.name}.`,
    },
    {
      id: 'doc-4',
      name: `quarterly_metric_analysis.xlsx`,
      type: 'XLSX',
      size: '8.4 MB',
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: 'sha256:5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a',
      uploadedAt: '2 days ago',
      source: 'S3 Bucket',
      isDataset: true,
      datasetRows: 12500,
      datasetCols: 12,
      dateRange: '2024 – 2026',
      dataQualityScore: 98.8,
      missingValuesPct: 0.4,
    },
    {
      id: 'doc-5',
      name: `compliance_checklist_2026.txt`,
      type: 'TXT',
      size: '240 KB',
      status: 'Ready',
      evidenceGrade: 'Grade B',
      evidenceHash: 'sha256:2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      uploadedAt: '3 days ago',
      source: 'API Sync',
      isDataset: false,
    },
  ];

  const [docs, setDocs] = useState<ExtendedDocumentRecord[]>(initialDocs);
  const [selectedDoc, setSelectedDoc] = useState<ExtendedDocumentRecord | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Modals state
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isConnectSourceModalOpen, setIsConnectSourceModalOpen] = useState(false);

  // Upload Pipeline Animation State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<'Uploading' | 'Processing' | 'Classifying' | 'Extracting' | 'Indexing' | 'Ready'>('Uploading');
  const [activeFileName, setActiveFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger File Input Click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Simulate Ingestion Pipeline Stages: Uploading -> Processing -> Classifying -> Extracting -> Indexing -> Ready
  const processFileUpload = (fileName: string, fileSize: string, fileType: ExtendedDocumentRecord['type']) => {
    setActiveFileName(fileName);
    setIsUploading(true);
    setUploadStage('Uploading');

    const stages: ('Uploading' | 'Processing' | 'Classifying' | 'Extracting' | 'Indexing' | 'Ready')[] = [
      'Uploading',
      'Processing',
      'Classifying',
      'Extracting',
      'Indexing',
      'Ready',
    ];

    let currentStageIndex = 0;
    const interval = setInterval(() => {
      currentStageIndex += 1;
      if (currentStageIndex < stages.length) {
        setUploadStage(stages[currentStageIndex]);
      } else {
        clearInterval(interval);
        setIsUploading(false);

        // Add newly ingested document
        const isDs = fileType === 'CSV' || fileType === 'XLSX';
        const newDoc: ExtendedDocumentRecord = {
          id: `doc-${Date.now()}`,
          name: fileName,
          type: fileType,
          size: fileSize,
          status: 'Ready',
          evidenceGrade: 'Grade A+',
          evidenceHash: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          uploadedAt: 'Just now',
          source: 'Direct Upload',
          isDataset: isDs,
          datasetRows: isDs ? 18400 : undefined,
          datasetCols: isDs ? 14 : undefined,
          dateRange: isDs ? '2024 – 2026' : undefined,
          dataQualityScore: isDs ? 99.6 : undefined,
          missingValuesPct: isDs ? 0.1 : undefined,
        };

        setDocs((prev) => [newDoc, ...prev]);
        onAddToast(`Ingested and indexed ${fileName} in ${workspace.name}`);
      }
    }, 400); // 400ms per pipeline stage
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      const fileType: ExtendedDocumentRecord['type'] = ext === 'CSV' ? 'CSV' : ext === 'XLSX' ? 'XLSX' : ext === 'DOCX' ? 'DOCX' : ext === 'TXT' ? 'TXT' : 'PDF';
      const sizeMb = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      processFileUpload(file.name, sizeMb, fileType);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      const fileType: ExtendedDocumentRecord['type'] = ext === 'CSV' ? 'CSV' : ext === 'XLSX' ? 'XLSX' : ext === 'DOCX' ? 'DOCX' : ext === 'TXT' ? 'TXT' : 'PDF';
      const sizeMb = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      processFileUpload(file.name, sizeMb, fileType);
    }
  };

  // Handle Dataset Import Modal Submission
  const handleImportDatasetSubmit = (name: string, format: string, rows: number, cols: number) => {
    const newDsDoc: ExtendedDocumentRecord = {
      id: `doc-${Date.now()}`,
      name: name,
      type: format === 'XLSX' ? 'XLSX' : 'CSV',
      size: `${(rows * 0.0003).toFixed(1)} MB`,
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      uploadedAt: 'Just now',
      source: 'Direct Upload',
      isDataset: true,
      datasetRows: rows,
      datasetCols: cols,
      dateRange: '2020 – 2026',
      dataQualityScore: 99.8,
      missingValuesPct: 0.1,
    };

    setDocs((prev) => [newDsDoc, ...prev]);
    onAddToast(`Imported dataset ${name} (${rows.toLocaleString()} rows)`);
  };

  // Handle External Source Connection
  const handleConnectSourceSubmit = (sourceName: string) => {
    const syncedDoc: ExtendedDocumentRecord = {
      id: `doc-${Date.now()}`,
      name: `${workspace.name.toLowerCase()}_${sourceName.toLowerCase().replace(/[^a-z]/g, '_')}_sync.csv`,
      type: 'CSV',
      size: '28.4 MB',
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      uploadedAt: 'Just now',
      source: sourceName.includes('S3') ? 'S3 Bucket' : 'API Sync',
      isDataset: true,
      datasetRows: 86000,
      datasetCols: 24,
      dateRange: '2010 – 2026',
      dataQualityScore: 99.9,
      missingValuesPct: 0.0,
    };

    setDocs((prev) => [syncedDoc, ...prev]);
    onAddToast(`Connected ${sourceName} to ${workspace.name}`);
  };

  // Filtered document records
  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === 'All' || d.type === formatFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || d.source === sourceFilter;
    const matchesGrade = gradeFilter === 'All' || d.evidenceGrade === gradeFilter;

    return matchesSearch && matchesFormat && matchesStatus && matchesSource && matchesGrade;
  });

  return (
    <PageContainer>
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Documents & Workspace Data"
        description={`Manage the information, unstructured documents, and operational datasets that power ${workspace.name}.`}
        breadcrumb={`SYNAPTIX COMMAND / ${workspace.name.toUpperCase()} / DOCUMENTS & DATA`}
        badge={
          <Badge variant="blue">
            <ShieldCheck size={13} style={{ marginRight: '4px' }} />
            {workspace.name} Boundary
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="blue"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={handleUploadClick}
            >
              Upload
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<TableIcon size={14} />}
              onClick={() => setIsDatasetModalOpen(true)}
            >
              Import Dataset
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Cloud size={14} />}
              onClick={() => setIsConnectSourceModalOpen(true)}
            >
              Connect Source
            </Button>
          </div>
        }
      />

      <PageContent>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg"
        />

        {/* 2. UPLOAD EXPERIENCE DRAG & DROP ZONE */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          onClick={handleUploadClick}
          className={`doc-upload-zone ${isDragging ? 'dragging' : ''}`}
          aria-label="Drag and Drop Upload Area"
        >
          <div className="flex flex-col items-center text-center max-w-lg">
            <div className="w-12 h-12 rounded-full bg-[var(--c-blue-soft)] text-[var(--c-blue)] flex items-center justify-center mb-3 shadow-xs">
              <Upload size={22} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--c-text-1)] mb-1">
              Drag and drop files here, or <span className="text-[var(--c-blue)] hover:underline font-bold">browse your computer</span>
            </h3>
            <p className="text-xs text-[var(--c-text-2)] leading-relaxed">
              Supported formats: <strong className="text-[var(--c-text-1)] font-semibold">PDF, DOCX, XLSX, CSV, TXT, PNG, JPG</strong> • Up to 500 MB per file
            </p>
          </div>

          {/* Live Upload Progress Pipeline Bar */}
          {isUploading && (
            <div
              className="mt-6 w-full max-w-xl bg-[var(--c-page)] border border-[var(--c-border)] rounded-lg p-4 animate-fade-in text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-[var(--c-text-1)] truncate max-w-[280px]">
                  {activeFileName}
                </span>
                <span className="text-[var(--c-blue)] font-semibold">Stage: {uploadStage}...</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['Uploading', 'Processing', 'Classifying', 'Extracting', 'Indexing', 'Ready'] as const).map((stg) => {
                  const stagesList = ['Uploading', 'Processing', 'Classifying', 'Extracting', 'Indexing', 'Ready'];
                  const stgIdx = stagesList.indexOf(stg);
                  const activeIdx = stagesList.indexOf(uploadStage);
                  const isPassed = stgIdx < activeIdx;
                  const isCurrent = stgIdx === activeIdx;

                  return (
                    <div
                      key={stg}
                      className={`flex flex-col items-center gap-1.5 text-center text-[10px] font-medium transition-colors ${
                        isPassed
                          ? 'text-[var(--c-success)]'
                          : isCurrent
                          ? 'text-[var(--c-blue)]'
                          : 'text-[var(--c-text-3)]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-semibold ${
                          isPassed
                            ? 'bg-[var(--c-success-bg)] border-[var(--c-success-border)] text-[var(--c-success)]'
                            : isCurrent
                            ? 'bg-[var(--c-blue-soft)] border-[var(--c-blue)] text-[var(--c-blue)]'
                            : 'bg-[var(--c-surface)] border-[var(--c-border)] text-[var(--c-text-3)]'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 size={12} />
                        ) : isCurrent ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <span>{stgIdx + 1}</span>
                        )}
                      </div>
                      <span className="truncate w-full">{stg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. SEARCH & FILTER TOOLBAR */}
        <div className="doc-toolbar-card">
          <div className="doc-search-wrapper">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents & datasets by name or content..."
              leftIcon={<Search size={15} />}
              className="h-10 text-xs w-full"
            />
          </div>

          <div className="doc-filter-group">
            <div className="doc-filter-select-wrapper">
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="doc-filter-select"
              >
                <option value="All">All Formats</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="XLSX">XLSX</option>
                <option value="CSV">CSV</option>
                <option value="TXT">TXT</option>
              </select>
              <ChevronDown size={14} className="doc-filter-chevron" />
            </div>

            <div className="doc-filter-select-wrapper">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="doc-filter-select"
              >
                <option value="All">All Statuses</option>
                <option value="Ready">Ready</option>
                <option value="Processing">Processing</option>
                <option value="Indexing">Indexing</option>
              </select>
              <ChevronDown size={14} className="doc-filter-chevron" />
            </div>

            <div className="doc-filter-select-wrapper">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="doc-filter-select"
              >
                <option value="All">All Sources</option>
                <option value="Direct Upload">Direct Upload</option>
                <option value="S3 Bucket">S3 Bucket</option>
                <option value="API Sync">API Sync</option>
              </select>
              <ChevronDown size={14} className="doc-filter-chevron" />
            </div>

            <div className="doc-filter-select-wrapper">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="doc-filter-select"
              >
                <option value="All">All Evidence Grades</option>
                <option value="Grade A+">Grade A+ (Verified)</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
              </select>
              <ChevronDown size={14} className="doc-filter-chevron" />
            </div>
          </div>
        </div>

        {/* 4. WORKSPACE DATA MANIFEST TABLE */}
        <div className="doc-manifest-card">
          <div className="doc-manifest-header">
            <div>
              <h3 className="doc-manifest-title">
                Workspace Data Manifest ({filteredDocs.length})
              </h3>
              <p className="doc-manifest-subtitle">
                Cryptographically verified knowledge index
              </p>
            </div>
          </div>

          <div className="doc-table-container">
            <table className="doc-manifest-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '260px' }}>Name</th>
                  <th style={{ width: '90px' }}>Type</th>
                  <th style={{ width: '90px' }}>Size</th>
                  <th style={{ width: '110px' }}>Uploaded</th>
                  <th style={{ width: '110px' }}>Status</th>
                  <th style={{ width: '140px' }}>Evidence Grade</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {filteredDocs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-xs text-[var(--c-text-3)]">
                        No documents match the active search and filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocs.map((doc) => (
                      <TableRow
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className="cursor-pointer hover:bg-[var(--c-page)] transition-colors border-b border-[var(--c-border)] group"
                      >
                        {/* Name */}
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              doc.isDataset
                                ? 'bg-[var(--c-blue-soft)] text-[var(--c-blue)]'
                                : 'bg-[var(--c-surface-2)] text-[var(--c-text-2)]'
                            }`}>
                              {doc.isDataset ? <TableIcon size={16} /> : <FileText size={16} />}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-[var(--c-text-1)] group-hover:text-[var(--c-blue)] transition-colors truncate max-w-[280px]" title={doc.name}>
                                  {doc.name}
                                </span>
                                {doc.isDataset && (
                                  <Badge variant="blue" size="sm" className="shrink-0 text-[10px]">
                                    Dataset
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--c-surface-2)] text-[var(--c-text-2)] border border-[var(--c-border)]">
                            {doc.type}
                          </span>
                        </TableCell>

                        {/* Size */}
                        <TableCell className="py-3.5 px-4 text-xs font-mono text-[var(--c-text-2)]">
                          {doc.size}
                        </TableCell>

                        {/* Uploaded */}
                        <TableCell className="py-3.5 px-4 text-xs text-[var(--c-text-3)] whitespace-nowrap">
                          {doc.uploadedAt}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5 px-4">
                          <Badge variant="success" size="sm" className="gap-1 font-medium whitespace-nowrap">
                            <CheckCircle2 size={11} /> {doc.status}
                          </Badge>
                        </TableCell>

                        {/* Evidence Grade */}
                        <TableCell className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--c-success-bg)] text-[var(--c-success)] border border-[var(--c-success-border)] whitespace-nowrap">
                            <ShieldCheck size={13} />
                            <span>{doc.evidenceGrade}</span>
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedDoc(doc)}
                              className="h-8 px-2 text-xs font-semibold text-[var(--c-blue)] hover:bg-[var(--c-blue-soft)]"
                              title="Inspect document details"
                            >
                              <span>Inspect</span>
                              <ChevronRight size={13} className="ml-0.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onAddToast(`Downloaded ${doc.name}`)}
                              className="h-8 w-8 p-0 text-[var(--c-text-2)] hover:text-[var(--c-text-1)]"
                              title="Download file"
                            >
                              <Download size={14} />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDocs(docs.filter((d) => d.id !== doc.id));
                                onAddToast(`Removed ${doc.name}`);
                              }}
                              className="h-8 w-8 p-0 text-[var(--c-text-3)] hover:text-[var(--c-danger)] hover:bg-[var(--c-danger-bg)]"
                              title="Delete file"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        </div>

      {/* 4. DOCUMENT DETAILS DRAWER */}
      <DocumentDetailsDrawer
        workspace={workspace}
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={(id) => setDocs(docs.filter((d) => d.id !== id))}
        onAddToast={onAddToast}
      />

      {/* Modals */}
      <DatasetImportModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        workspace={workspace}
        onImportDataset={handleImportDatasetSubmit}
      />

      <ConnectSourceModal
        isOpen={isConnectSourceModalOpen}
        onClose={() => setIsConnectSourceModalOpen(false)}
        workspace={workspace}
        onConnectSource={handleConnectSourceSubmit}
      />
      </PageContent>
    </PageContainer>
  );
};
