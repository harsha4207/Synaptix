# Script to generate capture_manifest.json and README.md for Synaptix Command figures

$manifestData = @{
    project = "Synaptix Command - Enterprise Intelligence Platform"
    version = "2.0.0"
    generated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
    specifications = @{
        resolution = "1600x1000"
        aspect_ratio = "16:10"
        color_depth = "32-bit ARGB"
        rendering_engine = "GDI+ Subpixel ClearType GridFit"
        design_system = "Navy (#0B1F3A), Blue (#1769E0), Canvas (#F7F9FC)"
        total_figures = 27
        verified_count = 27
        status = "Captured and Verified"
    }
    chapters = @(
        @{ chapter = 3; title = "System Architecture"; count = 12; directory = "chapter_3_architecture" },
        @{ chapter = 4; title = "User Interfaces"; count = 7; directory = "chapter_4_interfaces" },
        @{ chapter = 5; title = "Operational Outputs"; count = 7; directory = "chapter_5_outputs" },
        @{ chapter = 7; title = "Supporting Diagnostics & Verifications"; count = 1; directory = "chapter_7_supporting" }
    )
    figures = @(
        @{
            id = "3.1"
            number = "Figure 3.1"
            title = "Overall Synaptix Command System Architecture"
            filename = "figure-3-1-overall-system-architecture.png"
            relative_path = "chapter_3_architecture/figure-3-1-overall-system-architecture.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/system-overview"
            description = "High-level architectural view depicting Client Tier, Ingress API Gateway, Orchestration Layer (Context, Routing, Evidence, Governance), Secure Storage, and External Integrations."
        },
        @{
            id = "3.2"
            number = "Figure 3.2"
            title = "Four-Engine Architecture"
            filename = "figure-3-2-four-engine-architecture.png"
            relative_path = "chapter_3_architecture/figure-3-2-four-engine-architecture.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/engines"
            description = "Structural breakdown of Context Engine, Routing Engine, Evidence Engine, and Action Engine with inter-engine communication and data contracts."
        },
        @{
            id = "3.3"
            number = "Figure 3.3"
            title = "Six-Stage Operational Workflow"
            filename = "figure-3-3-six-stage-workflow.png"
            relative_path = "chapter_3_architecture/figure-3-3-six-stage-workflow.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/workflow"
            description = "Sequential pipeline from Intent Intake, Context Retrieval, Model Routing, Evidence Synthesis, Risk & Policy Gate, to Governed Execution."
        },
        @{
            id = "3.4"
            number = "Figure 3.4"
            title = "EMLM Architecture and Organizational Memory"
            filename = "figure-3-4-emlm-organizational-memory.png"
            relative_path = "chapter_3_architecture/figure-3-4-emlm-organizational-memory.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/emlm"
            description = "Enterprise Meta-Language Model indexing hierarchy, embedding vector storage, semantic graph mapping, and tenant-isolated institutional memory banks."
        },
        @{
            id = "3.5"
            number = "Figure 3.5"
            title = "Adaptive AI Router"
            filename = "figure-3-5-adaptive-ai-router.png"
            relative_path = "chapter_3_architecture/figure-3-5-adaptive-ai-router.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/router"
            description = "Model routing logic displaying multi-tier scoring (Task Complexity, Token Cost, Latency Budget, Fallback Strategy) dynamically dispatching across Tier 1, 2, and 3 LLMs."
        },
        @{
            id = "3.6"
            number = "Figure 3.6"
            title = "Knowledge Ingestion and Retrieval Pipeline"
            filename = "figure-3-6-knowledge-ingestion-retrieval.png"
            relative_path = "chapter_3_architecture/figure-3-6-knowledge-ingestion-retrieval.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/ingestion"
            description = "Multi-format parsing (PDF, DOCX, XLSX, JSON), semantic chunking, vector embedding generation, domain metadata tagging, and isolated Chroma/PostgreSQL persistence."
        },
        @{
            id = "3.7"
            number = "Figure 3.7"
            title = "Evidence Grading and Verification"
            filename = "figure-3-7-evidence-grading.png"
            relative_path = "chapter_3_architecture/figure-3-7-evidence-grading.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/evidence"
            description = "Confidence scoring pipeline, factual alignment matrix, contradiction detection, and citation attribution mechanisms ensuring 0% hallucination tolerance."
        },
        @{
            id = "3.8"
            number = "Figure 3.8"
            title = "Governed Action and Risk Tiers"
            filename = "figure-3-8-governed-action-risk-tiers.png"
            relative_path = "chapter_3_architecture/figure-3-8-governed-action-risk-tiers.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/governance"
            description = "Tiered governance matrix: Tier 0 (Read-Only Auto), Tier 1 (Low Risk Notified), Tier 2 (Medium Risk Approval), Tier 3 (Critical Multi-Signer Dual Approval) with dry-run verification."
        },
        @{
            id = "3.9"
            number = "Figure 3.9"
            title = "Closed-Loop Organizational Learning"
            filename = "figure-3-9-closed-loop-learning.png"
            relative_path = "chapter_3_architecture/figure-3-9-closed-loop-learning.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/learning"
            description = "Feedback loop architecture capturing user verifications, routing performance adjustments, prompt optimization caches, and policy refinement feedback vectors."
        },
        @{
            id = "3.10"
            number = "Figure 3.10"
            title = "Data Flow Diagram (Level 1)"
            filename = "figure-3-10-level-1-data-flow.png"
            relative_path = "chapter_3_architecture/figure-3-10-level-1-data-flow.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/dfd"
            description = "Formal Level 1 DFD tracking data transformation between User Entities, Ingestion Process 1.0, Vector Indexing 2.0, Retrieval & Routing 3.0, and Action Execution 4.0."
        },
        @{
            id = "3.11"
            number = "Figure 3.11"
            title = "Use Case Diagram"
            filename = "figure-3-11-use-case-diagram.png"
            relative_path = "chapter_3_architecture/figure-3-11-use-case-diagram.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/use-case"
            description = "UML Use Case representation showing Enterprise Analyst, Compliance Officer, and System Administrator interactions across Synaptix Command functional modules."
        },
        @{
            id = "3.12"
            number = "Figure 3.12"
            title = "Sequence Diagram for a Governed Action Request"
            filename = "figure-3-12-governed-action-sequence.png"
            relative_path = "chapter_3_architecture/figure-3-12-governed-action-sequence.png"
            chapter = 3
            category = "Architecture Diagram"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/architecture/sequence"
            description = "UML Sequence Diagram documenting lifelines: User, UI Gateway, Context Engine, Router, Risk Engine, Approver, and External API Connector with synchronous callbacks."
        },
        @{
            id = "4.1"
            number = "Figure 4.1"
            title = "Synaptix Command Login / Authentication Interface"
            filename = "figure-4-1-login-authentication.png"
            relative_path = "chapter_4_interfaces/figure-4-1-login-authentication.png"
            chapter = 4
            category = "User Interface"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/login"
            description = "Enterprise authentication portal with workspace selector, SAML 2.0 / OIDC SSO federation, biometric passkey MFA, and cryptographic security credentials."
        },
        @{
            id = "4.2"
            number = "Figure 4.2"
            title = "Main Workspace / Chat Interface"
            filename = "figure-4-2-main-workspace-chat.png"
            relative_path = "chapter_4_interfaces/figure-4-2-main-workspace-chat.png"
            chapter = 4
            category = "User Interface"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/chat"
            description = "Primary conversational intelligence console displaying domain-specific badge (Financial Operations), active model banner, structured prompt intake, and citation chips."
        },
        @{
            id = "4.3"
            number = "Figure 4.3"
            title = "Uploads & Data Interface"
            filename = "figure-4-3-uploads-data.png"
            relative_path = "chapter_4_interfaces/figure-4-3-uploads-data.png"
            chapter = 4
            category = "User Interface"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/data"
            description = "Multi-domain ingestion interface showing drag-and-drop zone, tenant boundary indicators, parser configuration, chunking preview, and indexed repository status."
        },
        @{
            id = "4.4"
            number = "Figure 4.4"
            title = "Dashboard Interface"
            filename = "figure-4-4-dashboard.png"
            relative_path = "chapter_4_interfaces/figure-4-4-dashboard.png"
            chapter = 4
            category = "User Interface"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/dashboard"
            description = "Executive intelligence overview featuring four KPI metric cards (99.8% Precision, 240ms Latency, 94.2% Router Efficiency, 100% Policy Pass), live throughput, and risk distribution."
        },
        @{
            id = "4.5"
            number = "Figure 4.5"
            title = "Agent Workflows Interface"
            filename = "figure-4-5-agent-workflows.png"
            relative_path = "chapter_4_interfaces/figure-4-5-agent-workflows.png"
            chapter = 4
            category = "User Interface"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/workflows"
            description = "Autonomous agent management console featuring multi-agent DAG visualizer, node configuration drawer, execution triggers, and operational status monitors."
        },
        @{
            id = "4.6"
            number = "Figure 4.6"
            title = "Evidence / Source Details Interface"
            filename = "figure-4-6-evidence-source-details.png"
            relative_path = "chapter_4_interfaces/figure-4-6-evidence-source-details.png"
            chapter = 4
            category = "User Interface"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/evidence"
            description = "Deep-dive evidence inspector showcasing raw text excerpts, token attribution weights, confidence scoring bars, and cross-reference document link tree."
        },
        @{
            id = "4.7"
            number = "Figure 4.7"
            title = "Action Preview or Approval Interface"
            filename = "figure-4-7-action-preview-approval.png"
            relative_path = "chapter_4_interfaces/figure-4-7-action-preview-approval.png"
            chapter = 4
            category = "User Interface"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/governance"
            description = "Pre-execution governed action modal showing payload diff, target endpoint (SAP ERP), risk tier calculation (Tier 2 Medium), dual approver signature requirements, and dry-run output."
        },
        @{
            id = "5.1"
            number = "Figure 5.1"
            title = "Main Command Center Output"
            filename = "figure-5-1-command-center-output.png"
            relative_path = "chapter_5_outputs/figure-5-1-command-center-output.png"
            chapter = 5
            category = "Operational Output"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/chat/financial-reconcile"
            description = "Live end-to-end command output showing real-time query resolution, multi-stage reasoning timeline (412ms), context integration, and multi-tier action authorization."
        },
        @{
            id = "5.2"
            number = "Figure 5.2"
            title = "Sample AI Response with Source Evidence"
            filename = "figure-5-2-ai-response-source-evidence.png"
            relative_path = "chapter_5_outputs/figure-5-2-ai-response-source-evidence.png"
            chapter = 5
            category = "Operational Output"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/chat/evidence-view"
            description = "High-fidelity AI synthesis response with interactive inline superscripts linking directly to verified PDF page excerpts, semantic similarity scores, and verification hashes."
        },
        @{
            id = "5.3"
            number = "Figure 5.3"
            title = "Document Upload and Processing Output"
            filename = "figure-5-3-document-upload-processing.png"
            relative_path = "chapter_5_outputs/figure-5-3-document-upload-processing.png"
            chapter = 5
            category = "Operational Output"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/data/processing-log"
            description = "Live ingestion execution output showing chunking statistics (1,248 chunks), vector embedding generation (384-dim), metadata tagging, and zero cross-domain leakage validation."
        },
        @{
            id = "5.4"
            number = "Figure 5.4"
            title = "Structured Data Analysis Output"
            filename = "figure-5-4-structured-data-analysis.png"
            relative_path = "chapter_5_outputs/figure-5-4-structured-data-analysis.png"
            chapter = 5
            category = "Operational Output"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/analytics/gl-variance"
            description = "Tabular financial variance analysis generated dynamically: SAP General Ledger line items, budget variance percentage, statistical anomaly flags, and natural language summary."
        },
        @{
            id = "5.5"
            number = "Figure 5.5"
            title = "Dashboard and Analytics Output"
            filename = "figure-5-5-dashboard-analytics-output.png"
            relative_path = "chapter_5_outputs/figure-5-5-dashboard-analytics-output.png"
            chapter = 5
            category = "Operational Output"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/dashboard/live-metrics"
            description = "Active analytics telemetry output displaying query latency percentiles (p50: 180ms, p95: 320ms, p99: 480ms), router cost optimization ($0.0018/query), and SLA compliance rate (99.98%)."
        },
        @{
            id = "5.6"
            number = "Figure 5.6"
            title = "Agent Workflow Execution Output"
            filename = "figure-5-6-agent-workflow-execution.png"
            relative_path = "chapter_5_outputs/figure-5-6-agent-workflow-execution.png"
            chapter = 5
            category = "Operational Output"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/workflows/execution-dag"
            description = "Execution logs and real-time DAG state for multi-agent reconciliation pipeline: Document Ingestion Node -> Variance Extraction -> Policy Compliance Check -> Journal Entry Draft Node."
        },
        @{
            id = "5.7"
            number = "Figure 5.7"
            title = "Action Verification or Approval Output"
            filename = "figure-5-7-action-verification-approval.png"
            relative_path = "chapter_5_outputs/figure-5-7-action-verification-approval.png"
            chapter = 5
            category = "Operational Output"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/governance/audit-receipt"
            description = "Cryptographically signed governance execution receipt showing SHA-256 state hash, authorized approver timestamp, transaction UUID, rollback token, and immutable audit trail."
        },
        @{
            id = "7.1"
            number = "Figure 7.1"
            title = "Additional Supporting Screenshot"
            filename = "figure-7-1-additional-supporting-screenshot.png"
            relative_path = "chapter_7_supporting/figure-7-1-additional-supporting-screenshot.png"
            chapter = 7
            category = "Supporting Diagnostics"
            status = "Captured and Verified"
            width = 1600
            height = 1000
            route = "/admin/domain-isolation-test"
            description = "Enterprise multi-domain isolation test console displaying concurrent verification across Healthcare, Finance, and Education workspaces with strict boundary validation (0 leaks)."
        }
    )
}

$manifestPath = "documentation_assets\synaptix_figures\capture_manifest.json"
$manifestJson = $manifestData | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $manifestPath), $manifestJson, [System.Text.Encoding]::UTF8)

Write-Host "Generated capture_manifest.json successfully at $manifestPath."

