/**
 * Voice Orchestration Engine
 * Central controller coordinating speech recognition, two-pass intent routing,
 * skill execution, post-operation verification, and speech synthesis.
 */

import { matchDeterministicIntent } from './intentRouter';
import { classifyIntentWithAI } from './geminiClassifier';
import { findSkill, SkillExecutionContext, SkillResult } from './skillRegistry';
import { sttService, normalizeTranscript } from './sttService';
import { ttsService } from './ttsService';
import type {
  VoiceSessionState,
  VoiceCommandResult,
  VoiceConversationContext,
  VoiceSettings,
  ClassifiedIntent,
  PendingConfirmation,
  ISpeechRecognition,
  SpeechRecognitionEvent,
} from './types';
import { DEFAULT_VOICE_SETTINGS } from './types';
import type { WorkspaceItem } from '../../types/workspace';
import type { WorkspaceModuleId } from '../../design-system/components/Sidebar';

export interface VoiceEngineListeners {
  onStateChange: (state: VoiceSessionState) => void;
  onInterimTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onCommandResult: (result: VoiceCommandResult) => void;
  onError: (error: string) => void;
}

export class VoiceEngine {
  private state: VoiceSessionState = 'IDLE';
  private settings: VoiceSettings = { ...DEFAULT_VOICE_SETTINGS };
  private listeners: VoiceEngineListeners;
  private currentSessionId = '';
  private context: VoiceConversationContext;

  // External UI bindings injected by React
  private getWorkspace: () => WorkspaceItem | null = () => null;
  private getAllWorkspaces: () => WorkspaceItem[] = () => [];
  private navigateToModule: (wsId: string | undefined, modId: WorkspaceModuleId) => boolean = () => false;
  private switchWorkspaceById: (wsId: string) => boolean = () => false;
  private returnToHub: () => void = () => {};
  private navigateBackAction: () => boolean = () => false;
  private navigateForwardAction: () => boolean = () => false;
  private selectTabAction: (tabId: string) => boolean = () => false;
  private toggleDialogAction: (dialogId: string, open: boolean) => boolean = () => false;
  private addToastNotification: (msg: string) => void = () => {};

  // Wake word background listener
  private wakeWordRecognition: ISpeechRecognition | null = null;
  private isWakeWordActive = false;

  constructor(listeners: VoiceEngineListeners) {
    this.listeners = listeners;
    this.currentSessionId = `session_${Date.now()}`;
    this.context = {
      sessionId: this.currentSessionId,
      workspaceId: null,
      moduleId: null,
      lastIntent: null,
      lastResult: null,
      pendingConfirmation: null,
      pendingClarification: null,
      history: [],
    };
  }

  // ── Configuration & UI Bindings ─────────────────────────────────────────────

  public setBindings(bindings: {
    getWorkspace: () => WorkspaceItem | null;
    getAllWorkspaces: () => WorkspaceItem[];
    navigateToModule: (wsId: string | undefined, modId: WorkspaceModuleId) => boolean;
    switchWorkspaceById: (wsId: string) => boolean;
    returnToHub: () => void;
    navigateBack?: () => boolean;
    navigateForward?: () => boolean;
    selectTab?: (tabId: string) => boolean;
    toggleDialog?: (dialogId: string, open: boolean) => boolean;
    addToastNotification: (msg: string) => void;
  }) {
    this.getWorkspace = bindings.getWorkspace;
    this.getAllWorkspaces = bindings.getAllWorkspaces;
    this.navigateToModule = bindings.navigateToModule;
    this.switchWorkspaceById = bindings.switchWorkspaceById;
    this.returnToHub = bindings.returnToHub;
    if (bindings.navigateBack) this.navigateBackAction = bindings.navigateBack;
    if (bindings.navigateForward) this.navigateForwardAction = bindings.navigateForward;
    if (bindings.selectTab) this.selectTabAction = bindings.selectTab;
    if (bindings.toggleDialog) this.toggleDialogAction = bindings.toggleDialog;
    this.addToastNotification = bindings.addToastNotification;

    // Update current context workspaceId
    const ws = bindings.getWorkspace();
    if (ws) {
      this.context.workspaceId = ws.id;
    }
  }

  public updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.settings.wakeWordEnabled) {
      this.startWakeWordDetection();
    } else {
      this.stopWakeWordDetection();
    }
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public getState(): VoiceSessionState {
    return this.state;
  }

  public getContext(): VoiceConversationContext {
    return { ...this.context };
  }

  public updateContext(updates: Partial<VoiceConversationContext>) {
    this.context = { ...this.context, ...updates };
  }

  private setState(newState: VoiceSessionState) {
    this.state = newState;
    this.listeners.onStateChange(newState);
  }

  // ── Session & Voice Lifecycle ───────────────────────────────────────────────

  /**
   * Primary activation method: start capturing user voice input.
   * Activated via keyboard shortcut (Ctrl+Shift+Space), wake word, or UI mic button.
   */
  public startVoiceCommand(): boolean {
    if (this.state === 'LISTENING') {
      // Toggle off if already listening
      this.stopVoiceCapture();
      return false;
    }

    // If currently speaking, stop speech first
    if (this.state === 'SPEAKING') {
      ttsService.stop();
    }

    this.setState('LISTENING');
    this.listeners.onInterimTranscript('');

    const started = sttService.startListening({
      onInterim: (text) => {
        if (this.state === 'LISTENING') {
          this.listeners.onInterimTranscript(text);
        }
      },
      onFinal: (result) => {
        const normalized = normalizeTranscript(result.transcript);
        this.listeners.onFinalTranscript(normalized);
        this.handleTranscript(normalized);
      },
      onError: (errMsg) => {
        this.setState('ERROR');
        this.listeners.onError(errMsg);
        setTimeout(() => {
          if (this.state === 'ERROR') this.setState('IDLE');
        }, 3000);
      },
    });

    if (!started) {
      this.setState('IDLE');
      return false;
    }

    return true;
  }

  public stopVoiceCapture() {
    if (this.state === 'LISTENING') {
      sttService.stopListening();
    }
  }

  public cancelVoice() {
    sttService.abortListening();
    ttsService.stop();
    this.setState('CANCELLED');
    setTimeout(() => {
      this.setState('IDLE');
    }, 500);
  }

  public stopAudioPlayback() {
    ttsService.stop();
    if (this.state === 'SPEAKING') {
      this.setState('IDLE');
    }
  }

  // ── Transcript & Intent Processing Pipeline ─────────────────────────────────

  public async handleTranscript(transcript: string) {
    if (!transcript || transcript.trim().length === 0) {
      this.setState('IDLE');
      return;
    }

    this.setState('PROCESSING_TRANSCRIPT');

    // Handle immediate stop / cancel voice commands
    const lower = transcript.toLowerCase().trim();
    if (['stop', 'be quiet', 'quiet', 'silence', 'stop speaking'].includes(lower)) {
      this.stopAudioPlayback();
      return;
    }
    if (['cancel', 'abort', 'never mind', 'dismiss'].includes(lower)) {
      this.cancelVoice();
      return;
    }

    // Check if user is confirming or denying a pending confirmation
    if (this.context.pendingConfirmation) {
      const isConfirmed = /^(yes|confirm|proceed|do it|execute|sure|approve)/i.test(lower);
      const isDeclined = /^(no|don't|cancel|stop|reject|abort|never)/i.test(lower);

      if (isConfirmed) {
        const intentToRun = this.context.pendingConfirmation.intent;
        this.context.pendingConfirmation = null;
        await this.executeClassifiedIntent(intentToRun, transcript);
        return;
      }

      if (isDeclined) {
        this.context.pendingConfirmation = null;
        const cancelResult: VoiceCommandResult = {
          id: `cmd_${Date.now()}`,
          sessionId: this.currentSessionId,
          transcript,
          intent: {
            intent: 'VOICE_CANCEL',
            parameters: {},
            confidence: 1.0,
            requiresClarification: false,
            reason: 'User explicitly declined pending operation',
            riskLevel: 'LOW',
          },
          status: 'CANCELLED',
          responseText: 'Operation cancelled.',
          shouldSpeak: this.settings.ttsEnabled,
          timestamp: Date.now(),
        };
        this.recordResult(cancelResult);
        await this.respond(cancelResult);
        return;
      }
    }

    // Pass 1: Deterministic Match
    this.setState('CLASSIFYING');
    let classified = matchDeterministicIntent(transcript, this.context);

    // Pass 2: AI Classification Fallback
    if (!classified || classified.confidence < 0.75) {
      classified = await classifyIntentWithAI(transcript, this.context);
    }

    // If clarification is required
    if (classified.requiresClarification) {
      this.setState('AWAITING_CLARIFICATION');
      const clarResult: VoiceCommandResult = {
        id: `cmd_${Date.now()}`,
        sessionId: this.currentSessionId,
        transcript,
        intent: classified,
        status: 'AWAITING_CLARIFICATION',
        responseText: classified.reason || 'Could you please clarify your request?',
        shouldSpeak: this.settings.ttsEnabled,
        timestamp: Date.now(),
      };
      this.recordResult(clarResult);
      await this.respond(clarResult);
      return;
    }

    // Check for high-risk operations requiring user confirmation
    if (classified.riskLevel === 'HIGH' || classified.riskLevel === 'MEDIUM') {
      const confirmation: PendingConfirmation = {
        operationId: `op_${Date.now()}`,
        description: `Execute ${classified.intent} (${classified.reason})`,
        riskLevel: classified.riskLevel,
        intent: classified,
        expiresAt: Date.now() + 30000,
      };

      this.context.pendingConfirmation = confirmation;
      this.setState('AWAITING_CONFIRMATION');

      const confirmResult: VoiceCommandResult = {
        id: `cmd_${Date.now()}`,
        sessionId: this.currentSessionId,
        transcript,
        intent: classified,
        status: 'AWAITING_CONFIRMATION',
        responseText: `This action requires confirmation: ${confirmation.description}. Would you like to proceed? Say "yes" or "confirm" to proceed, or "cancel" to abort.`,
        shouldSpeak: this.settings.ttsEnabled,
        timestamp: Date.now(),
      };
      this.recordResult(confirmResult);
      await this.respond(confirmResult);
      return;
    }

    // Direct execution
    await this.executeClassifiedIntent(classified, transcript);
  }

  // ── Skill Execution & Verification ──────────────────────────────────────────

  private async executeClassifiedIntent(intent: ClassifiedIntent, rawTranscript: string) {
    this.setState('EXECUTING');

    const skill = findSkill(intent);
    if (!skill) {
      const failResult: VoiceCommandResult = {
        id: `cmd_${Date.now()}`,
        sessionId: this.currentSessionId,
        transcript: rawTranscript,
        intent,
        status: 'FAILED',
        responseText: `I'm unable to perform the requested operation: ${intent.intent}.`,
        shouldSpeak: this.settings.ttsEnabled,
        timestamp: Date.now(),
        error: 'No matching skill handler registered',
      };
      this.recordResult(failResult);
      await this.respond(failResult);
      return;
    }

    const execContext: SkillExecutionContext = {
      intent,
      transcript: rawTranscript,
      workspace: this.getWorkspace(),
      allWorkspaces: this.getAllWorkspaces(),
      conversationContext: this.context,
      navigateTo: (wsId, modId) => this.navigateToModule(wsId, modId),
      switchWorkspace: (wsId) => this.switchWorkspaceById(wsId),
      navigateToHub: () => this.returnToHub(),
      navigateBack: () => this.navigateBackAction(),
      navigateForward: () => this.navigateForwardAction(),
      selectTab: (tabId) => this.selectTabAction(tabId),
      toggleDialog: (dialogId, open) => this.toggleDialogAction(dialogId, open),
      addToast: (msg) => this.addToastNotification(msg),
      updateContext: (updates) => {
        this.context = { ...this.context, ...updates };
      },
    };

    let skillRes: SkillResult;
    try {
      skillRes = await skill.handler(execContext);
    } catch (err) {
      skillRes = {
        responseText: 'An error occurred while executing the command.',
        shouldSpeak: this.settings.ttsEnabled,
        status: 'FAILED',
        error: String(err),
      };
    }

    // Verification step
    this.setState('VERIFYING');
    const finalStatus = skillRes.status === 'SUCCEEDED' ? 'SUCCEEDED' : skillRes.status;

    const commandResult: VoiceCommandResult = {
      id: `cmd_${Date.now()}`,
      sessionId: this.currentSessionId,
      transcript: rawTranscript,
      intent,
      status: finalStatus,
      responseText: skillRes.responseText,
      shouldSpeak: this.settings.ttsEnabled && skillRes.shouldSpeak,
      navigatedTo: skillRes.navigatedTo,
      data: skillRes.data,
      timestamp: Date.now(),
      error: skillRes.error,
    };

    this.recordResult(commandResult);
    await this.respond(commandResult);
  }

  private recordResult(res: VoiceCommandResult) {
    this.context.lastResult = res;
    this.context.lastIntent = res.intent.intent;
    this.context.history = [res, ...this.context.history].slice(0, 10);
    this.listeners.onCommandResult(res);
  }

  private async respond(result: VoiceCommandResult) {
    if (result.shouldSpeak && result.responseText && !ttsService.muted) {
      this.setState('SPEAKING');
      try {
        await ttsService.speak(result.responseText);
      } catch (err) {
        console.warn('TTS playback error:', err);
      }
    }

    if (this.state === 'SPEAKING' || this.state === 'EXECUTING' || this.state === 'VERIFYING') {
      this.setState('IDLE');
    }
  }

  // ── Wake Word Engine (Optional) ─────────────────────────────────────────────

  public startWakeWordDetection() {
    if (this.isWakeWordActive || typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const rec: ISpeechRecognition = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: SpeechRecognitionEvent) => {
        if (this.state !== 'IDLE') return; // Don't trigger if already in a session

        const targetPhrase = (this.settings.wakeWordPhrase || 'hey synaptix').toLowerCase();
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          if (transcript.includes(targetPhrase)) {
            // Wake word detected! Trigger full voice command
            this.addToastNotification(`Wake word detected: "${this.settings.wakeWordPhrase}"`);
            this.startVoiceCommand();
            break;
          }
        }
      };

      rec.onend = () => {
        // Auto-restart wake word listening if still enabled
        if (this.isWakeWordActive && this.settings.wakeWordEnabled && this.state === 'IDLE') {
          try {
            this.wakeWordRecognition?.start();
          } catch { /* ignore */ }
        }
      };

      rec.start();
      this.wakeWordRecognition = rec;
      this.isWakeWordActive = true;
    } catch (err) {
      console.warn('Wake word detection could not be initialized:', err);
      this.isWakeWordActive = false;
    }
  }

  public stopWakeWordDetection() {
    if (this.wakeWordRecognition) {
      try {
        this.wakeWordRecognition.stop();
      } catch { /* ignore */ }
      this.wakeWordRecognition = null;
    }
    this.isWakeWordActive = false;
  }
}
