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
  AlertCircle,
  Database,
  Layers,
  Sparkles,
  Sliders,
  Check,
  X,
  RefreshCw,
  Eye,
  Filter,
  ArrowRight,
  Info,
  ChevronRight
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { DocumentDetailsDrawer, ExtendedDocumentRecord } from '../components/documents/DocumentDetailsDrawer';
import { DatasetImportModal } from '../components/documents/DatasetImportModal';
import { ConnectSourceModal } from '../components/documents/ConnectSourceModal';
import { RagMemoryInspector } from '../components/documents/RagMemoryInspector';
import { useRag } from '../lib/rag/RagContext';

interface UploadsDataModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export type UploadsTab = 'all' | 'structured' | 'documents';

export const UploadsDataModule: React.FC<UploadsDataModuleProps> = ({
  workspace,
  onAddToast,
}) => {
  const { state: ragState, uploadFile, deleteDocument: deleteRagDoc } = useRag();

  const [activeTab, setActiveTab] = useState<UploadsTab>('all');
  const [selectedDoc, setSelectedDoc] = useState<ExtendedDocumentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');

  // Modals state
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isConnectSourceModalOpen, setIsConnectSourceModalOpen] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
  const [cleaningTargetDoc, setCleaningTargetDoc] = useState<ExtendedDocumentRecord | null>(null);
  const [cleaningApproved, setCleaningApproved] = useState<Record<string, boolean>>({});

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format bytes
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // Initial custom demo structured datasets tailored to workspace
  const [customDocs, setCustomDocs] = useState<ExtendedDocumentRecord[]>([
    {
      id: 'ds-struct-1',
      name: `${workspace.name.toLowerCase()}_operational_ledger_2026.csv`,
      type: 'CSV',
      size: '4.8 MB',
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: 'sha256-8a9f42b10e99a1103f42b98e11',
      uploadedAt: '10m ago',
      source: 'Direct Upload',
      isDataset: true,
      datasetRows: 14200,
      datasetCols: 18,
      dateRange: '2020 – 2026',
      dataQualityScore: 98.4,
      missingValuesPct: 0.2,
      summary: `Primary operational ledger containing 14,200 transactions, cost-center categorizations, and budget ceiling mappings.`,
      extractedEntities: ['Cost Centers', 'Tax IDs', 'Vendor Codes', 'Ledger IDs'],
    },
    {
      id: 'ds-struct-2',
      name: `q3_regional_variance_forecast.xlsx`,
      type: 'XLSX',
      size: '2.1 MB',
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: 'sha256-7b3c22f98a12c45543d1a08991',
      uploadedAt: '1h ago',
      source: 'API Sync',
      isDataset: true,
      datasetRows: 5800,
      datasetCols: 12,
      dateRange: '2022 – 2026',
      dataQualityScore: 99.1,
      missingValuesPct: 0.0,
      summary: `Quarterly forecasting model tracking baseline vs actual margin variance across EMEA and APAC branches.`,
      extractedEntities: ['EMEA Distribution Hub', 'APAC Branch', 'Margin Deficit'],
    },
  ]);

  // Convert real RAG documents to table manifest records
  const ragDocRecords: ExtendedDocumentRecord[] = ragState.documents.map((d) => {
    const isDs = d.fileType === 'CSV' || d.fileType === 'XLSX';
    return {
      id: d.id,
      name: d.filename,
      type: (d.fileType === 'JPG' || d.fileType === 'JPEG' || d.fileType === 'PNG' ? 'Image' : d.fileType) as ExtendedDocumentRecord['type'],
      size: formatBytes(d.sizeBytes),
      status: d.status === 'READY' ? 'Ready' : d.status === 'FAILED' ? 'Failed' : 'Indexing',
      evidenceGrade: 'Grade A+',
      evidenceHash: d.contentHash ? `sha256:${d.contentHash.substring(0, 32)}` : 'sha256:pending_index',
      uploadedAt: new Date(d.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: d.source || 'Direct Upload',
      isDataset: isDs,
      summary: d.metadata?.summary || `Indexed document with ${d.chunkCount} vector chunks in ${workspace.name}.`,
      rawContent: d.metadata?.rawText,
      datasetRows: d.metadata?.rowCount,
      datasetCols: d.metadata?.columnNames?.length,
      extractedEntities: d.metadata?.entities,
      chunks: [],
    };
  });

  const allDocs = [...ragDocRecords, ...customDocs];

  // Tab Filtering
  const displayedDocs = allDocs.filter((d) => {
    if (activeTab === 'structured') {
      if (!d.isDataset && d.type !== 'CSV' && d.type !== 'XLSX') return false;
    } else if (activeTab === 'documents') {
      if (d.isDataset || d.type === 'CSV' || d.type === 'XLSX') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!d.name.toLowerCase().includes(q) && !d.type.toLowerCase().includes(q)) return false;
    }
    if (formatFilter !== 'All' && d.type !== formatFilter) return false;
    return true;
  });

  // Upload handler
  const handleFileUpload = async (file: File) => {
    try {
      onAddToast(`Ingesting ${file.name} to ${workspace.name}...`);
      const isStructured = file.name.endsWith('.csv') || file.name.endsWith('.xlsx');
      const docId = await uploadFile(file);
      if (docId) {
        onAddToast(`✓ ${isStructured ? 'Structured dataset profiled & indexed' : 'Document understood & indexed'}: ${file.name}`);
      } else {
        onAddToast(`Upload failed for ${file.name}`);
      }
    } catch (err: any) {
      onAddToast(`Error: ${err.message}`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const handleImportDatasetSubmit = (name: string, format: string, rows: number, cols: number) => {
    const newDoc: ExtendedDocumentRecord = {
      id: `ds-${Date.now()}`,
      name,
      type: format === 'XLSX' ? 'XLSX' : 'CSV',
      size: `${(rows * 0.0003).toFixed(1)} MB`,
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: `sha256-${Math.random().toString(16).substring(2, 12)}`,
      uploadedAt: 'Just now',
      source: 'Direct Upload',
      isDataset: true,
      datasetRows: rows,
      datasetCols: cols,
      dateRange: '2024 – 2026',
      dataQualityScore: 98.8,
      missingValuesPct: 0.1,
      summary: `Imported structured dataset with ${rows.toLocaleString()} rows and ${cols} columns.`,
      extractedEntities: ['Transaction ID', 'Cost Unit', 'Ledger Amount'],
    };
    setCustomDocs((prev) => [newDoc, ...prev]);
    onAddToast(`Imported ${name} (${rows.toLocaleString()} rows)`);
  };

  const handleConnectSourceSubmit = (sourceName: string) => {
    const newDoc: ExtendedDocumentRecord = {
      id: `ds-${Date.now()}`,
      name: `${workspace.name.toLowerCase()}_${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sync.csv`,
      type: 'CSV',
      size: '18.4 MB',
      status: 'Ready',
      evidenceGrade: 'Grade A+',
      evidenceHash: `sha256-${Math.random().toString(16).substring(2, 12)}`,
      uploadedAt: 'Just now',
      source: 'API Sync',
      isDataset: true,
      datasetRows: 42000,
      datasetCols: 20,
      dateRange: '2020 – 2026',
      dataQualityScore: 99.4,
      missingValuesPct: 0.0,
      summary: `Synchronized enterprise schema from ${sourceName} into destination table synaptix_${workspace.name.toLowerCase()}_sync.`,
      extractedEntities: ['Account Number', 'Escrow Code', 'Transaction Volume'],
    };
    setCustomDocs((prev) => [newDoc, ...prev]);
    onAddToast(`Connected and synced ${sourceName}`);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. HEADER ROW */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Uploads & Data
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#1769E0',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              {allDocs.length} Sources Connected
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
            Unified data intelligence workspace for structured datasets, enterprise documents, and database connections.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: '#1769E0',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(23, 105, 224, 0.2)',
            }}
          >
            <Upload size={14} />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDatasetModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <TableIcon size={14} style={{ color: '#0D9488' }} />
            <span>Import Dataset</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConnectSourceModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Cloud size={14} style={{ color: '#2563EB' }} />
            <span>Connect Source</span>
          </button>
        </div>
      </div>

      {/* 2. THREE PRIMARY TABS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: activeTab === 'all' ? 600 : 500,
            color: activeTab === 'all' ? '#1769E0' : '#64748B',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '2px solid #1769E0' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Layers size={15} />
          <span>All Sources ({allDocs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('structured')}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: activeTab === 'structured' ? 600 : 500,
            color: activeTab === 'structured' ? '#1769E0' : '#64748B',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'structured' ? '2px solid #1769E0' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <TableIcon size={15} />
          <span>Structured Data ({allDocs.filter((d) => d.isDataset || d.type === 'CSV' || d.type === 'XLSX').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: activeTab === 'documents' ? 600 : 500,
            color: activeTab === 'documents' ? '#1769E0' : '#64748B',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'documents' ? '2px solid #1769E0' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileText size={15} />
          <span>Documents ({allDocs.filter((d) => !d.isDataset && d.type !== 'CSV' && d.type !== 'XLSX').length})</span>
        </button>
      </div>

      {/* 3. PIPELINE STATUS BANNER (Structured Data vs Document Ingestion) */}
      {activeTab === 'structured' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} style={{ color: '#0D9488' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Structured Data Pipeline</span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>SQL Query Engine • Data Quality Guard Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#475569', flexWrap: 'wrap' }}>
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>1. Validation</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>2. Schema Detection</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>3. Data Profiling</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>4. Quality Analysis</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>5. Cleaning Preview</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>6. Database Storage</span>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} style={{ color: '#2563EB' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Unstructured Document Understanding</span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>RAG Vector Indexing • Citation Extraction</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#475569', flexWrap: 'wrap' }}>
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>1. Classification</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>2. Text Extraction</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>3. Key Points & Summary</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>4. Semantic Chunking</span>
            <ArrowRight size={11} style={{ color: '#94A3B8' }} />
            <span style={{ background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>5. Knowledge Vector Storage</span>
          </div>
        </div>
      )}

      {/* 4. SEARCH & FILTER CONTROLS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources by name or format..."
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '12px',
              color: '#334155',
            }}
          >
            <option value="All">All Formats</option>
            <option value="CSV">CSV</option>
            <option value="XLSX">Excel (XLSX)</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">Word (DOCX)</option>
            <option value="TXT">Text (TXT)</option>
          </select>
        </div>
      </div>

      {/* 5. DATA SOURCES TABLE */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          overflowX: 'auto',
          boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
        }}
      >
        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 16px' }}>Source Name</th>
              <th style={{ padding: '10px 12px' }}>Type</th>
              <th style={{ padding: '10px 12px' }}>Size / Scale</th>
              <th style={{ padding: '10px 12px' }}>Pipeline Status</th>
              <th style={{ padding: '10px 12px' }}>Quality / Grade</th>
              <th style={{ padding: '10px 12px' }}>Uploaded</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedDocs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  No data sources found matching your criteria.
                </td>
              </tr>
            ) : (
              displayedDocs.map((doc) => {
                const isDataset = doc.isDataset || doc.type === 'CSV' || doc.type === 'XLSX';
                const isCleaned = cleaningApproved[doc.id];

                return (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 100ms',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: isDataset ? '#F0FDFA' : '#EFF6FF',
                            color: isDataset ? '#0D9488' : '#1769E0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isDataset ? <TableIcon size={14} /> : <FileText size={14} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {doc.source} {isCleaned && <span style={{ color: '#059669', fontWeight: 600 }}>• Cleaned & Verified</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#F1F5F9',
                          color: '#475569',
                        }}
                      >
                        {doc.type}
                      </span>
                    </td>

                    <td style={{ padding: '12px 12px', color: '#475569', fontSize: '12px' }}>
                      {isDataset && doc.datasetRows ? (
                        <span>{doc.datasetRows.toLocaleString()} rows • {doc.datasetCols || 12} cols</span>
                      ) : (
                        <span>{doc.size}</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: doc.status === 'Ready' ? '#059669' : '#D97706',
                          background: doc.status === 'Ready' ? '#ECFDF5' : '#FEF3C7',
                          padding: '2px 7px',
                          borderRadius: '999px',
                        }}
                      >
                        <CheckCircle2 size={11} />
                        {doc.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      {isDataset && doc.dataQualityScore ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>
                            {doc.dataQualityScore}%
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>Quality</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#1769E0', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                          {doc.evidenceGrade}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 12px', color: '#64748B', fontSize: '12px' }}>
                      {doc.uploadedAt}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {isDataset && (
                          <button
                            type="button"
                            onClick={() => {
                              setCleaningTargetDoc(doc);
                              setIsCleaningModalOpen(true);
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0',
                              background: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 500,
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                            title="Inspect quality and cleaning suggestions"
                          >
                            Clean
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#1769E0',
                            cursor: 'pointer',
                          }}
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (doc.id.startsWith('ds-')) {
                              setCustomDocs((prev) => prev.filter((d) => d.id !== doc.id));
                            } else {
                              deleteRagDoc(doc.id);
                            }
                            onAddToast(`Removed ${doc.name}`);
                          }}
                          style={{
                            padding: '4px 6px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                          }}
                          title="Delete source"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 6. DATA DETAILS DRAWER (Includes dataset details, document details & Advanced RAG Inspector) */}
      <DocumentDetailsDrawer
        workspace={workspace}
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={(id) => {
          if (id.startsWith('ds-')) {
            setCustomDocs((prev) => prev.filter((d) => d.id !== id));
          } else {
            deleteRagDoc(id);
          }
          setSelectedDoc(null);
          onAddToast('Document removed');
        }}
        onAddToast={onAddToast}
      />

      {/* 7. DATASET IMPORT MODAL */}
      <DatasetImportModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onImportDataset={handleImportDatasetSubmit}
      />

      {/* 8. CONNECT SOURCE MODAL */}
      <ConnectSourceModal
        isOpen={isConnectSourceModalOpen}
        onClose={() => setIsConnectSourceModalOpen(false)}
        onConnectSource={handleConnectSourceSubmit}
      />

      {/* 9. DATA CLEANING & QUALITY INSPECTION MODAL */}
      {isCleaningModalOpen && cleaningTargetDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 31, 58, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '780px',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(11, 31, 58, 0.16)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} style={{ color: '#0D9488' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Structured Data Quality & Cleaning: {cleaningTargetDoc.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCleaningModalOpen(false)}
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F1F5F9', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Quality Score Banner */}
              <div style={{ display: 'flex', gap: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>OVERALL DATA HEALTH</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>{cleaningTargetDoc.dataQualityScore || 98.4}%</div>
                  <div style={{ fontSize: '11px', color: '#059669' }}>High Statistical Reliability</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ROWS & COLUMNS</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                    {cleaningTargetDoc.datasetRows?.toLocaleString()} rows × {cleaningTargetDoc.datasetCols || 18} cols
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Schema: Validated</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>MISSING VALUES</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#D97706', marginTop: '4px' }}>
                    {cleaningTargetDoc.missingValuesPct || 0.2}% (28 cells)
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Deduplicated: 3 items</div>
                </div>
              </div>

              {/* Proposed Operations List */}
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                Proposed Automated Cleaning Operations
              </h4>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
                Original data file will remain immutable. Cleaned records will be validated and staged into the destination database table.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Impute Missing Numeric Values with Median</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>28 unallocated cells in ledger lines 410-438 will use branch group medians.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Standardize Date Formatting to ISO-8601</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Converts mixed MM/DD/YYYY and YYYY-MM-DD date columns into normalized UTC strings.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Strip Trailing Whitespace & Special Control Characters</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Sanitizes vendor strings and requisition descriptions.</div>
                  </div>
                </div>
              </div>

              {/* Destination Storage Confirmation */}
              <div style={{ padding: '10px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '11px', color: '#1E40AF' }}>
                <strong>Destination Database Target:</strong> `postgres_synaptix.{workspace.name.toLowerCase()}_operational_ledger_v2` (Row-Level Security active).
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Traceability log preserved for audit</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCleaningModalOpen(false)}
                  style={{ padding: '7px 14px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCleaningApproved((prev) => ({ ...prev, [cleaningTargetDoc.id]: true }));
                    setIsCleaningModalOpen(false);
                    onAddToast(`✓ Cleaned & verified dataset: ${cleaningTargetDoc.name}`);
                  }}
                  style={{ padding: '7px 16px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Approve & Stage to Database
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadsDataModule;
