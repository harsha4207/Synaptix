/**
 * Speech-to-Text Service
 * Uses the Web Speech API (SpeechRecognition) for browser-native streaming transcription.
 * Features an automatic silence & end-of-utterance detector (950ms) to finalize and execute
 * voice commands automatically without requiring another button click or shortcut press.
 */

import type {
  ISpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from './types';

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface STTCallbacks {
  onInterim: (text: string) => void;
  onFinal: (result: TranscriptionResult) => void;
  onError: (error: string) => void;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

class SpeechToTextService {
  private recognition: ISpeechRecognition | null = null;
  private isListening = false;
  private silenceTimer: any = null;
  private hasSubmittedFinal = false;
  private lastSpokenText = '';
  private readonly silenceThresholdMs = 950; // 950ms silence window after speech ends

  /**
   * Start streaming speech recognition with automatic silence-detection finalization.
   * Calls onInterim with live partials, and onFinal when silence or final event occurs.
   */
  startListening(callbacks: STTCallbacks): boolean {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      callbacks.onError(
        'Speech recognition is not supported in this browser. ' +
        'Please use Chrome or Edge, or type your command instead.'
      );
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Clear session state
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.hasSubmittedFinal = false;
    this.lastSpokenText = '';

    try {
      this.recognition = new Ctor();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let finalConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            finalConfidence = result[0].confidence;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentActiveText = (finalTranscript || interimTranscript).trim();
        if (currentActiveText) {
          this.lastSpokenText = currentActiveText;
          callbacks.onInterim(currentActiveText);

          // Reset silence detection timer on each new speech segment
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
          }

          this.silenceTimer = setTimeout(() => {
            if (this.lastSpokenText.trim() && !this.hasSubmittedFinal && this.isListening) {
              this.hasSubmittedFinal = true;
              const commitText = this.lastSpokenText.trim();
              this.stopListening();
              callbacks.onFinal({
                transcript: commitText,
                confidence: 0.9,
                isFinal: true,
              });
            }
          }, this.silenceThresholdMs);
        }

        // If SpeechRecognition natively flagged isFinal
        if (finalTranscript.trim() && !this.hasSubmittedFinal) {
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
          this.hasSubmittedFinal = true;
          this.stopListening();
          callbacks.onFinal({
            transcript: finalTranscript.trim(),
            confidence: finalConfidence || 0.9,
            isFinal: true,
          });
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
        this.isListening = false;

        // If we already captured valid speech, finalize it despite error
        if (this.lastSpokenText.trim() && !this.hasSubmittedFinal) {
          this.hasSubmittedFinal = true;
          callbacks.onFinal({
            transcript: this.lastSpokenText.trim(),
            confidence: 0.85,
            isFinal: true,
          });
          return;
        }

        switch (event.error) {
          case 'not-allowed':
            callbacks.onError('Microphone permission denied. Please allow microphone access in browser settings.');
            break;
          case 'no-speech':
            callbacks.onError('No speech detected. Please speak clearly into your microphone.');
            break;
          case 'network':
            callbacks.onError('Network error during speech recognition. Please check your connection.');
            break;
          case 'audio-capture':
            callbacks.onError('No microphone found. Please connect a microphone and try again.');
            break;
          default:
            callbacks.onError(`Speech recognition error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }

        // If stream ended with uncommitted spoken text, finalize automatically
        if (this.lastSpokenText.trim() && !this.hasSubmittedFinal) {
          this.hasSubmittedFinal = true;
          callbacks.onFinal({
            transcript: this.lastSpokenText.trim(),
            confidence: 0.88,
            isFinal: true,
          });
        }
        this.isListening = false;
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      this.isListening = false;
      callbacks.onError('Failed to start speech recognition. Please try again.');
      return false;
    }
  }

  stopListening(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch { /* ignore */ }
    }
    this.isListening = false;
  }

  abortListening(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch { /* ignore */ }
    }
    this.isListening = false;
    this.recognition = null;
    this.lastSpokenText = '';
    this.hasSubmittedFinal = false;
  }

  get isActive(): boolean {
    return this.isListening;
  }
}

// Singleton
export const sttService = new SpeechToTextService();

/**
 * Normalize a raw transcript: trim whitespace, capitalize first letter,
 * remove trailing punctuation artifacts from speech recognition.
 */
export function normalizeTranscript(raw: string): string {
  if (!raw) return '';
  let normalized = raw.trim();
  normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  normalized = normalized.replace(/\.$/, '');
  return normalized;
}
