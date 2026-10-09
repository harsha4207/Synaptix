import React from 'react';
import {
  Sparkles,
  LayoutGrid,
  Lightbulb,
  HelpCircle,
  BarChart2,
  Filter,
  Briefcase
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AiAssistToolbarProps {
  onAiAction: (actionType: string) => void;
  isProcessing?: boolean;
}

export const AiAssistToolbar: React.FC<AiAssistToolbarProps> = ({
  onAiAction,
  isProcessing = false,
}) => {
  const assistActions = [
    {
      id: 'improve_layout',
      label: 'Improve Layout',
      icon: <LayoutGrid size={14} style={{ color: 'var(--c-blue)' }} />,
      desc: 'Optimize widget grid balance & spacing',
    },
    {
      id: 'add_insight',
      label: 'Add Insight',
      icon: <Lightbulb size={14} style={{ color: '#D97706' }} />,
      desc: 'Generate automated AI insight card',
    },
    {
      id: 'explain_chart',
      label: 'Explain Chart',
      icon: <HelpCircle size={14} style={{ color: '#7C3AED' }} />,
      desc: 'Insert executive narrative explanation',
    },
    {
      id: 'add_comparison',
      label: 'Add Comparison',
      icon: <BarChart2 size={14} style={{ color: 'var(--c-success)' }} />,
      desc: 'Add 2019 vs 2024 category variance bar',
    },
    {
      id: 'add_filter',
      label: 'Add Filter',
      icon: <Filter size={14} style={{ color: 'var(--c-blue)' }} />,
      desc: 'Insert global canvas filter control',
    },
    {
      id: 'executive_friendly',
      label: 'Make Executive-Friendly',
      icon: <Briefcase size={14} style={{ color: 'var(--c-navy)' }} />,
      desc: 'Format for C-suite presentation & evidence',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--c-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--sp-4) var(--sp-5)',
        border: '1px solid var(--c-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <div
            style={{
              padding: 5,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(23, 105, 224, 0.08)',
              color: 'var(--c-blue)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <h3
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--c-navy)',
              margin: 0,
            }}
          >
            Autonomous AI Assist Tools
          </h3>
        </div>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--c-text-3)',
            fontFamily: 'var(--font-mono)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--c-page)',
            border: '1px solid var(--c-border)',
          }}
        >
          Governed AI Copilot
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sp-2)' }}>
        {assistActions.map((action) => (
          <Button
            key={action.id}
            variant="secondary"
            size="sm"
            onClick={() => onAiAction(action.id)}
            disabled={isProcessing}
            title={action.desc}
            icon={action.icon}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
