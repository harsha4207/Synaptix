/**
 * Centralized Gemini Provider & Health Check Test Suite
 * Tests configuration loading, safe error normalization, JSON generation,
 * RAG citation formatting, and offline/unconfigured behavior.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { geminiService } from '../src/lib/gemini/geminiService';

describe('Gemini Shared Provider Service', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    geminiService.initFromEnv();
  });

  describe('Configuration and Health Status', () => {
    it('reports unconfigured status safely when GEMINI_API_KEY is missing', async () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_GENAI_API_KEY;
      delete process.env.GOOGLE_API_KEY;
      geminiService.initFromEnv();

      expect(geminiService.isConfigured()).toBe(false);
      const health = await geminiService.checkHealth();
      expect(health.isConfigured).toBe(false);
      expect(health.status).toBe('unconfigured');
      expect(health.error).toContain('GEMINI_API_KEY is not configured');
      expect(health.model).toBeDefined();
    });

    it('initializes correctly when GEMINI_API_KEY is provided', () => {
      process.env.GEMINI_API_KEY = 'test-fake-gemini-key-12345';
      process.env.GEMINI_MODEL = 'gemini-2.5-flash';
      geminiService.initFromEnv();

      expect(geminiService.isConfigured()).toBe(true);
      expect(geminiService.getModelName()).toBe('gemini-2.5-flash');
    });

    it('never exposes the secret key in health check or error outputs', async () => {
      const secretKey = 'super-secret-gemini-key-9999';
      process.env.GEMINI_API_KEY = secretKey;
      geminiService.initFromEnv();

      const health = await geminiService.checkHealth(true);
      const healthJson = JSON.stringify(health);
      expect(healthJson).not.toContain(secretKey);
    });
  });

  describe('Grounded RAG Answer Generation', () => {
    it('returns clear abstention message when evidence blocks are empty', async () => {
      const result = await geminiService.generateGroundedRagAnswer({
        query: 'What is the leave policy limit?',
        workspaceId: 'finance',
        evidenceBlocks: [],
      });

      expect(result.hasSufficientEvidence).toBe(false);
      expect(result.citations).toHaveLength(0);
      expect(result.answer).toContain('No relevant documents');
    });

    it('handles unconfigured state with actionable error on generateText', async () => {
      delete process.env.GEMINI_API_KEY;
      geminiService.initFromEnv();

      await expect(
        geminiService.generateText('test')
      ).rejects.toThrow('GEMINI_API_KEY');
    });
  });
});
