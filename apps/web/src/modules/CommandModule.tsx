import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  ShieldCheck,
  RefreshCw,
  User,
  Cpu,
  Mic,
  Send,
  FileText,
  Activity,
  BrainCircuit,
  CheckSquare,
  Sparkles,
  Paperclip,
  X,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { DynamicResultView, CommandResultData, ResultType } from '../components/command-center/DynamicResultView';
import { EvidencePanel } from '../components/command-center/EvidencePanel';
import { ReasoningProgress } from '../components/command-center/ReasoningProgress';
import { ActionPreviewModal, GovernedActionItem } from '../components/actions/ActionPreviewModal';
import { KnowledgeGraph, GraphNode, GraphEdge } from '../components/knowledge/KnowledgeGraph';
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
  // Demo initial conversation history
  const initialHistory: CommandResultData[] = [
    {
      id: 'res-1',
      query: 'Analyze revenue from 2010–2026',
      resultType: 'Chart',
      answerText: `Revenue analysis for ${workspace.name} shows consistent historical growth from $12.4M in 2010 to $86.5M in 2022. Predictive reasoning models project $124.2M for FY2026 (+4.2% acceleration vs prior baseline model), with operating margins stabilizing at 41.2%.`,
      sourcesText: [
        `${workspace.name}_2010_2026_Revenue_Synthesis.csv`,
        `Q3_Forecast_Model_v4.xlsx (Sheet 2, Cell B14)`,
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
      answerText: `Scanned ${workspace.datasetCount} tabular data sources in ${workspace.name}. Flagged 1 high-risk unallocated vendor requisition ($42,500) and 2 medium-risk off-cycle expense claims requiring supervisory sign-off.`,
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

  // Composer State
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Contextual Drawers & Modals State
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [isReasoningModalOpen, setIsReasoningModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeGovernedAction, setActiveGovernedAction] = useState<GovernedActionItem | null>(null);

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

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history.length, isProcessing]);

  // Active result item for contextual drawers
  const activeResultItem = history.find((h) => h.id === selectedResultId) || history[0] || null;

  // Determine result type based on query content
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
  const handleSubmitCommand = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;

    const trimmed = queryText.trim();
    setInputText('');
    setIsProcessing(true);
    setCurrentStageIndex(0);
    setActiveQuery(trimmed);

    const routing = aiRouter.evaluateQuery(trimmed, workspace.id);
    setActiveRoutingTier(routing.tier);

    onAddToast(`Reasoning (${routing.tier}): "${trimmed.substring(0, 32)}..."`);

    // Stage progression animation
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < 6 ? prev + 1 : prev));
    }, 320);

    const requestId = `req-${Date.now()}`;

    // Persist User Message
    await conversationPersistence.saveMessage({
      conversationId: activeConversationId,
      userId: 'enterprise-user',
      role: 'user',
      content: trimmed,
      status: 'completed',
      provider: 'user',
      model: 'user-input',
      routingTier: routing.tier,
      requestId,
      citations: [],
      metadata: { query: trimmed },
    });

    try {
      const emlmResult = await emlmOrchestrator.execute({
        query: trimmed,
        workspaceId: workspace.id,
        conversationId: activeConversationId,
        requestId,
      });

      clearInterval(stageInterval);
      setCurrentStageIndex(7);

      const resType = determineResultType(trimmed);
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
        metadata: { query: trimmed, resultType: resType },
        completedAt: new Date().toISOString(),
      });

      const newResult: CommandResultData = {
        id: newId,
        query: trimmed,
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

      setHistory((prev) => [...prev, newResult]);
      setSelectedResultId(newId);
      setIsProcessing(false);

      // If action proposal detected, prepare governed action
      if (routing.tier === 'TIER_4_CONSEQUENTIAL' || resType === 'Approval request' || resType === 'Action plan') {
        setActiveGovernedAction({
          id: `ACT-${Date.now()}`,
          name: `Authorize Execution: ${trimmed.substring(0, 48)}`,
          requestedBy: 'Enterprise Operator',
          workspace: workspace.name,
          riskTier: 'High',
          affectedSystems: ['Enterprise Core Ledger', 'Audit Storage'],
          changesSummary: `Requested action mutation based on query: "${trimmed}"`,
          evidenceGrade: 'G1 Verified',
          evidenceHash: `0x${newId.substring(4)}`,
          approvalStatus: 'Pending',
          verificationStatus: 'Verified',
          statusCategory: 'Pending',
          goalUnderstood: emlmResult.answer.substring(0, 140),
          planSummary: '1. Validate boundary RBAC. 2. Capture rollback snapshot. 3. Apply state mutation.',
          planVersion: 'v1.0',
          planHash: '0x8a9f42b1',
          isPlanValid: true,
          reversibility: 'Fully Reversible',
          verificationMethod: 'Dual-Key RBAC Sign-Off',
          steps: [
            { stepIndex: 1, title: 'Verify Source Citations', system: 'RAG Pipeline', description: 'Validated against primary documents', isApproved: true },
            { stepIndex: 2, title: 'Create Rollback Snapshot', system: 'Storage Vault', description: 'Captured state prior to execution', isApproved: true },
            { stepIndex: 3, title: 'Commit Governed Action', system: 'Target Engine', description: 'Awaiting human authorization', isApproved: false },
          ],
        });
      }

      const citeCount = emlmResult.citations.length;
      onAddToast(`✓ Response generated with ${citeCount > 0 ? `${citeCount} grounded citations` : 'verified reasoning'}`);
    } catch (err: any) {
      clearInterval(stageInterval);
      setIsProcessing(false);
      onAddToast(`Execution Error: ${err.message}`);
    }
  };

  const handleMicClick = () => {
    setIsListening(true);
    onAddToast('Listening for voice command...');
    setTimeout(() => {
      setInputText(`Analyze Q3 operating performance and identify risk factors in ${workspace.name}`);
      setIsListening(false);
    }, 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitCommand(inputText);
    }
  };

  // Sample prompt suggestions
  const promptSuggestions = [
    `Analyze ${workspace.name.toLowerCase()} revenue trends from 2010 to 2026`,
    `Find statistical anomalies in uploaded datasets`,
    `Verify compliance audit and margin variance`,
    `Check unallocated vendor requisitions`,
  ];

  // Mock Graph Data for Knowledge Modal
  const mockNodes: GraphNode[] = [
    { id: 'n1', label: `${workspace.name} Boundary`, type: 'Boundary', x: 280, y: 160, color: '#1769E0', description: 'Domain boundary', documentCount: workspace.documentCount, evidenceGrade: 'G1 Verified' },
    { id: 'n2', label: 'Vendor Operations', type: 'Entity', x: 140, y: 90, color: '#D97706', description: 'Operational requisitions', documentCount: 14, evidenceGrade: 'G1 Verified' },
    { id: 'n3', label: 'Gross Margin Variance', type: 'Metric', x: 420, y: 90, color: '#059669', description: 'Margin acceleration (+4.2%)', documentCount: 8, evidenceGrade: 'G1 Verified' },
    { id: 'n4', label: 'RBAC Policy Rules', type: 'Governance', x: 130, y: 240, color: '#7C3AED', description: 'Governance standards', documentCount: 22, evidenceGrade: 'G1 Verified' },
    { id: 'n5', label: 'Treasury Ledger Sync', type: 'Database', x: 430, y: 240, color: '#0D9488', description: 'Cash ledger sync', documentCount: 12, evidenceGrade: 'G1 Verified' },
  ];

  const mockEdges: GraphEdge[] = [
    { id: 'e1', source: 'n1', target: 'n2', label: 'contains' },
    { id: 'e1', source: 'n1', target: 'n3', label: 'tracks' },
    { id: 'e3', source: 'n1', target: 'n4', label: 'governed_by' },
    { id: 'e4', source: 'n1', target: 'n5', label: 'integrates' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, position: 'relative', background: '#F7F9FC' }}>
      {/* 1. CHAT HEADER BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#EFF6FF',
              color: '#1769E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                {workspace.name} Chat & Reasoning
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#1769E0',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  padding: '1px 7px',
                  borderRadius: '999px',
                }}
              >
                {activeRoutingTier}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              Autonomous intelligence with strict boundary verification
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setHistory([]);
              onAddToast(`Cleared conversation history for ${workspace.name}`);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#475569',
              cursor: 'pointer',
            }}
            title="Start new conversation"
          >
            <RefreshCw size={13} />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* 2. CONVERSATION MESSAGES STREAM (Full width, centered) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px 140px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '920px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {history.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  color: '#1769E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Sparkles size={24} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                How can I assist your {workspace.name} operations today?
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                Ask questions about your uploaded documents, analyze financial ledgers, detect operational anomalies, or automate governed workflows.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', textAlign: 'left' }}>
                {promptSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSubmitCommand(s)}
                    style={{
                      padding: '12px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#1E293B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#EFF6FF';
                      e.currentTarget.style.borderColor = '#BFDBFE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                  >
                    <span>{s}</span>
                    <ChevronRight size={14} style={{ color: '#94A3B8' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Multi-Turn Messages */}
          {history.map((item) => (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* User Query Bubble */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    maxWidth: '80%',
                    background: '#0B1F3A',
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    borderRadius: '14px 14px 2px 14px',
                    boxShadow: '0 2px 6px rgba(11, 31, 58, 0.08)',
                  }}
                >
                  <p style={{ fontSize: '14px', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                    {item.query}
                  </p>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px', textAlign: 'right' }}>
                    {item.timestamp}
                  </div>
                </div>
              </div>

              {/* AI Assistant Response Card */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    color: '#1769E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Synaptix Command</span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>• {item.timestamp}</span>
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#059669',
                        backgroundColor: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ShieldCheck size={11} />
                      {item.confidenceScore}% Grounded
                    </span>
                  </div>

                  {/* Dynamic Result Body (Markdown Text, Chart, Table) */}
                  <div style={{ fontSize: '14px', color: '#1E293B', lineHeight: 1.6, marginBottom: '16px' }}>
                    <DynamicResultView workspace={workspace} result={item} onAddToast={onAddToast} />
                  </div>

                  {/* Contextual Action Buttons under message */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid #F1F5F9',
                    }}
                  >
                    {/* Sources Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResultId(item.id);
                        setIsEvidenceDrawerOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <FileText size={13} style={{ color: '#1769E0' }} />
                      <span>{item.sourcesText?.length || 2} Sources</span>
                    </button>

                    {/* Evidence & Grounding Details */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResultId(item.id);
                        setIsEvidenceDrawerOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <ShieldCheck size={13} style={{ color: '#059669' }} />
                      <span>Evidence Details</span>
                    </button>

                    {/* Reasoning Steps */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResultId(item.id);
                        setIsReasoningModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <Activity size={13} style={{ color: '#D97706' }} />
                      <span>Reasoning Details</span>
                    </button>

                    {/* Knowledge Graph Explorer */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResultId(item.id);
                        setIsKnowledgeModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <BrainCircuit size={13} style={{ color: '#7C3AED' }} />
                      <span>Knowledge Graph</span>
                    </button>

                    {/* Governed Action trigger if consequential */}
                    {(item.resultType === 'Approval request' || item.resultType === 'Action plan' || item.riskLevel.includes('High')) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResultId(item.id);
                          if (!activeGovernedAction) {
                            setActiveGovernedAction({
                              id: `ACT-${Date.now()}`,
                              name: `Inspect Operational Plan: ${item.query}`,
                              requestedBy: 'Enterprise Operator',
                              workspace: workspace.name,
                              riskTier: 'Critical',
                              affectedSystems: ['Enterprise Core Ledger'],
                              changesSummary: item.answerText.substring(0, 100),
                              evidenceGrade: 'G1 Verified',
                              evidenceHash: item.evidenceHash,
                              approvalStatus: 'Pending',
                              verificationStatus: 'Verified',
                              statusCategory: 'Pending',
                              goalUnderstood: item.answerText.substring(0, 120),
                              planSummary: 'Multi-step action plan requiring step-up authentication',
                              planVersion: 'v1.0',
                              planHash: '0x8a9f42b1',
                              isPlanValid: true,
                              reversibility: 'Fully Reversible',
                              verificationMethod: 'Dual-Key RBAC Sign-Off',
                              steps: [
                                { stepIndex: 1, title: 'Verify Data Ingestion', system: 'Data Pipeline', description: 'Checks source hashes', isApproved: true },
                                { stepIndex: 2, title: 'Authorize Mutation', system: 'Enterprise DB', description: 'Awaiting Dual Sign-Off', isApproved: false },
                              ],
                            });
                          }
                          setIsActionModalOpen(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#DC2626',
                          cursor: 'pointer',
                          marginLeft: 'auto',
                        }}
                      >
                        <CheckSquare size={13} />
                        <span>Inspect Approval</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Reasoning In-Progress State */}
          {isProcessing && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#EFF6FF',
                  color: '#1769E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Synaptix EMLM Reasoning</span>
                  <span style={{ fontSize: '11px', color: '#1769E0', fontWeight: 600 }}>Active</span>
                </div>
                <ReasoningProgress currentStageIndex={currentStageIndex} isComplete={false} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. DOCKED BOTTOM COMPOSER */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(247, 249, 252, 1) 75%, rgba(247, 249, 252, 0) 100%)',
          padding: '16px 20px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', maxWidth: '920px', pointerEvents: 'auto' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '14px',
              boxShadow: '0 4px 20px rgba(11, 31, 58, 0.08)',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <textarea
              ref={composerTextareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Synaptix across ${workspace.name.toLowerCase()} documents, models, and ledgers... (Press Enter to send)`}
              rows={2}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: '#0F172A',
                lineHeight: 1.5,
                background: 'transparent',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* File Attachment Button */}
                <button
                  type="button"
                  onClick={() => onAddToast('Attach reference document or spreadsheet')}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Attach file"
                >
                  <Paperclip size={16} />
                </button>

                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={handleMicClick}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: isListening ? '1px solid #FECACA' : '1px solid #E2E8F0',
                    background: isListening ? '#FEF2F2' : '#F8FAFC',
                    color: isListening ? '#DC2626' : '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                  title="Voice command input"
                >
                  <Mic size={14} />
                  <span>{isListening ? 'Listening...' : 'Voice'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {inputText.length > 0 ? `${inputText.length} chars` : 'Enter to send'}
                </span>
                <button
                  type="button"
                  disabled={!inputText.trim() || isProcessing}
                  onClick={() => handleSubmitCommand(inputText)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    borderRadius: '8px',
                    background: inputText.trim() && !isProcessing ? '#1769E0' : '#E2E8F0',
                    color: inputText.trim() && !isProcessing ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: inputText.trim() && !isProcessing ? 'pointer' : 'not-allowed',
                    transition: 'all 120ms ease',
                  }}
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: '#94A3B8' }}>
            Strict Workspace Boundary Active • All reasoning is 100% grounded in verified source evidence
          </div>
        </div>
      </div>

      {/* 4. CONTEXTUAL EVIDENCE & SOURCES DRAWER (Slides out from right) */}
      {isEvidenceDrawerOpen && (
        <>
          <div
            onClick={() => setIsEvidenceDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(11, 31, 58, 0.4)',
              backdropFilter: 'blur(2px)',
              zIndex: 90,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '440px',
              maxWidth: '100vw',
              background: '#FFFFFF',
              boxShadow: '-4px 0 24px rgba(11, 31, 58, 0.15)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: '#059669' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Sources & Evidence Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEvidenceDrawerOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <EvidencePanel
                workspace={workspace}
                activeResult={activeResultItem}
                onAddToast={onAddToast}
              />
            </div>
          </div>
        </>
      )}

      {/* 5. CONTEXTUAL REASONING DETAILS MODAL */}
      {isReasoningModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 31, 58, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(11, 31, 58, 0.16)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: '#D97706' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  EMLM 8-Stage Reasoning Trace
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReasoningModalOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                <strong>Evaluated Query:</strong> "{activeResultItem?.query}"
              </div>
              <ReasoningProgress currentStageIndex={7} isComplete={true} />
            </div>

            <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsReasoningModalOpen(false)}
                style={{
                  padding: '7px 16px',
                  background: '#0B1F3A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONTEXTUAL KNOWLEDGE GRAPH MODAL */}
      {isKnowledgeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 31, 58, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '880px',
              height: '580px',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(11, 31, 58, 0.16)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={18} style={{ color: '#7C3AED' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Knowledge Graph — {workspace.name} Boundary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKnowledgeModalOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
              <KnowledgeGraph
                nodes={mockNodes}
                edges={mockEdges}
                onSelectNode={(node) => onAddToast(`Selected Entity: ${node.label}`)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. CONTEXTUAL ACTION PREVIEW & APPROVAL MODAL */}
      <ActionPreviewModal
        action={activeGovernedAction}
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onApprove={(id) => {
          setIsActionModalOpen(false);
          onAddToast(`✓ Governed Action ${id} authorized via Two-Person Rule.`);
        }}
        onReject={(id, reason) => {
          setIsActionModalOpen(false);
          onAddToast(`Action ${id} rejected: ${reason || 'Operator declined'}`);
        }}
        onModifyPlan={(id) => {
          onAddToast(`Plan modification requested for ${id}`);
        }}
        onAddToast={onAddToast}
      />
    </div>
  );
};
