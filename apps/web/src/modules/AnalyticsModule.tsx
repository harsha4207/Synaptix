import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Mic,
  MicOff,
  Sparkles,
  Calendar,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import {
  TimeSeriesLineChart,
  TimeSeriesPoint,
  CategoryBarChart,
  CategoryComparisonItem,
  RelationshipScatterPlot,
  ScatterPoint,
  CompositionStackedBar,
  CompositionYearData
} from '../components/analytics/AnalyticsCharts';
import { InsightPanel, InsightItem } from '../components/analytics/InsightPanel';
import { DataDrillDownModal } from '../components/analytics/DataDrillDownModal';
import { PageContainer, PageHeader, PageContent } from '../components/layout';
import { Badge } from '../components/ui/Badge';

interface AnalyticsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
  activeSubTab?: AnalysisSectionTab;
  onSubTabChange?: (tab: AnalysisSectionTab) => void;
}

export type AnalysisSectionTab =
  | 'overview'
  | 'trends'
  | 'comparisons'
  | 'anomalies'
  | 'relationships'
  | 'drivers'
  | 'detailed_data';

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({
  workspace,
  onAddToast,
  activeSubTab,
  onSubTabChange,
}) => {
  // Top Bar States
  const [selectedDataset, setSelectedDataset] = useState<string>('FY2026 Enterprise Operational Ledger');
  const [dateRange, setDateRange] = useState<string>('2010 – 2026');
  const [selectedMetric, setSelectedMetric] = useState<string>('Gross Margin %');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Natural Language Input State
  const [nlQuery, setNlQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AnalysisSectionTab>(activeSubTab || 'overview');

  useEffect(() => {
    if (activeSubTab) {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Drill-down modal state
  const [isDrillDownOpen, setIsDrillDownOpen] = useState<boolean>(false);
  const [selectedInsightForDrill, setSelectedInsightForDrill] = useState<InsightItem | null>(null);
  const [drillTargetSubject, setDrillTargetSubject] = useState<string>('Selected Period Data');

  // Sample Datasets for workspace
  const datasetsList = [
    'FY2026 Enterprise Operational Ledger',
    'Q3 Multi-Region Revenue & Cost Log',
    'Supply Chain Latency & Freight Audit',
    'Customer Retention & Tier Analytics',
  ];

  const dateRanges = ['2010 – 2026', '2019 – 2024', '2021 – 2026', 'Last 12 Months', 'Custom'];
  const metricOptions = [
    'Gross Margin %',
    'Net Revenue ($M)',
    'Operating Expense ($M)',
    'Supply Chain Latency (days)',
    'Customer Churn %',
  ];

  // Natural Language Prompt Examples
  const promptExamples = [
    'Analyze the decline from 2010 to 2026.',
    'Find the biggest anomalies.',
    'Compare 2019 and 2024.',
    'Identify variables correlated with the decline.',
  ];

  // Mock Time Series Data (2010 to 2026)
  const timeSeriesData: TimeSeriesPoint[] = [
    { year: 2010, value: 48.5, label: 'Baseline Peak' },
    { year: 2012, value: 47.2, label: 'Stable Expansion' },
    { year: 2014, value: 46.8, label: 'Normal Variance' },
    { year: 2016, value: 45.1, label: 'Modest Shift' },
    { year: 2018, value: 44.2, label: 'Pre-Shift Plateau' },
    { year: 2019, value: 42.5, label: 'Onset of Decline', isAnomaly: true, anomalyNote: 'First major margin divergence triggered by supply chain overhead surge' },
    { year: 2020, value: 34.0, label: 'Accelerated Drift', isAnomaly: true, anomalyNote: 'Pandemic logistics surcharges and regional operational freezes' },
    { year: 2021, value: 28.3, label: 'Trough Lowest Point', isAnomaly: true, anomalyNote: '14.2% total margin contraction from 2019 baseline' },
    { year: 2022, value: 31.5, label: 'Recovery Phase 1' },
    { year: 2023, value: 35.0, label: 'Restructuring Gains' },
    { year: 2024, value: 37.8, label: 'Automation Impact' },
    { year: 2025, value: 39.4, label: 'Stabilization' },
    { year: 2026, value: 41.2, label: 'Current FY Trajectory' },
  ];

  // Category Comparison Data (2019 vs 2024)
  const categoryComparisonData: CategoryComparisonItem[] = [
    { category: 'North America Enterprise', valBaseline: 52.4, valCurrent: 44.1, deltaPercent: -15.8 },
    { category: 'EMEA Operational Sector', valBaseline: 46.1, valCurrent: 33.2, deltaPercent: -28.0 },
    { category: 'APAC Logistics & Supply', valBaseline: 38.0, valCurrent: 36.5, deltaPercent: -3.9 },
    { category: 'LATAM Growth Hub', valBaseline: 29.5, valCurrent: 34.8, deltaPercent: 17.9 },
  ];

  // Scatter Plot Relationship Data (Logistics Delay vs Margin Impact)
  const scatterData: ScatterPoint[] = [
    { id: 'sp1', xLabel: 'Logistics Delay (Days)', xValue: 2.1, yValue: 47.5, label: '2012 Q2 Batch', category: 'North America' },
    { id: 'sp2', xLabel: 'Logistics Delay (Days)', xValue: 3.5, yValue: 45.2, label: '2015 Q4 Hub', category: 'EMEA' },
    { id: 'sp3', xLabel: 'Logistics Delay (Days)', xValue: 6.8, yValue: 39.1, label: '2019 Q3 Surge', category: 'EMEA' },
    { id: 'sp4', xLabel: 'Logistics Delay (Days)', xValue: 12.4, yValue: 29.0, label: '2020 Q2 Crisis', category: 'Global Logistics' },
    { id: 'sp5', xLabel: 'Logistics Delay (Days)', xValue: 14.1, yValue: 27.5, label: '2021 Q1 Bottleneck', category: 'Global Logistics' },
    { id: 'sp6', xLabel: 'Logistics Delay (Days)', xValue: 8.2, yValue: 35.4, label: '2023 Q1 Pivot', category: 'APAC' },
    { id: 'sp7', xLabel: 'Logistics Delay (Days)', xValue: 4.0, yValue: 41.0, label: '2025 Q3 Current', category: 'North America' },
  ];

  // Stacked Bar Composition Data
  const compositionData: CompositionYearData[] = [
    {
      period: '2018 Fiscal',
      segments: [
        { name: 'Direct COGS', value: 32.5, color: '#1769E0' },
        { name: 'Logistics Overhead', value: 12.2, color: '#D97706' },
        { name: 'R&D Investment', value: 8.4, color: '#10B981' },
        { name: 'Compliance Surcharge', value: 4.1, color: '#6366F1' },
      ],
    },
    {
      period: '2020 Fiscal',
      segments: [
        { name: 'Direct COGS', value: 34.0, color: '#1769E0' },
        { name: 'Logistics Overhead', value: 24.8, color: '#D97706' },
        { name: 'R&D Investment', value: 6.2, color: '#10B981' },
        { name: 'Compliance Surcharge', value: 9.5, color: '#6366F1' },
      ],
    },
    {
      period: '2024 Fiscal',
      segments: [
        { name: 'Direct COGS', value: 30.1, color: '#1769E0' },
        { name: 'Logistics Overhead', value: 16.4, color: '#D97706' },
        { name: 'R&D Investment', value: 11.2, color: '#10B981' },
        { name: 'Compliance Surcharge', value: 5.8, color: '#6366F1' },
      ],
    },
  ];

  // Automated Insights List
  const insightsList: InsightItem[] = [
    {
      id: 'ins-1',
      title: 'Major Decline Detected in Operating Margin',
      distinction: 'Observed',
      period: '2019–2021',
      magnitude: '-14.2% Gross Margin Shift ($42.8M total drift)',
      supportingData: '1,420 transaction rows, 3 ledger streams',
      confidenceScore: 98.4,
      description: 'Gross margin dropped from 42.5% in 2019 to a trough of 28.3% in 2021 before recovering.',
      relatedMetrics: ['Gross Margin %', 'Freight Overhead'],
      evidenceGrade: 'G1 Verified',
      actionableRecommendation: 'Re-audit freight contract escalations executed between Q3 2019 and Q2 2021.',
    },
    {
      id: 'ins-2',
      title: 'Strong Negative Correlation Between Freight Latency & Margin',
      distinction: 'Correlated',
      period: '2010–2026',
      magnitude: 'Pearson r = -0.84 (High Co-variance)',
      supportingData: '64 quarterly data points',
      confidenceScore: 94.1,
      description: 'Increases in average shipping delay strongly co-vary with gross margin contractions.',
      relatedMetrics: ['Logistics Delay', 'Gross Margin %'],
      evidenceGrade: 'G1 Verified',
      actionableRecommendation: 'Cross-reference delay timestamps against tariff rate increases to isolate compounding variables.',
    },
    {
      id: 'ins-3',
      title: 'EMEA Vendor Tariff Surcharges Identified as Explanatory Candidate',
      distinction: 'Potential driver',
      period: '2019–2021',
      magnitude: '+103.2% Increase in Customs Penalties',
      supportingData: '312 audited vendor invoices',
      confidenceScore: 88.7,
      description: 'Customs penalties and tariff surcharges account for approximately $18.4M of the total $42.8M margin drift.',
      relatedMetrics: ['Compliance Surcharge', 'EMEA Sector'],
      evidenceGrade: 'G2 Parsed',
      actionableRecommendation: 'Run automated invoice verification against official tariff schedule rules.',
    },
  ];

  // Handle Natural Language Prompt Submission
  const handleNlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlQuery.trim()) return;

    setIsAnalyzing(true);
    onAddToast(`Running AI analytical pipeline: "${nlQuery}"`);

    setTimeout(() => {
      setIsAnalyzing(false);
      const q = nlQuery.toLowerCase();

      if (q.includes('decline') || q.includes('trend') || q.includes('2010')) {
        setActiveTab('trends');
      } else if (q.includes('anomaly') || q.includes('anomalies')) {
        setActiveTab('anomalies');
      } else if (q.includes('compare') || q.includes('2019') || q.includes('2024')) {
        setActiveTab('comparisons');
      } else if (q.includes('correlat') || q.includes('relationship')) {
        setActiveTab('relationships');
      } else if (q.includes('driver') || q.includes('cause')) {
        setActiveTab('drivers');
      } else {
        setActiveTab('overview');
      }

      onAddToast('Analytical investigation complete. Updated visualizations & insights.');
    }, 800);
  };

  const handleSelectPromptChip = (chipText: string) => {
    setNlQuery(chipText);
    setIsAnalyzing(true);
    onAddToast(`Executing: "${chipText}"`);

    setTimeout(() => {
      setIsAnalyzing(false);
      if (chipText.includes('decline')) setActiveTab('trends');
      else if (chipText.includes('anomalies')) setActiveTab('anomalies');
      else if (chipText.includes('Compare')) setActiveTab('comparisons');
      else if (chipText.includes('correlated')) setActiveTab('relationships');
      onAddToast('Analytical pipeline completed.');
    }, 700);
  };

  const handleOpenDrillDownForInsight = (insight: InsightItem) => {
    setSelectedInsightForDrill(insight);
    setDrillTargetSubject(insight.title);
    setIsDrillDownOpen(true);
  };

  const handleOpenDrillDownForSubject = (subject: string) => {
    setSelectedInsightForDrill(null);
    setDrillTargetSubject(subject);
    setIsDrillDownOpen(true);
  };

  return (
    <PageContainer>
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        title="Analytics Engine"
        description={`Automated quantitative analysis, trends, correlation exploration and predictive modeling for ${workspace.name}.`}
        breadcrumb={
          <div className="flex items-center gap-2">
            <span>{workspace.name}</span>
            <span className="text-[var(--c-text-3)]">/</span>
            <span className="text-[var(--c-blue)]">Analytics Engine</span>
          </div>
        }
        badge={
          <Badge variant="blue">
            <ShieldCheck size={13} />
            {workspace.name} Domain Boundary
          </Badge>
        }
      />

      <PageContent>
        {/* 2. ANALYTICAL FILTER TOOLBAR */}
        <div className="analytics-toolbar-card">
          <div className="analytics-toolbar-row">
            {/* Dataset Selector */}
            <div className="analytics-selector-box flex-1 min-w-[200px] sm:min-w-[225px] lg:min-w-[250px] max-w-[340px]">
              <Database className="w-4 h-4 text-[var(--c-text-2)] shrink-0" />
              <span className="analytics-selector-label">Dataset:</span>
              <div className="relative flex-1 min-w-0 flex items-center">
                <select
                  value={selectedDataset}
                  onChange={(e) => {
                    setSelectedDataset(e.target.value);
                    onAddToast(`Loaded dataset: ${e.target.value}`);
                  }}
                  className="analytics-selector-select"
                >
                  {datasetsList.map((ds) => (
                    <option key={ds} value={ds} className="bg-surface text-[var(--c-text-1)]">
                      {ds}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-[var(--c-text-3)] absolute right-0 pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Period Selector */}
            <div className="analytics-selector-box min-w-[135px] sm:min-w-[155px]">
              <Calendar className="w-4 h-4 text-[var(--c-text-2)] shrink-0" />
              <span className="analytics-selector-label">Period:</span>
              <div className="relative flex-1 min-w-0 flex items-center">
                <select
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value);
                    onAddToast(`Updated Date Range: ${e.target.value}`);
                  }}
                  className="analytics-selector-select"
                >
                  {dateRanges.map((r) => (
                    <option key={r} value={r} className="bg-surface text-[var(--c-text-1)]">
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-[var(--c-text-3)] absolute right-0 pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Metric Selector */}
            <div className="analytics-selector-box min-w-[155px] sm:min-w-[180px]">
              <BarChart3 className="w-4 h-4 text-[var(--c-text-2)] shrink-0" />
              <span className="analytics-selector-label">Metric:</span>
              <div className="relative flex-1 min-w-0 flex items-center">
                <select
                  value={selectedMetric}
                  onChange={(e) => {
                    setSelectedMetric(e.target.value);
                    onAddToast(`Active Metric: ${e.target.value}`);
                  }}
                  className="analytics-selector-select"
                >
                  {metricOptions.map((m) => (
                    <option key={m} value={m} className="bg-surface text-[var(--c-text-1)]">
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-[var(--c-text-3)] absolute right-0 pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`analytics-btn-filter ${showFiltersDrawer ? 'active' : ''}`}
            >
              <Sliders className="w-4 h-4 text-inherit shrink-0" />
              <span>Filters</span>
            </button>

            {/* Run Analysis Button */}
            <button
              type="button"
              onClick={() => handleNlSubmit()}
              disabled={isAnalyzing}
              className="analytics-btn-run"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''} shrink-0`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
            </button>
          </div>

          {showFiltersDrawer && (
            <div className="pt-3.5 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs animate-fade-in bg-surface-2 p-4 rounded-xl">
              <div>
                <label className="block text-[var(--c-text-2)] font-semibold mb-1.5 text-xs">Region Dimension</label>
                <div className="relative flex items-center">
                  <select className="w-full h-10 px-3.5 pr-8 bg-surface border border-border rounded-lg text-[var(--c-text-1)] font-medium outline-none text-xs appearance-none cursor-pointer hover:border-[var(--c-border-2)] focus:border-[var(--c-blue)]">
                    <option>All Global Regions</option>
                    <option>North America</option>
                    <option>EMEA</option>
                    <option>APAC</option>
                  </select>
                  <ChevronDown size={14} className="text-[var(--c-text-3)] absolute right-2.5 pointer-events-none shrink-0" />
                </div>
              </div>
              <div>
                <label className="block text-[var(--c-text-2)] font-semibold mb-1.5 text-xs">Evidence Grade Filter</label>
                <div className="relative flex items-center">
                  <select className="w-full h-10 px-3.5 pr-8 bg-surface border border-border rounded-lg text-[var(--c-text-1)] font-medium outline-none text-xs appearance-none cursor-pointer hover:border-[var(--c-border-2)] focus:border-[var(--c-blue)]">
                    <option>All Evidence Grades</option>
                    <option>G1 Verified Only</option>
                    <option>G2 Parsed & Above</option>
                  </select>
                  <ChevronDown size={14} className="text-[var(--c-text-3)] absolute right-2.5 pointer-events-none shrink-0" />
                </div>
              </div>
              <div>
                <label className="block text-[var(--c-text-2)] font-semibold mb-1.5 text-xs">Anomaly Threshold</label>
                <div className="relative flex items-center">
                  <select className="w-full h-10 px-3.5 pr-8 bg-surface border border-border rounded-lg text-[var(--c-text-1)] font-medium outline-none text-xs appearance-none cursor-pointer hover:border-[var(--c-border-2)] focus:border-[var(--c-blue)]">
                    <option>All Signals</option>
                    <option>High Severity (&gt;0.80)</option>
                    <option>Medium Severity (&gt;0.50)</option>
                  </select>
                  <ChevronDown size={14} className="text-[var(--c-text-3)] absolute right-2.5 pointer-events-none shrink-0" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. NATURAL-LANGUAGE ANALYTICAL QUERY PANEL */}
        <div className="nl-prompt-panel">
          <div className="nl-prompt-header">
            <div className="nl-prompt-header-left">
              <div className="nl-prompt-icon-badge">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="nl-prompt-title-group">
                <h2 className="nl-prompt-title">Natural-Language Analytical Query</h2>
                <p className="nl-prompt-subtitle">Ask natural language questions about trends, margins, anomalies, and correlations</p>
              </div>
            </div>
            <span className="nl-prompt-badge">
              Governed AI Engine
            </span>
          </div>

          <form
            onSubmit={handleNlSubmit}
            className="nl-prompt-form"
          >
            <div className="nl-prompt-input-wrapper">
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Ask about trends, declines, anomalies, or correlations (e.g. Analyze the decline from 2010 to 2026)..."
                className="nl-prompt-input"
              />
            </div>

            <div className="nl-prompt-actions-group">
              <button
                type="button"
                onClick={() => {
                  setIsListening(!isListening);
                  onAddToast(isListening ? 'Voice input stopped' : 'Voice listening active... Speak your query');
                }}
                className={`nl-prompt-btn-mic ${isListening ? 'listening' : ''}`}
                title="Toggle Voice Input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={isAnalyzing || !nlQuery.trim()}
                className="nl-prompt-btn-primary"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="nl-prompt-examples-row">
            <span className="nl-prompt-examples-label">Try example prompts:</span>
            {promptExamples.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSelectPromptChip(prompt)}
                className="nl-prompt-example-chip"
              >
                “{prompt}”
              </button>
            ))}
          </div>
        </div>

        {/* 4. ANALYSIS NAVIGATION TABS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            backgroundColor: 'var(--c-surface)',
            padding: '8px',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--c-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'trends', label: 'Trends' },
            { id: 'comparisons', label: 'Comparisons' },
            { id: 'anomalies', label: 'Anomalies' },
            { id: 'relationships', label: 'Relationships' },
            { id: 'drivers', label: 'Drivers' },
            { id: 'detailed_data', label: 'Detailed Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as AnalysisSectionTab);
                onSubTabChange?.(tab.id as AnalysisSectionTab);
              }}
              style={{
                height: '36px',
                padding: '0 18px',
                borderRadius: 'var(--r-md)',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? 700 : 600,
                backgroundColor: activeTab === tab.id ? 'var(--c-blue)' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--c-text-2)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1.3',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 5. TAB CONTENTS & METRIC CARDS */}
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  padding: '20px 22px',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--c-border)',
                  backgroundColor: 'var(--c-surface)',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '128px',
                  gap: '10px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--c-text-2)] uppercase tracking-wider">Active Metric Value</span>
                  <BarChart3 className="w-4 h-4 text-[var(--c-blue)]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--c-text-1)] font-mono tracking-tight">41.2%</div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +1.8% vs FY2025
                </div>
              </div>

              <div
                style={{
                  padding: '20px 22px',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--c-border)',
                  backgroundColor: 'var(--c-surface)',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '128px',
                  gap: '10px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--c-text-2)] uppercase tracking-wider">Historical Trough (2021)</span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono tracking-tight">28.3%</div>
                <div className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" /> -14.2% drop from 2019
                </div>
              </div>

              <div
                style={{
                  padding: '20px 22px',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--c-border)',
                  backgroundColor: 'var(--c-surface)',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '128px',
                  gap: '10px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--c-text-2)] uppercase tracking-wider">Strongest Correlation</span>
                  <Sliders className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono tracking-tight">r = -0.84</div>
                <div className="text-xs text-[var(--c-text-2)] font-medium">Logistics Latency vs Margin</div>
              </div>

              <div
                style={{
                  padding: '20px 22px',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--c-border)',
                  backgroundColor: 'var(--c-surface)',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '128px',
                  gap: '10px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--c-text-2)] uppercase tracking-wider">Verified Evidence Grade</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tracking-tight">G1 Ledger</div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cryptographic Integrity
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <TimeSeriesLineChart
                title="16-Year Operating Margin Trajectory & Decline Pattern"
                description="Longitudinal tracking of gross margin variance across authorized fiscal periods (2010 – 2026)."
                metric={selectedMetric}
                period={dateRange}
                source={selectedDataset}
                evidenceGrade="G1 Verified"
                data={timeSeriesData}
                unit="%"
                onDrillDown={(p) => handleOpenDrillDownForSubject(`Year ${p}`)}
              />

              <CategoryBarChart
                title="Regional Sector Performance Variance (2019 vs 2024)"
                description="Comparison of baseline pre-decline margins against current fiscal operational status."
                metric="Margin % by Sector"
                period="2019 vs 2024"
                source={selectedDataset}
                evidenceGrade="G1 Verified"
                data={categoryComparisonData}
                baselineLabel="2019 Baseline"
                currentLabel="2024 Status"
                onDrillDown={(cat) => handleOpenDrillDownForSubject(cat)}
              />
            </div>

            <div className="lg:col-span-5">
              <InsightPanel
                insights={insightsList}
                onDrillDown={(ins) => handleOpenDrillDownForInsight(ins)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. TRENDS TAB */}
      {activeTab === 'trends' && (
        <div className="space-y-6 animate-fade-in">
          <TimeSeriesLineChart
            title="Multi-Year Trend Analysis & Decline Curve (2010 – 2026)"
            description="Detailed longitudinal line trajectory showing the 2019-2021 margin drop and post-2022 recovery curve."
            metric={selectedMetric}
            period={dateRange}
            source={selectedDataset}
            evidenceGrade="G1 Verified"
            data={timeSeriesData}
            unit="%"
            onDrillDown={(p) => handleOpenDrillDownForSubject(`Trend Period ${p}`)}
          />

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 w-full">
            <div className="bg-[var(--c-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--c-border)] shadow-xs flex flex-col justify-between space-y-3.5 min-w-0 transition-colors hover:border-[var(--c-border-2)]">
              <div className="space-y-2.5 min-w-0">
                <h3 className="font-bold text-[var(--c-text-1)] text-sm sm:text-base tracking-tight">
                  Decline Phase Breakdown (2019–2021)
                </h3>
                <p className="text-xs sm:text-[13px] text-[var(--c-text-2)] leading-6 break-words">
                  Empirical evidence isolates the primary drop between Q2 2019 and Q4 2021. Margin decreased at an average rate of 4.73 percentage points per year during this phase.
                </p>
              </div>
              <div className="mt-3.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs sm:text-[13px] text-red-600 dark:text-red-400 font-mono font-semibold flex items-center gap-2 flex-wrap min-w-0">
                <span>Decline Velocity: -0.39% / Month</span>
                <span className="text-red-300 dark:text-red-600 hidden sm:inline select-none">|</span>
                <span>Peak Drift: $42.8M</span>
              </div>
            </div>

            <div className="bg-[var(--c-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--c-border)] shadow-xs flex flex-col justify-between space-y-3.5 min-w-0 transition-colors hover:border-[var(--c-border-2)]">
              <div className="space-y-2.5 min-w-0">
                <h3 className="font-bold text-[var(--c-text-1)] text-sm sm:text-base tracking-tight">
                  Recovery Phase Analysis (2022–2026)
                </h3>
                <p className="text-xs sm:text-[13px] text-[var(--c-text-2)] leading-6 break-words">
                  Post-2022 restructuring and automation initiatives resulted in a steady recovery curve (+2.58 percentage points per year).
                </p>
              </div>
              <div className="mt-3.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs sm:text-[13px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-2 flex-wrap min-w-0">
                <span>Recovery Velocity: +0.22% / Month</span>
                <span className="text-emerald-300 dark:text-emerald-600 hidden sm:inline select-none">|</span>
                <span>Regained Margin: +12.9%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPARISONS TAB */}
      {activeTab === 'comparisons' && (
        <div className="space-y-6 animate-fade-in">
          <CategoryBarChart
            title="Comparative Sector & Regional Variance (2019 Baseline vs 2024 Current)"
            description="Side-by-side category comparison identifying which enterprise sectors suffered the largest margin contraction."
            metric="Gross Margin %"
            period="2019 vs 2024"
            source={selectedDataset}
            evidenceGrade="G1 Verified"
            data={categoryComparisonData}
            baselineLabel="2019 Baseline"
            currentLabel="2024 Current"
            onDrillDown={(cat) => handleOpenDrillDownForSubject(`Category: ${cat}`)}
          />

          <CompositionStackedBar
            title="Historical Expense Composition Breakdown (2018 vs 2020 vs 2024)"
            description="Composition shift across Direct COGS, Logistics Overhead, R&D, and Compliance surcharges."
            metric="Cost Breakdown ($M)"
            period="2018 – 2024"
            source={selectedDataset}
            evidenceGrade="G1 Verified"
            data={compositionData}
            onDrillDown={(p) => handleOpenDrillDownForSubject(`Composition Period: ${p}`)}
          />
        </div>
      )}

      {/* 4. ANOMALIES TAB */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-sm block">3 High-Severity Anomaly Clusters Detected</strong>
              Autonomous pattern analysis flagged unusual statistical variance in 2019 Q3, 2020 Q2, and 2021 Q1.
            </div>
          </div>

          <TimeSeriesLineChart
            title="Anomaly Distribution Along Time-Series"
            description="Pulsing markers highlight statistically significant outlier events along the timeline."
            metric={selectedMetric}
            period={dateRange}
            source={selectedDataset}
            evidenceGrade="G1 Verified"
            data={timeSeriesData}
            unit="%"
            onDrillDown={(p) => handleOpenDrillDownForSubject(`Anomaly Point ${p}`)}
          />
        </div>
      )}

      {/* 5. RELATIONSHIPS TAB */}
      {activeTab === 'relationships' && (
        <div className="space-y-6 animate-fade-in">
          <RelationshipScatterPlot
            title="Variable Co-variance: Freight Latency vs Margin Impact"
            description="Scatter plot showing correlation between average delivery delay days and resulting operating margin %."
            metric="Margin %"
            period={dateRange}
            source={selectedDataset}
            evidenceGrade="G1 Verified"
            data={scatterData}
            xTitle="Logistics Delay (Days)"
            yTitle="Operating Margin %"
            correlationCoeff={-0.84}
            onDrillDown={(lbl) => handleOpenDrillDownForSubject(`Scatter Point: ${lbl}`)}
          />

          <div className="bg-[var(--c-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--c-border)] shadow-xs space-y-2.5 min-w-0 transition-colors hover:border-[var(--c-border-2)]">
            <h3 className="font-bold text-[var(--c-text-1)] text-sm sm:text-base tracking-tight">Governance Note on Correlation vs Causation</h3>
            <p className="text-xs sm:text-[13px] text-[var(--c-text-2)] leading-6 break-words">
              Synaptix Command strictly separates <strong className="text-[var(--c-text-1)] font-semibold">Correlated</strong> observations from <strong className="text-[var(--c-text-1)] font-semibold">Verified explanations</strong>. While Freight Latency exhibits a strong negative correlation (r = -0.84), direct causality requires verification against underlying freight contract billing records.
            </p>
          </div>
        </div>
      )}

      {/* 6. DRIVERS TAB */}
      {activeTab === 'drivers' && (
        <div className="space-y-6 animate-fade-in">
          <CompositionStackedBar
            title="Potential vs Verified Margin Drift Drivers"
            description="Deconstruction of expenditure segments contributing to total margin shift."
            metric="Overhead Contribution ($M)"
            period="2018 – 2024"
            source={selectedDataset}
            evidenceGrade="G1 Verified"
            data={compositionData}
            onDrillDown={(p) => handleOpenDrillDownForSubject(`Driver Breakdown: ${p}`)}
          />

          <InsightPanel
            insights={insightsList.filter((i) => i.distinction === 'Potential driver' || i.distinction === 'Verified explanation')}
            onDrillDown={(ins) => handleOpenDrillDownForInsight(ins)}
          />
        </div>
      )}

      {/* 7. DETAILED DATA TAB */}
      {activeTab === 'detailed_data' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Underlying Dataset Table</h3>
              <p className="text-xs text-slate-500">
                Direct view of active operational ledger records for {selectedDataset}
              </p>
            </div>
            <button
              onClick={() => handleOpenDrillDownForSubject('Full Dataset View')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Open Full Inspector Drawer
            </button>
          </div>

          <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50 space-y-3">
            <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Underlying Rows Ready for Inspection</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click below to view, filter, and export the full set of 1,420 cryptographic ledger entries supporting this workspace analysis.
            </p>
            <button
              onClick={() => handleOpenDrillDownForSubject('Full Dataset View')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5"
            >
              Launch Interactive Data Inspector
            </button>
          </div>
        </div>
      )}

      {/* DRILL DOWN MODAL */}
      <DataDrillDownModal
        isOpen={isDrillDownOpen}
        onClose={() => setIsDrillDownOpen(false)}
        insight={selectedInsightForDrill}
        targetSubject={drillTargetSubject}
        onAddToast={onAddToast}
      />
      </PageContent>
    </PageContainer>
  );
};
