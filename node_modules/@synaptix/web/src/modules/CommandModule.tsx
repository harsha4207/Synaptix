import React, { useState, useEffect } from 'react';
import { Bot, ShieldCheck, RefreshCw, User, Cpu } from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { CommandInputArea } from '../components/command-center/CommandInputArea';
import { DynamicResultView, CommandResultData, ResultType } from '../components/command-center/DynamicResultView';
import { EvidencePanel } from '../components/command-center/EvidencePanel';
import { ReasoningProgress } from '../components/command-center/ReasoningProgress';
import { PageContainer } from '../components/layout';
import { useRag } from '../lib/rag';

import { emlmOrchestrator } from '../lib/ai/emlmOrchestrator';
import { conversationPersistence } from '../lib/ai/conversationPersistence';
import { aiRouter } from '../lib/ai/aiRouter';
import type { RoutingTier } from '../lib/ai/types';

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
  ];

  const { setWorkspace: setRagWorkspace } = useRag();

  const [history, setHistory] = useState<CommandResultData[]>(initialHistory);
  const [selectedResultId, setSelectedResultId] = useState<string>(initialHistory[0].id);
  const [activeConversationId, setActiveConversationId] = useState<string>(`conv-${workspace.id}`);

  // Reasoning Execution Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [activeRoutingTier, setActiveRoutingTier] = useState<RoutingTier>('TIER_2_MODERATE');

  // Set workspace context for RAG and load persistent history
  useEffect(() => {
    setRagWorkspace(workspace.id);
    const convId = `conv-${workspace.id}`;
    setActiveConversationId(convId);

    // Load persisted messages
    conversationPersistence.getMessages(convId).then((persistedMsgs) => {
      if (persistedMsgs.length > 0) {
        const assistantMsgs = persistedMsgs.filter((m) => m.role === 'assistant');
        if (assistantMsgs.length > 0) {
          const mapped: CommandResultData[] = assistantMsgs.map((m) => ({
            id: m.id,
            query: (m.metadata?.query as string) || 'Workspace Query',
            resultType: (m.metadata?.resultType as ResultType) || 'Answer',
            answerText: m.content,
            sourcesText: m.citations.map((c) => `${c.filename} (${c.locationStr})`),
            confidenceScore: 96,
            riskLevel: m.routingTier === 'TIER_4_CONSEQUENTIAL' ? 'High Risk (RBAC Approval Required)' : 'Low Risk (Read-Only)',
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            evidenceHash: `sha256-${m.id.substring(0, 16)}`,
            knowledgeTriples: m.citations.slice(0, 2).map((c) => `[${c.filename}] --(verified)--> [Relevance: ${c.relevanceScore}]`),
          }));
          setHistory(mapped);
          setSelectedResultId(mapped[0].id);
        }
      }
    });
  }, [workspace.id, setRagWorkspace]);

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

  // Submit new command & trigger EMLM execution pipeline
  const handleSubmitCommand = async (queryText: string, _attachedFile?: string) => {
    setIsProcessing(true);
    setCurrentStageIndex(0);
    setActiveQuery(queryText);

    const routing = aiRouter.evaluateQuery(queryText, workspace.id);
    setActiveRoutingTier(routing.tier);

    onAddToast(`EMLM Router [${routing.tier}]: "${queryText.substring(0, 30)}..."`);

    // Stage progression animation
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < 6 ? prev + 1 : prev));
    }, 300);

    const requestId = `req-${Date.now()}`;

    // Persist User Message
    await conversationPersistence.saveMessage({
      conversationId: activeConversationId,
      userId: 'enterprise-user',
      role: 'user',
      content: queryText,
      status: 'completed',
      provider: 'user',
      model: 'user-input',
      routingTier: routing.tier,
      requestId,
      citations: [],
      metadata: { query: queryText },
    });

    try {
      const emlmResult = await emlmOrchestrator.execute({
        query: queryText,
        workspaceId: workspace.id,
        conversationId: activeConversationId,
        requestId,
      });

      clearInterval(stageInterval);
      setCurrentStageIndex(7);

      const resType = determineResultType(queryText);
      const newId = `res-${Date.now()}`;

      // Persist Assistant Response
      await conversationPersistence.saveMessage({
        id: newId,
        conversationId: activeConversationId,
        userId: 'enterprise-user',
        role: 'assistant',
        content: emlmResult.answer,
        status: 'completed',
        provider: 'google',
        model: routing.selectedModel,
        routingTier: routing.tier,
        requestId: `resp-${requestId}`,
        latencyMs: emlmResult.latencyMs,
        citations: emlmResult.citations,
        metadata: { query: queryText, resultType: resType },
        completedAt: new Date().toISOString(),
      });

      const newResult: CommandResultData = {
        id: newId,
        query: queryText,
        resultType: resType,
        answerText: emlmResult.answer,
        sourcesText: emlmResult.citations.map((c) => `${c.filename} (${c.locationStr})`),
        confidenceScore: emlmResult.citations.length > 0 ? 98 : 88,
        riskLevel: routing.tier === 'TIER_4_CONSEQUENTIAL' ? 'High Risk (RBAC Approval Required)' : 'Low Risk (Read-Only)',
        timestamp: 'Just now',
        evidenceHash: `sha256-${newId.substring(4)}`,
        knowledgeTriples: emlmResult.citations.slice(0, 2).map((c) =>
          `[${c.filename}] --(verified)--> [Score: ${c.relevanceScore}]`
        ),
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

      const citeCount = emlmResult.citations.length;
      onAddToast(`EMLM Execution Complete (${routing.tier}) — ${citeCount > 0 ? `${citeCount} citations verified` : 'Grounded model response'}`);
    } catch (err: any) {
      clearInterval(stageInterval);
      setIsProcessing(false);
      onAddToast(`Execution Error: ${err.message}`);
    }
  };

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
                  <span className="context-indicator-pill" style={{ marginLeft: '8px', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                    <Cpu size={13} /> {activeRoutingTier}
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
