/**
 * Skill Registry — Executable Voice Commands
 * Maps intents to real application operations.
 * Each skill defines parameters, risk, verification, and response text.
 */

import type { ClassifiedIntent, VoiceCommandResult, VoiceConversationContext } from './types';
import type { WorkspaceItem } from '../../types/workspace';
import type { WorkspaceModuleId } from '../../design-system/components/Sidebar';
import { NAVIGATION_REGISTRY } from './navigationRegistry';
import { performCapabilityDiscovery, performCrossWorkspaceComparison } from './capabilityRegistry';
import { ragStore } from '../rag/store';
import { ragQuery } from '../rag/retrieval';

export interface SkillExecutionContext {
  intent: ClassifiedIntent;
  transcript: string;
  workspace: WorkspaceItem | null;
  allWorkspaces: WorkspaceItem[];
  conversationContext: VoiceConversationContext;
  navigateTo: (workspaceId: string | undefined, moduleId: WorkspaceModuleId) => boolean;
  switchWorkspace: (workspaceId: string) => boolean;
  navigateToHub: () => void;
  navigateBack?: () => boolean;
  navigateForward?: () => boolean;
  selectTab?: (tabId: string) => boolean;
  toggleDialog?: (dialogId: string, open: boolean) => boolean;
  addToast: (message: string) => void;
  updateContext: (updates: Partial<VoiceConversationContext>) => void;
}

export interface SkillResult {
  responseText: string;
  shouldSpeak: boolean;
  status: VoiceCommandResult['status'];
  navigatedTo?: string;
  data?: Record<string, unknown>;
  error?: string;
}

export type SkillHandler = (ctx: SkillExecutionContext) => Promise<SkillResult>;

export interface Skill {
  id: string;
  name: string;
  supportedIntents: Array<VoiceCommandResult['intent']['intent']>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresConfirmation: boolean;
  isReadOnly: boolean;
  handler: SkillHandler;
}

// ── Navigation Skill ──────────────────────────────────────────────────────────

const navigationSkill: Skill = {
  id: 'navigate',
  name: 'Navigate to Application Page',
  supportedIntents: ['NAVIGATE'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { intent, allWorkspaces } = ctx;
    const targetKey = intent.target;

    if (!targetKey) {
      return {
        responseText: 'I\'m not sure where to navigate. Can you be more specific?',
        shouldSpeak: true,
        status: 'FAILED',
        error: 'No target specified',
      };
    }

    const navTarget = NAVIGATION_REGISTRY.find((t) => t.key === targetKey);
    if (!navTarget) {
      return {
        responseText: `I couldn't find a page called "${targetKey}". Please try again.`,
        shouldSpeak: true,
        status: 'FAILED',
        error: 'Target not in registry',
      };
    }

    // Resolve workspace if needed
    let workspaceId = navTarget.workspaceId ?? intent.workspaceId;

    // For 'current.*' targets, use the active workspace
    if (!workspaceId && navTarget.requiresWorkspace) {
      workspaceId = ctx.workspace?.id;
    }

    // Verify workspace is authorized
    if (workspaceId) {
      const ws = allWorkspaces.find((w) => w.id === workspaceId);
      if (!ws) {
        return {
          responseText: `I couldn't find the workspace "${workspaceId}".`,
          shouldSpeak: true,
          status: 'FAILED',
          error: 'Workspace not found',
        };
      }
      if (!ws.isAuthorized) {
        return {
          responseText: `You don't have access to the ${ws.name} workspace.`,
          shouldSpeak: true,
          status: 'FAILED',
          error: 'Unauthorized workspace',
        };
      }
    }

    // Execute navigation
    const success = ctx.navigateTo(workspaceId, navTarget.moduleId);
    if (!success) {
      return {
        responseText: 'Navigation failed. Please try again.',
        shouldSpeak: true,
        status: 'FAILED',
        error: 'Navigation callback returned false',
      };
    }

    // Update conversation context
    ctx.updateContext({
      workspaceId: workspaceId || ctx.conversationContext.workspaceId,
      moduleId: navTarget.moduleId,
      lastIntent: 'NAVIGATE',
    });

    const wsLabel = workspaceId
      ? allWorkspaces.find((w) => w.id === workspaceId)?.name || workspaceId
      : null;
    const locationLabel = wsLabel ? `${wsLabel} — ${navTarget.label}` : navTarget.label;

    return {
      responseText: `Opened ${locationLabel}.`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: targetKey,
      data: { moduleId: navTarget.moduleId, workspaceId },
    };
  },
};

// ── Workspace Switch Skill ────────────────────────────────────────────────────

const workspaceSwitchSkill: Skill = {
  id: 'workspace-switch',
  name: 'Switch Workspace',
  supportedIntents: ['WORKSPACE_SWITCH', 'SWITCH_WORKSPACE'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { intent, allWorkspaces } = ctx;
    const targetId = intent.workspaceId || intent.parameters['workspaceId'] as string;

    if (!targetId) {
      return {
        responseText: 'Which workspace would you like to switch to? Available: Finance, Research, Healthcare, Education, and Business Strategy.',
        shouldSpeak: true,
        status: 'AWAITING_CLARIFICATION',
      };
    }

    const ws = allWorkspaces.find((w) => w.id === targetId);
    if (!ws) {
      return {
        responseText: `I couldn't find a workspace called "${targetId}".`,
        shouldSpeak: true,
        status: 'FAILED',
        error: 'Workspace not found',
      };
    }

    if (!ws.isAuthorized) {
      return {
        responseText: `You don't have access to the ${ws.name} workspace.`,
        shouldSpeak: true,
        status: 'FAILED',
        error: 'Unauthorized',
      };
    }

    const success = ctx.switchWorkspace(ws.id);
    if (!success) {
      return {
        responseText: `Failed to switch to ${ws.name}. Please try again.`,
        shouldSpeak: true,
        status: 'FAILED',
      };
    }

    ctx.updateContext({ workspaceId: ws.id, moduleId: 'overview', lastIntent: 'WORKSPACE_SWITCH' });

    return {
      responseText: `Switched to the ${ws.name} workspace.`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: `${ws.id}.overview`,
      data: { workspaceId: ws.id },
    };
  },
};

// ── Navigate to Hub Skill ─────────────────────────────────────────────────────

const hubNavigationSkill: Skill = {
  id: 'navigate-hub',
  name: 'Navigate to Workspace Hub',
  supportedIntents: ['NAVIGATE_HOME', 'NAVIGATE'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    if (ctx.intent.intent !== 'NAVIGATE_HOME' && ctx.intent.target !== 'hub') {
      return { responseText: '', shouldSpeak: false, status: 'FAILED' };
    }
    ctx.navigateToHub();
    ctx.updateContext({ workspaceId: null, moduleId: null, lastIntent: 'NAVIGATE_HOME' });
    return {
      responseText: 'Returned to the Workspace Hub.',
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: 'hub',
    };
  },
};

// ── History Navigation Skill ──────────────────────────────────────────────────

const historyNavigationSkill: Skill = {
  id: 'navigate-history',
  name: 'History Navigation',
  supportedIntents: ['NAVIGATE_BACK', 'NAVIGATE_FORWARD'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const isBack = ctx.intent.intent === 'NAVIGATE_BACK';
    if (isBack) {
      if (ctx.navigateBack) {
        ctx.navigateBack();
      }
      return {
        responseText: 'Returned to the previous page.',
        shouldSpeak: true,
        status: 'SUCCEEDED',
      };
    } else {
      if (ctx.navigateForward) {
        ctx.navigateForward();
      }
      return {
        responseText: 'Navigated forward.',
        shouldSpeak: true,
        status: 'SUCCEEDED',
      };
    }
  },
};

// ── Tab Switching Skill ───────────────────────────────────────────────────────

const tabSwitchSkill: Skill = {
  id: 'tab-switch',
  name: 'Switch Page Tab',
  supportedIntents: ['OPEN_TAB', 'CLOSE_TAB'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const tabId = ctx.intent.tabId || (ctx.intent.parameters['tabId'] as string);
    const tabLabel = (ctx.intent.parameters['tabLabel'] as string) || tabId || 'requested';

    if (!tabId) {
      return {
        responseText: 'Which tab would you like to open?',
        shouldSpeak: true,
        status: 'AWAITING_CLARIFICATION',
      };
    }

    // If a target module was specified and differs from current, ensure we navigate there
    if (ctx.intent.moduleId && ctx.workspace?.id) {
      ctx.navigateTo(ctx.workspace.id, ctx.intent.moduleId);
    }

    if (ctx.selectTab) {
      ctx.selectTab(tabId);
    }

    ctx.addToast(`Switched to "${tabLabel}" tab`);

    return {
      responseText: `Switched to the ${tabLabel} tab.`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      data: { tabId, tabLabel },
    };
  },
};

// ── Dialog Control Skill ──────────────────────────────────────────────────────

const dialogSkill: Skill = {
  id: 'dialog-control',
  name: 'Dialog Control',
  supportedIntents: ['OPEN_DIALOG', 'CLOSE_DIALOG'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const isOpen = ctx.intent.intent === 'OPEN_DIALOG';
    const dialogId = (ctx.intent.parameters['dialogId'] as string) || 'search_modal';

    if (ctx.toggleDialog) {
      ctx.toggleDialog(dialogId, isOpen);
    }

    return {
      responseText: isOpen ? 'Opened Global Search modal.' : 'Closed dialog.',
      shouldSpeak: true,
      status: 'SUCCEEDED',
      data: { dialogId, open: isOpen },
    };
  },
};

// ── Page Summary Skill ────────────────────────────────────────────────────────

const pageSummarySkill: Skill = {
  id: 'page-summary',
  name: 'Read Page Summary',
  supportedIntents: ['READ_PAGE_SUMMARY'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { workspace, conversationContext } = ctx;
    const moduleId = conversationContext.moduleId || 'overview';

    if (!workspace) {
      return {
        responseText: 'You are on the Workspace Hub. Here you can access Finance, Research, Healthcare, Education, and Business Strategy workspaces.',
        shouldSpeak: true,
        status: 'SUCCEEDED',
      };
    }

    const summaries: Record<string, string> = {
      overview: `${workspace.name} Workspace Overview. You have ${workspace.documentCount} documents, ${workspace.datasetCount} datasets, and ${workspace.dashboardCount} active dashboards.`,
      command: `Command Center for ${workspace.name}. Ready for natural-language reasoning, data synthesis, and RAG questions with verifiable citations.`,
      analytics: `${workspace.name} Analytics Engine. Currently displaying multi-variable ledger analysis, time-series trends from 2010 to 2026, and category comparisons.`,
      documents: `${workspace.name} Documents & Data. File repository containing verified enterprise PDFs, financial ledgers, and domain datasets.`,
      dashboards: `${workspace.name} Dashboards. Visualizing key performance indicators, gross margin trajectories, and anomaly alerts.`,
      problems: `${workspace.name} Problem Resolution. Tracking critical anomalies, margin drift, and operational alerts across business sectors.`,
      workflows: `${workspace.name} Workflows & Automation. Governing scheduled pipelines, validation jobs, and enterprise DAGs.`,
      actions: `${workspace.name} Governed Actions Center. Displaying pending approvals, risk evaluations, and execution audit logs.`,
      knowledge: `${workspace.name} Knowledge Graph. Visualizing domain ontology and cross-entity relationships.`,
      evidence: `${workspace.name} Evidence Explorer. Providing cryptographic hash verification and citation trace chains.`,
      audit: `${workspace.name} Compliance Audit Trail. Recording immutable user actions, access logs, and governance events.`,
    };

    const text = summaries[moduleId] || `You are currently viewing the ${moduleId} module in the ${workspace.name} workspace.`;

    return {
      responseText: text,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      data: { workspace: workspace.name, module: moduleId },
    };
  },
};

// ── Document Q&A / RAG Skill ──────────────────────────────────────────────────

const documentQASkill: Skill = {
  id: 'document-qa',
  name: 'Document Search & Q&A',
  supportedIntents: ['DOCUMENT_SEARCH', 'DOCUMENT_SUMMARY', 'ORGANIZATION_QA'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { intent, workspace } = ctx;
    const query = (intent.parameters['query'] || intent.parameters['question'] || ctx.transcript) as string;
    const workspaceId = workspace?.id;

    if (!workspaceId) {
      return {
        responseText: 'Please open a workspace first before searching documents.',
        shouldSpeak: true,
        status: 'FAILED',
        error: 'No active workspace',
      };
    }

    if (!query?.trim()) {
      return {
        responseText: 'What would you like to search for?',
        shouldSpeak: true,
        status: 'AWAITING_CLARIFICATION',
      };
    }

    try {
      // Check if there are any indexed documents first
      const chunks = await ragStore.getChunksByWorkspace(workspaceId);

      if (chunks.length === 0) {
        // No documents indexed — provide helpful guidance
        ctx.navigateTo(workspaceId, 'documents');
        ctx.updateContext({ moduleId: 'documents' });
        return {
          responseText: `No documents have been uploaded to the ${workspace?.name} workspace yet. I've opened the Documents module so you can upload files. Once uploaded, I can search and answer questions about them.`,
          shouldSpeak: true,
          status: 'PARTIALLY_SUCCEEDED',
          navigatedTo: `${workspaceId}.documents`,
          data: { chunkCount: 0, query },
        };
      }

      // Run RAG query
      const answer = await ragQuery({
        query,
        workspaceId,
        organizationId: 'synaptix-enterprise',
        topK: 5,
        similarityThreshold: 0.05,
      });

      if (!answer.hasSufficientEvidence) {
        return {
          responseText: `I searched the ${workspace?.name} workspace documents but couldn't find relevant information about "${query}". Try uploading more documents or rephrasing your question.`,
          shouldSpeak: true,
          status: 'SUCCEEDED',
          data: {
            answer: answer.answer,
            citations: [],
            chunkCount: chunks.length,
            query,
          },
        };
      }

      const citationSummary = answer.citations.slice(0, 3)
        .map((c) => c.filename)
        .join(', ');

      const spokenAnswer = answer.answer.length > 250
        ? answer.answer.substring(0, 250) + '...'
        : answer.answer;

      // Navigate to command center to show full answer
      ctx.navigateTo(workspaceId, 'command');
      ctx.updateContext({ moduleId: 'command', lastIntent: intent.intent });

      return {
        responseText: `Based on ${citationSummary}: ${spokenAnswer}`,
        shouldSpeak: true,
        status: 'SUCCEEDED',
        navigatedTo: `${workspaceId}.command`,
        data: {
          answer: answer.answer,
          citations: answer.citations,
          confidence: answer.confidenceLevel,
          query,
        },
      };
    } catch (err) {
      return {
        responseText: 'I encountered an error while searching documents. Please try again.',
        shouldSpeak: true,
        status: 'FAILED',
        error: String(err),
      };
    }
  },
};

// ── Analytics Query Skill ─────────────────────────────────────────────────────

const analyticsQuerySkill: Skill = {
  id: 'analytics-query',
  name: 'Analytics Query',
  supportedIntents: ['ANALYTICS_QUERY'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { workspace } = ctx;
    const workspaceId = workspace?.id;

    if (!workspaceId) {
      return {
        responseText: 'Please open a workspace first to access analytics.',
        shouldSpeak: true,
        status: 'FAILED',
      };
    }

    // Navigate to analytics and let the user interact with it
    ctx.navigateTo(workspaceId, 'analytics');
    ctx.updateContext({ moduleId: 'analytics', lastIntent: 'ANALYTICS_QUERY' });

    const query = (ctx.intent.parameters['query'] || ctx.transcript) as string;

    return {
      responseText: `Opening the ${workspace?.name} Analytics Engine. ${query ? `You asked: "${query}". Use the analytics interface to explore your data.` : 'Explore your data with the analytics tools.'}`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: `${workspaceId}.analytics`,
      data: { query, workspaceId },
    };
  },
};

// ── Dashboard Skill ───────────────────────────────────────────────────────────

const dashboardSkill: Skill = {
  id: 'dashboard-view',
  name: 'View Dashboards',
  supportedIntents: ['DASHBOARD_VIEW'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { workspace } = ctx;
    const workspaceId = workspace?.id;

    if (!workspaceId) {
      return {
        responseText: 'Please open a workspace first to view dashboards.',
        shouldSpeak: true,
        status: 'FAILED',
      };
    }

    ctx.navigateTo(workspaceId, 'dashboards');
    ctx.updateContext({ moduleId: 'dashboards', lastIntent: 'DASHBOARD_VIEW' });

    return {
      responseText: `Opened the ${workspace?.name} Dashboards.`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: `${workspaceId}.dashboards`,
    };
  },
};

// ── Problem Investigation Skill ───────────────────────────────────────────────

const problemSkill: Skill = {
  id: 'problem-investigation',
  name: 'Problem Investigation',
  supportedIntents: ['PROBLEM_INVESTIGATION'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { workspace } = ctx;
    const workspaceId = workspace?.id;

    if (!workspaceId) {
      return {
        responseText: 'Please open a workspace to investigate problems.',
        shouldSpeak: true,
        status: 'FAILED',
      };
    }

    ctx.navigateTo(workspaceId, 'problems');
    ctx.updateContext({ moduleId: 'problems', lastIntent: 'PROBLEM_INVESTIGATION' });

    return {
      responseText: `Opened Problem Resolution for ${workspace?.name}.`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: `${workspaceId}.problems`,
    };
  },
};

// ── Workflow Skills ───────────────────────────────────────────────────────────

const workflowListSkill: Skill = {
  id: 'workflow-list',
  name: 'List Workflows',
  supportedIntents: ['WORKFLOW_LIST', 'WORKFLOW_RUN'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { workspace } = ctx;
    const workspaceId = workspace?.id;

    if (!workspaceId) {
      return {
        responseText: 'Please open a workspace to view workflows.',
        shouldSpeak: true,
        status: 'FAILED',
      };
    }

    ctx.navigateTo(workspaceId, 'workflows');
    ctx.updateContext({ moduleId: 'workflows', lastIntent: 'WORKFLOW_LIST' });

    const isRun = ctx.intent.intent === 'WORKFLOW_RUN';
    const wfName = ctx.intent.parameters['workflowName'] as string | undefined;

    return {
      responseText: isRun && wfName
        ? `Opened Workflows for ${workspace?.name}. Select "${wfName}" to run it.`
        : `Opened Workflows & Automation for ${workspace?.name}.`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: `${workspaceId}.workflows`,
    };
  },
};

// ── Actions Skill ─────────────────────────────────────────────────────────────

const actionsSkill: Skill = {
  id: 'actions-list',
  name: 'View Actions',
  supportedIntents: ['ACTION_LIST', 'ACTION_EXECUTE'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { workspace } = ctx;
    const workspaceId = workspace?.id;

    if (!workspaceId) {
      return {
        responseText: 'Please open a workspace to view governed actions.',
        shouldSpeak: true,
        status: 'FAILED',
      };
    }

    ctx.navigateTo(workspaceId, 'actions');
    ctx.updateContext({ moduleId: 'actions', lastIntent: 'ACTION_LIST' });

    return {
      responseText: `Opened the ${workspace?.name} Governed Actions Center.`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: `${workspaceId}.actions`,
    };
  },
};

// ── Global Search Skill ───────────────────────────────────────────────────────

const globalSearchSkill: Skill = {
  id: 'global-search',
  name: 'Global Search',
  supportedIntents: ['GLOBAL_SEARCH'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { workspace } = ctx;
    const query = ctx.intent.parameters['query'] as string || ctx.transcript;
    const workspaceId = workspace?.id;

    if (!workspaceId) {
      return {
        responseText: 'Please open a workspace to use global search.',
        shouldSpeak: true,
        status: 'FAILED',
      };
    }

    ctx.navigateTo(workspaceId, 'search');
    ctx.updateContext({ moduleId: 'search', lastIntent: 'GLOBAL_SEARCH' });

    ctx.addToast(`Searching: "${query}"`);

    return {
      responseText: `Searching for "${query}" in ${workspace?.name}.`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      navigatedTo: `${workspaceId}.search`,
      data: { query },
    };
  },
};

// ── Conversation Query Skill ──────────────────────────────────────────────────

const conversationSkill: Skill = {
  id: 'conversation-query',
  name: 'General Conversation',
  supportedIntents: ['CONVERSATION_QUERY', 'GENERAL_QUERY'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { workspace, transcript } = ctx;

    // For general questions, try RAG if we have a workspace
    if (workspace?.id) {
      const chunks = await ragStore.getChunksByWorkspace(workspace.id);
      if (chunks.length > 0) {
        try {
          const answer = await ragQuery({
            query: transcript,
            workspaceId: workspace.id,
            organizationId: 'synaptix-enterprise',
            topK: 3,
          });

          if (answer.hasSufficientEvidence) {
            ctx.navigateTo(workspace.id, 'command');
            ctx.updateContext({ moduleId: 'command' });
            return {
              responseText: answer.answer.length > 250
                ? answer.answer.substring(0, 250) + '...'
                : answer.answer,
              shouldSpeak: true,
              status: 'SUCCEEDED',
              navigatedTo: `${workspace.id}.command`,
              data: { answer: answer.answer, citations: answer.citations },
            };
          }
        } catch { /* fall through */ }
      }
    }

    // Generic helpul response
    return {
      responseText: `I heard: "${transcript}". I can help you navigate to any workspace module, search documents, or run analytics. Try saying "Open Finance Analytics" or "Search for revenue report".`,
      shouldSpeak: true,
      status: 'SUCCEEDED',
    };
  },
};

// ── Capability Discovery Skill ───────────────────────────────────────────────

const capabilityDiscoverySkill: Skill = {
  id: 'capability-discovery',
  name: 'Capability & Feature Discovery',
  supportedIntents: ['CAPABILITY_DISCOVERY'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { intent, workspace, allWorkspaces } = ctx;
    const targetWs = (intent.workspaceId || intent.parameters?.targetWorkspaceId || workspace?.id || 'global') as string;
    const authorizedWsIds = allWorkspaces.filter((w) => w.isAuthorized).map((w) => w.id);

    const discovery = performCapabilityDiscovery(ctx.transcript, targetWs, authorizedWsIds);

    const availableNames = discovery.availableCapabilities.slice(0, 4).map((c) => c.name).join(', ');
    const unavailableNote = discovery.unavailableCapabilities.length > 0
      ? ` Note: ${discovery.unavailableCapabilities.length} advanced capability requires governance approval or additional datasets.`
      : '';

    const responseText = `${discovery.summary} Available capabilities include: ${availableNames}.${unavailableNote}`;

    return {
      responseText,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      data: { discovery },
    };
  },
};

// ── Cross Workspace Compare Skill ─────────────────────────────────────────────

const crossWorkspaceCompareSkill: Skill = {
  id: 'cross-workspace-compare',
  name: 'Cross-Workspace Comparative Analysis',
  supportedIntents: ['CROSS_WORKSPACE_COMPARE'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  handler: async (ctx) => {
    const { intent, allWorkspaces } = ctx;
    let workspaces: string[] = ['finance', 'business'];
    if (intent.parameters?.workspaces) {
      try {
        workspaces = JSON.parse(intent.parameters.workspaces as string);
      } catch {
        workspaces = ['finance', 'business'];
      }
    }
    const metric = (intent.parameters?.metric as string) || 'Operational & Financial Performance';
    const authorizedWsIds = allWorkspaces.filter((w) => w.isAuthorized).map((w) => w.id);

    const comparison = performCrossWorkspaceComparison(workspaces, metric, authorizedWsIds);

    if (!comparison.isAuthorized) {
      return {
        responseText: comparison.comparisonText,
        shouldSpeak: true,
        status: 'FAILED',
        error: 'Unauthorized workspace in comparison query',
        data: comparison.data,
      };
    }

    return {
      responseText: comparison.comparisonText,
      shouldSpeak: true,
      status: 'SUCCEEDED',
      data: comparison.data,
    };
  },
};

// ── Voice Control Skills ──────────────────────────────────────────────────────

const voiceStopSkill: Skill = {
  id: 'voice-stop',
  name: 'Stop Voice',
  supportedIntents: ['VOICE_STOP', 'VOICE_CANCEL', 'VOICE_MUTE'],
  riskLevel: 'LOW',
  requiresConfirmation: false,
  isReadOnly: true,
  // Handler is mostly handled at the VoiceEngine level, but we provide a result
  handler: async (_ctx) => ({
    responseText: '',
    shouldSpeak: false,
    status: 'SUCCEEDED',
  }),
};

// ── Skill Registry ────────────────────────────────────────────────────────────

export const SKILL_REGISTRY: Skill[] = [
  hubNavigationSkill,     // Must be before navigationSkill (more specific hub handler)
  historyNavigationSkill,
  tabSwitchSkill,
  dialogSkill,
  pageSummarySkill,
  capabilityDiscoverySkill,
  crossWorkspaceCompareSkill,
  navigationSkill,
  workspaceSwitchSkill,
  documentQASkill,
  analyticsQuerySkill,
  dashboardSkill,
  problemSkill,
  workflowListSkill,
  actionsSkill,
  globalSearchSkill,
  conversationSkill,
  voiceStopSkill,
];

export function findSkill(intent: ClassifiedIntent): Skill | null {
  if (intent.intent === 'NAVIGATE') {
    if (intent.target === 'hub') {
      return hubNavigationSkill;
    }
    return navigationSkill;
  }
  if (intent.intent === 'NAVIGATE_HOME') {
    return hubNavigationSkill;
  }
  if (intent.intent === 'NAVIGATE_BACK' || intent.intent === 'NAVIGATE_FORWARD') {
    return historyNavigationSkill;
  }
  if (intent.intent === 'OPEN_TAB' || intent.intent === 'CLOSE_TAB') {
    return tabSwitchSkill;
  }
  if (intent.intent === 'OPEN_DIALOG' || intent.intent === 'CLOSE_DIALOG') {
    return dialogSkill;
  }
  if (intent.intent === 'READ_PAGE_SUMMARY') {
    return pageSummarySkill;
  }
  if (intent.intent === 'CAPABILITY_DISCOVERY') {
    return capabilityDiscoverySkill;
  }
  if (intent.intent === 'CROSS_WORKSPACE_COMPARE') {
    return crossWorkspaceCompareSkill;
  }

  return SKILL_REGISTRY.find((s) =>
    s.supportedIntents.includes(intent.intent as never)
  ) ?? null;
}
