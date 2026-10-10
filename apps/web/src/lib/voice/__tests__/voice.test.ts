/**
 * SYNAPTIX COMMAND — Voice Operations Engine Test Suite
 * Validates deterministic routing, navigation targets, AI fallback,
 * skill execution, post-operation verification, and conversation context.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  normalizePhrase,
  findNavigationTargets,
  NAVIGATION_REGISTRY,
} from '../navigationRegistry';
import { matchDeterministicIntent } from '../intentRouter';
import { classifyWithHeuristics } from '../geminiClassifier';
import { findSkill, SKILL_REGISTRY, SkillExecutionContext } from '../skillRegistry';
import { VoiceEngine } from '../engine';
import { normalizeTranscript } from '../sttService';
import type { WorkspaceItem } from '../../../types/workspace';

const MOCK_FINANCE_WS: WorkspaceItem = {
  id: 'finance',
  name: 'Finance',
  domain: 'Finance',
  description: 'Financial intelligence & modeling',
  iconName: 'TrendingUp',
  documentCount: 128,
  datasetCount: 12,
  dashboardCount: 4,
  pendingActionCount: 2,
  lastActivity: 'Revenue analysis completed',
  lastActivityTime: '5 minutes ago',
  colorAccent: '#1769E0',
  isAuthorized: true,
};

const MOCK_RESEARCH_WS: WorkspaceItem = {
  id: 'research',
  name: 'Research',
  domain: 'Research',
  description: 'Scientific synthesis & paper analysis',
  iconName: 'FlaskConical',
  documentCount: 84,
  datasetCount: 18,
  dashboardCount: 6,
  lastActivity: 'Dataset uploaded',
  lastActivityTime: '20 minutes ago',
  colorAccent: '#2496FF',
  isAuthorized: true,
};

describe('Voice Operations Engine — Navigation Registry', () => {
  it('normalizes phrases correctly by trimming, lowercasing, and stripping punctuation', () => {
    expect(normalizePhrase('  Open   Finance Analytics!  ')).toBe('open finance analytics');
    expect(normalizePhrase('Go to Workspace Hub???')).toBe('go to workspace hub');
  });

  it('matches exact navigation aliases with highest confidence', () => {
    const matches = findNavigationTargets('finance analytics');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].target.key).toBe('finance.analytics');
    expect(matches[0].confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('finds hub navigation aliases', () => {
    const matches = findNavigationTargets('go to hub');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].target.key).toBe('hub');
  });

  it('contains entries for all 5 enterprise workspaces and common modules', () => {
    const keys = NAVIGATION_REGISTRY.map((t) => t.key);
    expect(keys).toContain('hub');
    expect(keys).toContain('finance.overview');
    expect(keys).toContain('finance.analytics');
    expect(keys).toContain('research.overview');
    expect(keys).toContain('healthcare.overview');
    expect(keys).toContain('education.overview');
    expect(keys).toContain('business.overview');
    expect(keys).toContain('current.command');
    expect(keys).toContain('current.dashboards');
  });
});

describe('Voice Operations Engine — Deterministic Router (Pass 1)', () => {
  it('routes fast navigation commands deterministically without LLM', () => {
    const intent = matchDeterministicIntent('finance analytics');
    expect(intent).not.toBeNull();
    expect(intent?.intent).toBe('NAVIGATE');
    expect(intent?.target).toBe('finance.analytics');
    expect(intent?.moduleId).toBe('analytics');
    expect(intent?.workspaceId).toBe('finance');
    expect(intent?.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('routes workspace switch phrases deterministically', () => {
    const intent = matchDeterministicIntent('switch to research workspace');
    expect(intent).not.toBeNull();
    expect(intent?.intent).toBe('WORKSPACE_SWITCH');
    expect(intent?.workspaceId).toBe('research');
  });

  it('routes voice control commands: stop, cancel, mute', () => {
    const stop = matchDeterministicIntent('stop speaking');
    expect(stop?.intent).toBe('VOICE_STOP');

    const cancel = matchDeterministicIntent('cancel command');
    expect(cancel?.intent).toBe('VOICE_CANCEL');

    const mute = matchDeterministicIntent('mute voice');
    expect(mute?.intent).toBe('VOICE_MUTE');
  });

  it('extracts parameters for search commands', () => {
    const search = matchDeterministicIntent('search for quarterly revenue growth');
    expect(search).not.toBeNull();
    expect(search?.intent).toBe('GLOBAL_SEARCH');
    expect(search?.parameters.query).toBe('quarterly revenue growth');
  });

  it('routes workflows and actions listings', () => {
    const wf = matchDeterministicIntent('list workflows');
    expect(wf?.intent).toBe('WORKFLOW_LIST');

    const actions = matchDeterministicIntent('show actions');
    expect(actions?.intent).toBe('ACTION_LIST');
  });

  it('returns null for ambiguous phrases, allowing AI fallback', () => {
    const match = matchDeterministicIntent('what does the latest report say about our cloud budget');
    // Long ambiguous query should fall through to AI
    expect(match).toBeNull();
  });
});

describe('Voice Operations Engine — AI Classifier Fallback (Pass 2)', () => {
  it('classifies organizational Q&A policies using semantic heuristics', () => {
    const classified = classifyWithHeuristics('what is the policy for annual leave approval?');
    expect(classified.intent).toBe('ORGANIZATION_QA');
    expect(classified.riskLevel).toBe('LOW');
  });

  it('classifies financial analytics inquiries', () => {
    const classified = classifyWithHeuristics('analyze our net profit margin and ebitda trend');
    expect(classified.intent).toBe('ANALYTICS_QUERY');
  });

  it('classifies workflow trigger requests with MEDIUM risk level', () => {
    const classified = classifyWithHeuristics('run workflow nightly data ingestion');
    expect(classified.intent).toBe('WORKFLOW_RUN');
    expect(classified.riskLevel).toBe('MEDIUM');
  });

  it('flags ambiguous short phrases as requiring clarification', () => {
    const classified = classifyWithHeuristics('stuff');
    expect(classified.intent).toBe('CLARIFICATION_REQUIRED');
    expect(classified.requiresClarification).toBe(true);
  });
});

describe('Voice Operations Engine — Skill Registry & Verified Execution', () => {
  it('registers all required core enterprise skills', () => {
    const skillIds = SKILL_REGISTRY.map((s) => s.id);
    expect(skillIds).toContain('navigate-hub');
    expect(skillIds).toContain('navigate');
    expect(skillIds).toContain('workspace-switch');
    expect(skillIds).toContain('document-qa');
    expect(skillIds).toContain('analytics-query');
    expect(skillIds).toContain('dashboard-view');
    expect(skillIds).toContain('problem-investigation');
    expect(skillIds).toContain('workflow-list');
    expect(skillIds).toContain('actions-list');
  });

  it('executes navigation skill and verifies target page', async () => {
    const navSkill = findSkill({
      intent: 'NAVIGATE',
      target: 'finance.analytics',
      parameters: {},
      confidence: 1.0,
      requiresClarification: false,
      reason: 'test',
      riskLevel: 'LOW',
    });

    expect(navSkill).not.toBeNull();

    const navigateToMock = vi.fn().mockReturnValue(true);
    const updateContextMock = vi.fn();

    const ctx: SkillExecutionContext = {
      intent: {
        intent: 'NAVIGATE',
        target: 'finance.analytics',
        parameters: {},
        confidence: 1.0,
        requiresClarification: false,
        reason: 'test',
        riskLevel: 'LOW',
      },
      transcript: 'open finance analytics',
      workspace: MOCK_FINANCE_WS,
      allWorkspaces: [MOCK_FINANCE_WS, MOCK_RESEARCH_WS],
      conversationContext: {
        sessionId: 'test-session',
        workspaceId: 'finance',
        moduleId: 'overview',
        lastIntent: null,
        lastResult: null,
        pendingConfirmation: null,
        pendingClarification: null,
        history: [],
      },
      navigateTo: navigateToMock,
      switchWorkspace: vi.fn(),
      navigateToHub: vi.fn(),
      addToast: vi.fn(),
      updateContext: updateContextMock,
    };

    const res = await navSkill!.handler(ctx);
    expect(res.status).toBe('SUCCEEDED');
    expect(navigateToMock).toHaveBeenCalledWith('finance', 'analytics');
    expect(res.responseText).toContain('Finance — Finance — Analytics Engine');
  });

  it('executes workspace switch skill safely with verification', async () => {
    const wsSkill = findSkill({
      intent: 'WORKSPACE_SWITCH',
      workspaceId: 'research',
      parameters: { workspaceId: 'research' },
      confidence: 0.95,
      requiresClarification: false,
      reason: 'test',
      riskLevel: 'LOW',
    });

    expect(wsSkill).not.toBeNull();

    const switchMock = vi.fn().mockReturnValue(true);
    const updateContextMock = vi.fn();

    const ctx: SkillExecutionContext = {
      intent: {
        intent: 'WORKSPACE_SWITCH',
        workspaceId: 'research',
        parameters: { workspaceId: 'research' },
        confidence: 0.95,
        requiresClarification: false,
        reason: 'test',
        riskLevel: 'LOW',
      },
      transcript: 'switch to research',
      workspace: MOCK_FINANCE_WS,
      allWorkspaces: [MOCK_FINANCE_WS, MOCK_RESEARCH_WS],
      conversationContext: {
        sessionId: 'test-session',
        workspaceId: 'finance',
        moduleId: 'overview',
        lastIntent: null,
        lastResult: null,
        pendingConfirmation: null,
        pendingClarification: null,
        history: [],
      },
      navigateTo: vi.fn(),
      switchWorkspace: switchMock,
      navigateToHub: vi.fn(),
      addToast: vi.fn(),
      updateContext: updateContextMock,
    };

    const res = await wsSkill!.handler(ctx);
    expect(res.status).toBe('SUCCEEDED');
    expect(switchMock).toHaveBeenCalledWith('research');
    expect(res.responseText).toContain('Research workspace');
  });
});

describe('Voice Operations Engine — Lifecycle & Context', () => {
  it('normalizes speech transcripts properly', () => {
    expect(normalizeTranscript('  open finance analytics. ')).toBe('Open finance analytics');
  });

  it('manages engine lifecycle states and listeners', async () => {
    const stateTransitions: string[] = [];

    const engine = new VoiceEngine({
      onStateChange: (state) => stateTransitions.push(state),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: vi.fn(),
      onError: vi.fn(),
    });

    const navigateToMock = vi.fn().mockReturnValue(true);

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS, MOCK_RESEARCH_WS],
      navigateToModule: navigateToMock,
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      addToastNotification: vi.fn(),
    });

    // Simulate transcript execution
    await engine.handleTranscript('go to finance analytics');

    expect(navigateToMock).toHaveBeenCalled();
    const ctx = engine.getContext();
    expect(ctx.lastIntent).toBe('NAVIGATE');
    expect(ctx.history.length).toBe(1);
    expect(ctx.history[0].status).toBe('SUCCEEDED');
    expect(ctx.history[0].navigatedTo).toContain('finance.analytics');
  });

  it('handles automatic speech end finalization and stops safely', async () => {
    const results: any[] = [];
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    const switchWsMock = vi.fn().mockReturnValue(true);
    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS, MOCK_RESEARCH_WS],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: switchWsMock,
      returnToHub: vi.fn(),
      addToastNotification: vi.fn(),
    });

    // Handle incoming finalized speech
    await engine.handleTranscript('switch to research workspace');

    expect(switchWsMock).toHaveBeenCalledWith('research');
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('SUCCEEDED');
    expect(results[0].intent.intent).toBe('WORKSPACE_SWITCH');
  });

  it('executes home navigation deterministically', async () => {
    const results: any[] = [];
    const returnToHubMock = vi.fn();
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: returnToHubMock,
      addToastNotification: vi.fn(),
    });

    await engine.handleTranscript('take me back to the homepage');
    expect(returnToHubMock).toHaveBeenCalled();
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('SUCCEEDED');
    expect(results[0].intent.intent).toBe('NAVIGATE_HOME');
  });

  it('executes history back and forward commands', async () => {
    const results: any[] = [];
    const backMock = vi.fn().mockReturnValue(true);
    const forwardMock = vi.fn().mockReturnValue(true);
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      navigateBack: backMock,
      navigateForward: forwardMock,
      addToastNotification: vi.fn(),
    });

    await engine.handleTranscript('go back to the previous page');
    expect(backMock).toHaveBeenCalled();
    expect(results[0].intent.intent).toBe('NAVIGATE_BACK');

    await engine.handleTranscript('go forward');
    expect(forwardMock).toHaveBeenCalled();
    expect(results[1].intent.intent).toBe('NAVIGATE_FORWARD');
  });

  it('executes tab switching for ordinal and named tab requests', async () => {
    const results: any[] = [];
    const selectTabMock = vi.fn().mockReturnValue(true);
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      selectTab: selectTabMock,
      addToastNotification: vi.fn(),
    });

    // Set module context to analytics
    engine.updateContext({ moduleId: 'analytics' });

    await engine.handleTranscript('open the second tab');
    expect(selectTabMock).toHaveBeenCalledWith('trends');
    expect(results[0].status).toBe('SUCCEEDED');

    await engine.handleTranscript('switch to anomalies tab');
    expect(selectTabMock).toHaveBeenCalledWith('anomalies');
    expect(results[1].status).toBe('SUCCEEDED');
  });

  it('executes dialog open and close commands', async () => {
    const results: any[] = [];
    const dialogMock = vi.fn().mockReturnValue(true);
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      toggleDialog: dialogMock,
      addToastNotification: vi.fn(),
    });

    await engine.handleTranscript('open search modal');
    expect(dialogMock).toHaveBeenCalledWith('search_modal', true);
    expect(results[0].intent.intent).toBe('OPEN_DIALOG');

    await engine.handleTranscript('close modal');
    expect(dialogMock).toHaveBeenCalledWith('search_modal', false);
    expect(results[1].intent.intent).toBe('CLOSE_DIALOG');
  });

  it('reads page summaries accurately according to current context', async () => {
    const results: any[] = [];
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      addToastNotification: vi.fn(),
    });

    engine.updateContext({ moduleId: 'analytics' });

    await engine.handleTranscript('summarize this page');
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('SUCCEEDED');
    expect(results[0].responseText).toContain('Analytics Engine');
  });

  it('handles capability discovery across workspaces', async () => {
    const results: any[] = [];
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS, MOCK_RESEARCH_WS],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      addToastNotification: vi.fn(),
    });

    await engine.handleTranscript('what can i do in Finance?');
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('SUCCEEDED');
    expect(results[0].intent.intent).toBe('CAPABILITY_DISCOVERY');
    expect(results[0].responseText).toContain('Finance');
  });

  it('executes cross-workspace comparison between authorized workspaces', async () => {
    const results: any[] = [];
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS, MOCK_RESEARCH_WS, { ...MOCK_FINANCE_WS, id: 'business', name: 'Business Strategy', isAuthorized: true }],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      addToastNotification: vi.fn(),
    });

    await engine.handleTranscript('Compare Finance and Business metrics for the selected period');
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('SUCCEEDED');
    expect(results[0].intent.intent).toBe('CROSS_WORKSPACE_COMPARE');
    expect(results[0].responseText).toContain('FINANCE');
    expect(results[0].responseText).toContain('BUSINESS');
    expect(results[0].responseText).toContain('Provenance: Verified across 2 authorized domain boundaries');
  });

  it('rejects cross-workspace comparison if any target workspace is unauthorized', async () => {
    const results: any[] = [];
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    // Business workspace is marked unauthorized
    const unauthorizedBusiness: WorkspaceItem = {
      ...MOCK_FINANCE_WS,
      id: 'business',
      name: 'Business Strategy',
      isAuthorized: false,
    };

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [MOCK_FINANCE_WS, unauthorizedBusiness],
      navigateToModule: vi.fn().mockReturnValue(true),
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      addToastNotification: vi.fn(),
    });

    await engine.handleTranscript('Compare Finance and Business metrics');
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('FAILED');
    expect(results[0].responseText).toContain('Access denied for cross-workspace comparison');
    expect(results[0].responseText).toContain('business');
  });

  it('resolves compound cross-workspace queries correctly', async () => {
    const results: any[] = [];
    const navMock = vi.fn().mockReturnValue(true);
    const engine = new VoiceEngine({
      onStateChange: vi.fn(),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onCommandResult: (res) => results.push(res),
      onError: vi.fn(),
    });

    engine.setBindings({
      getWorkspace: () => MOCK_FINANCE_WS,
      getAllWorkspaces: () => [
        MOCK_FINANCE_WS,
        MOCK_RESEARCH_WS,
        { ...MOCK_FINANCE_WS, id: 'healthcare', name: 'Healthcare', isAuthorized: true },
        { ...MOCK_FINANCE_WS, id: 'education', name: 'Education', isAuthorized: true },
        { ...MOCK_FINANCE_WS, id: 'business', name: 'Business Strategy', isAuthorized: true },
        { ...MOCK_FINANCE_WS, id: 'operations', name: 'Custom Operations', isAuthorized: true },
      ],
      navigateToModule: navMock,
      switchWorkspaceById: vi.fn().mockReturnValue(true),
      returnToHub: vi.fn(),
      addToastNotification: vi.fn(),
    });

    // "Open Finance and show the annual revenue analysis"
    await engine.handleTranscript('Open Finance and show the annual revenue analysis');
    expect(navMock).toHaveBeenCalledWith('finance', 'analytics');

    // "Go to Education and show the available analytics"
    await engine.handleTranscript('Go to Education and show the available analytics');
    expect(navMock).toHaveBeenCalledWith('education', 'analytics');

    // "Open Business and investigate the largest operational issue"
    await engine.handleTranscript('Open Business and investigate the largest operational issue');
    expect(navMock).toHaveBeenCalledWith('business', 'problems');

    // "Switch to Custom Operations and show the available workflows"
    await engine.handleTranscript('Switch to Custom Operations and show the available workflows');
    expect(navMock).toHaveBeenCalledWith('operations', 'workflows');
  });
});

