/**
 * SYNAPTIX COMMAND — Voice Engine Types
 * Central type definitions for the voice command orchestration system.
 */

import type { WorkspaceModuleId } from '../../design-system/components/Sidebar';

// ── Web Speech API Declarations ───────────────────────────────────────────────

export interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionResultItem;
  isFinal?: boolean;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// ── Voice Session State Machine ───────────────────────────────────────────────

export type VoiceSessionState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING_TRANSCRIPT'
  | 'CLASSIFYING'
  | 'AWAITING_CLARIFICATION'
  | 'AWAITING_CONFIRMATION'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'SPEAKING'
  | 'ERROR'
  | 'CANCELLED';

// ── Intent Categories ─────────────────────────────────────────────────────────

export type VoiceIntent =
  | 'NAVIGATE'
  | 'NAVIGATE_HOME'
  | 'NAVIGATE_BACK'
  | 'NAVIGATE_FORWARD'
  | 'SWITCH_WORKSPACE'
  | 'WORKSPACE_SWITCH'
  | 'OPEN_TAB'
  | 'CLOSE_TAB'
  | 'OPEN_DIALOG'
  | 'CLOSE_DIALOG'
  | 'GLOBAL_SEARCH'
  | 'DOCUMENT_SEARCH'
  | 'DOCUMENT_SUMMARY'
  | 'ORGANIZATION_QA'
  | 'ANALYTICS_QUERY'
  | 'DASHBOARD_VIEW'
  | 'PROBLEM_INVESTIGATION'
  | 'WORKFLOW_LIST'
  | 'WORKFLOW_RUN'
  | 'ACTION_LIST'
  | 'ACTION_EXECUTE'
  | 'READ_PAGE_SUMMARY'
  | 'CAPABILITY_DISCOVERY'
  | 'CROSS_WORKSPACE_COMPARE'
  | 'CONVERSATION_QUERY'
  | 'VOICE_STOP'
  | 'VOICE_CANCEL'
  | 'VOICE_MUTE'
  | 'CLARIFICATION_REQUIRED'
  | 'GENERAL_QUERY'
  | 'UNKNOWN';

// ── Tab & Dialog Capability Registrations ────────────────────────────────────

export interface PageTabTarget {
  /** Tab identifier (e.g. 'trends', 'Pending', 'Critical', 'profile') */
  id: string;
  /** Human-readable tab label */
  label: string;
  /** Parent module */
  moduleId: WorkspaceModuleId;
  /** 1-based ordinal index for ordinal matching ('first tab', 'second tab') */
  index: number;
  /** Natural-language aliases */
  aliases: string[];
}

export interface DialogTarget {
  id: string;
  label: string;
  aliases: string[];
  description: string;
}

// ── Classified Intent Result ──────────────────────────────────────────────────

export interface ClassifiedIntent {
  intent: VoiceIntent;
  /** Canonical navigation target (e.g., 'finance.analytics', 'hub', 'documents') */
  target?: string;
  /** Workspace ID if explicitly specified or resolved */
  workspaceId?: string;
  /** Module ID if explicitly specified or resolved */
  moduleId?: WorkspaceModuleId;
  /** Target tab ID if an OPEN_TAB intent */
  tabId?: string;
  /** Target dialog ID if a dialog intent */
  dialogId?: string;
  /** Extracted parameters */
  parameters: Record<string, string | number | boolean>;
  /** 0–1 confidence score */
  confidence: number;
  /** Whether human clarification is needed */
  requiresClarification: boolean;
  /** Reason for the classification */
  reason: string;
  /** Risk level */
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ── Navigation Target Registry ────────────────────────────────────────────────

export interface NavigationTarget {
  /** Unique canonical key, e.g. 'finance.analytics' */
  key: string;
  /** Human-readable label */
  label: string;
  /** Module to activate */
  moduleId: WorkspaceModuleId;
  /** Optional workspace to switch to */
  workspaceId?: string;
  /** All matching aliases/phrases */
  aliases: string[];
  /** Whether the target requires an authenticated workspace */
  requiresWorkspace: boolean;
  /** Description for voice/UI feedback */
  description: string;
}

// ── Command Execution ─────────────────────────────────────────────────────────

export type ExecutionStatus =
  | 'RECEIVED'
  | 'CLASSIFYING'
  | 'AWAITING_CLARIFICATION'
  | 'AWAITING_CONFIRMATION'
  | 'AUTHORIZING'
  | 'RUNNING'
  | 'VERIFYING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PARTIALLY_SUCCEEDED';

export interface VoiceCommandResult {
  id: string;
  sessionId: string;
  transcript: string;
  intent: ClassifiedIntent;
  status: ExecutionStatus;
  /** Human-readable response */
  responseText: string;
  /** Whether TTS should speak the response */
  shouldSpeak: boolean;
  /** Navigation performed */
  navigatedTo?: string;
  /** Data payload from skill execution */
  data?: Record<string, unknown>;
  /** Timestamp ms */
  timestamp: number;
  /** Error details if failed */
  error?: string;
}

// ── Voice Session Context ─────────────────────────────────────────────────────

export interface VoiceConversationContext {
  sessionId: string;
  /** Currently active workspace ID */
  workspaceId: string | null;
  /** Currently active module */
  moduleId: WorkspaceModuleId | null;
  /** Last successfully executed intent */
  lastIntent: VoiceIntent | null;
  /** Last command result */
  lastResult: VoiceCommandResult | null;
  /** Pending confirmation operation */
  pendingConfirmation: PendingConfirmation | null;
  /** Active clarification question */
  pendingClarification: string | null;
  /** Short-term command history (last 5) */
  history: VoiceCommandResult[];
}

export interface PendingConfirmation {
  operationId: string;
  description: string;
  riskLevel: 'MEDIUM' | 'HIGH';
  intent: ClassifiedIntent;
  /** Expires at unix timestamp ms */
  expiresAt: number;
}

// ── Microphone State ──────────────────────────────────────────────────────────

export type MicrophonePermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface AudioCaptureState {
  isRecording: boolean;
  permission: MicrophonePermission;
  durationMs: number;
  hasAudio: boolean;
  error: string | null;
}

// ── TTS State ─────────────────────────────────────────────────────────────────

export interface TTSState {
  isPlaying: boolean;
  isMuted: boolean;
  currentText: string | null;
  error: string | null;
}

// ── Wake Word Config ──────────────────────────────────────────────────────────

export interface WakeWordConfig {
  enabled: boolean;
  phrase: string;
  /** Sensitivity 0–1 */
  sensitivity: number;
}

// ── Voice Settings ────────────────────────────────────────────────────────────

export interface VoiceSettings {
  /** Keyboard shortcut e.g. 'Ctrl+Shift+Space' */
  shortcut: string;
  /** Whether voice responses are spoken */
  ttsEnabled: boolean;
  /** Whether wake word detection is active */
  wakeWordEnabled: boolean;
  wakeWordPhrase: string;
  /** Max recording duration in seconds */
  maxRecordingSeconds: number;
  /** Silence timeout in seconds */
  silenceTimeoutSeconds: number;
  /** Whether to auto-execute low-risk navigation commands */
  autoExecuteNavigation: boolean;
  /** Whether to show transcript preview before executing */
  showTranscriptPreview: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  shortcut: 'Ctrl+Shift+Space',
  ttsEnabled: true,
  wakeWordEnabled: false,
  wakeWordPhrase: 'Hey Synaptix',
  maxRecordingSeconds: 30,
  silenceTimeoutSeconds: 3,
  autoExecuteNavigation: true,
  showTranscriptPreview: false,
};
