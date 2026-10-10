/**
 * Audio Capture Service
 * Manages microphone access, MediaRecorder lifecycle, and audio blob creation.
 * Handles permission checking, start/stop/cancel, silence detection, and cleanup.
 */

import type { MicrophonePermission } from './types';

export interface AudioCaptureCallbacks {
  onStart: () => void;
  onStop: (blob: Blob, durationMs: number) => void;
  onError: (error: string) => void;
  onDurationUpdate: (ms: number) => void;
}

const MAX_RECORDING_MS = 30_000;
const SILENCE_TIMEOUT_MS = 3_000;
// Preferred MIME types — try in order of preference
const PREFERRED_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

class AudioCaptureService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private maxDurationTimeout: ReturnType<typeof setTimeout> | null = null;
  private silenceTimeout: ReturnType<typeof setTimeout> | null = null;
  private isRecording = false;

  async checkPermission(): Promise<MicrophonePermission> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return 'unsupported';
    }

    try {
      if (navigator.permissions) {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return status.state as MicrophonePermission;
      }
      // Fallback: can't check without requesting
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }

  async requestPermission(): Promise<MicrophonePermission> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop — we just wanted the permission prompt
      stream.getTracks().forEach((t) => t.stop());
      return 'granted';
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          return 'denied';
        }
      }
      return 'denied';
    }
  }

  private selectMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';
    for (const mime of PREFERRED_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mime)) return mime;
    }
    return '';
  }

  async startRecording(callbacks: AudioCaptureCallbacks): Promise<boolean> {
    if (this.isRecording) {
      callbacks.onError('Already recording');
      return false;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      callbacks.onError('Microphone access is not supported in this browser');
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          callbacks.onError('Microphone permission denied. Please allow microphone access in your browser settings.');
          return false;
        }
        if (err.name === 'NotFoundError') {
          callbacks.onError('No microphone found. Please connect a microphone and try again.');
          return false;
        }
      }
      callbacks.onError('Failed to access microphone. Please check your device and browser settings.');
      return false;
    }

    const mimeType = this.selectMimeType();
    const recorderOptions = mimeType ? { mimeType } : undefined;

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
    } catch {
      callbacks.onError('Could not initialize audio recorder. Your browser may not support the required format.');
      this.releaseStream();
      return false;
    }

    this.audioChunks = [];
    this.isRecording = true;
    this.startTime = Date.now();

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
        // Reset silence timer on data
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
          this.silenceTimeout = setTimeout(() => this.stopRecording(callbacks), SILENCE_TIMEOUT_MS);
        }
      }
    };

    this.mediaRecorder.onstop = () => {
      this.clearTimers();
      const duration = Date.now() - this.startTime;
      const blob = new Blob(this.audioChunks, { type: mimeType || 'audio/webm' });
      this.releaseStream();
      this.isRecording = false;
      this.audioChunks = [];

      if (blob.size < 100) {
        callbacks.onError('No audio was recorded. Please speak clearly and try again.');
        return;
      }

      callbacks.onStop(blob, duration);
    };

    this.mediaRecorder.onerror = () => {
      this.clearTimers();
      this.releaseStream();
      this.isRecording = false;
      callbacks.onError('Recording encountered an error. Please try again.');
    };

    // Request data every 250ms for silence detection
    this.mediaRecorder.start(250);

    // Update duration counter
    this.durationInterval = setInterval(() => {
      callbacks.onDurationUpdate(Date.now() - this.startTime);
    }, 100);

    // Auto-stop at max duration
    this.maxDurationTimeout = setTimeout(() => {
      this.stopRecording(callbacks);
    }, MAX_RECORDING_MS);

    // Start silence detection after 1.5s
    setTimeout(() => {
      if (this.isRecording) {
        this.silenceTimeout = setTimeout(() => {
          this.stopRecording(callbacks);
        }, SILENCE_TIMEOUT_MS);
      }
    }, 1500);

    callbacks.onStart();
    return true;
  }

  stopRecording(callbacks: AudioCaptureCallbacks): void {
    if (!this.isRecording || !this.mediaRecorder) return;

    this.clearTimers();
    try {
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    } catch {
      callbacks.onError('Failed to stop recording gracefully.');
      this.forceStop();
    }
  }

  cancelRecording(): void {
    if (!this.isRecording) return;
    this.clearTimers();
    this.isRecording = false;
    this.audioChunks = [];

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Suppress onstop callback
      this.mediaRecorder.onstop = null;
      try {
        this.mediaRecorder.stop();
      } catch { /* ignore */ }
    }

    this.releaseStream();
  }

  get isActive(): boolean {
    return this.isRecording;
  }

  private clearTimers(): void {
    if (this.durationInterval) { clearInterval(this.durationInterval); this.durationInterval = null; }
    if (this.maxDurationTimeout) { clearTimeout(this.maxDurationTimeout); this.maxDurationTimeout = null; }
    if (this.silenceTimeout) { clearTimeout(this.silenceTimeout); this.silenceTimeout = null; }
  }

  private releaseStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
  }

  private forceStop(): void {
    this.isRecording = false;
    this.audioChunks = [];
    this.releaseStream();
  }
}

// Singleton
export const audioCaptureService = new AudioCaptureService();
