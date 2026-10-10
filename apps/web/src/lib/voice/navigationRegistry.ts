/**
 * Navigation Target Registry
 * Registers all real application routes and their voice aliases.
 * Based on actual WorkspaceModuleId values and workspace IDs from mockWorkspaces.ts
 */

import type { NavigationTarget, PageTabTarget, DialogTarget } from './types';

/** 
 * All real workspace module IDs from Sidebar.tsx:
 * 'overview' | 'search' | 'command' | 'knowledge' | 'documents' |
 * 'analytics' | 'dashboards' | 'problems' | 'workflows' | 'actions' |
 * 'evidence' | 'audit' | 'settings'
 *
 * Real workspace IDs from mockWorkspaces.ts:
 * 'finance' | 'research' | 'healthcare' | 'education' | 'business'
 */

export const NAVIGATION_REGISTRY: NavigationTarget[] = [
  // ── Global / Hub ─────────────────────────────────────────────────────────────
  {
    key: 'hub',
    label: 'Workspace Hub',
    moduleId: 'overview',
    requiresWorkspace: false,
    description: 'Return to the workspace hub home page',
    aliases: [
      'home', 'hub', 'workspace hub', 'go home', 'go to hub', 'back to hub',
      'my workspaces', 'workspace list', 'main hub', 'landing',
    ],
  },

  // ── Workspace: Finance ────────────────────────────────────────────────────────
  {
    key: 'finance.overview',
    label: 'Finance — Overview',
    moduleId: 'overview',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance workspace overview',
    aliases: [
      'finance', 'finance workspace', 'open finance', 'go to finance',
      'finance overview', 'finance home',
    ],
  },
  {
    key: 'finance.command',
    label: 'Finance — Command Center',
    moduleId: 'command',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance command center for AI queries',
    aliases: [
      'finance command', 'finance command center', 'command center finance',
      'finance ai', 'finance query',
    ],
  },
  {
    key: 'finance.analytics',
    label: 'Finance — Analytics Engine',
    moduleId: 'analytics',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance analytics and reporting',
    aliases: [
      'finance analytics', 'financial analytics', 'finance analysis',
      'go to finance analytics', 'open finance analytics',
      'finance revenue', 'finance reports',
    ],
  },
  {
    key: 'finance.documents',
    label: 'Finance — Documents & Data',
    moduleId: 'documents',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance documents and uploaded data',
    aliases: [
      'finance documents', 'finance files', 'financial documents',
      'finance data', 'finance uploads',
    ],
  },
  {
    key: 'finance.dashboards',
    label: 'Finance — Dashboards',
    moduleId: 'dashboards',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance dashboards and charts',
    aliases: [
      'finance dashboards', 'financial dashboards', 'finance charts',
      'finance dashboard', 'finance visualization',
    ],
  },
  {
    key: 'finance.knowledge',
    label: 'Finance — Knowledge Graph',
    moduleId: 'knowledge',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance knowledge graph',
    aliases: [
      'finance knowledge', 'finance knowledge graph', 'finance graph',
      'financial knowledge',
    ],
  },
  {
    key: 'finance.problems',
    label: 'Finance — Problem Resolution',
    moduleId: 'problems',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance problems and insights',
    aliases: [
      'finance problems', 'finance issues', 'financial problems',
      'finance anomalies', 'finance insights',
    ],
  },
  {
    key: 'finance.workflows',
    label: 'Finance — Workflows',
    moduleId: 'workflows',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance workflow automation',
    aliases: [
      'finance workflows', 'finance automation', 'financial workflows',
    ],
  },
  {
    key: 'finance.actions',
    label: 'Finance — Governed Actions',
    moduleId: 'actions',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance governed actions center',
    aliases: [
      'finance actions', 'finance approvals', 'financial actions',
      'finance governed actions',
    ],
  },
  {
    key: 'finance.evidence',
    label: 'Finance — Evidence Explorer',
    moduleId: 'evidence',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance evidence explorer',
    aliases: ['finance evidence', 'financial evidence', 'finance explorer'],
  },
  {
    key: 'finance.audit',
    label: 'Finance — Audit Trail',
    moduleId: 'audit',
    workspaceId: 'finance',
    requiresWorkspace: true,
    description: 'Finance audit trail',
    aliases: ['finance audit', 'financial audit', 'finance audit trail', 'finance logs'],
  },

  // ── Workspace: Research ───────────────────────────────────────────────────────
  {
    key: 'research.overview',
    label: 'Research — Overview',
    moduleId: 'overview',
    workspaceId: 'research',
    requiresWorkspace: true,
    description: 'Research workspace overview',
    aliases: ['research', 'research workspace', 'open research', 'go to research', 'research overview'],
  },
  {
    key: 'research.command',
    label: 'Research — Command Center',
    moduleId: 'command',
    workspaceId: 'research',
    requiresWorkspace: true,
    description: 'Research command center',
    aliases: ['research command', 'research ai', 'research query', 'research command center'],
  },
  {
    key: 'research.analytics',
    label: 'Research — Analytics Engine',
    moduleId: 'analytics',
    workspaceId: 'research',
    requiresWorkspace: true,
    description: 'Research analytics',
    aliases: ['research analytics', 'research analysis', 'research data analysis'],
  },
  {
    key: 'research.documents',
    label: 'Research — Documents & Data',
    moduleId: 'documents',
    workspaceId: 'research',
    requiresWorkspace: true,
    description: 'Research documents and data',
    aliases: ['research documents', 'research papers', 'research files', 'research data'],
  },
  {
    key: 'research.knowledge',
    label: 'Research — Knowledge Graph',
    moduleId: 'knowledge',
    workspaceId: 'research',
    requiresWorkspace: true,
    description: 'Research knowledge graph',
    aliases: ['research knowledge', 'research knowledge graph', 'research graph'],
  },

  // ── Workspace: Healthcare ─────────────────────────────────────────────────────
  {
    key: 'healthcare.overview',
    label: 'Healthcare — Overview',
    moduleId: 'overview',
    workspaceId: 'healthcare',
    requiresWorkspace: true,
    description: 'Healthcare workspace overview',
    aliases: ['healthcare', 'healthcare workspace', 'open healthcare', 'go to healthcare', 'healthcare overview'],
  },
  {
    key: 'healthcare.analytics',
    label: 'Healthcare — Analytics',
    moduleId: 'analytics',
    workspaceId: 'healthcare',
    requiresWorkspace: true,
    description: 'Healthcare analytics',
    aliases: ['healthcare analytics', 'patient analytics', 'clinical analytics'],
  },
  {
    key: 'healthcare.documents',
    label: 'Healthcare — Documents',
    moduleId: 'documents',
    workspaceId: 'healthcare',
    requiresWorkspace: true,
    description: 'Healthcare documents',
    aliases: ['healthcare documents', 'clinical documents', 'patient documents', 'healthcare files'],
  },
  {
    key: 'healthcare.command',
    label: 'Healthcare — Command Center',
    moduleId: 'command',
    workspaceId: 'healthcare',
    requiresWorkspace: true,
    description: 'Healthcare command center',
    aliases: ['healthcare command', 'clinical command', 'healthcare ai', 'healthcare query'],
  },

  // ── Workspace: Education ──────────────────────────────────────────────────────
  {
    key: 'education.overview',
    label: 'Education — Overview',
    moduleId: 'overview',
    workspaceId: 'education',
    requiresWorkspace: true,
    description: 'Education workspace overview',
    aliases: ['education', 'education workspace', 'open education', 'go to education', 'learning workspace'],
  },
  {
    key: 'education.analytics',
    label: 'Education — Analytics',
    moduleId: 'analytics',
    workspaceId: 'education',
    requiresWorkspace: true,
    description: 'Education analytics',
    aliases: ['education analytics', 'learning analytics', 'student analytics'],
  },
  {
    key: 'education.documents',
    label: 'Education — Documents',
    moduleId: 'documents',
    workspaceId: 'education',
    requiresWorkspace: true,
    description: 'Education documents',
    aliases: ['education documents', 'learning materials', 'curriculum documents'],
  },

  // ── Workspace: Business ───────────────────────────────────────────────────────
  {
    key: 'business.overview',
    label: 'Business Strategy — Overview',
    moduleId: 'overview',
    workspaceId: 'business',
    requiresWorkspace: true,
    description: 'Business Strategy workspace overview',
    aliases: [
      'business', 'business strategy', 'business workspace', 'open business',
      'go to business', 'strategy workspace',
    ],
  },
  {
    key: 'business.command',
    label: 'Business Strategy — Command Center',
    moduleId: 'command',
    workspaceId: 'business',
    requiresWorkspace: true,
    description: 'Business strategy AI command center',
    aliases: ['business command', 'strategy command', 'business ai'],
  },
  {
    key: 'business.analytics',
    label: 'Business Strategy — Analytics',
    moduleId: 'analytics',
    workspaceId: 'business',
    requiresWorkspace: true,
    description: 'Business analytics',
    aliases: ['business analytics', 'strategy analytics', 'market analytics'],
  },
  {
    key: 'business.dashboards',
    label: 'Business Strategy — Dashboards',
    moduleId: 'dashboards',
    workspaceId: 'business',
    requiresWorkspace: true,
    description: 'Business dashboards',
    aliases: ['business dashboards', 'strategy dashboards', 'market dashboards'],
  },
  {
    key: 'business.problems',
    label: 'Business Strategy — Problems & Insights',
    moduleId: 'problems',
    workspaceId: 'business',
    requiresWorkspace: true,
    description: 'Business strategy problems and anomaly investigation',
    aliases: ['business problems', 'business issues', 'strategy problems', 'business anomalies'],
  },
  {
    key: 'business.workflows',
    label: 'Business Strategy — Workflows & Automation',
    moduleId: 'workflows',
    workspaceId: 'business',
    requiresWorkspace: true,
    description: 'Business strategy automated workflows',
    aliases: ['business workflows', 'strategy workflows', 'business automation'],
  },
  {
    key: 'business.actions',
    label: 'Business Strategy — Governed Actions',
    moduleId: 'actions',
    workspaceId: 'business',
    requiresWorkspace: true,
    description: 'Business strategy governed action center',
    aliases: ['business actions', 'strategy actions', 'business approvals'],
  },
  {
    key: 'business.documents',
    label: 'Business Strategy — Documents',
    moduleId: 'documents',
    workspaceId: 'business',
    requiresWorkspace: true,
    description: 'Business strategy documents',
    aliases: ['business documents', 'strategy documents', 'business files'],
  },

  // ── Workspace: Custom Operations ───────────────────────────────────────────
  {
    key: 'operations.overview',
    label: 'Custom Operations — Overview',
    moduleId: 'overview',
    workspaceId: 'operations',
    requiresWorkspace: true,
    description: 'Custom operations workspace overview',
    aliases: [
      'operations', 'custom operations', 'operations workspace', 'open operations',
      'go to operations', 'custom operations workspace', 'switch to custom operations',
    ],
  },
  {
    key: 'operations.workflows',
    label: 'Custom Operations — Workflows & Automation',
    moduleId: 'workflows',
    workspaceId: 'operations',
    requiresWorkspace: true,
    description: 'Operations workflow automation pipelines',
    aliases: [
      'operations workflows', 'custom operations workflows', 'operations automation',
      'operations pipeline', 'operations dags',
    ],
  },
  {
    key: 'operations.actions',
    label: 'Custom Operations — Governed Actions',
    moduleId: 'actions',
    workspaceId: 'operations',
    requiresWorkspace: true,
    description: 'Operations governed actions center',
    aliases: ['operations actions', 'custom operations actions', 'operations approvals'],
  },
  {
    key: 'operations.analytics',
    label: 'Custom Operations — Analytics',
    moduleId: 'analytics',
    workspaceId: 'operations',
    requiresWorkspace: true,
    description: 'Operations throughput and latency analytics',
    aliases: ['operations analytics', 'custom operations analytics', 'operations metrics'],
  },
  {
    key: 'operations.documents',
    label: 'Custom Operations — Documents',
    moduleId: 'documents',
    workspaceId: 'operations',
    requiresWorkspace: true,
    description: 'Operations manuals and SOP documents',
    aliases: ['operations documents', 'custom operations documents', 'operations files'],
  },
  {
    key: 'operations.command',
    label: 'Custom Operations — Command Center',
    moduleId: 'command',
    workspaceId: 'operations',
    requiresWorkspace: true,
    description: 'Operations AI command center',
    aliases: ['operations command', 'custom operations command', 'operations ai'],
  },
  {
    key: 'operations.dashboards',
    label: 'Custom Operations — Dashboards',
    moduleId: 'dashboards',
    workspaceId: 'operations',
    requiresWorkspace: true,
    description: 'Operations monitoring dashboards',
    aliases: ['operations dashboards', 'custom operations dashboards'],
  },
  {
    key: 'operations.problems',
    label: 'Custom Operations — Problems',
    moduleId: 'problems',
    workspaceId: 'operations',
    requiresWorkspace: true,
    description: 'Operations anomaly and incident resolution',
    aliases: ['operations problems', 'custom operations problems', 'operations anomalies', 'operations issues'],
  },

  // ── Workspace-Agnostic Modules (resolved to current workspace) ────────────────
  {
    key: 'current.command',
    label: 'Command Center',
    moduleId: 'command',
    requiresWorkspace: true,
    description: 'Open the Command Center for the current workspace',
    aliases: [
      'command center', 'command', 'ai command', 'open command center',
      'go to command', 'command center ai', 'chat', 'ask a question',
    ],
  },
  {
    key: 'current.documents',
    label: 'Documents & Data',
    moduleId: 'documents',
    requiresWorkspace: true,
    description: 'Open Documents & Data for the current workspace',
    aliases: [
      'documents', 'documents and data', 'my documents', 'show documents',
      'upload documents', 'files', 'data files',
    ],
  },
  {
    key: 'current.analytics',
    label: 'Analytics Engine',
    moduleId: 'analytics',
    requiresWorkspace: true,
    description: 'Open the Analytics Engine for the current workspace',
    aliases: [
      'analytics', 'analytics engine', 'analytics workspace', 'open analytics',
      'go to analytics', 'reports', 'analysis',
    ],
  },
  {
    key: 'current.dashboards',
    label: 'Dashboards',
    moduleId: 'dashboards',
    requiresWorkspace: true,
    description: 'Open Dashboards for the current workspace',
    aliases: [
      'dashboards', 'dashboard', 'dashboard builder', 'dashboard generator',
      'create dashboard', 'open dashboards', 'charts',
    ],
  },
  {
    key: 'current.knowledge',
    label: 'Knowledge Graph',
    moduleId: 'knowledge',
    requiresWorkspace: true,
    description: 'Open the Knowledge Graph for the current workspace',
    aliases: [
      'knowledge', 'knowledge graph', 'knowledge base', 'open knowledge',
      'organizational knowledge', 'entity graph',
    ],
  },
  {
    key: 'current.problems',
    label: 'Problem Resolution',
    moduleId: 'problems',
    requiresWorkspace: true,
    description: 'Open Problem Resolution for the current workspace',
    aliases: [
      'problems', 'problem resolution', 'problems and insights', 'issues',
      'anomalies', 'insights', 'open problems',
    ],
  },
  {
    key: 'current.workflows',
    label: 'Workflows & Automation',
    moduleId: 'workflows',
    requiresWorkspace: true,
    description: 'Open Workflows & Automation for the current workspace',
    aliases: [
      'workflows', 'workflow automation', 'automation', 'open workflows',
      'go to workflows',
    ],
  },
  {
    key: 'current.actions',
    label: 'Governed Actions',
    moduleId: 'actions',
    requiresWorkspace: true,
    description: 'Open the Actions Center for the current workspace',
    aliases: [
      'actions', 'actions center', 'governed actions', 'open actions',
      'approvals', 'pending approvals',
    ],
  },
  {
    key: 'current.evidence',
    label: 'Evidence Explorer',
    moduleId: 'evidence',
    requiresWorkspace: true,
    description: 'Open the Evidence Explorer for the current workspace',
    aliases: [
      'evidence', 'evidence explorer', 'explore evidence', 'open evidence',
    ],
  },
  {
    key: 'current.audit',
    label: 'Audit Trail',
    moduleId: 'audit',
    requiresWorkspace: true,
    description: 'Open the Audit Trail for the current workspace',
    aliases: [
      'audit', 'audit trail', 'audit log', 'open audit', 'activity log',
    ],
  },
  {
    key: 'current.search',
    label: 'Global Search',
    moduleId: 'search',
    requiresWorkspace: true,
    description: 'Open the Global Search for the current workspace',
    aliases: [
      'search', 'global search', 'open search', 'search everything',
      'find', 'look up',
    ],
  },
  {
    key: 'current.settings',
    label: 'Settings',
    moduleId: 'settings',
    requiresWorkspace: true,
    description: 'Open the settings for the current workspace',
    aliases: [
      'settings', 'domain settings', 'workspace settings', 'open settings',
      'configure',
    ],
  },
];

/**
 * Normalize text for matching: lowercase, collapse whitespace, strip punctuation
 */
export function normalizePhrase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find matching navigation targets from normalized transcript.
 * Returns targets sorted by match confidence (exact alias > partial match).
 */
export function findNavigationTargets(
  normalizedTranscript: string
): { target: NavigationTarget; confidence: number }[] {
  const results: { target: NavigationTarget; confidence: number }[] = [];

  for (const target of NAVIGATION_REGISTRY) {
    let bestScore = 0;

    for (const alias of target.aliases) {
      const normalizedAlias = normalizePhrase(alias);

      if (normalizedTranscript === normalizedAlias) {
        bestScore = 1.0; // exact match
      } else if (normalizedTranscript.includes(normalizedAlias)) {
        // transcript contains full alias phrase
        const score = 0.9 * (normalizedAlias.length / normalizedTranscript.length + 0.1);
        bestScore = Math.max(bestScore, score);
      } else if (normalizedAlias.includes(normalizedTranscript)) {
        // alias contains transcript (user said shorter phrase)
        const score = 0.7 * (normalizedTranscript.length / normalizedAlias.length);
        bestScore = Math.max(bestScore, score);
      } else {
        // Word-level partial match
        const aliasWords = normalizedAlias.split(' ');
        const transcriptWords = normalizedTranscript.split(' ');
        const matchCount = aliasWords.filter((w) => transcriptWords.includes(w)).length;
        if (matchCount > 0) {
          const score = 0.5 * (matchCount / aliasWords.length);
          bestScore = Math.max(bestScore, score);
        }
      }
    }

    if (bestScore > 0.4) {
      results.push({ target, confidence: bestScore });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

// ── Tab Registry ─────────────────────────────────────────────────────────────

export const TAB_REGISTRY: PageTabTarget[] = [
  // Analytics Module Tabs
  { id: 'overview', label: 'Overview', moduleId: 'analytics', index: 1, aliases: ['overview', 'summary', 'overview tab', 'first tab', '1st tab', 'tab 1'] },
  { id: 'trends', label: 'Trends', moduleId: 'analytics', index: 2, aliases: ['trends', 'time series', 'trends tab', 'second tab', '2nd tab', 'tab 2'] },
  { id: 'comparisons', label: 'Comparisons', moduleId: 'analytics', index: 3, aliases: ['comparisons', 'category comparisons', 'comparisons tab', 'third tab', '3rd tab', 'tab 3'] },
  { id: 'anomalies', label: 'Anomalies', moduleId: 'analytics', index: 4, aliases: ['anomalies', 'irregularities', 'outliers', 'anomalies tab', 'fourth tab', '4th tab', 'tab 4'] },
  { id: 'relationships', label: 'Relationships', moduleId: 'analytics', index: 5, aliases: ['relationships', 'correlations', 'scatter plot', 'relationships tab', 'fifth tab', '5th tab', 'tab 5'] },
  { id: 'drivers', label: 'Drivers', moduleId: 'analytics', index: 6, aliases: ['drivers', 'driver breakdown', 'waterfall', 'drivers tab', 'sixth tab', '6th tab', 'tab 6'] },
  { id: 'detailed_data', label: 'Detailed Data', moduleId: 'analytics', index: 7, aliases: ['detailed data', 'data ledger', 'raw data', 'detailed data tab', 'seventh tab', '7th tab', 'tab 7', 'last tab'] },

  // Actions Module Tabs
  { id: 'Pending', label: 'Pending Approvals', moduleId: 'actions', index: 1, aliases: ['pending', 'pending approvals', 'pending tab', 'first tab', '1st tab', 'tab 1'] },
  { id: 'Approved', label: 'Approved Actions', moduleId: 'actions', index: 2, aliases: ['approved', 'authorized', 'approved tab', 'second tab', '2nd tab', 'tab 2'] },
  { id: 'Running', label: 'Running Execution', moduleId: 'actions', index: 3, aliases: ['running', 'in progress', 'active execution', 'running tab', 'third tab', '3rd tab', 'tab 3'] },
  { id: 'Completed', label: 'Completed', moduleId: 'actions', index: 4, aliases: ['completed', 'finished', 'done', 'completed tab', 'fourth tab', '4th tab', 'tab 4'] },
  { id: 'Failed', label: 'Failed / Rejected', moduleId: 'actions', index: 5, aliases: ['failed', 'rejected', 'failed tab', 'fifth tab', '5th tab', 'tab 5', 'last tab'] },

  // Problems Module Tabs
  { id: 'Critical', label: 'Critical Issues', moduleId: 'problems', index: 1, aliases: ['critical', 'critical issues', 'p0', 'critical tab', 'first tab', '1st tab', 'tab 1'] },
  { id: 'Attention', label: 'Requires Attention', moduleId: 'problems', index: 2, aliases: ['attention', 'warnings', 'attention tab', 'second tab', '2nd tab', 'tab 2'] },
  { id: 'Investigation', label: 'Under Investigation', moduleId: 'problems', index: 3, aliases: ['investigation', 'under review', 'investigation tab', 'third tab', '3rd tab', 'tab 3'] },
  { id: 'Resolved', label: 'Resolved Problems', moduleId: 'problems', index: 4, aliases: ['resolved', 'closed', 'fixed', 'resolved tab', 'fourth tab', '4th tab', 'tab 4', 'last tab'] },

  // Settings Module Tabs
  { id: 'profile', label: 'User Profile', moduleId: 'settings', index: 1, aliases: ['profile', 'profile settings', 'account', 'user profile', 'first tab', '1st tab', 'tab 1'] },
  { id: 'security', label: 'Security & Auth', moduleId: 'settings', index: 2, aliases: ['security', 'security settings', 'mfa', 'credentials', 'second tab', '2nd tab', 'tab 2'] },
  { id: 'preferences', label: 'Preferences', moduleId: 'settings', index: 3, aliases: ['preferences', 'appearance', 'theme', 'display', 'preferences tab', 'third tab', '3rd tab', 'tab 3', 'last tab'] },
];

// ── Dialog Registry ──────────────────────────────────────────────────────────

export const DIALOG_REGISTRY: DialogTarget[] = [
  {
    id: 'search_modal',
    label: 'Global Search Modal',
    description: 'Enterprise global search modal with keyboard shortcut Cmd+K',
    aliases: ['search modal', 'global search', 'quick search', 'cmd k', 'command k', 'find dialog', 'search popup'],
  },
];

/**
 * Find matching tab for a given active module and normalized phrase
 */
export function findTabTarget(
  moduleId: string | null | undefined,
  phrase: string
): { tab: PageTabTarget; confidence: number } | null {
  const normalized = normalizePhrase(phrase);
  const targetModuleId = moduleId || 'analytics';

  const moduleTabs = TAB_REGISTRY.filter((t) => t.moduleId === targetModuleId);
  if (moduleTabs.length === 0) return null;

  // Ordinal checks (e.g. "open the second tab", "switch to 3rd tab", "last tab")
  const ordinalMap: Record<string, number> = {
    'first': 1, '1st': 1, 'one': 1, '1': 1,
    'second': 2, '2nd': 2, 'two': 2, '2': 2,
    'third': 3, '3rd': 3, 'three': 3, '3': 3,
    'fourth': 4, '4th': 4, 'four': 4, '4': 4,
    'fifth': 5, '5th': 5, 'five': 5, '5': 5,
    'sixth': 6, '6th': 6, 'six': 6, '6': 6,
    'seventh': 7, '7th': 7, 'seven': 7, '7': 7,
  };

  for (const [word, index] of Object.entries(ordinalMap)) {
    if (normalized.includes(`${word} tab`) || normalized === word || normalized === `tab ${word}`) {
      const match = moduleTabs.find((t) => t.index === index);
      if (match) return { tab: match, confidence: 0.95 };
    }
  }

  if (normalized.includes('last tab') || normalized === 'last') {
    const lastTab = moduleTabs[moduleTabs.length - 1];
    if (lastTab) return { tab: lastTab, confidence: 0.95 };
  }

  // Alias checks
  for (const tab of moduleTabs) {
    for (const alias of tab.aliases) {
      const normAlias = normalizePhrase(alias);
      if (normalized === normAlias || normalized.includes(normAlias) || normAlias.includes(normalized)) {
        return { tab, confidence: 0.90 };
      }
    }
  }

  return null;
}

/**
 * Get all valid workspace IDs
 */
export const WORKSPACE_IDS = ['finance', 'research', 'healthcare', 'education', 'business', 'operations'] as const;
export type WorkspaceId = typeof WORKSPACE_IDS[number];
