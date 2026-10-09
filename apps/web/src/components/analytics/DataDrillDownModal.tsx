import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Search
} from 'lucide-react';
import { InsightItem } from './InsightPanel';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

interface DrillDownDataRow {
  id: string;
  timestamp: string;
  entity: string;
  category: string;
  value: number;
  anomalyScore: number;
  status: string;
  evidenceHash: string;
}

interface DataDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight?: InsightItem | null;
  targetSubject?: string;
  onAddToast: (msg: string) => void;
}

export const DataDrillDownModal: React.FC<DataDrillDownModalProps> = ({
  isOpen,
  onClose,
  insight,
  targetSubject = 'Selected Ledger Rows',
  onAddToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const mockRows: DrillDownDataRow[] = [
    {
      id: 'REC-2019-0941',
      timestamp: '2019-04-12 14:22:10',
      entity: 'EMEA Enterprise Distribution',
      category: 'COGS Surcharge',
      value: 1420000,
      anomalyScore: 0.94,
      status: 'Flagged Shift',
      evidenceHash: '0x8a9f42b10e...',
    },
    {
      id: 'REC-2019-1182',
      timestamp: '2019-08-19 09:15:44',
      entity: 'APAC Logistics Network',
      category: 'Freight Delay Penalty',
      value: 890000,
      anomalyScore: 0.88,
      status: 'Flagged Shift',
      evidenceHash: '0x7b3c22f98a...',
    },
    {
      id: 'REC-2020-0312',
      timestamp: '2020-02-04 11:00:19',
      entity: 'North America Supply Hub',
      category: 'Tariff Escalation',
      value: 2350000,
      anomalyScore: 0.96,
      status: 'Critical Anomaly',
      evidenceHash: '0x99a1104e7c...',
    },
    {
      id: 'REC-2020-0874',
      timestamp: '2020-11-28 16:45:33',
      entity: 'Global Procurement Direct',
      category: 'Raw Material Premium',
      value: 1780000,
      anomalyScore: 0.91,
      status: 'Flagged Shift',
      evidenceHash: '0x44d1288f33...',
    },
    {
      id: 'REC-2021-0105',
      timestamp: '2021-03-15 10:30:00',
      entity: 'Compliance & Customs',
      category: 'Audit Surcharge',
      value: 620000,
      anomalyScore: 0.76,
      status: 'Standard Record',
      evidenceHash: '0x12c45589bb...',
    },
    {
      id: 'REC-2024-0419',
      timestamp: '2024-05-20 13:10:45',
      entity: 'Automated Operations',
      category: 'Efficiency Gain Offset',
      value: -1250000,
      anomalyScore: 0.22,
      status: 'Verified Normal',
      evidenceHash: '0x33e98124aa...',
    },
  ];

  const filteredRows = mockRows.filter((r) => {
    return (
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExportCSV = () => {
    onAddToast(`Exported ${filteredRows.length} underlying rows to CSV (G1 Verified)`);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="940px">
      <DialogHeader
        title={insight ? insight.title : `Data Drill-Down: ${targetSubject}`}
        description="Inspect raw transactional records & evidence hashes behind this analytical finding"
        onClose={onClose}
      />

      {insight && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            borderBottom: '1px solid #BFDBFE',
            padding: 'var(--sp-3) var(--sp-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
            color: 'var(--c-text-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <span>
              Period: <strong style={{ color: 'var(--c-text-1)', fontFamily: 'var(--font-mono)' }}>{insight.period}</strong>
            </span>
            <span>
              Magnitude: <strong style={{ color: 'var(--c-text-1)', fontFamily: 'var(--font-mono)' }}>{insight.magnitude}</strong>
            </span>
            <span>
              Classification: <strong style={{ color: 'var(--c-blue)' }}>{insight.distinction}</strong>
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>
            Confidence: {insight.confidenceScore}%
          </span>
        </div>
      )}

      {/* Filter toolbar */}
      <div
        style={{
          padding: 'var(--sp-3) var(--sp-6)',
          borderBottom: '1px solid var(--c-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sp-3)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search records, entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>

        <Button variant="secondary" size="sm" onClick={handleExportCSV} icon={<Download size={14} />}>
          Export CSV
        </Button>
      </div>

      <DialogBody style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: 'var(--text-xs)', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--c-page)',
                  borderBottom: '1px solid var(--c-border)',
                  color: 'var(--c-text-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '10px 16px' }}>Record ID</th>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Entity / Cost Center</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Impact ($)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Anomaly Score</th>
                <th style={{ padding: '10px 16px' }}>Evidence Hash</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid var(--c-border)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td style={{ padding: '10px 16px', color: 'var(--c-blue)', fontWeight: 700 }}>{row.id}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--c-text-3)' }}>{row.timestamp}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--c-text-1)', fontFamily: 'var(--font-body)' }}>{row.entity}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-body)' }}>{row.category}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                    {row.value < 0 ? (
                      <span style={{ color: 'var(--c-success)' }}>-${Math.abs(row.value).toLocaleString()}</span>
                    ) : (
                      <span style={{ color: 'var(--c-text-1)' }}>${row.value.toLocaleString()}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <Badge
                      variant={
                        row.anomalyScore > 0.8
                          ? 'destructive'
                          : row.anomalyScore > 0.5
                          ? 'warning'
                          : 'default'
                      }
                      size="sm"
                    >
                      {(row.anomalyScore * 100).toFixed(0)}%
                    </Badge>
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--c-text-3)' }}>{row.evidenceHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogBody>

      <DialogFooter>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginRight: 'auto' }}>
          Showing {filteredRows.length} of {mockRows.length} ledger transactions
        </span>
        <Button variant="primary" onClick={onClose}>
          Close Inspector
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
