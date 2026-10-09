import React, { useState, forwardRef } from 'react';
import { Sparkles, Mic, ArrowRight, CornerDownLeft, ShieldAlert } from 'lucide-react';

interface HeroCommandAreaProps {
  onCommandSubmitted: (commandText: string) => void;
  isolationNotice: string | null;
  onClearIsolationNotice: () => void;
}

export const HeroCommandArea = forwardRef<HTMLInputElement, HeroCommandAreaProps>(
  ({ onCommandSubmitted, isolationNotice, onClearIsolationNotice }, ref) => {
    const [commandInput, setCommandInput] = useState('');
    const [isListening, setIsListening] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commandInput.trim()) return;
      onCommandSubmitted(commandInput);
    };

    const handleMicClick = () => {
      setIsListening(true);
      setTimeout(() => {
        setCommandInput('Analyze revenue and cash flow forecast for FY2026');
        setIsListening(false);
      }, 1500);
    };

    return (
      <section className="hero-command-section" aria-label="Command Center Entry">
        <div className="hero-text-content">
          <h1 className="hero-main-heading">What will you accomplish today?</h1>
          <p className="hero-supporting-text">
            Explore your organizational intelligence, analyze data, solve problems, and take action.
          </p>
        </div>

        {/* Primary Command Input Container */}
        <form onSubmit={handleSubmit} className="hero-command-bar-wrapper">
          <div className="command-bar-inner">
            <div className="command-icon-badge">
              <Sparkles size={18} className="sparkles-icon" />
            </div>

            <input
              ref={ref}
              type="text"
              value={commandInput}
              onChange={(e) => {
                setCommandInput(e.target.value);
                if (isolationNotice) onClearIsolationNotice();
              }}
              placeholder="Ask Synaptix anything about your work..."
              className="hero-command-input"
            />

            <div className="command-bar-controls">
              <button
                type="button"
                onClick={handleMicClick}
                className={`mic-button ${isListening ? 'listening' : ''}`}
                title="Voice Command Mode"
                aria-label="Activate voice input"
              >
                <Mic size={16} />
              </button>

              <button
                type="submit"
                className="command-submit-btn"
                disabled={!commandInput.trim()}
                title="Execute Command"
                aria-label="Submit Command"
              >
                <span>Command</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="command-keyboard-hint">
            <CornerDownLeft size={12} /> Press <span>Enter</span> to submit • Commands require workspace context
          </div>
        </form>

        {/* Workspace Isolation Notice (Triggers when user types a domain query prior to workspace selection) */}
        {isolationNotice && (
          <div className="workspace-isolation-banner" role="alert">
            <div className="banner-icon-wrapper">
              <ShieldAlert size={18} />
            </div>
            <div className="banner-content">
              <span className="banner-system-label">SYNAPTIX WORKSPACE SECURITY</span>
              <p className="banner-text">{isolationNotice}</p>
            </div>
            <button
              type="button"
              className="banner-dismiss-btn"
              onClick={onClearIsolationNotice}
            >
              Select Workspace ↓
            </button>
          </div>
        )}
      </section>
    );
  }
);

HeroCommandArea.displayName = 'HeroCommandArea';
