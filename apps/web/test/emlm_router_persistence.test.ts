/**
 * SYNAPTIX COMMAND — EMLM, AI Router, and Conversation Persistence Test Suite
 *
 * Validates:
 * 1. Adaptive AI Router (4 Tiers)
 * 2. EMLM 8-Stage Orchestration Pipeline
 * 3. Conversation & Message Persistence with Idempotency & Chronological ordering
 * 4. Workspace Isolation & Tenant Boundary Enforcement
 */

import { describe, it, expect } from 'vitest';
import { aiRouter } from '../src/lib/ai/aiRouter';
import { emlmOrchestrator, EMLM_STAGES } from '../src/lib/ai/emlmOrchestrator';
import { conversationPersistence } from '../src/lib/ai/conversationPersistence';
import type { MessageRecord } from '../src/lib/ai/types';

describe('Adaptive AI Router (4-Tier Policy Engine)', () => {
  it('routes simple queries to TIER_1_SIMPLE with zero RAG and fast latency', () => {
    const r1 = aiRouter.evaluateQuery('hello');
    expect(r1.tier).toBe('TIER_1_SIMPLE');
    expect(r1.requiresRag).toBe(false);
    expect(r1.requiresComputation).toBe(false);

    const r2 = aiRouter.evaluateQuery('what is synaptix');
    expect(r2.tier).toBe('TIER_1_SIMPLE');

    const r3 = aiRouter.evaluateQuery('go home');
    expect(r3.tier).toBe('TIER_1_SIMPLE');
  });

  it('routes standard domain questions to TIER_2_MODERATE with RAG', () => {
    const r1 = aiRouter.evaluateQuery('What is the clinical protocol for pediatric triage?', 'healthcare', true);
    expect(r1.tier).toBe('TIER_2_MODERATE');
    expect(r1.requiresRag).toBe(true);
    expect(r1.requiresGovernanceApproval).toBe(false);
  });

  it('routes multi-step and anomaly questions to TIER_3_COMPLEX with EMLM multi-stage', () => {
    const r1 = aiRouter.evaluateQuery('Investigate root cause of Q3 revenue variance and anomaly correlation', 'finance', true);
    expect(r1.tier).toBe('TIER_3_COMPLEX');
    expect(r1.requiresRag).toBe(true);
    expect(r1.requiresComputation).toBe(true);
  });

  it('routes mutating, permission, or financial execution queries to TIER_4_CONSEQUENTIAL', () => {
    const r1 = aiRouter.evaluateQuery('Modify permission and grant access to executive ledger', 'finance');
    expect(r1.tier).toBe('TIER_4_CONSEQUENTIAL');
    expect(r1.requiresGovernanceApproval).toBe(true);

    const r2 = aiRouter.evaluateQuery('Approve requisition and execute transaction $42,500', 'finance');
    expect(r2.tier).toBe('TIER_4_CONSEQUENTIAL');
    expect(r2.requiresGovernanceApproval).toBe(true);
  });
});

describe('EMLM 8-Stage Orchestration Pipeline', () => {
  it('defines exactly 8 bounded reasoning stages', () => {
    expect(EMLM_STAGES.length).toBe(8);
    expect(EMLM_STAGES[0].id).toBe('UNDERSTAND_REQUEST');
    expect(EMLM_STAGES[7].id).toBe('PERSIST_AND_AUDIT_EXECUTION');
  });

  it('executes simple query via EMLM without unnecessary RAG stages', async () => {
    const result = await emlmOrchestrator.execute({
      query: 'hello',
      workspaceId: 'finance',
    });

    expect(result.answer).toContain('SYNAPTIX COMMAND');
    expect(result.routing.tier).toBe('TIER_1_SIMPLE');
    expect(result.stages.length).toBe(8);
    expect(result.stages.find((s) => s.id === 'RETRIEVE_EVIDENCE_AND_METRICS')?.status).toBe('skipped');
  });

  it('enforces zero-trust workspace tenancy and throws on unauthorized workspace', async () => {
    await expect(
      emlmOrchestrator.execute({
        query: 'Show financial metrics',
        workspaceId: 'invalid_unauthorized_workspace',
      })
    ).rejects.toThrow('Tenant isolation enforced');
  });
});

describe('Conversation & Message Persistence Service', () => {
  it('creates and lists conversations with metadata', async () => {
    const conv = await conversationPersistence.createConversation('test-user-1', 'finance', 'Q3 Financial Analysis');
    expect(conv.id).toBeDefined();
    expect(conv.workspaceId).toBe('finance');
    expect(conv.title).toBe('Q3 Financial Analysis');

    const list = await conversationPersistence.getConversations('test-user-1', 'finance');
    expect(list.some((c) => c.id === conv.id)).toBe(true);
  });

  it('saves and retrieves messages chronologically with idempotency', async () => {
    const convId = `test-conv-${Date.now()}`;
    const reqId = `req-test-${Date.now()}`;

    const userMsg: Omit<MessageRecord, 'id' | 'createdAt'> = {
      conversationId: convId,
      userId: 'test-user-1',
      role: 'user',
      content: 'Analyze Q3 revenue',
      status: 'completed',
      provider: 'user',
      model: 'user-input',
      routingTier: 'TIER_2_MODERATE',
      requestId: reqId,
      citations: [],
      metadata: {},
    };

    const savedUser = await conversationPersistence.saveMessage(userMsg);
    expect(savedUser.id).toBeDefined();

    // Idempotent duplicate save with same requestId should not duplicate
    await conversationPersistence.saveMessage(userMsg);

    const assistantMsg: Omit<MessageRecord, 'id' | 'createdAt'> = {
      conversationId: convId,
      userId: 'test-user-1',
      role: 'assistant',
      content: 'Revenue was $86.5M in Q3 2026.',
      status: 'completed',
      provider: 'google',
      model: 'gemini-2.5-flash',
      routingTier: 'TIER_2_MODERATE',
      requestId: `resp-${reqId}`,
      citations: [{
        documentId: 'doc-1',
        filename: 'revenue.csv',
        excerpt: 'Q3 Revenue: 86.5M',
        locationStr: 'p.1',
        relevanceScore: 0.95,
        workspaceId: 'finance',
      }],
      metadata: {},
    };

    await conversationPersistence.saveMessage(assistantMsg);

    const messages = await conversationPersistence.getMessages(convId);
    expect(messages.length).toBe(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].citations.length).toBe(1);
  });

  it('generates a bounded context window for LLM follow-ups', () => {
    const mockMessages: MessageRecord[] = Array.from({ length: 10 }).map((_, i) => ({
      id: `msg-${i}`,
      conversationId: 'conv-1',
      userId: 'user-1',
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
      status: 'completed',
      provider: 'google',
      model: 'gemini-2.5-flash',
      routingTier: 'TIER_2_MODERATE',
      requestId: `req-${i}`,
      citations: [],
      metadata: {},
      createdAt: new Date(Date.now() + i * 1000).toISOString(),
    }));

    const bounded = conversationPersistence.getBoundedContextWindow(mockMessages, 4);
    expect(bounded.length).toBe(4);
    expect(bounded[0].content).toBe('Message 6');
    expect(bounded[3].content).toBe('Message 9');
  });
});
