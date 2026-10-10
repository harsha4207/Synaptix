import { supabase } from '../supabase/client';
import type { ConversationRecord, MessageRecord } from './types';

const LOCAL_STORAGE_CONVERSATIONS_KEY = 'synaptix_conversations_v1';
const LOCAL_STORAGE_MESSAGES_KEY = 'synaptix_messages_v1';

export class ConversationPersistenceService {
  private memoryConversations: ConversationRecord[] = [];
  private memoryMessages: MessageRecord[] = [];

  /**
   * Retrieves all conversations for the user in the specified workspace or globally.
   */
  public async getConversations(
    userId: string,
    workspaceId?: string | null
  ): Promise<ConversationRecord[]> {
    try {
      if (supabase) {
        let query = (supabase as any)
          .from('conversations')
          .select('*')
          .order('updated_at', { ascending: false });

        if (workspaceId) {
          query = query.eq('workspace_id', workspaceId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            organizationId: c.organization_id || 'SYNAPTIX COMMAND Enterprise',
            workspaceId: c.workspace_id,
            title: c.title,
            metadata: c.metadata || {},
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }));
        }
      }
    } catch {
      // Fall through to local storage
    }

    // Fallback: Check memory store first, then local storage
    const local = this.getLocalConversations(userId, workspaceId);
    if (local.length > 0) return local;

    return this.memoryConversations.filter((c) => {
      const matchesUser = c.userId === userId || userId === 'guest';
      const matchesWs = !workspaceId || c.workspaceId === workspaceId;
      return matchesUser && matchesWs;
    });
  }

  /**
   * Creates a new conversation record.
   */
  public async createConversation(
    userId: string,
    workspaceId: string,
    title: string = 'New Inquiry'
  ): Promise<ConversationRecord> {
    const newConv: ConversationRecord = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      organizationId: 'SYNAPTIX COMMAND Enterprise',
      workspaceId,
      title,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await (supabase as any).from('conversations').insert({
          id: newConv.id,
          user_id: newConv.userId,
          organization_id: newConv.organizationId,
          workspace_id: newConv.workspaceId,
          title: newConv.title,
          metadata: newConv.metadata,
          created_at: newConv.createdAt,
          updated_at: newConv.updatedAt,
        });
        if (error) console.warn('[Persistence] Supabase insert failed, saving locally:', error);
      }
    } catch {
      // Local fallback
    }

    this.memoryConversations.unshift(newConv);
    this.saveLocalConversation(newConv);
    return newConv;
  }

  /**
   * Retrieves messages for a conversation ordered chronologically with pagination support.
   */
  public async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageRecord[]> {
    try {
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .range(offset, offset + limit - 1);

        if (!error && data && data.length > 0) {
          return data.map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            userId: m.user_id,
            role: m.role,
            content: m.content,
            status: m.status,
            provider: m.provider || 'google',
            model: m.model || 'gemini-2.5-flash',
            routingTier: m.routing_tier || 'TIER_2_MODERATE',
            intent: m.intent,
            requestId: m.request_id,
            latencyMs: m.latency_ms,
            inputTokens: m.input_tokens,
            outputTokens: m.output_tokens,
            citations: m.citations || [],
            metadata: m.metadata || {},
            createdAt: m.created_at,
            completedAt: m.completed_at,
          }));
        }
      }
    } catch {
      // Local fallback
    }

    const local = this.getLocalMessages(conversationId);
    if (local.length > 0) {
      return local.slice(offset, offset + limit);
    }

    return this.memoryMessages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  /**
   * Saves a user or assistant message with idempotency.
   */
  public async saveMessage(message: Omit<MessageRecord, 'id' | 'createdAt'> & { id?: string }): Promise<MessageRecord> {
    const record: MessageRecord = {
      id: message.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
      ...message,
      createdAt: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await (supabase as any).from('messages').upsert({
          id: record.id,
          conversation_id: record.conversationId,
          user_id: record.userId,
          role: record.role,
          content: record.content,
          status: record.status,
          provider: record.provider,
          model: record.model,
          routing_tier: record.routingTier,
          intent: record.intent,
          request_id: record.requestId,
          latency_ms: record.latencyMs,
          input_tokens: record.inputTokens,
          output_tokens: record.outputTokens,
          citations: record.citations,
          metadata: record.metadata,
          created_at: record.createdAt,
          completed_at: record.completedAt,
        }, { onConflict: 'request_id' });

        if (error) {
          console.warn('[Persistence] Supabase message upsert error:', error);
        } else {
          // Update conversation timestamp
          await (supabase as any)
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', record.conversationId);
        }
      }
    } catch {
      // Local fallback
    }

    const memIdx = this.memoryMessages.findIndex((m) => m.requestId === record.requestId || m.id === record.id);
    if (memIdx >= 0) {
      this.memoryMessages[memIdx] = record;
    } else {
      this.memoryMessages.push(record);
    }

    this.saveLocalMessage(record);
    return record;
  }

  /**
   * Generates a bounded context window for LLM follow-ups.
   */
  public getBoundedContextWindow(
    messages: MessageRecord[],
    maxRecentMessages: number = 6
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const recent = messages.slice(-maxRecentMessages);
    return recent.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));
  }

  // ── Local Storage Fallback Helpers ──────────────────────────────────────────

  private getLocalConversations(userId: string, workspaceId?: string | null): ConversationRecord[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
      if (!raw) return [];
      const convs: ConversationRecord[] = JSON.parse(raw);
      return convs.filter((c) => {
        const matchesUser = c.userId === userId || userId === 'guest';
        const matchesWs = !workspaceId || c.workspaceId === workspaceId;
        return matchesUser && matchesWs;
      });
    } catch {
      return [];
    }
  }

  private saveLocalConversation(conv: ConversationRecord): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
      const convs: ConversationRecord[] = raw ? JSON.parse(raw) : [];
      const idx = convs.findIndex((c) => c.id === conv.id);
      if (idx >= 0) {
        convs[idx] = conv;
      } else {
        convs.unshift(conv);
      }
      localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(convs));
    } catch {
      // Storage unavailable
    }
  }

  private getLocalMessages(conversationId: string): MessageRecord[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
      if (!raw) return [];
      const msgs: MessageRecord[] = JSON.parse(raw);
      return msgs
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch {
      return [];
    }
  }

  private saveLocalMessage(msg: MessageRecord): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
      const msgs: MessageRecord[] = raw ? JSON.parse(raw) : [];
      const idx = msgs.findIndex((m) => m.requestId === msg.requestId || m.id === msg.id);
      if (idx >= 0) {
        msgs[idx] = msg;
      } else {
        msgs.push(msg);
      }
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(msgs));
    } catch {
      // Storage unavailable
    }
  }
}

export const conversationPersistence = new ConversationPersistenceService();
