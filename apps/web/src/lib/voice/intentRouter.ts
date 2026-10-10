import type { ClassifiedIntent, VoiceConversationContext, VoiceIntent } from './types';
import { normalizePhrase, findNavigationTargets, findTabTarget } from './navigationRegistry';

// ── Command Pattern Definitions ───────────────────────────────────────────────

interface CommandPattern {
  intent: VoiceIntent;
  /** Exact normalized phrases to match (token-aware) */
  exactPhrases?: string[];
  /** Patterns that the normalized transcript must start with */
  startsWith?: string[];
  /** Patterns that the normalized transcript must include */
  includes?: string[];
  /** Minimum confidence when matched */
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Optional parameter extractor */
  extractParams?: (transcript: string) => Record<string, string>;
}

const COMMAND_PATTERNS: CommandPattern[] = [
  // ── Home navigation ───────────────────────────────────────────────────────
  {
    intent: 'NAVIGATE_HOME',
    exactPhrases: [
      'go home', 'home', 'take me home', 'take me back to the homepage',
      'return to the workspace hub', 'back to hub', 'workspace hub',
      'return to homepage', 'back to home', 'return home', 'go to homepage',
      'take me to hub', 'main hub', 'hub page',
    ],
    confidence: 0.98,
    riskLevel: 'LOW',
  },

  // ── History navigation ────────────────────────────────────────────────────
  {
    intent: 'NAVIGATE_BACK',
    exactPhrases: [
      'go back', 'back', 'previous page', 'return to previous page',
      'go back to where i was', 'return to the previous page', 'previous view',
      'back to previous', 'go back to the last page', 'return to last page',
      'last page', 'go back one page', 'go back to the previous page',
      'go back to previous page', 'back to previous page',
    ],
    startsWith: ['go back', 'return to previous', 'return to the previous', 'take me back'],
    confidence: 0.98,
    riskLevel: 'LOW',
  },
  {
    intent: 'NAVIGATE_FORWARD',
    exactPhrases: [
      'go forward', 'forward', 'forward page', 'next page in history',
      'move forward', 'return forward', 'go to forward page',
    ],
    startsWith: ['go forward', 'move forward'],
    confidence: 0.98,
    riskLevel: 'LOW',
  },

  // ── Dialog control commands ───────────────────────────────────────────────
  {
    intent: 'OPEN_DIALOG',
    exactPhrases: [
      'open search', 'open global search', 'open search modal', 'quick search',
      'find in all workspaces', 'open cmd k', 'open command k', 'search modal',
      'open the search modal', 'launch search modal',
    ],
    confidence: 0.95,
    riskLevel: 'LOW',
    extractParams: () => ({ dialogId: 'search_modal' }),
  },
  {
    intent: 'CLOSE_DIALOG',
    exactPhrases: [
      'close dialog', 'close modal', 'close search', 'dismiss modal',
      'dismiss dialog', 'close popup', 'exit dialog', 'close search modal',
      'close this dialog', 'close this modal', 'dismiss popup',
    ],
    confidence: 0.95,
    riskLevel: 'LOW',
  },

  // ── Page summary / Reading ────────────────────────────────────────────────
  {
    intent: 'READ_PAGE_SUMMARY',
    exactPhrases: [
      'read page summary', 'summarize this page', 'what is on this page',
      'summarize page', 'page summary', 'tell me about this page',
      'what does this page show', 'read summary', 'give me a summary of this page',
      'read the summary on this page', 'summarize the page',
    ],
    startsWith: ['read the summary', 'summarize this page', 'what is on this page'],
    confidence: 0.92,
    riskLevel: 'LOW',
  },

  // ── Voice control commands ───────────────────────────────────────────────
  {
    intent: 'VOICE_STOP',
    exactPhrases: [
      'stop', 'stop speaking', 'stop voice', 'be quiet', 'silence',
      'stop talking', 'enough', 'stop audio', 'pause audio',
    ],
    confidence: 0.98,
    riskLevel: 'LOW',
  },
  {
    intent: 'VOICE_CANCEL',
    exactPhrases: [
      'cancel', 'cancel that', 'never mind', 'forget it', 'discard',
      'abort', 'cancel command', 'stop listening', 'go away',
    ],
    confidence: 0.97,
    riskLevel: 'LOW',
  },
  {
    intent: 'VOICE_MUTE',
    exactPhrases: ['mute', 'mute voice', 'disable voice', 'turn off voice', 'silence responses'],
    confidence: 0.97,
    riskLevel: 'LOW',
  },

  // ── Search commands ──────────────────────────────────────────────────────
  {
    intent: 'GLOBAL_SEARCH',
    startsWith: ['search for ', 'find ', 'look up ', 'look for ', 'search '],
    confidence: 0.90,
    riskLevel: 'LOW',
    extractParams: (t) => ({ query: t.replace(/^(search for|find|look up|look for|search)\s+/i, '').trim() }),
  },
  {
    intent: 'DOCUMENT_SEARCH',
    startsWith: ['find document ', 'search document', 'find my document', 'search my files'],
    includes: ['in documents', 'in my files', 'in the documents'],
    confidence: 0.90,
    riskLevel: 'LOW',
    extractParams: (t) => ({ query: t.replace(/^(find|search)\s+(document|file|my|for|in)\s*/i, '').trim() }),
  },
  {
    intent: 'DOCUMENT_SUMMARY',
    startsWith: ['summarize document ', 'summarise document ', 'give me a summary of the document '],
    includes: ['document summary', 'summary of document'],
    confidence: 0.88,
    riskLevel: 'LOW',
    extractParams: (t) => ({ subject: t.replace(/^(summarize|summarise|give me a summary of|read|what does)\s+/i, '').trim() }),
  },

  // ── Organization Q&A ─────────────────────────────────────────────────────
  {
    intent: 'ORGANIZATION_QA',
    startsWith: ['what is our ', 'what are our ', 'tell me about ', 'explain ', 'what is the policy'],
    includes: ['policy', 'procedure', 'sop', 'standard operating', 'leave policy', 'approval policy'],
    confidence: 0.85,
    riskLevel: 'LOW',
    extractParams: (t) => ({ question: t }),
  },

  // ── Capability Discovery ──────────────────────────────────────────────────
  {
    intent: 'CAPABILITY_DISCOVERY',
    startsWith: [
      'what can i do in ', 'what can i do here', 'which operations are supported',
      'what operations are supported', 'what capabilities are available',
      'show capabilities', 'list capabilities', 'what tabs are available',
      'which workflows can i run', 'why cant i perform this action',
      'why cannot i perform this action', 'which capabilities are unavailable',
      'show me all available actions in this workspace', 'what features are available',
      'can you create dashboards in this workspace', 'what can we do in ',
      'what operations are available', 'list operations',
    ],
    includes: ['capabilities', 'what can i do', 'operations are supported'],
    confidence: 0.94,
    riskLevel: 'LOW',
    extractParams: (t) => {
      const lower = t.toLowerCase();
      let targetWs: string | undefined = undefined;
      for (const ws of ['finance', 'research', 'healthcare', 'education', 'business', 'operations']) {
        if (lower.includes(ws)) {
          targetWs = ws;
          break;
        }
      }
      return { targetWorkspaceId: targetWs || '' };
    },
  },

  // ── Cross Workspace Compare ───────────────────────────────────────────────
  {
    intent: 'CROSS_WORKSPACE_COMPARE',
    startsWith: ['compare ', 'cross workspace comparison', 'cross-workspace comparison', 'compare metrics'],
    confidence: 0.95,
    riskLevel: 'LOW',
    extractParams: (t) => {
      const lower = t.toLowerCase();
      const detectedWorkspaces: string[] = [];
      for (const ws of ['finance', 'research', 'healthcare', 'education', 'business', 'operations']) {
        if (lower.includes(ws)) {
          detectedWorkspaces.push(ws);
        }
      }
      return {
        workspaces: JSON.stringify(detectedWorkspaces.length > 0 ? detectedWorkspaces : ['finance', 'business']),
        metric: lower.includes('revenue') ? 'Revenue & Margins' : 'Operational Metrics',
      };
    },
  },

  // ── Analytics ────────────────────────────────────────────────────────────
  {
    intent: 'ANALYTICS_QUERY',
    startsWith: ['show me analytics for ', 'analyze ', 'analyse ', 'what was ', 'how much '],
    includes: ['revenue', 'expenses', 'budget', 'profit', 'margin', 'growth', 'trend', 'metrics'],
    confidence: 0.87,
    riskLevel: 'LOW',
    extractParams: (t) => ({ query: t }),
  },

  // ── Workflow commands ─────────────────────────────────────────────────────
  {
    intent: 'WORKFLOW_LIST',
    exactPhrases: ['list workflows', 'show workflows', 'my workflows', 'all workflows', 'workflow list'],
    startsWith: ['show me the workflow', 'list all workflow', 'what workflows'],
    confidence: 0.92,
    riskLevel: 'LOW',
  },
  {
    intent: 'WORKFLOW_RUN',
    startsWith: ['run workflow', 'start workflow', 'execute workflow', 'run the workflow'],
    includes: ['workflow'],
    confidence: 0.85,
    riskLevel: 'MEDIUM',
    extractParams: (t) => ({ workflowName: t.replace(/^(run|start|execute)\s+(the\s+)?workflow\s*/i, '').trim() }),
  },

  // ── Action commands ───────────────────────────────────────────────────────
  {
    intent: 'ACTION_LIST',
    exactPhrases: ['show actions', 'list actions', 'my actions', 'pending actions', 'pending approvals'],
    startsWith: ['show me the actions', 'what actions', 'all actions'],
    confidence: 0.92,
    riskLevel: 'LOW',
  },

  // ── Problem investigation ─────────────────────────────────────────────────
  {
    intent: 'PROBLEM_INVESTIGATION',
    exactPhrases: ['show problems', 'list problems', 'what problems', 'current issues'],
    startsWith: ['investigate ', 'check the anomaly', 'look at the problem', 'what is causing'],
    includes: ['anomaly', 'anomalies', 'problem', 'issue', 'incident'],
    confidence: 0.85,
    riskLevel: 'LOW',
    extractParams: (t) => ({ query: t }),
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    intent: 'DASHBOARD_VIEW',
    exactPhrases: ['show dashboards', 'open dashboards', 'my dashboards', 'view dashboards'],
    startsWith: ['show me the dashboard', 'open the dashboard', 'view my dashboard'],
    confidence: 0.90,
    riskLevel: 'LOW',
  },

  // ── General query ─────────────────────────────────────────────────────────
  {
    intent: 'CONVERSATION_QUERY',
    startsWith: ['what is ', 'how do ', 'can you ', 'please ', 'help me ', 'i need to '],
    confidence: 0.65,
    riskLevel: 'LOW',
    extractParams: (t) => ({ question: t }),
  },
];

// ── Deterministic Router ──────────────────────────────────────────────────────

/**
 * Pass 1: Deterministic command matching with contextual resolution.
 * Returns null if no high-confidence match found (fall through to AI).
 */
export function matchDeterministicIntent(
  rawTranscript: string,
  context?: VoiceConversationContext
): ClassifiedIntent | null {
  const normalized = normalizePhrase(rawTranscript);

  // 0. Compound cross-workspace navigation phrases: "Open X and show/investigate Y"
  const compoundMatch = matchCompoundCrossWorkspaceIntent(normalized);
  if (compoundMatch) return compoundMatch;

  // 1. Check direct command patterns (Home, Back, Forward, Dialogs, Voice Controls, Capability Discovery, Compare, etc.)
  for (const pattern of COMMAND_PATTERNS) {
    let matched = false;

    if (pattern.exactPhrases) {
      for (const phrase of pattern.exactPhrases) {
        if (normalizePhrase(phrase) === normalized) {
          matched = true;
          break;
        }
      }
    }

    if (!matched && pattern.startsWith) {
      for (const prefix of pattern.startsWith) {
        const normalizedPrefix = normalizePhrase(prefix);
        if (normalized.startsWith(normalizedPrefix)) {
          matched = true;
          break;
        }
      }
    }

    if (!matched && pattern.includes) {
      const matchedAll = pattern.includes.every((phrase) =>
        normalized.includes(normalizePhrase(phrase))
      );
      if (matchedAll) matched = true;
    }

    if (matched && pattern.confidence >= 0.80) {
      const params = pattern.extractParams ? pattern.extractParams(rawTranscript) : {};
      
      // Special workspace context resolution for Capability Discovery
      let workspaceId = params.targetWorkspaceId || context?.workspaceId;
      if (pattern.intent === 'CAPABILITY_DISCOVERY' && !workspaceId) {
        workspaceId = 'global';
      }

      return {
        intent: pattern.intent,
        workspaceId: workspaceId || undefined,
        parameters: params,
        confidence: pattern.confidence,
        requiresClarification: false,
        reason: `Deterministic pattern match for intent ${pattern.intent}`,
        riskLevel: pattern.riskLevel,
      };
    }
  }

  // 2. Tab switching check (e.g. "open the second tab", "switch to trends tab", "anomalies tab")
  if (
    normalized.includes('tab') ||
    normalized.startsWith('switch to ') ||
    normalized.startsWith('open ') ||
    normalized.startsWith('show ')
  ) {
    const tabMatch = findTabTarget(context?.moduleId, normalized);
    if (tabMatch && tabMatch.confidence >= 0.85) {
      return {
        intent: 'OPEN_TAB',
        moduleId: tabMatch.tab.moduleId,
        tabId: tabMatch.tab.id,
        parameters: { tabId: tabMatch.tab.id, tabLabel: tabMatch.tab.label },
        confidence: tabMatch.confidence,
        requiresClarification: false,
        reason: `Matched tab "${tabMatch.tab.label}" for module ${tabMatch.tab.moduleId}`,
        riskLevel: 'LOW',
      };
    }
  }

  // 3. Workspace switch patterns: "switch to finance", "go to research workspace"
  const wsSwitchMatch = matchWorkspaceSwitch(normalized);
  if (wsSwitchMatch) return wsSwitchMatch;

  // 4. Navigation targets (module navigation & workspace pages)
  const navMatches = findNavigationTargets(normalized);
  if (navMatches.length > 0 && navMatches[0].confidence >= 0.7) {
    const { target, confidence } = navMatches[0];
    const resolvedWs = target.workspaceId || context?.workspaceId || undefined;
    return {
      intent: 'NAVIGATE',
      target: target.key,
      workspaceId: resolvedWs,
      moduleId: target.moduleId,
      parameters: {},
      confidence,
      requiresClarification: false,
      reason: `Matched navigation alias for "${target.label}"`,
      riskLevel: 'LOW',
    };
  }

  // No high-confidence deterministic match
  return null;
}

function matchCompoundCrossWorkspaceIntent(normalized: string): ClassifiedIntent | null {
  const wsMap: Record<string, string> = {
    finance: 'finance',
    research: 'research',
    healthcare: 'healthcare',
    education: 'education',
    business: 'business',
    'custom operations': 'operations',
    operations: 'operations',
  };

  for (const [wsKey, wsId] of Object.entries(wsMap)) {
    if (normalized.includes(wsKey)) {
      if (normalized.includes('revenue analysis') || normalized.includes('revenue') || normalized.includes('analytics')) {
        return {
          intent: 'NAVIGATE',
          target: `${wsId}.analytics`,
          workspaceId: wsId,
          moduleId: 'analytics',
          parameters: { focus: 'revenue' },
          confidence: 0.95,
          requiresClarification: false,
          reason: `Compound intent to view ${wsId} analytics`,
          riskLevel: 'LOW',
        };
      }
      if (normalized.includes('summarize') && normalized.includes('research document')) {
        return {
          intent: 'DOCUMENT_SUMMARY',
          workspaceId: wsId,
          moduleId: 'documents',
          parameters: { subject: 'latest indexed research document' },
          confidence: 0.95,
          requiresClarification: false,
          reason: `Compound intent to summarize ${wsId} document`,
          riskLevel: 'LOW',
        };
      }
      if (normalized.includes('policy') || normalized.includes('uploaded policy')) {
        return {
          intent: 'DOCUMENT_SEARCH',
          workspaceId: wsId,
          moduleId: 'documents',
          parameters: { query: 'uploaded policy' },
          confidence: 0.95,
          requiresClarification: false,
          reason: `Compound intent to search policy in ${wsId}`,
          riskLevel: 'LOW',
        };
      }
      if (normalized.includes('investigate') || normalized.includes('largest operational issue') || normalized.includes('issue') || normalized.includes('problem')) {
        return {
          intent: 'NAVIGATE',
          target: `${wsId}.problems`,
          workspaceId: wsId,
          moduleId: 'problems',
          parameters: { focus: 'largest_issue' },
          confidence: 0.95,
          requiresClarification: false,
          reason: `Compound intent to investigate issues in ${wsId}`,
          riskLevel: 'LOW',
        };
      }
      if (normalized.includes('workflows') || normalized.includes('workflow')) {
        return {
          intent: 'NAVIGATE',
          target: `${wsId}.workflows`,
          workspaceId: wsId,
          moduleId: 'workflows',
          parameters: {},
          confidence: 0.95,
          requiresClarification: false,
          reason: `Compound intent to show workflows in ${wsId}`,
          riskLevel: 'LOW',
        };
      }
    }
  }

  // Cross-workspace policy search: "Search all workspaces I am authorized to access for this policy"
  if (normalized.includes('search all workspaces') || (normalized.includes('all workspaces') && normalized.includes('policy'))) {
    return {
      intent: 'GLOBAL_SEARCH',
      parameters: { query: 'policy', crossWorkspace: 'true' },
      confidence: 0.95,
      requiresClarification: false,
      reason: 'Cross-workspace document search query',
      riskLevel: 'LOW',
    };
  }

  return null;
}

function matchWorkspaceSwitch(normalized: string): ClassifiedIntent | null {
  const WORKSPACE_PATTERNS: { ids: string[]; phrases: string[] }[] = [
    { ids: ['finance'], phrases: ['finance', 'financial'] },
    { ids: ['research'], phrases: ['research', 'science', 'lab'] },
    { ids: ['healthcare'], phrases: ['healthcare', 'health care', 'clinical', 'medical', 'hospital'] },
    { ids: ['education'], phrases: ['education', 'learning', 'academic', 'school', 'university'] },
    { ids: ['business'], phrases: ['business', 'strategy', 'business strategy'] },
    { ids: ['operations'], phrases: ['operations', 'custom operations', 'ops', 'logistics'] },
  ];

  const SWITCH_PREFIXES = [
    'switch to ', 'change to ', 'go to ', 'open ', 'switch workspace to ',
    'change workspace to ', 'navigate to ', 'take me to ', 'go inside ',
  ];

  for (const pattern of WORKSPACE_PATTERNS) {
    for (const prefix of SWITCH_PREFIXES) {
      for (const phrase of pattern.phrases) {
        if (normalized === `${prefix}${phrase}` || normalized === `${prefix}${phrase} workspace`) {
          return {
            intent: 'WORKSPACE_SWITCH',
            workspaceId: pattern.ids[0],
            parameters: { workspaceId: pattern.ids[0] },
            confidence: 0.95,
            requiresClarification: false,
            reason: `Workspace switch to ${pattern.ids[0]}`,
            riskLevel: 'LOW',
          };
        }
      }
    }
  }

  return null;
}

