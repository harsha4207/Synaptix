/**
 * Voice Command HUD (Heads-Up Display)
 *
 * Compact, floating voice assistant control panel positioned near the bottom
 * center of the viewport. Matches the SYNAPTIX COMMAND enterprise color palette.
 * Automatically executes commands when speech finishes, and auto-closes on navigation.
 */

import React from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Square,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useVoiceCommand } from '../../lib/voice/VoiceContext';
import type { VoiceSessionState } from '../../lib/voice/types';
import './voice.css';

export const VoiceCommandHud: React.FC = () => {
  const {
    sessionState,
    interimTranscript,
    finalTranscript,
    lastResult,
    isListening,
    isSpeaking,
    isMuted,
    isHudVisible,
    setHudVisible,
    startVoiceCommand,
    stopVoiceCapture,
    cancelVoice,
    stopAudioPlayback,
    toggleMute,
  } = useVoiceCommand();

  const activeTranscript = interimTranscript || finalTranscript;

  if (!isHudVisible) return null;

  const getStatusText = (state: VoiceSessionState) => {
    switch (state) {
      case 'LISTENING':
        return activeTranscript ? activeTranscript : 'Listening for command...';
      case 'PROCESSING_TRANSCRIPT':
      case 'CLASSIFYING':
        return 'Analyzing intent...';
      case 'EXECUTING':
        return 'Executing command...';
      case 'VERIFYING':
        return 'Verifying operation...';
      case 'SPEAKING':
        return 'Speaking response...';
      case 'AWAITING_CONFIRMATION':
        return 'Confirmation required';
      case 'AWAITING_CLARIFICATION':
        return 'Clarification required';
      case 'ERROR':
        return 'Voice recognition error';
      default:
        return 'Ready for command';
    }
  };

  const isAnsweringKnowledge =
    lastResult &&
    lastResult.status === 'SUCCEEDED' &&
    !lastResult.navigatedTo &&
    (sessionState === 'IDLE' || sessionState === 'SPEAKING') &&
    lastResult.responseText;

  return (
    <div
      className="voice-floating-container"
      role="dialog"
      aria-label="Voice Command Assistant"
    >
      <div className={`voice-floating-panel ${isListening ? 'listening-state' : ''}`}>
        {/* Main Floating Row */}
        <div className="voice-panel-main-row">
          {/* Left: Active Mic Button with Waveform */}
          <button
            type="button"
            className={`voice-panel-mic-btn ${isListening ? 'active' : ''}`}
            onClick={isListening ? stopVoiceCapture : startVoiceCommand}
            title={isListening ? 'Stop Listening (Auto-submitting on silence)' : 'Start Listening'}
            aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
          >
            <Mic size={18} />
            {isListening && <span className="voice-pulse-ring" />}
          </button>

          {/* Center: Live Status & Transcript Preview */}
          <div className="voice-panel-center-content">
            <div className="voice-panel-status-label">
              {sessionState === 'LISTENING' ? (
                <span className="voice-listening-indicator">
                  <span className="voice-mini-pulse-dot" />
                  Listening...
                </span>
              ) : sessionState === 'PROCESSING_TRANSCRIPT' || sessionState === 'CLASSIFYING' || sessionState === 'EXECUTING' ? (
                <span className="voice-processing-indicator">
                  <Sparkles size={11} className="spin-icon" />
                  Processing
                </span>
              ) : sessionState === 'SPEAKING' ? (
                <span className="voice-speaking-indicator">
                  <Volume2 size={11} className="pulse-icon" />
                  Assistant Speaking
                </span>
              ) : sessionState === 'ERROR' ? (
                <span className="voice-error-indicator">
                  <AlertCircle size={11} />
                  Error
                </span>
              ) : (
                <span className="voice-ready-indicator">Synaptix Voice</span>
              )}

              <span className="voice-shortcut-tag">Ctrl+Shift+Space</span>
            </div>

            <div
              className={`voice-panel-transcript ${
                isListening && activeTranscript ? 'has-transcript' : ''
              }`}
              title={getStatusText(sessionState)}
            >
              {activeTranscript ? (
                <span>“{activeTranscript}”</span>
              ) : (
                <span className="voice-placeholder-text">
                  {getStatusText(sessionState)}
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="voice-panel-actions">
            {isSpeaking && (
              <button
                type="button"
                className="voice-panel-btn stop-speech"
                onClick={stopAudioPlayback}
                title="Stop Speech Output"
              >
                <Square size={13} />
              </button>
            )}

            <button
              type="button"
              className={`voice-panel-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
              title={isMuted ? 'Unmute Voice Output' : 'Mute Voice Output'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button
              type="button"
              className="voice-panel-btn close"
              onClick={() => {
                cancelVoice();
                setHudVisible(false);
              }}
              title="Close Voice Control (Esc)"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Live Audio Waveform (shown while actively recording) */}
        {isListening && (
          <div className="voice-panel-waveform" aria-hidden="true">
            <span className="v-bar v1" />
            <span className="v-bar v2" />
            <span className="v-bar v3" />
            <span className="v-bar v4" />
            <span className="v-bar v5" />
            <span className="v-bar v6" />
            <span className="v-bar v7" />
            <span className="v-bar v8" />
            <span className="v-bar v9" />
            <span className="v-bar v10" />
          </div>
        )}

        {/* Expanded Knowledge / RAG Response Drawer (when answering a query) */}
        {isAnsweringKnowledge && lastResult && (
          <div className="voice-panel-response-drawer">
            <div className="voice-drawer-header">
              <div className="voice-drawer-badge">
                <CheckCircle2 size={12} className="text-success" />
                <span>{lastResult.intent.intent}</span>
              </div>
              <button
                type="button"
                className="voice-drawer-close-btn"
                onClick={() => setHudVisible(false)}
                title="Dismiss response"
              >
                <X size={12} />
              </button>
            </div>

            <div className="voice-drawer-text">
              {lastResult.responseText}
            </div>

            {/* Citations if present */}
            {lastResult.data && Array.isArray((lastResult.data as any).citations) && (
              <div className="voice-drawer-citations">
                {((lastResult.data as any).citations as any[]).slice(0, 3).map((c, i) => (
                  <span key={i} className="voice-drawer-citation-pill">
                    {c.filename}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
