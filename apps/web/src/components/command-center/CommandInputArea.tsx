import React, { useState, useRef } from 'react';
import { Sparkles, Mic, Paperclip, ArrowRight, CornerDownLeft } from 'lucide-react';
import { VoiceWaveform } from './VoiceWaveform';
import { WorkspaceItem } from '../../types/workspace';

interface CommandInputAreaProps {
  workspace: WorkspaceItem;
  onSubmitCommand: (text: string, attachedFile?: string) => void;
  onAddToast: (msg: string) => void;
  isProcessing: boolean;
}

export const CommandInputArea: React.FC<CommandInputAreaProps> = ({
  workspace,
  onSubmitCommand,
  onAddToast,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedCommands = [
    'Analyze revenue from 2010–2026',
    'Find anomalies in this dataset',
    'Create an executive dashboard',
    'Find documents related to this problem',
    'Create a monthly workflow',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSubmitCommand(inputText, attachedFileName || undefined);
    setInputText('');
    setAttachedFileName(null);
  };

  const handleSelectSuggested = (cmd: string) => {
    if (isProcessing) return;
    setInputText(cmd);
    onSubmitCommand(cmd);
  };

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    onAddToast('Listening for voice command...');

    setTimeout(() => {
      setInputText(`Analyze revenue from 2010–2026 and identify Q3 margin variance in ${workspace.name}`);
      setIsListening(false);
      onAddToast('Voice command parsed');
    }, 2200);
  };

  const handleFileAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      onAddToast(`Attached file: ${file.name}`);
    }
  };

  return (
    <div className="command-center-input-container">
      {/* Heading Prompt */}
      <div className="input-heading-row">
        <h2 className="input-main-label">What would you like Synaptix to do?</h2>
        <span className="input-scope-badge">{workspace.name} Context</span>
      </div>

      {/* Primary Input Box Form */}
      <form onSubmit={handleSubmit} className={`command-input-card ${isProcessing ? 'processing' : ''}`}>
        {/* Voice Waveform Indicator */}
        <VoiceWaveform isListening={isListening} />

        <div className="input-card-main-row">
          <div className="input-sparkle-circle">
            <Sparkles size={18} className="sparkle-blue" />
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask Synaptix about ${workspace.name.toLowerCase()} analytics, data, documents or workflows...`}
            className="command-large-input"
            disabled={isProcessing}
          />

          <div className="input-right-actions">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* File Attachment Button */}
            <button
              type="button"
              onClick={handleFileAttachClick}
              className={`action-icon-btn ${attachedFileName ? 'has-file' : ''}`}
              title="Attach document or dataset"
              disabled={isProcessing}
            >
              <Paperclip size={16} />
            </button>

            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`action-icon-btn mic-btn ${isListening ? 'listening-active' : ''}`}
              title="Voice Command Mode"
              disabled={isProcessing}
            >
              <Mic size={16} />
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit-command"
              disabled={!inputText.trim() || isProcessing}
            >
              <span>Command</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Attachment Pill if present */}
        {attachedFileName && (
          <div className="attached-file-pill">
            <Paperclip size={12} />
            <span>Attached: {attachedFileName}</span>
            <button
              type="button"
              onClick={() => setAttachedFileName(null)}
              className="remove-file-btn"
            >
              ×
            </button>
          </div>
        )}

        <div className="input-footer-hints">
          <CornerDownLeft size={12} />
          <span>Press <strong>Enter</strong> to execute • Governed by SAML 2.0 RBAC</span>
        </div>
      </form>

      {/* Suggested Command Chips */}
      <div className="suggested-commands-section">
        <span className="suggested-label">Suggested Commands:</span>
        <div className="suggested-chips-list">
          {suggestedCommands.map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              className="suggested-chip-btn"
              onClick={() => handleSelectSuggested(cmd)}
              disabled={isProcessing}
            >
              <span>"{cmd}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
