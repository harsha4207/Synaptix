import React from 'react';
import {
  Database,
  FileText,
  FileSpreadsheet,
  FileCode,
  HardDrive,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { KnowledgeSourceSummary, ProcessedDocumentSummary } from './types';

interface KnowledgeOverviewProps {
  sources: KnowledgeSourceSummary[];
  recentDocuments: ProcessedDocumentSummary[];
  totalDocCount: number;
  totalDatasetCount: number;
  onNavigateToDocuments?: () => void;
  onInspectDocument?: (docId: string) => void;
}

export const KnowledgeOverview: React.FC<KnowledgeOverviewProps> = ({
  sources,
  recentDocuments,
  totalDocCount,
  totalDatasetCount,
  onNavigateToDocuments,
  onInspectDocument,
}) => {
  return (
    <section
      className="dash-card-static dash-stagger-4"
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
      aria-label="Knowledge and Ingestion Overview"
    >
      {/* SECTION HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Database size={16} style={{ color: '#1769E0' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Organizational Knowledge & Ingestion Status
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Active documents, tabular datasets, vector chunk embeddings, and cryptographic hashes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#EFF6FF',
              color: '#1E40AF',
              fontWeight: 600,
            }}
          >
            {totalDocCount} Ingested Docs • {totalDatasetCount} Datasets
          </span>

          {onNavigateToDocuments && (
            <button
              type="button"
              onClick={onNavigateToDocuments}
              className="dash-btn-ghost"
              style={{ fontSize: '11px', height: '30px' }}
            >
              <span>View Data Ingestion</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* TOP ROW: FORMAT DISTRIBUTION CHIPS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        {sources.map((src) => (
          <div
            key={src.format}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: src.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {src.format.includes('PDF') ? (
                <FileText size={15} />
              ) : src.format.includes('XLS') || src.format.includes('CSV') ? (
                <FileSpreadsheet size={15} />
              ) : (
                <FileCode size={15} />
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                {src.format}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                {src.count} files <span style={{ fontSize: '11px', fontWeight: 400, color: '#94A3B8' }}>({src.storageMb} MB)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENTLY PROCESSED DOCUMENTS TABLE */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
            Recently Processed & Grounded Documents
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Vector memory partition healthy
          </span>
        </div>

        <div
          style={{
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#FFFFFF',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px' }}>
                  Document Name
                </th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px' }}>
                  Format / Size
                </th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px' }}>
                  Chunks Index
                </th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px' }}>
                  SHA-256 Content Hash
                </th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px', textAlign: 'right' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    transition: 'background 120ms ease',
                  }}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} style={{ color: '#1769E0', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '12px' }}>
                        {doc.filename}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#64748B', fontSize: '11px' }}>
                    {doc.fileType} • {doc.sizeFormatted}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '11px', color: '#0F172A' }}>
                    {doc.chunkCount} vector chunks
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <code
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#475569',
                        background: '#F1F5F9',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      {doc.contentHash.substring(0, 16)}...
                    </code>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: doc.status === 'READY' ? '#DCFCE7' : '#FEF3C7',
                        color: doc.status === 'READY' ? '#166534' : '#92400E',
                      }}
                    >
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

