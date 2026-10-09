import React from 'react';
import {
  BrainCircuit,
  LineChart,
  BarChart3,
  AlertTriangle,
  Workflow,
  ShieldCheck,
  Settings,
  Sparkles,
  Database,
  FileText
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { WorkspaceModuleId } from '../design-system/components/Sidebar';
import { MetricCard, InsightCard } from '../design-system/components/MetricCard';
import { PageContainer, PageHeader, PageContent } from '../components/layout';
import { Button } from '../components/ui/Button';

interface GenericWorkspaceModuleProps {
  workspace: WorkspaceItem;
  moduleId: WorkspaceModuleId;
  onAddToast: (msg: string) => void;
}

export const GenericWorkspaceModule: React.FC<GenericWorkspaceModuleProps> = ({
  workspace,
  moduleId,
  onAddToast,
}) => {
  const getModuleMeta = () => {
    switch (moduleId) {
      case 'knowledge':
        return {
          title: `${workspace.name} Knowledge Graph`,
          subtitle: 'Semantic knowledge extraction & document relationship graph',
          icon: <BrainCircuit size={22} className="module-icon" />,
        };
      case 'analytics':
        return {
          title: `${workspace.name} Analytics Engine`,
          subtitle: 'Automated quantitative analysis, trends & predictive modeling',
          icon: <LineChart size={22} className="module-icon" />,
        };
      case 'dashboards':
        return {
          title: `${workspace.name} Executive Dashboards`,
          subtitle: 'Real-time operational metrics & interactive KPI visualizations',
          icon: <BarChart3 size={22} className="module-icon" />,
        };
      case 'problems':
        return {
          title: `${workspace.name} Problem Resolution`,
          subtitle: 'Root-cause analysis, anomaly detection & incident resolution',
          icon: <AlertTriangle size={22} className="module-icon" />,
        };
      case 'workflows':
        return {
          title: `${workspace.name} Workflows & Automation`,
          subtitle: 'Automated reasoning pipelines & multi-step execution plans',
          icon: <Workflow size={22} className="module-icon" />,
        };
      case 'evidence':
        return {
          title: `${workspace.name} Evidence Explorer`,
          subtitle: 'Cryptographic proof, source citations & verification hashes',
          icon: <ShieldCheck size={22} className="module-icon" />,
        };
      case 'settings':
        return {
          title: `${workspace.name} Domain Settings`,
          subtitle: 'Access control policies, data retention & API connector config',
          icon: <Settings size={22} className="module-icon" />,
        };
      default:
        return {
          title: `${workspace.name} Module`,
          subtitle: `Isolated ${workspace.domain} boundary`,
          icon: <BrainCircuit size={22} className="module-icon" />,
        };
    }
  };

  const meta = getModuleMeta();

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.subtitle}
        breadcrumb={`SYNAPTIX COMMAND / ${workspace.name.toUpperCase()} / ${meta.title.toUpperCase()}`}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles size={14} />}
            onClick={() => onAddToast(`Action initiated in ${meta.title}`)}
          >
            Execute Analysis
          </Button>
        }
      />

      <PageContent>
        {/* KPI Metric Cards */}
        <div className="module-metrics-grid">
          <MetricCard
            title="Indexed Files"
            value={workspace.documentCount}
            change="+12% this week"
            changeType="positive"
            subtitle="Semantic retrieval ready"
            icon={<FileText size={18} />}
          />
          <MetricCard
            title="Active Datasets"
            value={workspace.datasetCount}
            change="Updated 1h ago"
            changeType="neutral"
            subtitle="Schema validated"
            icon={<Database size={18} />}
          />
          <MetricCard
            title="Reasoning Dashboards"
            value={workspace.dashboardCount}
            change="+2 generated"
            changeType="positive"
            subtitle="Live operational views"
            icon={<BarChart3 size={18} />}
          />
        </div>

        {/* Insight Card */}
        <div className="module-insights-wrapper">
          <InsightCard
            title={`Automated ${workspace.domain} Trend Synthesis`}
            domain={workspace.domain}
            summary={`Synaptix reasoning engines analyzed ${workspace.documentCount} documents and identified key performance levers with 0 compliance anomalies.`}
            confidenceScore={96}
            evidenceCount={workspace.datasetCount}
            onActionClick={() => onAddToast(`Navigating to reasoning details for ${workspace.name}`)}
            actionText="View Complete Evidence Chain"
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};
