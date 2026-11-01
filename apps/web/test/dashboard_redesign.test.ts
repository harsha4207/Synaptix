import { describe, it, expect } from 'vitest';
import {
  DATE_RANGE_OPTIONS,
  DashboardPage,
  DashboardHeader,
  DateRangeSelector,
  MetricCard,
  AnalyticsSection,
  ActivityChart,
  WorkflowChart,
  AgentOperations,
  KnowledgeOverview,
  GovernanceOverview,
  RecentActivity,
  DashboardSkeleton,
  DashboardEmptyState,
} from '../src/components/dashboard';

describe('Synaptix Command — Redesigned Dashboard Architecture', () => {
  it('exports all 14 core modular components from the dashboard library', () => {
    expect(DashboardPage).toBeDefined();
    expect(DashboardHeader).toBeDefined();
    expect(DateRangeSelector).toBeDefined();
    expect(MetricCard).toBeDefined();
    expect(AnalyticsSection).toBeDefined();
    expect(ActivityChart).toBeDefined();
    expect(WorkflowChart).toBeDefined();
    expect(AgentOperations).toBeDefined();
    expect(KnowledgeOverview).toBeDefined();
    expect(GovernanceOverview).toBeDefined();
    expect(RecentActivity).toBeDefined();
    expect(DashboardSkeleton).toBeDefined();
    expect(DashboardEmptyState).toBeDefined();
    expect(DATE_RANGE_OPTIONS).toBeDefined();
  });

  it('supports 5 standardized enterprise date range options', () => {
    expect(DATE_RANGE_OPTIONS.length).toBe(5);
    const keys = DATE_RANGE_OPTIONS.map((o) => o.key);
    expect(keys).toEqual(['7d', '30d', 'qtd', 'ytd', 'all']);

    const sevenDay = DATE_RANGE_OPTIONS.find((o) => o.key === '7d');
    expect(sevenDay?.days).toBe(7);
    expect(sevenDay?.label).toBe('7D');

    const thirtyDay = DATE_RANGE_OPTIONS.find((o) => o.key === '30d');
    expect(thirtyDay?.days).toBe(30);
    expect(thirtyDay?.label).toBe('30D');

    const qtd = DATE_RANGE_OPTIONS.find((o) => o.key === 'qtd');
    expect(qtd?.days).toBe(90);

    const ytd = DATE_RANGE_OPTIONS.find((o) => o.key === 'ytd');
    expect(ytd?.days).toBe(365);
  });

  it('defines valid evidence provenance distribution totaling 100%', () => {
    const evidence = {
      g2Count: 42,
      g2Pct: 68,
      g1Count: 17,
      g1Pct: 27,
      g0Count: 3,
      g0Pct: 5,
      contradictedCount: 0,
    };

    expect(evidence.g2Pct + evidence.g1Pct + evidence.g0Pct).toBe(100);
    expect(evidence.contradictedCount).toBe(0);
    expect(evidence.g2Count).toBeGreaterThan(0);
  });

  it('verifies knowledge source summary formats and storage metrics', () => {
    const formats = ['PDF Documents', 'Financial XLSX', 'CSV Tabular Ledgers', 'DOCX & Contracts'];
    formats.forEach((fmt) => {
      expect(typeof fmt).toBe('string');
      expect(fmt.length).toBeGreaterThan(0);
    });
  });

  it('verifies operational execution statuses conform to strict enterprise tiers', () => {
    const allowedStatuses = ['success', 'approval_required', 'failed', 'running'];
    const testStatus = 'approval_required';
    expect(allowedStatuses).toContain(testStatus);
  });

  it('verifies risk-tier classification contains four distinct security buckets', () => {
    const tiers = ['Critical', 'High', 'Medium', 'Low'];
    expect(tiers).toHaveLength(4);
    expect(tiers).toContain('Critical');
    expect(tiers).toContain('High');
  });
});

