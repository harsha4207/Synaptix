/**
 * AI Intent Classifier — Pass 2
 * Handles complex, natural-language, or ambiguous voice commands when
 * deterministic pattern matching (Pass 1) does not yield high confidence.
 *
 * Integrates with centralized backend Gemini API, with an intelligent
 * semantic heuristic fallback when running offline or without an API key.
 */

import type { ClassifiedIntent, VoiceConversationContext } from './types';
import { geminiClient } from '../gemini/geminiClient';
import { geminiService } from '../gemini/geminiService';

/**
 * Heuristic AI-fallback intent classifier for offline or no-key environments.
 * Uses semantic scoring and conversational context.
 */
export function classifyWithHeuristics(
  transcript: string,
  context?: VoiceConversationContext
): ClassifiedIntent {
  const lower = transcript.toLowerCase();

  // Check for questions about policies, SOPs, leaves, rules -> ORGANIZATION_QA
  if (/policy|sop|guideline|rule|procedure|leave|holiday|allowance|protocol/i.test(lower)) {
    return {
      intent: 'ORGANIZATION_QA',
      workspaceId: context?.workspaceId ?? undefined,
      parameters: { question: transcript },
      confidence: 0.88,
      requiresClarification: false,
      reason: 'Detected organizational knowledge or policy inquiry',
      riskLevel: 'LOW',
    };
  }

  // Check for document search or reading
  if (/document|pdf|csv|spreadsheet|upload|file|report/i.test(lower) && /read|summar|find|search|show/i.test(lower)) {
    return {
      intent: 'DOCUMENT_SEARCH',
      workspaceId: context?.workspaceId ?? undefined,
      moduleId: 'documents',
      parameters: { query: transcript },
      confidence: 0.84,
      requiresClarification: false,
      reason: 'Detected document search request',
      riskLevel: 'LOW',
    };
  }

  // Check for analytics / numerical trends
  if (/revenue|profit|margin|cost|expense|growth|churn|forecast|metric|kpi|ebitda/i.test(lower)) {
    return {
      intent: 'ANALYTICS_QUERY',
      workspaceId: context?.workspaceId ?? 'finance',
      moduleId: 'analytics',
      parameters: { query: transcript },
      confidence: 0.85,
      requiresClarification: false,
      reason: 'Detected financial/analytics inquiry',
      riskLevel: 'LOW',
    };
  }

  // Check for problem / anomaly investigation
  if (/anomaly|incident|alert|bug|broken|failure|downtime|outage|investigat/i.test(lower)) {
    return {
      intent: 'PROBLEM_INVESTIGATION',
      workspaceId: context?.workspaceId ?? undefined,
      moduleId: 'problems',
      parameters: { query: transcript },
      confidence: 0.86,
      requiresClarification: false,
      reason: 'Detected problem or incident inquiry',
      riskLevel: 'LOW',
    };
  }

  // Check for workflows
  if (/workflow|pipeline|automate|trigger|dag/i.test(lower)) {
    const isExecution = /run|trigger|start|execute/i.test(lower);
    return {
      intent: isExecution ? 'WORKFLOW_RUN' : 'WORKFLOW_LIST',
      workspaceId: context?.workspaceId ?? undefined,
      moduleId: 'workflows',
      parameters: { workflowName: transcript },
      confidence: 0.82,
      requiresClarification: false,
      reason: isExecution ? 'Detected workflow execution' : 'Detected workflow review',
      riskLevel: isExecution ? 'MEDIUM' : 'LOW',
    };
  }

  // Check for actions / approvals
  if (/action|approve|reject|governance|compliance|sign off/i.test(lower)) {
    const isExecute = /approve|reject|authorize|execute/i.test(lower);
    return {
      intent: isExecute ? 'ACTION_EXECUTE' : 'ACTION_LIST',
      workspaceId: context?.workspaceId ?? undefined,
      moduleId: 'actions',
      parameters: { actionName: transcript },
      confidence: 0.83,
      requiresClarification: isExecute,
      reason: 'Detected governed action inquiry',
      riskLevel: isExecute ? 'HIGH' : 'LOW',
    };
  }

  // If very short or ambiguous single words that don't match anything
  if (transcript.trim().split(/\s+/).length <= 2 && !/^(stop|cancel|mute|help)$/i.test(lower)) {
    return {
      intent: 'CLARIFICATION_REQUIRED',
      parameters: { originalInput: transcript },
      confidence: 0.45,
      requiresClarification: true,
      reason: 'Ambiguous phrase requiring clarification',
      riskLevel: 'LOW',
    };
  }

  // Default fallback: conversational query (can trigger RAG or general answer)
  return {
    intent: 'CONVERSATION_QUERY',
    workspaceId: context?.workspaceId ?? undefined,
    parameters: { question: transcript },
    confidence: 0.70,
    requiresClarification: false,
    reason: 'Interpreted as conversational query',
    riskLevel: 'LOW',
  };
}

/**
 * Classifies a user transcript using Gemini backend API or fallback heuristics.
 */
export async function classifyIntentWithAI(
  transcript: string,
  context?: VoiceConversationContext
): Promise<ClassifiedIntent> {
  // 1. Direct Node/backend execution (e.g. tests)
  if (typeof window === 'undefined' && geminiService.isConfigured()) {
    try {
      const res = await geminiService.classifyVoiceIntent(transcript, context as any);
      return {
        intent: res.intent as any,
        target: res.target,
        workspaceId: res.workspaceId as any,
        moduleId: res.moduleId as any,
        parameters: res.parameters,
        confidence: res.confidence,
        requiresClarification: res.requiresClarification,
        reason: res.reason,
        riskLevel: res.riskLevel,
      };
    } catch {
      return classifyWithHeuristics(transcript, context);
    }
  }

  // 2. Browser client execution calling backend API
  if (typeof window !== 'undefined') {
    try {
      const res = await geminiClient.classifyIntent(transcript, context);
      return {
        intent: res.intent as any,
        target: res.target,
        workspaceId: res.workspaceId as any,
        moduleId: res.moduleId as any,
        parameters: res.parameters,
        confidence: res.confidence,
        requiresClarification: res.requiresClarification,
        reason: res.reason,
        riskLevel: res.riskLevel,
      };
    } catch {
      return classifyWithHeuristics(transcript, context);
    }
  }

  return classifyWithHeuristics(transcript, context);
}
