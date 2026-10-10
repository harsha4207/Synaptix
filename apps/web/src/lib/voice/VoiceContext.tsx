/**
 * Voice Command React Context & Provider
 * Supplies the voice engine state, shortcut listeners, and control methods across SYNAPTIX COMMAND.
 */

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { VoiceEngine } from './engine';
import { ttsService } from './ttsService';
import type {
  VoiceSessionState,
  VoiceCommandResult,
  VoiceSettings,
} from './types';
import { DEFAULT_VOICE_SETTINGS } from './types';
import type { WorkspaceItem } from '../../types/workspace';
import type { WorkspaceModuleId } from '../../design-system/components/Sidebar';

export interface VoiceContextValue {
  sessionState: VoiceSessionState;
  interimTranscript: string;
  finalTranscript: string;
  lastResult: VoiceCommandResult | null;
  history: VoiceCommandResult[];
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  settings: VoiceSettings;
  isHudVisible: boolean;
  setHudVisible: (visible: boolean) => void;
  startVoiceCommand: () => void;
  stopVoiceCapture: () => void;
  cancelVoice: () => void;
  stopAudioPlayback: () => void;
  toggleMute: () => void;
  executeDirectText: (text: string) => Promise<void>;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export interface VoiceProviderProps {
  currentWorkspace: WorkspaceItem | null;
  allWorkspaces: WorkspaceItem[];
  currentModule?: WorkspaceModuleId | null;
  currentTab?: string | null;
  onNavigateToModule: (workspaceId: string | undefined, moduleId: WorkspaceModuleId) => boolean;
  onSelectWorkspace: (workspaceId: string) => boolean;
  onBackToHub: () => void;
  onNavigateBack?: () => boolean;
  onNavigateForward?: () => boolean;
  onSelectTab?: (tabId: string) => boolean;
  onToggleDialog?: (dialogId: string, open: boolean) => boolean;
  onAddToast: (message: string) => void;
  children: React.ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({
  currentWorkspace,
  allWorkspaces,
  currentModule,
  currentTab,
  onNavigateToModule,
  onSelectWorkspace,
  onBackToHub,
  onNavigateBack,
  onNavigateForward,
  onSelectTab,
  onToggleDialog,
  onAddToast,
  children,
}) => {
  const [sessionState, setSessionState] = useState<VoiceSessionState>('IDLE');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null);
  const [history, setHistory] = useState<VoiceCommandResult[]>([]);
  const [isMuted, setIsMuted] = useState(ttsService.muted);
  const [isHudVisible, setHudVisible] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);

  // Keep engine ref
  const engineRef = useRef<VoiceEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new VoiceEngine({
      onStateChange: (state) => {
        setSessionState(state);
        // Automatically reveal HUD when listening or executing
        if (state === 'LISTENING' || state === 'PROCESSING_TRANSCRIPT' || state === 'EXECUTING' || state === 'AWAITING_CONFIRMATION' || state === 'AWAITING_CLARIFICATION') {
          setHudVisible(true);
        }
      },
      onInterimTranscript: (text) => setInterimTranscript(text),
      onFinalTranscript: (text) => setFinalTranscript(text),
      onCommandResult: (result) => {
        setLastResult(result);
        setHistory((prev) => [result, ...prev].slice(0, 10));

        // Automatically close compact floating panel on successful navigation/tab/dialog operations
        if (
          result.status === 'SUCCEEDED' &&
          (result.navigatedTo ||
            result.intent.intent === 'NAVIGATE' ||
            result.intent.intent === 'NAVIGATE_HOME' ||
            result.intent.intent === 'NAVIGATE_BACK' ||
            result.intent.intent === 'NAVIGATE_FORWARD' ||
            result.intent.intent === 'SWITCH_WORKSPACE' ||
            result.intent.intent === 'OPEN_TAB' ||
            result.intent.intent === 'CLOSE_TAB' ||
            result.intent.intent === 'OPEN_DIALOG' ||
            result.intent.intent === 'CLOSE_DIALOG' ||
            result.intent.intent === 'VOICE_STOP' ||
            result.intent.intent === 'VOICE_CANCEL')
        ) {
          setTimeout(() => {
            setHudVisible(false);
          }, 600);
        }
      },
      onError: (err) => {
        onAddToast(`Voice Assistant: ${err}`);
      },
    });
  }

  // Update bindings whenever props change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setBindings({
        getWorkspace: () => currentWorkspace,
        getAllWorkspaces: () => allWorkspaces,
        navigateToModule: onNavigateToModule,
        switchWorkspaceById: onSelectWorkspace,
        returnToHub: onBackToHub,
        navigateBack: onNavigateBack,
        navigateForward: onNavigateForward,
        selectTab: onSelectTab,
        toggleDialog: onToggleDialog,
        addToastNotification: onAddToast,
      });

      // Update active module in engine conversation context
      if (currentModule) {
        engineRef.current.getContext().moduleId = currentModule;
      }
    }
  }, [
    currentWorkspace,
    allWorkspaces,
    currentModule,
    currentTab,
    onNavigateToModule,
    onSelectWorkspace,
    onBackToHub,
    onNavigateBack,
    onNavigateForward,
    onSelectTab,
    onToggleDialog,
    onAddToast,
  ]);

  // Global Keyboard Shortcut: Ctrl + Shift + Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+Space or Meta(Cmd)+Shift+Space
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        e.stopPropagation();
        if (engineRef.current) {
          setHudVisible(true);
          engineRef.current.startVoiceCommand();
        }
      }

      // Escape to cancel/dismiss HUD if active
      if (e.key === 'Escape' && isHudVisible) {
        if (sessionState === 'LISTENING') {
          engineRef.current?.cancelVoice();
        }
        setHudVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isHudVisible, sessionState]);

  const startVoiceCommand = () => {
    setHudVisible(true);
    engineRef.current?.startVoiceCommand();
  };

  const stopVoiceCapture = () => {
    engineRef.current?.stopVoiceCapture();
  };

  const cancelVoice = () => {
    engineRef.current?.cancelVoice();
    setHudVisible(false);
  };

  const stopAudioPlayback = () => {
    engineRef.current?.stopAudioPlayback();
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    ttsService.setMuted(next);
    onAddToast(next ? 'Voice output muted' : 'Voice output enabled');
  };

  const executeDirectText = async (text: string) => {
    setHudVisible(true);
    setFinalTranscript(text);
    await engineRef.current?.handleTranscript(text);
  };

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      engineRef.current?.updateSettings(merged);
      return merged;
    });
  };

  const value = useMemo<VoiceContextValue>(
    () => ({
      sessionState,
      interimTranscript,
      finalTranscript,
      lastResult,
      history,
      isListening: sessionState === 'LISTENING',
      isSpeaking: sessionState === 'SPEAKING',
      isMuted,
      settings,
      isHudVisible,
      setHudVisible,
      startVoiceCommand,
      stopVoiceCapture,
      cancelVoice,
      stopAudioPlayback,
      toggleMute,
      executeDirectText,
      updateSettings,
    }),
    [
      sessionState,
      interimTranscript,
      finalTranscript,
      lastResult,
      history,
      isMuted,
      settings,
      isHudVisible,
    ]
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

export const useVoiceCommand = (): VoiceContextValue => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceCommand must be used within a VoiceProvider');
  }
  return context;
};
