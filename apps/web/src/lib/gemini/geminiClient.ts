/**
 * SYNAPTIX COMMAND — Client-Side Gemini AI API Client
 *
 * Provides a clean, typed interface for frontend components to interact with
 * Gemini intelligence without ever exposing the GEMINI_API_KEY to the client bundle.
 * All requests route through the backend server middleware endpoints.
 */

import type { GeminiHealthStatus, RagEvidenceContext } from './geminiService';

export interface GenerateTextClientOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GroundedRagResponse {
  answer: string;
  hasSufficientEvidence: boolean;
  citations: Array<{
    documentId: string;
    filename: string;
    excerpt: string;
    locationStr: string;
    relevanceScore: number;
  }>;
}

export interface ClassifiedVoiceIntentResponse {
  intent: string;
  target?: string;
  workspaceId?: string;
  moduleId?: string;
  parameters: Record<string, any>;
  confidence: number;
  requiresClarification: boolean;
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DashboardSpecResponse {
  title: string;
  description: string;
  widgets: Array<{
    id: string;
    type: 'kpi' | 'line_chart' | 'bar_chart' | 'insight' | 'table' | 'executive_summary';
    title: string;
    description?: string;
    width: 'third' | 'half' | 'two_thirds' | 'full';
    dataset: string;
    metric: string;
    period: string;
    kpiValue?: string;
    kpiChange?: string;
    isPositiveChange?: boolean;
    summaryText?: string;
  }>;
}

class GeminiClient {
  private get baseEndpoint(): string {
    const customBase = (import.meta as any).env?.VITE_API_BASE_URL;
    if (customBase && typeof customBase === 'string') {
      return `${customBase.replace(/\/$/, '')}/api`;
    }
    return '/api';
  }

  /**
   * Checks the active health status of the Gemini configuration on the backend.
   */
  public async checkHealth(forceLivePing = false): Promise<GeminiHealthStatus> {
    try {
      const url = `${this.baseEndpoint}/health/gemini${forceLivePing ? '?ping=true' : ''}`;
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
      if (!res.ok) {
        return {
          isConfigured: false,
          model: 'unknown',
          status: 'error',
          error: `HTTP ${res.status}: ${res.statusText}`,
          lastChecked: new Date().toISOString(),
        };
      }
      return await res.json();
    } catch (err: any) {
      return {
        isConfigured: false,
        model: 'unknown',
        status: 'error',
        error: err.message || 'Failed to reach health endpoint',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Requests text generation from Gemini via the backend.
   */
  public async generateText(
    prompt: string,
    options: GenerateTextClientOptions = {}
  ): Promise<string> {
    const res = await fetch(`${this.baseEndpoint}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, ...options }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errBody.error || `Generation request failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.text;
  }

  /**
   * Generates a grounded RAG response with authorized workspace citations.
   */
  public async generateRagAnswer(
    context: RagEvidenceContext
  ): Promise<GroundedRagResponse> {
    const res = await fetch(`${this.baseEndpoint}/ai/rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errBody.error || `RAG generation failed with status ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Classifies user voice/text transcript into a structured intent.
   */
  public async classifyIntent(
    transcript: string,
    context?: Record<string, any>
  ): Promise<ClassifiedVoiceIntentResponse> {
    const res = await fetch(`${this.baseEndpoint}/ai/classify-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, context }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errBody.error || `Intent classification failed: ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Generates a validated dashboard layout specification from natural language.
   */
  public async generateDashboardSpec(
    prompt: string,
    workspaceId: string
  ): Promise<DashboardSpecResponse> {
    const res = await fetch(`${this.baseEndpoint}/ai/dashboard-spec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, workspaceId }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errBody.error || `Dashboard generation failed: ${res.status}`);
    }

    return await res.json();
  }
}

export const geminiClient = new GeminiClient();
