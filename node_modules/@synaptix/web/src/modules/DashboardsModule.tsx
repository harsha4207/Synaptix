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
import { PageContainer, PageContent } from '../components/layout';

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
      period: '2010 â€“ 2026',
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
      period: '2019 â€“ 2021',
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
      period: '2010 â€“ 2026',
      summaryText:
        'Executive Overview: Longitudinal tracking of gross margin variance demonstrates a significant 14.2% margin contraction between 2019 and 2021, primarily driven by logistics overhead surcharges and EMEA customs penalties. Strategic restructuring since 2022 has restored operating margin to 41.2% in FY2026.',
    },
    {
      id: 'w-line-1',
      type: 'line_chart',
      title: '16-Year Operating Margin Trajectory (2010 â€“ 2026)',
      description: 'Time-series curve highlighting historical trough and recovery phase',
      width: 'half',
      dataset: 'FY2026 Enterprise Operational Ledger',
      metric: 'Gross Margin %',
      period: '2010 â€“ 2026',
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
      title: 'Major Margin Decline Detected (2019â€“2021)',
      description: 'Autonomous AI insight identifying $42.8M total margin drift across EMEA and logistics overhead streams.',
      width: 'half',
      dataset: 'FY2026 Enterprise Operational Ledger',
      metric: 'Margin Drift',
      period: '2019 â€“ 2021',
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
      period: '2019 â€“ 2026',
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
      <PageContent>
      {/* TOP AI DASHBOARD COMMAND BAR */}
      <div style={{
        background: 'var(--c-navy)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
        display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Sparkles size={18} style={{ color: 'var(--c-blue-bright)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: '#FFFFFF' }}>
              AI Dashboard Generator
            </h2>
          </div>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
            {workspace.name} Context
          </span>
        </div>

        <form onSubmit={handleGenerateDashboard} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={nlDashboardPrompt}
            onChange={(e) => setNlDashboardPrompt(e.target.value)}
            placeholder="Describe the dashboard you wantâ€¦ (e.g. executive view of revenue decline 2010â€“2026)"
            style={{
              width: '100%', height: '48px', paddingLeft: 'var(--sp-4)', paddingRight: '120px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--r-md)', fontSize: 'var(--text-sm)', color: '#FFFFFF',
              outline: 'none', fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            type="submit"
            disabled={isGenerating}
            style={{
              position: 'absolute', right: '6px', height: '36px', padding: '0 var(--sp-4)',
              background: 'var(--c-blue)', color: '#FFFFFF', borderRadius: 'var(--r-md)',
              border: 'none', fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sans)',
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <><span>Generate</span><ArrowRight size={13} /></>}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-xs)' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Example:</span>
          <button
            type="button"
            onClick={() => { setNlDashboardPrompt('Create an executive dashboard showing revenue decline from 2010 to 2026, major drivers, anomalies and current performance.'); handleGenerateDashboard(); }}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--r-sm)', padding: '4px 12px', color: 'rgba(255,255,255,0.75)',
              fontSize: 'var(--text-xs)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            "Create an executive dashboard showing revenue decline from 2010 to 2026..."
          </button>
        </div>

        {isGenerating && (
          <div style={{ paddingTop: 'var(--sp-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--sp-2)' }}>
              <span style={{ fontWeight: 600 }}>Workflow Generation Step:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{workflowSteps[generationStep]}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {workflowSteps.map((step, idx) => (
                <div key={step} title={step} style={{
                  height: '4px', flex: 1, borderRadius: '999px',
                  background: idx <= generationStep ? 'var(--c-blue-bright)' : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.3s ease',
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DASHBOARD TOOLBAR */}
      <div className="card" style={{ padding: 'var(--sp-4) var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div className="action-btn-icon icon-blue"><BarChart3 size={20} /></div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <input
                  type="text"
                  value={dashboardTitle}
                  onChange={(e) => { setDashboardTitle(e.target.value); setIsSaved(false); }}
                  style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)',
                    color: 'var(--c-text-1)', background: 'transparent', border: 'none',
                    borderBottom: '1px solid transparent', outline: 'none', padding: '0 4px',
                    cursor: 'text', transition: 'border-color var(--t-fast)', maxWidth: '440px',
                  }}
                  onFocus={(e) => { e.target.style.borderBottomColor = 'var(--c-border-2)'; }}
                  onBlur={(e) => { e.target.style.borderBottomColor = 'transparent'; }}
                />
                {!isSaved && <span className="badge badge-warning">Unsaved Edits</span>}
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-2)', marginTop: '2px' }}>
                Interactive BI Canvas â€” G1 Ledger Evidence Binding ({widgets.length} Widgets)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <button className="btn-secondary btn-sm" onClick={() => handleAddWidget('kpi')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} style={{ color: 'var(--c-blue)' }} /> Add Widget
            </button>
            <button
              onClick={handleSaveDashboard}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                height: '32px', padding: '0 var(--sp-4)', borderRadius: 'var(--r-md)',
                background: showSaveSuccess ? 'var(--c-success)' : 'var(--c-blue)',
                color: '#FFFFFF', border: 'none', fontSize: 'var(--text-xs)',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                transition: 'background 0.2s ease',
              }}
            >
              {showSaveSuccess ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Dashboard</>}
            </button>
          </div>
        </div>

        <AiAssistToolbar onAiAction={handleAiAssistAction} isProcessing={isGenerating} />
      </div>

      <DashboardCanvas
        widgets={widgets}
        onSelectWidget={handleSelectWidgetForEdit}
        onRemoveWidget={handleRemoveWidget}
        onDuplicateWidget={handleDuplicateWidget}
        onMoveWidget={handleMoveWidget}
        onToggleWidth={handleToggleWidth}
        onAddToast={onAddToast}
      />

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
