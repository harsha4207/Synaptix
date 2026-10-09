import React, { useState, useEffect } from 'react';
import { Bot, ShieldCheck, RefreshCw, User } from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { CommandInputArea } from '../components/command-center/CommandInputArea';
import { DynamicResultView, CommandResultData, ResultType } from '../components/command-center/DynamicResultView';
import { EvidencePanel } from '../components/command-center/EvidencePanel';
import { ReasoningProgress } from '../components/command-center/ReasoningProgress';
import { PageContainer } from '../components/layout';

interface CommandModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export const CommandModule: React.FC<CommandModuleProps> = ({
  workspace,
  onAddToast,
}) => {
  // Initial demo conversation history items
  const initialHistory: CommandResultData[] = [
    {
      id: 'res-1',
      query: 'Analyze revenue from 2010–2026',
      resultType: 'Chart',
      answerText: `Revenue analysis for ${workspace.name} shows strong historical growth from $12.4M in 2010 to $86.5M in 2022. Predictive reasoning models project $124.2M for FY2026 (+4.2% acceleration vs prior baseline model).`,
      sourcesText: [
        `${workspace.name}_2010_2026_Revenue_Synthesis.csv`,
        `Q3_Forecast_Model_v4.xlsx (Sheet 2, B14)`,
      ],
      confidenceScore: 98,
      riskLevel: 'Low Risk (Read-Only)',
      timestamp: '10 minutes ago',
      evidenceHash: 'sha256-8f9a2b1c4e7d3a5b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      knowledgeTriples: [
        `[${workspace.name}] --(has_revenue_model)--> [18.4% CAGR]`,
        `[Q3 Forecast] --(predicts_growth)--> [$124.2M FY2026]`,
      ],
      chartData: [
        { year: '2010', label: '2010', value: 12.4 },
        { year: '2014', label: '2014', value: 24.8 },
        { year: '2018', label: '2018', value: 48.2 },
        { year: '2022', label: '2022', value: 86.5 },
        { year: '2026', label: '2026 (Est)', value: 124.2 },
      ],
    },
    {
      id: 'res-2',
      query: 'Find anomalies in this dataset',
      resultType: 'Table',
      answerText: `Scanned ${workspace.datasetCount} tabular data sources in ${workspace.name}. Flagged 1 high-risk unallocated vendor requisition ($42,500) and 2 medium-risk off-cycle claims.`,
      sourcesText: [
        `Vendor_Ledger_Q3_2026.csv (Lines 412-480)`,
        `RBAC_Audit_Rules_v2.json`,
      ],
      confidenceScore: 94,
      riskLevel: 'Medium Risk (Review Recommended)',
      timestamp: '25 minutes ago',
      evidenceHash: 'sha256-1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      knowledgeTriples: [
        `[Vendor Ops] --(has_variance)--> [$42.5k Unallocated]`,
        `[Ledger Entry #412] --(violates)--> [Approval Rule #8]`,
      ],
      tableData: [
        { id: 't1', col1: 'Vendor Operations Requisition', col2: '$42,500', col3: 'High Risk', status: 'Pending Review' },
        { id: 't2', col1: 'IT Infrastructure Licensing', col2: '$18,200', col3: 'Medium Risk', status: 'Verified' },
        { id: 't3', col1: 'Travel & Expense Claim', col2: '$6,400', col3: 'Medium Risk', status: 'Flagged' },
      ],
    },
    {
      id: 'res-3',
      query: 'Create a monthly workflow',
      resultType: 'Approval request',
      answerText: `Automated compliance audit workflow created for ${workspace.name}. Policy dictates executive RBAC sign-off before scheduled monthly activation.`,
      sourcesText: [
        `Compliance_Policy_Framework_2026.pdf`,
        `SAML2_RBAC_Matrix.json`,
      ],
      confidenceScore: 99,
      riskLevel: 'High Risk (RBAC Approval Required)',
      timestamp: '1 hour ago',
      evidenceHash: 'sha256-e9f8d7c6b5a40987654321fedcba9876543210fe0123456789abcdef01234567',
      knowledgeTriples: [
        `[SAML Policy] --(requires)--> [RBAC Sign-off]`,
        `[Monthly Workflow] --(triggers)--> [Audit Hashing]`,
      ],
      approvalInfo: {
        title: `Monthly Compliance Workflow Activation in ${workspace.name}`,
        amount: 'Policy Rule #402',
        requester: 'Synaptix Reasoning Engine v2.4',
        reason: 'Automated 1st-of-month audit ingestion pipeline requires RBAC sign-off.',
        approved: false,
      },
    },
  ];

  const [history, setHistory] = useState<CommandResultData[]>(initialHistory);
  const [selectedResultId, setSelectedResultId] = useState<string>(initialHistory[0].id);

  // Reasoning Execution Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [activeQuery, setActiveQuery] = useState<string>('');

  // Currently active result for Evidence Panel
  const activeResultItem = history.find((h) => h.id === selectedResultId) || history[0] || null;

  // Function to determine result type based on query content
  const determineResultType = (queryText: string): ResultType => {
    const q = queryText.toLowerCase();
    if (q.includes('revenue') || q.includes('chart') || q.includes('2010') || q.includes('trend')) return 'Chart';
    if (q.includes('anomaly') || q.includes('anomalies') || q.includes('table') || q.includes('dataset')) return 'Table';
    if (q.includes('dashboard') || q.includes('cards')) return 'Dashboard';
    if (q.includes('workflow') || q.includes('pipeline') || q.includes('monthly')) return 'Workflow';
    if (q.includes('plan') || q.includes('steps') || q.includes('action plan')) return 'Action plan';
    if (q.includes('approval') || q.includes('approve') || q.includes('governance')) return 'Approval request';
    if (q.includes('report') || q.includes('document')) return 'Report';
    if (q.includes('insight') || q.includes('variance')) return 'Insight';
    return 'Answer';
  };

  // Submit new command & trigger 7-stage reasoning progress loop
  const handleSubmitCommand = (queryText: string, _attachedFile?: string) => {
    setIsProcessing(true);
    setCurrentStageIndex(0);
    setActiveQuery(queryText);

    onAddToast(`Initiated Reasoning Sequence: "${queryText.substring(0, 30)}..."`);
  };

  // Handle stage-by-stage progression sequence
  useEffect(() => {
    if (!isProcessing) return;

    if (currentStageIndex < 6) {
      const timer = setTimeout(() => {
        setCurrentStageIndex((prev) => prev + 1);
      }, 400); // 400ms per stage for a total ~2.8s smooth reasoning lifecycle
      return () => clearTimeout(timer);
    } else if (currentStageIndex === 6) {
      const timer = setTimeout(() => {
        // Complete execution and reveal dynamic result
        const resType = determineResultType(activeQuery);
        const newId = `res-${Date.now()}`;

        const newResult: CommandResultData = {
          id: newId,
          query: activeQuery,
          resultType: resType,
          answerText: `Synaptix reasoning engine executed query in ${workspace.name} context. Verified against ${workspace.documentCount} knowledge documents. Outcome generated with SAML 2.0 RBAC validation.`,
          sourcesText: [
            `${workspace.name}_Indexed_Data_Synthesis.pdf (p.4)`,
            `RBAC_Governance_Matrix.json`,
          ],
          confidenceScore: Math.floor(Math.random() * 6) + 94, // 94-99%
          riskLevel: resType === 'Approval request' ? 'High Risk (RBAC Approval Required)' : 'Low Risk (Read-Only)',
          timestamp: 'Just now',
          evidenceHash: `sha256-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
          knowledgeTriples: [
            `[${workspace.name}] --(has_query)--> ["${activeQuery.substring(0, 20)}..."]`,
            `[Reasoning Engine] --(verified)--> [98% Confidence]`,
          ],
          chartData: [
            { year: '2010', label: '2010', value: 14.2 },
            { year: '2014', label: '2014', value: 28.5 },
            { year: '2018', label: '2018', value: 52.1 },
            { year: '2022', label: '2022', value: 91.4 },
            { year: '2026', label: '2026 (Est)', value: 128.9 },
          ],
        };

        setHistory((prev) => [newResult, ...prev]);
        setSelectedResultId(newId);
        setIsProcessing(false);
        onAddToast(`Reasoning Complete: Generated ${resType} Output`);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, currentStageIndex, activeQuery, workspace.name, workspace.documentCount, onAddToast]);

  return (
    <PageContainer maxWidth="1600px">
      <div className="command-center-layout">
        {/* CENTER & LEFT BODY PANEL */}
        <div className="command-center-main-column">
          {/* TOP BAR / HEADER */}
          <div className="command-center-top-bar">
            <div className="top-bar-left">
              <div className="bot-avatar-badge">
                <Bot size={24} className="bot-icon" />
              </div>
              <div className="top-bar-text-group">
                <div className="command-breadcrumb">
                  SYNAPTIX COMMAND / {workspace.name.toUpperCase()} / COMMAND CENTER
                </div>
                <div className="top-bar-title-row">
                  <h1 className="top-bar-title">{workspace.name} Command Center</h1>
                  <span className="context-indicator-pill">
                    <ShieldCheck size={13} /> {workspace.domain} Boundary • Engine Active
                  </span>
                </div>
                <p className="top-bar-subtitle">
                  Primary conversational & operational intelligence interface for {workspace.name}
                </p>
              </div>
            </div>

            <div className="top-bar-right">
              <button
                type="button"
                className="btn-header-sm"
                onClick={() => onAddToast(`Reset ${workspace.name} Command Session`)}
                title="Reset session"
              >
                <RefreshCw size={13} /> Clear Session
              </button>
            </div>
          </div>

          {/* CENTER CONVERSATION & INPUT AREA */}
          <div className="command-center-scroll-body">
            {/* 1. Large Command Input Area */}
            <CommandInputArea
              workspace={workspace}
              onSubmitCommand={handleSubmitCommand}
              onAddToast={onAddToast}
              isProcessing={isProcessing}
            />

            {/* 2. Active Stage-by-Stage Reasoning Progress Sequence */}
            {isProcessing && (
              <div className="active-reasoning-container animate-fade-in-up">
                <div className="user-query-card-preview">
                  <span className="user-label">User Query:</span>
                  <p className="query-text">"{activeQuery}"</p>
                </div>
                <ReasoningProgress
                  currentStageIndex={currentStageIndex}
                  isComplete={false}
                />
              </div>
            )}

            {/* 3. Stream of Generated Dynamic Result Cards */}
            <div className="command-results-stream" aria-label="Command Execution History">
              <div className="stream-header-bar">
                <h3>Reasoning Execution Stream</h3>
                <span className="stream-count-tag">{history.length} Results</span>
              </div>

              {history.map((item) => {
                const isSelected = selectedResultId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedResultId(item.id)}
                    className={`result-stream-item-wrapper ${isSelected ? 'selected-item' : ''}`}
                  >
                    <div className="user-query-header-row">
                      <div className="user-avatar-dot">
                        <User size={14} />
                      </div>
                      <div className="query-text-group">
                        <span className="query-label">Request • {item.timestamp}</span>
                        <h4 className="query-title">"{item.query}"</h4>
                      </div>
                    </div>

                    <DynamicResultView
                      workspace={workspace}
                      result={item}
                      onAddToast={onAddToast}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT CONTEXT / EVIDENCE PANEL */}
        <EvidencePanel
          workspace={workspace}
          activeResult={activeResultItem}
          onAddToast={onAddToast}
        />
      </div>
    </PageContainer>
  );
};
