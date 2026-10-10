import React, { useState } from 'react';
import {
  BarChart3,
  Plus,
  Save,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Check
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import {
  DashboardCanvas,
  DashboardWidget,
  WidgetWidth,
  WidgetType
} from '../components/dashboards/DashboardCanvas';
import { WidgetConfigPanel } from '../components/dashboards/WidgetConfigPanel';
import { AiAssistToolbar } from '../components/dashboards/AiAssistToolbar';
import { TimeSeriesPoint, CategoryComparisonItem } from '../components/analytics/AnalyticsCharts';
import { PageContainer, PageContent, PageHeader } from '../components/layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface DashboardsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export const DashboardsModule: React.FC<DashboardsModuleProps> = ({ workspace, onAddToast }) => {
  // Top Command NL State
  const [nlDashboardPrompt, setNlDashboardPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);

  // Active Dashboard Metadata
  const [dashboardTitle, setDashboardTitle] = useState<string>(
    'FY2026 Executive Performance & Revenue Trajectory'
  );
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  // Inspector Panel State
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Generation Workflow Steps
  const workflowSteps = [
    'User request',
    'Interpret requirements',
    'Identify datasets',
    'Select metrics',
    'Select visualizations',
    'Generate layout',
    'Preview & Edit',
  ];

  // Default Mock Line Data
  const sampleLineData: TimeSeriesPoint[] = [
    { year: 2010, value: 48.5, label: 'Peak Baseline' },
    { year: 2012, value: 47.2, label: 'Stable Expansion' },
    { year: 2014, value: 46.8, label: 'Normal Variance' },
    { year: 2016, value: 45.1, label: 'Modest Shift' },
    { year: 2018, value: 44.2, label: 'Pre-Decline' },
    { year: 2019, value: 42.5, label: 'Onset of Decline', isAnomaly: true },
    { year: 2020, value: 34.0, label: 'Pandemic Drift', isAnomaly: true },
    { year: 2021, value: 28.3, label: 'Trough Lowest', isAnomaly: true },
    { year: 2022, value: 31.5, label: 'Recovery Start' },
    { year: 2024, value: 37.8, label: 'Automation Impact' },
    { year: 2026, value: 41.2, label: 'Current FY Status' },
  ];

  // Default Mock Bar Data
  const sampleBarData: CategoryComparisonItem[] = [
    { category: 'North America Enterprise', valBaseline: 52.4, valCurrent: 44.1, deltaPercent: -15.8 },
    { category: 'EMEA Operational Sector', valBaseline: 46.1, valCurrent: 33.2, deltaPercent: -28.0 },
    { category: 'APAC Logistics Network', valBaseline: 38.0, valCurrent: 36.5, deltaPercent: -3.9 },
    { category: 'LATAM Growth Hub', valBaseline: 29.5, valCurrent: 34.8, deltaPercent: 17.9 },
  ];

  // Initial Widgets Setup
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'w-kpi-1',
      type: 'kpi',
      title: 'Gross Margin %',
      description: 'Current FY2026 active operating margin',
      width: 'third',
      dataset: 'FY2026 Enterprise Operational Ledger',
      metric: 'Gross Margin %',
      period: '2010 – 2026',
      evidenceGrade: 'G1 Verified',
      kpiValue: '41.2%',
      kpiChange: '+1.8% YoY',
      isPositiveChange: true,
      kpiSubtext: 'Trough: 28.3% in FY2021',
    },
    {
      id: 'w-kpi-2',
      type: 'kpi',
      title: 'Net Revenue ($M)',
      description: 'Total consolidated enterprise revenue',
      width: 'third',
      dataset: 'FY2026 Enterprise Operational Ledger',
      metric: 'Net Revenue ($M)',
      period: 'FY2026',
      evidenceGrade: 'G1 Verified',
      kpiValue: '$412.5M',
      kpiChange: '+4.2% YoY',
      isPositiveChange: true,
      kpiSubtext: 'Target: $425.0M',
    },
    {
      id: 'w-kpi-3',
      type: 'kpi',
      title: 'High Severity Anomalies',
      description: 'Flagged ledger shift clusters',
      width: 'third',
      dataset: 'Supply Chain Latency & Freight Audit',
      metric: 'Anomaly Count',
      period: '2019 – 2021',
      evidenceGrade: 'G1 Verified',
      kpiValue: '3 Clusters',
      kpiChange: '-14.2% Margin Drift',
      isPositiveChange: false,
      kpiSubtext: 'Logistics overhead surge',
    },
    {
      id: 'w-summary-1',
      type: 'text_summary',
      title: 'Executive Summary',
      description: 'Longitudinal analysis overview',
      width: 'full',
      dataset: 'FY2026 Enterprise Operational Ledger',
      metric: 'Executive Narrative',
      period: '2010 – 2026',
      summaryText:
        'Executive Overview: Longitudinal tracking of gross margin variance demonstrates a significant 14.2% margin contraction between 2019 and 2021, primarily driven by logistics overhead surcharges and EMEA customs penalties. Strategic restructuring since 2022 has restored operating margin to 41.2% in FY2026.',
    },
    {
      id: 'w-line-1',
      type: 'line_chart',
      title: '16-Year Operating Margin Trajectory (2010 – 2026)',
      description: 'Time-series curve highlighting historical trough and recovery phase',
      width: 'half',
      dataset: 'FY2026 Enterprise Operational Ledger',
      metric: 'Gross Margin %',
      period: '2010 – 2026',
      evidenceGrade: 'G1 Verified',
      lineData: sampleLineData,
    },
    {
      id: 'w-bar-1',
      type: 'bar_chart',
      title: 'Sector Performance Variance (2019 vs 2024)',
      description: 'Comparative sector breakdown isolating the EMEA margin drop',
      width: 'half',
      dataset: 'Q3 Multi-Region Revenue & Cost Log',
      metric: 'Gross Margin %',
      period: '2019 vs 2024',
      evidenceGrade: 'G1 Verified',
      barData: sampleBarData,
    },
    {
      id: 'w-insight-1',
      type: 'insight',
      title: 'Major Margin Decline Detected (2019–2021)',
      description: 'Autonomous AI insight identifying $42.8M total margin drift across EMEA and logistics overhead streams.',
      width: 'half',
      dataset: 'FY2026 Enterprise Operational Ledger',
      metric: 'Margin Drift',
      period: '2019 – 2021',
      insightDistinction: 'Observed',
      insightMagnitude: '-14.2% Total Drift ($42.8M)',
    },
    {
      id: 'w-table-1',
      type: 'table',
      title: 'Underlying Cryptographic Ledger Records',
      description: 'Direct evidence inspection of flagged financial transactions',
      width: 'half',
      dataset: 'FY2026 Enterprise Operational Ledger',
      metric: 'Ledger Audit',
      period: '2019 – 2026',
      evidenceGrade: 'G1 Verified',
    },
  ]);

  // Handle Natural Language Dashboard Generation
  const handleGenerateDashboard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setGenerationStep(1);
    onAddToast('Interpreting natural-language BI requirements...');

    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          setIsGenerating(false);
          setIsSaved(false);
          onAddToast('Generated new BI dashboard layout!');
          return 6;
        }
        return prev + 1;
      });
    }, 400);
  };

  // Widget Actions
  const handleSelectWidgetForEdit = (widget: DashboardWidget) => {
    setSelectedWidget(widget);
    setIsInspectorOpen(true);
  };

  const handleUpdateWidget = (updated: DashboardWidget) => {
    setWidgets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setIsSaved(false);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setIsSaved(false);
    onAddToast('Removed widget from canvas');
  };

  const handleDuplicateWidget = (targetWidget: DashboardWidget) => {
    const newWidget: DashboardWidget = {
      ...targetWidget,
      id: `w-copy-${Date.now()}`,
      title: `${targetWidget.title} (Copy)`,
    };
    setWidgets((prev) => [...prev, newWidget]);
    setIsSaved(false);
    onAddToast(`Duplicated widget: "${newWidget.title}"`);
  };

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    const idx = widgets.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;

    const updated = [...widgets];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setWidgets(updated);
    setIsSaved(false);
  };

  const handleToggleWidth = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const nextWidth: WidgetWidth =
          w.width === 'full' ? 'half' : w.width === 'half' ? 'third' : 'full';
        return { ...w, width: nextWidth };
      })
    );
    setIsSaved(false);
  };

  const handleAddWidget = (type: WidgetType) => {
    const newId = `w-new-${Date.now()}`;
    let newWidget: DashboardWidget;

    switch (type) {
      case 'kpi':
        newWidget = {
          id: newId,
          type: 'kpi',
          title: 'Custom Metric KPI',
          description: 'New metric tracker',
          width: 'third',
          dataset: 'FY2026 Enterprise Operational Ledger',
          metric: 'Operating Expense ($M)',
          period: 'FY2026',
          kpiValue: '$124.8M',
          kpiChange: '-2.4%',
          isPositiveChange: true,
          kpiSubtext: 'Under budget limit',
        };
        break;
      case 'line_chart':
        newWidget = {
          id: newId,
          type: 'line_chart',
          title: 'New Time-Series Chart',
          description: 'Longitudinal performance metric',
          width: 'half',
          dataset: 'FY2026 Enterprise Operational Ledger',
          metric: 'Net Revenue ($M)',
          period: '2010 â€“ 2026',
          lineData: sampleLineData,
        };
        break;
      case 'bar_chart':
        newWidget = {
          id: newId,
          type: 'bar_chart',
          title: 'New Category Comparison',
          description: 'Segment variance breakdown',
          width: 'half',
          dataset: 'Q3 Multi-Region Revenue & Cost Log',
          metric: 'Gross Margin %',
          period: '2019 vs 2024',
          barData: sampleBarData,
        };
        break;
      default:
        newWidget = {
          id: newId,
          type: 'insight',
          title: 'New AI Insight Card',
          description: 'Automated pattern alert',
          width: 'half',
          dataset: 'FY2026 Enterprise Operational Ledger',
          metric: 'Anomaly Detection',
          period: '2019 â€“ 2021',
          insightDistinction: 'Observed',
        };
    }

    setWidgets((prev) => [newWidget, ...prev]);
    setIsSaved(false);
    onAddToast(`Added new ${type.toUpperCase()} widget`);
  };

  // AI Assist Toolbar Handler
  const handleAiAssistAction = (actionType: string) => {
    onAddToast(`Executing AI Copilot: ${actionType.replace('_', ' ').toUpperCase()}`);

    if (actionType === 'improve_layout') {
      setWidgets((prev) =>
        prev.map((w, idx) => {
          if (w.type === 'kpi') return { ...w, width: 'third' };
          if (w.type === 'text_summary') return { ...w, width: 'full' };
          return { ...w, width: idx % 2 === 0 ? 'half' : 'half' };
        })
      );
      onAddToast('Optimized widget canvas grid balance');
    } else if (actionType === 'add_insight') {
      handleAddWidget('insight');
    } else if (actionType === 'add_filter') {
      const filterWidget: DashboardWidget = {
        id: `w-filter-${Date.now()}`,
        type: 'filter_control',
        title: 'Global Canvas Filter',
        description: 'Interactive sector & region filter',
        width: 'full',
        dataset: 'FY2026 Enterprise Operational Ledger',
        metric: 'Sector Filter',
        period: 'All Periods',
      };
      setWidgets((prev) => [filterWidget, ...prev]);
      onAddToast('Added Global Canvas Filter control');
    } else if (actionType === 'executive_friendly') {
      setDashboardTitle('C-Suite Executive Briefing: FY2026 Margin & Revenue Analysis');
      onAddToast('Applied C-Suite executive formatting & evidence tags');
    }
    setIsSaved(false);
  };

  // Save Dashboard Action
  const handleSaveDashboard = () => {
    setIsSaved(true);
    setShowSaveSuccess(true);
    onAddToast(`Saved dashboard "${dashboardTitle}" to ${workspace.name} Workspace`);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  return (
    <PageContainer>
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        title="Dashboards & Executive Canvas"
        description={`Interactive executive visual canvas, KPI tracking, and generative BI intelligence for ${workspace.name}.`}
        breadcrumb={
          <div className="flex items-center gap-2">
            <span>{workspace.name}</span>
            <span className="text-[var(--c-text-3)]">/</span>
            <span className="text-[var(--c-blue)]">Dashboards & Canvas</span>
          </div>
        }
        badge={
          <Badge variant="blue">
            <BarChart3 size={13} />
            {workspace.name} Boundary
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus size={14} className="text-[var(--c-blue)]" />}
              onClick={() => handleAddWidget('kpi')}
            >
              Add Widget
            </Button>
            <Button
              variant={showSaveSuccess ? 'default' : 'blue'}
              size="sm"
              leftIcon={showSaveSuccess ? <Check size={14} /> : <Save size={14} />}
              onClick={handleSaveDashboard}
            >
              {showSaveSuccess ? 'Saved!' : 'Save Dashboard'}
            </Button>
          </div>
        }
      />

      <PageContent className="space-y-6">
        {/* 2. REFINED AI DASHBOARD GENERATOR PANEL */}
        <div className="nl-prompt-panel">
          <div className="nl-prompt-header">
            <div className="nl-prompt-header-left">
              <div className="nl-prompt-icon-badge">
                <Sparkles className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div className="nl-prompt-title-group">
                <h2 className="nl-prompt-title">AI Dashboard Generator</h2>
                <p className="nl-prompt-subtitle">
                  Generate complete BI canvas layouts and visual metric cards with natural language
                </p>
              </div>
            </div>
            <span className="nl-prompt-badge">
              {workspace.name} Context
            </span>
          </div>

          <form onSubmit={handleGenerateDashboard} className="nl-prompt-form">
            <div className="nl-prompt-input-wrapper">
              <input
                type="text"
                value={nlDashboardPrompt}
                onChange={(e) => setNlDashboardPrompt(e.target.value)}
                placeholder="Describe the dashboard you want… (e.g. Executive view of revenue trajectory and anomaly drivers 2010–2026)"
                className="nl-prompt-input"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="nl-prompt-btn-primary"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="nl-prompt-examples-row">
            <span className="nl-prompt-examples-label">Example:</span>
            <button
              type="button"
              onClick={() => {
                setNlDashboardPrompt(
                  'Create an executive dashboard showing revenue decline from 2010 to 2026, major drivers, anomalies and current performance.'
                );
                handleGenerateDashboard();
              }}
              className="nl-prompt-example-chip"
            >
              “Create an executive dashboard showing revenue decline from 2010 to 2026, major drivers, anomalies and current performance.”
            </button>
          </div>

          {isGenerating && (
            <div className="pt-3 border-t border-[rgba(255,255,255,0.12)]">
              <div className="flex justify-between items-center text-xs text-[rgba(255,255,255,0.8)] mb-2">
                <span className="font-semibold">Workflow Generation Step:</span>
                <span className="font-mono text-[#38BDF8]">{workflowSteps[generationStep]}</span>
              </div>
              <div className="flex gap-1.5">
                {workflowSteps.map((step, idx) => (
                  <div
                    key={step}
                    title={step}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      idx <= generationStep ? 'bg-[#38BDF8]' : 'bg-[rgba(255,255,255,0.15)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. DASHBOARD CANVAS CONTROL BAR */}
        <div className="w-full bg-[var(--c-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--c-border)] shadow-xs transition-colors flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-xl bg-[var(--c-blue-soft)] text-[var(--c-blue)] border border-[rgba(23,105,224,0.15)] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <input
                    type="text"
                    value={dashboardTitle}
                    onChange={(e) => {
                      setDashboardTitle(e.target.value);
                      setIsSaved(false);
                    }}
                    className="w-full max-w-xl font-display font-bold text-lg sm:text-xl text-[var(--c-text-1)] bg-transparent border border-transparent hover:border-[var(--c-border)] focus:border-[var(--c-blue)] focus:bg-[var(--c-surface)] rounded-lg px-2 py-1 outline-none transition-all"
                    aria-label="Dashboard Title"
                  />
                  {!isSaved && (
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200 select-none">
                      Unsaved Edits
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--c-text-2)] mt-1 font-normal">
                  Interactive BI Canvas • G1 Ledger Evidence Binding • <span className="font-semibold text-[var(--c-text-1)]">{widgets.length} Widgets Active</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--c-border)]">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={14} className="text-[var(--c-blue)]" />}
                onClick={() => handleAddWidget('kpi')}
              >
                Add Widget
              </Button>
              <Button
                variant={showSaveSuccess ? 'default' : 'blue'}
                size="sm"
                leftIcon={showSaveSuccess ? <Check size={14} /> : <Save size={14} />}
                onClick={handleSaveDashboard}
              >
                {showSaveSuccess ? 'Saved!' : 'Save Dashboard'}
              </Button>
            </div>
          </div>

          <AiAssistToolbar onAiAction={handleAiAssistAction} isProcessing={isGenerating} />
        </div>

        {/* 4. DASHBOARD CANVAS */}
        <DashboardCanvas
          widgets={widgets}
          onSelectWidget={handleSelectWidgetForEdit}
          onRemoveWidget={handleRemoveWidget}
          onDuplicateWidget={handleDuplicateWidget}
          onMoveWidget={handleMoveWidget}
          onToggleWidth={handleToggleWidth}
          onAddToast={onAddToast}
        />

        {/* 5. WIDGET CONFIG PANEL */}
        <WidgetConfigPanel
          widget={selectedWidget}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateWidget={handleUpdateWidget}
          onRemoveWidget={handleRemoveWidget}
          onDuplicateWidget={handleDuplicateWidget}
          onAddToast={onAddToast}
        />
      </PageContent>
    </PageContainer>
  );
};
