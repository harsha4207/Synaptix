/**
 * Text-to-Speech Service
 *
 * Provides speech synthesis using:
 * 1. ElevenLabs Neural TTS via backend proxy (/api/voice/tts) when configured.
 * 2. High-performance browser-native Web Speech Synthesis API as fallback.
 *
 * Keeps API keys safely on the backend.
 */

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isMuted = false;
  private isPlaying = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  get isSupported(): boolean {
    return (
      (typeof window !== 'undefined' && 'Audio' in window) ||
      this.synthesis !== null
    );
  }

  get activeUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  get isSpeaking(): boolean {
    return this.isPlaying;
  }

  get muted(): boolean {
    return this.isMuted;
  }

  setMuted(value: boolean): void {
    this.isMuted = value;
    if (value) {
      this.stop();
    }
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (this.isMuted) return;
    if (!text?.trim()) return;

    // Stop any current playback
    this.stop();

    // Truncate excessively long text for voice readout
    const truncated = text.length > 400
      ? text.substring(0, 400) + '... and more.'
      : text;

    // 1. Attempt ElevenLabs TTS via Backend Endpoint
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: truncated, voiceId: options.voice }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('audio')) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;

          return new Promise<void>((resolve) => {
            audio.onplay = () => {
              this.isPlaying = true;
            };
            audio.onended = () => {
              this.isPlaying = false;
              this.currentAudio = null;
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            audio.onerror = () => {
              this.isPlaying = false;
              this.currentAudio = null;
              URL.revokeObjectURL(audioUrl);
              // Fallback to browser Web Speech API
              this.speakWithWebSpeech(truncated, options).then(resolve);
            };
            audio.play().catch(() => {
              this.speakWithWebSpeech(truncated, options).then(resolve);
            });
          });
        }
      } catch {
        // Fallback to Web Speech API
      }
    }

    // 2. Browser-native Web Speech API
    return this.speakWithWebSpeech(truncated, options);
  }

  private speakWithWebSpeech(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.synthesis) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 1.1;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;
      utterance.lang = 'en-US';

      // Select voice if specified
      if (options.voice) {
        const voices = this.synthesis!.getVoices();
        const matched = voices.find((v) =>
          v.name.toLowerCase().includes(options.voice!.toLowerCase())
        );
        if (matched) utterance.voice = matched;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        resolve(); // Don't throw
      };

      this.currentUtterance = utterance;

      // Chrome workaround: synthesis sometimes pauses
      this.synthesis!.cancel();
      this.synthesis!.speak(utterance);
    });
  }

  stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch { /* ignore */ }
      this.currentAudio = null;
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  }
}

// Singleton
export const ttsService = new TextToSpeechService();
