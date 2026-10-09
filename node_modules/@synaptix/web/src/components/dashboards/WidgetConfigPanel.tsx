import React, { useState, useEffect } from 'react';
import { X, Sliders, Check, Trash2, Copy, ShieldCheck } from 'lucide-react';
import { DashboardWidget, WidgetType, WidgetWidth } from './DashboardCanvas';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';

interface WidgetConfigPanelProps {
  widget: DashboardWidget | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateWidget: (updatedWidget: DashboardWidget) => void;
  onRemoveWidget: (id: string) => void;
  onDuplicateWidget: (widget: DashboardWidget) => void;
  onAddToast: (msg: string) => void;
}

export const WidgetConfigPanel: React.FC<WidgetConfigPanelProps> = ({
  widget,
  isOpen,
  onClose,
  onUpdateWidget,
  onRemoveWidget,
  onDuplicateWidget,
  onAddToast,
}) => {
  if (!isOpen || !widget) return null;

  const [title, setTitle] = useState(widget.title);
  const [description, setDescription] = useState(widget.description);
  const [type, setType] = useState<WidgetType>(widget.type);
  const [width, setWidth] = useState<WidgetWidth>(widget.width);
  const [dataset, setDataset] = useState(widget.dataset);
  const [metric, setMetric] = useState(widget.metric);
  const [period, setPeriod] = useState(widget.period);

  useEffect(() => {
    setTitle(widget.title);
    setDescription(widget.description);
    setType(widget.type);
    setWidth(widget.width);
    setDataset(widget.dataset);
    setMetric(widget.metric);
    setPeriod(widget.period);
  }, [widget]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWidget({
      ...widget,
      title,
      description,
      type,
      width,
      dataset,
      metric,
      period,
    });
    onAddToast(`Updated widget: "${title}"`);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(11, 31, 58, 0.35)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fade-in 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          height: '100%',
          backgroundColor: 'var(--c-surface)',
          borderLeft: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          animation: 'slide-in-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--sp-4) var(--sp-5)',
            borderBottom: '1px solid var(--c-border)',
            backgroundColor: 'var(--c-page)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div
              style={{
                padding: 'var(--sp-2)',
                backgroundColor: 'rgba(23, 105, 224, 0.1)',
                color: 'var(--c-blue)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--c-text-1)', margin: 0 }}>
                Widget Configuration
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', margin: 0 }}>
                Configure parameters & visual appearance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--c-text-3)',
            }}
            aria-label="Close configuration"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form
          onSubmit={handleApply}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--sp-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-4)',
          }}
        >
          <FormField label="Widget Title" required>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Description / Subtitle">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: 'var(--sp-2) var(--sp-3)',
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text-1)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </FormField>

          <FormField label="Visualization Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WidgetType)}
              style={{
                width: '100%',
                padding: 'var(--sp-2) var(--sp-3)',
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text-1)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
            >
              <option value="kpi">KPI Summary Metric</option>
              <option value="line_chart">Time-Series Line Chart</option>
              <option value="bar_chart">Category Bar Chart</option>
              <option value="table">Underlying Data Table</option>
              <option value="insight">AI Insight Card</option>
              <option value="text_summary">Executive Text Summary</option>
            </select>
          </FormField>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: 'var(--sp-1)' }}>
              Grid Canvas Width
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-2)' }}>
              {[
                { id: 'full', label: 'Full (100%)' },
                { id: 'half', label: 'Half (50%)' },
                { id: 'third', label: 'Compact (33%)' },
              ].map((w) => (
                <button
                  type="button"
                  key={w.id}
                  onClick={() => setWidth(w.id as WidgetWidth)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: width === w.id ? '1px solid var(--c-blue)' : '1px solid var(--c-border)',
                    backgroundColor: width === w.id ? 'var(--c-blue)' : 'var(--c-surface)',
                    color: width === w.id ? '#fff' : 'var(--c-text-2)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <FormField label="Dataset Source">
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--sp-2) var(--sp-3)',
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text-1)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
            >
              <option value="FY2026 Enterprise Operational Ledger">FY2026 Enterprise Operational Ledger</option>
              <option value="Q3 Multi-Region Revenue & Cost Log">Q3 Multi-Region Revenue & Cost Log</option>
              <option value="Supply Chain Latency & Freight Audit">Supply Chain Latency & Freight Audit</option>
              <option value="Customer Retention & Tier Analytics">Customer Retention & Tier Analytics</option>
            </select>
          </FormField>

          <FormField label="Metric Parameter">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--sp-2) var(--sp-3)',
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text-1)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
            >
              <option value="Gross Margin %">Gross Margin %</option>
              <option value="Net Revenue ($M)">Net Revenue ($M)</option>
              <option value="Operating Expense ($M)">Operating Expense ($M)</option>
              <option value="Supply Chain Latency (days)">Supply Chain Latency (days)</option>
              <option value="Customer Churn %">Customer Churn %</option>
            </select>
          </FormField>

          <FormField label="Time Period">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--sp-2) var(--sp-3)',
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text-1)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
            >
              <option value="2010 – 2026">2010 – 2026 (16 Years)</option>
              <option value="2019 – 2024">2019 – 2024 (Decline & Recovery)</option>
              <option value="2021 – 2026">2021 – 2026 (Recent Trajectory)</option>
              <option value="Last 12 Months">Last 12 Months</option>
            </select>
          </FormField>

          <div
            style={{
              padding: 'var(--sp-3)',
              backgroundColor: '#EAF7EE',
              border: '1px solid #C4EDCF',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '11px', color: '#1B6A34' }}>
              <ShieldCheck size={14} style={{ color: '#1B6A34' }} />
              Governed Data Binding
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#1B6A34', lineHeight: 1.4 }}>
              Widget calculations are bound to cryptographic ledger evidence (G1 Verified).
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div
          style={{
            padding: 'var(--sp-4) var(--sp-5)',
            borderTop: '1px solid var(--c-border)',
            backgroundColor: 'var(--c-page)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--sp-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
            <button
              type="button"
              onClick={() => {
                onDuplicateWidget(widget);
                onClose();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text-2)',
              }}
              title="Duplicate Widget"
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                onRemoveWidget(widget.id);
                onClose();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-danger)',
              }}
              title="Remove Widget"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <Button variant="blue" onClick={handleApply} icon={<Check size={15} />}>
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
