import React, { useState } from 'react';
import { X, Table as TableIcon, Check } from 'lucide-react';
import { WorkspaceItem } from '../../types/workspace';

interface DatasetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceItem;
  onImportDataset: (datasetName: string, format: string, rows: number, cols: number) => void;
}

export const DatasetImportModal: React.FC<DatasetImportModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onImportDataset,
}) => {
  const [datasetName, setDatasetName] = useState('');
  const [format, setFormat] = useState<'CSV' | 'XLSX' | 'SQL Table'>('CSV');
  const [estimatedRows, setEstimatedRows] = useState(25000);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName.trim()) {
      setError('Dataset name is required');
      return;
    }

    onImportDataset(datasetName.trim(), format, estimatedRows, 16);
    onClose();
    setDatasetName('');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title-group">
            <div className="modal-icon-badge cyan">
              <TableIcon size={20} />
            </div>
            <div>
              <h3>Import Dataset into {workspace.name}</h3>
              <p>Ingest tabular datasets, schemas, and relational views</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Dataset Name *</label>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => {
                setDatasetName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. q3_vendor_transactions_ledger.csv"
              className={`form-input ${error ? 'input-error' : ''}`}
              autoFocus
            />
            {error && <span className="field-error-msg">{error}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Data Format</label>
            <div className="format-selection-grid">
              {(['CSV', 'XLSX', 'SQL Table'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  className={`format-card ${format === fmt ? 'active' : ''}`}
                  onClick={() => setFormat(fmt)}
                >
                  <span>{fmt}</span>
                  {format === fmt && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Row Count</label>
            <select
              value={estimatedRows}
              onChange={(e) => setEstimatedRows(Number(e.target.value))}
              className="form-input"
            >
              <option value={5000}>5,000 Rows (Small Dataset)</option>
              <option value={25000}>25,000 Rows (Standard Operational Dataset)</option>
              <option value={100000}>100,000 Rows (Large Enterprise Schema)</option>
            </select>
          </div>

          <div className="modal-actions-row">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem' }}>
              Import Dataset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
