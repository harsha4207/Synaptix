import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export type UploadState = 'idle' | 'drag-over' | 'uploading' | 'processing' | 'ready';

export interface UploadFileItem {
  id: string;
  name: string;
  size: string;
  state: UploadState;
  progress: number;
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  acceptedTypes = '.pdf, .docx, .csv, .json, .xlsx',
  maxSizeMB = 50,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const newItems: UploadFileItem[] = files.map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      state: 'uploading',
      progress: 35,
    }));

    setUploadedFiles((prev) => [...newItems, ...prev]);
    onFilesSelected(files);

    // Transition each file through: uploading -> processing -> ready
    newItems.forEach((item) => {
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, state: 'processing', progress: 75 } : f))
        );
      }, 700);

      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, state: 'ready', progress: 100 } : f))
        );
      }, 1500);
    });
  };

  const currentZoneState: UploadState = isDragging ? 'drag-over' : 'idle';

  return (
    <div className="ds-upload-wrapper">
      <div
        className={`ds-upload-zone state-${currentZoneState}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        <div className="upload-icon-circle">
          <UploadCloud size={24} />
        </div>
        <h4 className="upload-title">
          {currentZoneState === 'drag-over' ? 'Drop files to upload' : 'Drag & drop files or browse'}
        </h4>
        <p className="upload-subtitle">
          Supports PDF, DOCX, CSV, JSON, XLSX up to {maxSizeMB}MB • Semantic indexing active
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-file-list">
          {uploadedFiles.map((file) => (
            <div key={file.id} className={`uploaded-file-item file-state-${file.state}`}>
              <FileText size={16} className="file-icon" />
              <div className="file-info">
                <div className="file-name-row">
                  <span className="file-name">{file.name}</span>
                  <span className="file-state-badge">{file.state.toUpperCase()}</span>
                </div>
                <div className="file-progress-bar-wrap">
                  <div
                    className={`file-progress-fill ${file.state}`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
              {file.state === 'ready' ? (
                <CheckCircle2 size={16} className="upload-success-icon" />
              ) : file.state === 'processing' ? (
                <Sparkles size={16} className="upload-processing-icon animate-pulse" />
              ) : (
                <Loader2 size={16} className="upload-spinner animate-spin" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
