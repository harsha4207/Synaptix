import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Edit2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Lightbulb,
  FileText,
  Filter
} from 'lucide-react';
import {
  TimeSeriesLineChart,
  CategoryBarChart,
  TimeSeriesPoint,
  CategoryComparisonItem
} from '../analytics/AnalyticsCharts';
import { Badge } from '../ui/Badge';

export type WidgetType =
  | 'kpi'
  | 'line_chart'
  | 'bar_chart'
  | 'table'
  | 'insight'
  | 'text_summary'
  | 'filter_control';

export type WidgetWidth = 'full' | 'half' | 'third';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  width: WidgetWidth;
  dataset: string;
  metric: string;
  period: string;
  evidenceGrade?: string;
  kpiValue?: string;
  kpiChange?: string;
  isPositiveChange?: boolean;
  kpiSubtext?: string;
  summaryText?: string;
  insightDistinction?: string;
  insightMagnitude?: string;
  lineData?: TimeSeriesPoint[];
  barData?: CategoryComparisonItem[];
}

interface DashboardCanvasProps {
  widgets: DashboardWidget[];
  onSelectWidget: (widget: DashboardWidget) => void;
  onRemoveWidget: (id: string) => void;
  onDuplicateWidget: (widget: DashboardWidget) => void;
  onMoveWidget: (id: string, direction: 'up' | 'down') => void;
  onToggleWidth: (id: string) => void;
  onAddToast: (msg: string) => void;
}

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  widgets,
  onSelectWidget,
  onRemoveWidget,
  onDuplicateWidget,
  onMoveWidget,
  onToggleWidth,
  onAddToast,
}) => {
  const getGridSpan = (width: WidgetWidth): string => {
    switch (width) {
      case 'full':
        return '1 / -1';
      case 'half':
        return 'span 6';
      case 'third':
        return 'span 4';
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 'var(--sp-5)',
        animation: 'fade-in 0.2s ease',
      }}
    >
      {widgets.map((widget, index) => {
        return (
          <div
            key={widget.id}
            style={{
              gridColumn: getGridSpan(widget.width),
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--c-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--c-border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {/* Header bar */}
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--c-page)',
                  borderBottom: '1px solid var(--c-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--c-text-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <span style={{ cursor: 'grab', color: 'var(--c-text-3)', display: 'inline-flex', flexShrink: 0 }}>
                    <GripVertical size={15} />
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: 'var(--c-text-1)',
                      fontSize: 'var(--text-xs)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '170px',
                    }}
                    title={widget.title}
                  >
                    {widget.title}
                  </span>
                  {widget.evidenceGrade && (
                    <Badge variant="success" size="sm" className="whitespace-nowrap flex-shrink-0">
                      <ShieldCheck size={12} style={{ marginRight: 3 }} />
                      {widget.evidenceGrade}
                    </Badge>
                  )}
                </div>

                {/* Widget Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => onMoveWidget(widget.id, 'up')}
                    disabled={index === 0}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      opacity: index === 0 ? 0.3 : 1,
                      padding: 5,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--c-text-2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Move Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveWidget(widget.id, 'down')}
                    disabled={index === widgets.length - 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: index === widgets.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: index === widgets.length - 1 ? 0.3 : 1,
                      padding: 5,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--c-text-2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Move Down"
                  >
                    <ArrowDown size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleWidth(widget.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 5,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--c-text-2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={`Width: ${widget.width}. Click to toggle width.`}
                  >
                    {widget.width === 'full' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectWidget(widget)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 5,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--c-blue)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Edit Widget"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateWidget(widget)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 5,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--c-text-2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Duplicate Widget"
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveWidget(widget.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 5,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--c-danger)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove Widget"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Widget Body Content */}
              <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {widget.type === 'kpi' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--c-text-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {widget.metric}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-3xl)',
                          fontWeight: 800,
                          color: 'var(--c-text-1)',
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {widget.kpiValue || '41.2%'}
                      </span>
                      {widget.kpiChange && (
                        <Badge variant={widget.isPositiveChange ? 'success' : 'destructive'} className="whitespace-nowrap">
                          {widget.isPositiveChange ? (
                            <TrendingUp size={13} style={{ marginRight: 3 }} />
                          ) : (
                            <TrendingDown size={13} style={{ marginRight: 3 }} />
                          )}
                          {widget.kpiChange}
                        </Badge>
                      )}
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-2)', margin: 0, lineHeight: 1.4 }}>
                      {widget.kpiSubtext || widget.description}
                    </p>
                  </div>
                )}

                {widget.type === 'line_chart' && widget.lineData && (
                  <TimeSeriesLineChart
                    title={widget.title}
                    description={widget.description}
                    metric={widget.metric}
                    period={widget.period}
                    source={widget.dataset}
                    evidenceGrade={widget.evidenceGrade || 'G1 Verified'}
                    data={widget.lineData}
                    onDrillDown={(p) => onAddToast(`Drilled into year ${p} from Dashboard Widget`)}
                  />
                )}

                {widget.type === 'bar_chart' && widget.barData && (
                  <CategoryBarChart
                    title={widget.title}
                    description={widget.description}
                    metric={widget.metric}
                    period={widget.period}
                    source={widget.dataset}
                    evidenceGrade={widget.evidenceGrade || 'G1 Verified'}
                    data={widget.barData}
                    baselineLabel="2019 Baseline"
                    currentLabel="2024 Current"
                    onDrillDown={(cat) => onAddToast(`Drilled into category ${cat}`)}
                  />
                )}

                {widget.type === 'table' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontWeight: 700, color: 'var(--c-text-1)', fontSize: 'var(--text-sm)', margin: 0 }}>
                        {widget.title}
                      </h4>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>
                        6 Ledger Records
                      </span>
                    </div>
                    <div style={{ overflowX: 'auto', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-md)' }}>
                      <table style={{ width: '100%', textAlign: 'left', fontSize: 'var(--text-xs)', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--c-page)', borderBottom: '1px solid var(--c-border)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--c-text-2)' }}>
                            <th style={{ padding: '8px 10px' }}>Record ID</th>
                            <th style={{ padding: '8px 10px' }}>Cost Center</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>Value ($)</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center' }}>Score</th>
                          </tr>
                        </thead>
                        <tbody style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                            <td style={{ padding: '8px 10px', color: 'var(--c-blue)', fontWeight: 700 }}>REC-2019-0941</td>
                            <td style={{ padding: '8px 10px', color: 'var(--c-text-1)', fontFamily: 'var(--font-body)' }}>EMEA Enterprise</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>$1,420,000</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--c-danger)', fontWeight: 700 }}>94%</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                            <td style={{ padding: '8px 10px', color: 'var(--c-blue)', fontWeight: 700 }}>REC-2020-0312</td>
                            <td style={{ padding: '8px 10px', color: 'var(--c-text-1)', fontFamily: 'var(--font-body)' }}>North America Hub</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>$2,350,000</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--c-danger)', fontWeight: 700 }}>96%</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 10px', color: 'var(--c-blue)', fontWeight: 700 }}>REC-2024-0419</td>
                            <td style={{ padding: '8px 10px', color: 'var(--c-text-1)', fontFamily: 'var(--font-body)' }}>Automated Ops</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>-$1,250,000</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--c-success)', fontWeight: 700 }}>22%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {widget.type === 'insight' && (
                  <div
                    style={{
                      padding: 'var(--sp-4)',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--sp-2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lightbulb size={16} style={{ color: '#D97706' }} />
                        <h4 style={{ fontWeight: 700, color: '#92400E', fontSize: 'var(--text-sm)', margin: 0 }}>
                          {widget.title}
                        </h4>
                      </div>
                      <Badge variant="warning">{widget.insightDistinction || 'Observed'}</Badge>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                      {widget.description}
                    </p>
                    <div
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: '#92400E',
                        borderTop: '1px solid #FDE68A',
                        paddingTop: 'var(--sp-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        Magnitude: <strong>{widget.insightMagnitude || '-14.2% Margin Shift'}</strong>
                      </span>
                      <span style={{ color: 'var(--c-blue)', fontWeight: 700 }}>98.4% Confidence</span>
                    </div>
                  </div>
                )}

                {widget.type === 'text_summary' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-blue)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      <FileText size={16} />
                      Executive Narrative Overview
                    </div>
                    <p
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--c-text-2)',
                        lineHeight: 1.6,
                        backgroundColor: 'var(--c-page)',
                        padding: 'var(--sp-3)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--c-border)',
                        margin: 0,
                      }}
                    >
                      {widget.summaryText ||
                        'Longitudinal tracking of gross margin variance demonstrates a significant 14.2% margin contraction between 2019 and 2021, primarily driven by logistics overhead surcharges and EMEA customs penalties. Strategic restructuring since 2022 has restored operating margin to 41.2% in FY2026.'}
                    </p>
                  </div>
                )}

                {widget.type === 'filter_control' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--sp-3)',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      padding: 'var(--sp-3)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    <Filter size={16} style={{ color: 'var(--c-blue)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', width: '100%' }}>
                      <span style={{ fontWeight: 700, color: '#1E3A8A' }}>Global Canvas Filter:</span>
                      <select
                        style={{
                          backgroundColor: 'var(--c-surface)',
                          border: '1px solid var(--c-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '4px 8px',
                          color: 'var(--c-text-1)',
                          fontSize: 'var(--text-xs)',
                        }}
                      >
                        <option>All Operating Sectors</option>
                        <option>North America Enterprise</option>
                        <option>EMEA Operational Sector</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
