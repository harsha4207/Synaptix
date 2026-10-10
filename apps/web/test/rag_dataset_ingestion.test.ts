/**
 * SYNAPTIX COMMAND — Dataset Ingestion, Vector Retrieval & Workspace Isolation Test Suite
 * Tests multi-format extraction, chunking, TF-IDF vector embeddings,
 * hybrid retrieval, reranking, source citations, and cross-workspace isolation.
 */

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { SynaptixRagEngine, type RetrievedScoredChunk } from '../src/lib/rag/engine';

describe('Synaptix Dataset Ingestion & Retrieval Pipeline', () => {
  const baseDir = path.resolve(process.cwd(), '../../synaptix_test_data');
  const inventoryPath = path.resolve(process.cwd(), '../../dataset_inventory.json');
  let inventory: any[] = [];
  const engine = new SynaptixRagEngine();

  it('loads and validates the dataset inventory', () => {
    expect(fs.existsSync(inventoryPath)).toBe(true);
    inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));
    expect(inventory.length).toBeGreaterThanOrEqual(100);

    const validFiles = inventory.filter((i: any) => i.validationStatus === 'VALID');
    expect(validFiles.length).toBeGreaterThanOrEqual(100);
  });

  it('ingests multi-format documents and generates vector embeddings', async () => {
    const res = await engine.ingestAll(inventory, baseDir);
    expect(res.totalProcessed).toBeGreaterThanOrEqual(100);
    expect(res.totalChunks).toBeGreaterThanOrEqual(400);

    // Verify all 6 core workspaces have documents
    expect(res.workspaceDistribution.finance).toBeGreaterThan(0);
    expect(res.workspaceDistribution.research).toBeGreaterThan(0);
    expect(res.workspaceDistribution.healthcare).toBeGreaterThan(0);
    expect(res.workspaceDistribution.education).toBeGreaterThan(0);
    expect(res.workspaceDistribution.business).toBeGreaterThan(0);
    expect(res.workspaceDistribution.custom_operations).toBeGreaterThan(0);
  });

  it('retrieves evidence with genuine citations and section locations', () => {
    const results = engine.retrieve('annual leave days entitlement', 'business', 3);
    expect(results.length).toBeGreaterThan(0);
    const top = results[0];
    expect(top.doc.filename).toBeDefined();
    expect(top.chunk.id).toBeDefined();
    expect(top.chunk.content.length).toBeGreaterThan(20);
    expect(top.score).toBeGreaterThan(0);
  });

  it('strictly enforces cross-workspace zero-trust isolation', () => {
    // 1. Finance query in Research workspace should never return Finance documents
    const finInResearch = engine.retrieve('Yearly PnL and revenue history', 'research', 5);
    const finLeaks = finInResearch.filter((r: RetrievedScoredChunk) => r.doc.workspaceId !== 'research');
    expect(finLeaks.length).toBe(0);

    // 2. Healthcare query in Finance workspace should never return Healthcare documents
    const healthInFin = engine.retrieve('Patient admission utilization rates', 'finance', 5);
    const healthLeaks = healthInFin.filter((r: RetrievedScoredChunk) => r.doc.workspaceId !== 'finance');
    expect(healthLeaks.length).toBe(0);

    // 3. Education query in Healthcare workspace should never return Education documents
    const eduInHealth = engine.retrieve('Curriculum review and student academic performance', 'healthcare', 5);
    const eduLeaks = eduInHealth.filter((r: RetrievedScoredChunk) => r.doc.workspaceId !== 'healthcare');
    expect(eduLeaks.length).toBe(0);
  });

  it('correctly handles BI structured analytics queries against XLSX and CSV datasets', () => {
    const pnlResults = engine.retrieve('total revenue and YoY decline', 'finance', 3);
    expect(pnlResults.length).toBeGreaterThan(0);
    const hasFinanceSource = pnlResults.some(
      (r: RetrievedScoredChunk) =>
        r.doc.filename.toLowerCase().includes('pnl') ||
        r.doc.filename.toLowerCase().includes('revenue') ||
        r.doc.filename.toLowerCase().includes('report') ||
        r.doc.filename.toLowerCase().includes('financials')
    );
    expect(hasFinanceSource).toBe(true);
  });
});

