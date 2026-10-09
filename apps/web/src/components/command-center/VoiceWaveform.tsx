import React from 'react';
import { Mic, CheckCircle2, Loader2 } from 'lucide-react';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'response';

interface VoiceWaveformProps {
  voiceState?: VoiceState;
  isListening?: boolean; // backwards compatibility
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  voiceState: explicitState,
  isListening = false,
}) => {
  const currentState: VoiceState = explicitState || (isListening ? 'listening' : 'idle');

  if (currentState === 'idle') {
    return (
      <div className="voice-state-box idle" title="Voice Input Idle (Static)">
        <Mic size={15} className="voice-static-icon" />
        <span className="voice-status-text">Voice Command Ready</span>
      </div>
    );
  }

  if (currentState === 'listening') {
    return (
      <div className="voice-state-box listening" aria-label="Listening to voice command">
        <div className="waveform-bars">
          <span className="wave-bar bar-1" />
          <span className="wave-bar bar-2" />
          <span className="wave-bar bar-3" />
          <span className="wave-bar bar-4" />
          <span className="wave-bar bar-5" />
        </div>
        <span className="voice-status-text">Listening for voice input...</span>
      </div>
    );
  }

  if (currentState === 'processing') {
    return (
      <div className="voice-state-box processing" aria-label="Processing audio stream">
        <div className="minimal-pulse-ring">
          <Loader2 size={15} className="spinner-icon animate-spin" />
        </div>
        <span className="voice-status-text">Processing natural language audio...</span>
      </div>
    );
  }

  return (
    <div className="voice-state-box response" aria-label="Voice command parsed">
      <CheckCircle2 size={15} className="voice-response-icon" />
      <span className="voice-status-text">Voice Command Synthesized</span>
    </div>
  );
};
