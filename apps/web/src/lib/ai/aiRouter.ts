/**
 * SYNAPTIX COMMAND — Adaptive AI Router
 *
 * Evaluates every incoming request against a 4-Tier Policy Engine:
 * - Tier 1: Simple (Deterministic logic / lightweight response)
 * - Tier 2: Moderate (Gemini + Conversation History + RAG Retrieval)
 * - Tier 3: Complex (Full EMLM Multi-stage Orchestration Pipeline)
 * - Tier 4: Consequential (High-risk Operations & Governance Confirmation)
 */

import type { RoutingDecision } from './types';

export class AdaptiveAiRouter {
  private defaultModel: string = 'gemini-2.5-flash';

  constructor(defaultModel: string = 'gemini-2.5-flash') {
    this.defaultModel = defaultModel;
  }

  /**
   * Evaluates query complexity and assigns the optimal processing tier and resource strategy.
   */
  public evaluateQuery(
    query: string,
    _workspaceId: string = 'finance',
    hasAuthorizedEvidence: boolean = true
  ): RoutingDecision {
    const q = query.trim().toLowerCase();

    // ── TIER 4: Consequential Operations (Mutating, approvals, high risk) ────
    const consequentialPatterns = [
      'delete', 'remove', 'modify permission', 'grant access', 'revoke access',
      'approve requisition', 'execute transaction', 'transfer funds', 'drop table',
      'override policy', 'execute high risk', 'terminate workflow', 'sign off'
    ];
    if (consequentialPatterns.some((pattern) => q.includes(pattern))) {
      return {
        tier: 'TIER_4_CONSEQUENTIAL',
        reason: 'Consequential action requiring RBAC validation and explicit human governance approval',
        confidence: 0.98,
        selectedModel: this.defaultModel,
        requiresRag: true,
        requiresComputation: true,
        requiresGovernanceApproval: true,
        estimatedLatencyMs: 1200,
      };
    }

    // ── TIER 1: Simple Requests (Greetings, navigation, straightforward definitions) ─
    const simplePatterns = [
      'hello', 'hi', 'hey', 'good morning', 'good evening', 'help',
      'what is synaptix', 'who are you', 'what can you do', 'clear',
      'go home', 'home', 'back to hub', 'open search', 'ping'
    ];
    const isDirectSimple = simplePatterns.some(
      (p) => q === p || q.startsWith(`${p} `) || q.endsWith(` ${p}`)
    );
    if (isDirectSimple && q.length < 40) {
      return {
        tier: 'TIER_1_SIMPLE',
        reason: 'Deterministic / Low-complexity query handled with zero or lightweight model overhead',
        confidence: 0.95,
        selectedModel: this.defaultModel,
        requiresRag: false,
        requiresComputation: false,
        requiresGovernanceApproval: false,
        estimatedLatencyMs: 150,
      };
    }

    // ── TIER 3: Complex Multi-stage Investigations ───────────────────────────
    const complexPatterns = [
      'investigate', 'root cause', 'cross-workspace', 'compare', 'multi-year',
      'reconciliation', 'anomaly detection', 'forecast model', 'synthesis',
      'variance analysis', 'correlation', 'deep dive', 'audit trail forensic'
    ];
    const isComplex =
      complexPatterns.some((p) => q.includes(p)) ||
      (q.includes('between') && q.includes('and')) ||
      q.length > 120;

    if (isComplex) {
      return {
        tier: 'TIER_3_COMPLEX',
        reason: 'Complex multi-step inquiry requiring 8-stage EMLM evidence synthesis & analytics calculations',
        confidence: 0.92,
        selectedModel: this.defaultModel,
        requiresRag: hasAuthorizedEvidence,
        requiresComputation: true,
        requiresGovernanceApproval: false,
        estimatedLatencyMs: 2500,
      };
    }

    // ── TIER 2: Moderate Standard Workspace Q&A ──────────────────────────────
    return {
      tier: 'TIER_2_MODERATE',
      reason: 'Standard workspace question routed to Gemini with grounded RAG context and persistent history',
      confidence: 0.90,
      selectedModel: this.defaultModel,
      requiresRag: hasAuthorizedEvidence,
      requiresComputation: false,
      requiresGovernanceApproval: false,
      estimatedLatencyMs: 1200,
    };
  }
}

export const aiRouter = new AdaptiveAiRouter();
