# ==============================================================================
# SYNAPTIX COMMAND - Group A Architecture Diagrams (Figures 3.1 - 3.12)
# ==============================================================================

. "$PSScriptRoot\figure_drawing_lib.ps1"

$outputDir = "C:\Users\Harsha MS\Synaptix\docs\figures"
if (-not [System.IO.Directory]::Exists($outputDir)) {
    [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
}

function Draw-HeaderBlock($c, [string]$figNum, [string]$title, [string]$subtitle) {
    $fontFig = New-Object System.Drawing.Font ("Segoe UI", 11.0, [System.Drawing.FontStyle]::Bold)
    $fontTitle = New-Object System.Drawing.Font ("Segoe UI", 18.0, [System.Drawing.FontStyle]::Bold)
    $fontSub = New-Object System.Drawing.Font ("Segoe UI", 10.5, [System.Drawing.FontStyle]::Regular)
    
    Draw-Text $c $figNum.ToUpper() $fontFig $global:COL_BLUE 50.0 30.0
    Draw-Text $c $title $fontTitle $global:COL_NAVY 50.0 52.0
    Draw-Text $c $subtitle $fontSub $global:COL_TEXT_SECONDARY 50.0 90.0
    
    $pen = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
    $c.Graphics.DrawLine($pen, 50, 120, ($c.Width - 50), 120)
    $pen.Dispose()
    
    $fontFig.Dispose(); $fontTitle.Dispose(); $fontSub.Dispose()
}

# --- Figure 3.1: Overall System Architecture ---
function Render-Figure-3-1 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.1" "Overall Synaptix Command System Architecture" "Multi-layer platform architecture linking client interfaces, 4-tier routing, EMLM mediation, and four core operational engines."
    $fH2 = New-Object System.Drawing.Font ("Segoe UI", 11.5, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.0, [System.Drawing.FontStyle]::Regular)

    # Col 1: Interfaces
    Draw-Card $c 60.0 150.0 260.0 790.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.5
    Draw-Text $c "USER & VOICE INTERFACES" $fH2 $global:COL_NAVY 80.0 170.0
    $interfaces = @(
        @{ Title = "Natural Language HUD"; Desc = "Voice Audio Capture (PCM)\nElevenLabs TTS & Web Speech"; Y = 210 },
        @{ Title = "Command Center UI"; Desc = "Prompt input, multi-turn chat,\nHotkeys & Reasoning HUD"; Y = 330 },
        @{ Title = "Executive Dashboards"; Desc = "Operational telemetry, KPIs,\nRisk & Evidence distribution"; Y = 450 },
        @{ Title = "Governed Actions UI"; Desc = "Two-Person sign-off modals,\nAction previews & diff views"; Y = 570 }
    )
    foreach ($it in $interfaces) {
        Draw-Card $c 80.0 $it.Y 220.0 100.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.0
        Draw-Text $c $it.Title $fH2 $global:COL_NAVY 95.0 ($it.Y + 15)
        Draw-Text $c $it.Desc $fBody $global:COL_TEXT_SECONDARY 95.0 ($it.Y + 45)
    }

    # Col 2: Router
    Draw-Card $c 360.0 150.0 280.0 790.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.5
    Draw-Text $c "ADAPTIVE AI ROUTER" $fH2 $global:COL_NAVY 380.0 170.0
    $tiers = @(
        @{ Name = "Tier 1: Simple"; Sub = "<150ms | Zero RAG | Cache"; Col = $global:COL_GREEN; Bg = $global:COL_GREEN_BG; Y = 210 },
        @{ Name = "Tier 2: Moderate"; Sub = "Gemini 2.5 Flash + Hybrid RAG"; Col = $global:COL_BLUE; Bg = $global:COL_BLUE_LIGHT; Y = 310 },
        @{ Name = "Tier 3: Complex"; Sub = "8-Stage EMLM Pipeline"; Col = $global:COL_PURPLE; Bg = $global:COL_PURPLE_BG; Y = 410 },
        @{ Name = "Tier 4: Consequential"; Sub = "Human Sign-off & Step-up MFA"; Col = $global:COL_RED; Bg = $global:COL_RED_BG; Y = 510 }
    )
    foreach ($t in $tiers) {
        Draw-Card $c 380.0 $t.Y 240.0 80.0 $t.Bg $t.Col 6.0 1.0
        Draw-Text $c $t.Name $fH2 $global:COL_NAVY 395.0 ($t.Y + 12)
        Draw-Text $c $t.Sub $fBody $global:COL_TEXT_SECONDARY 395.0 ($t.Y + 40)
    }

    # Col 3 & 4: EMLM & 4 Engines
    Draw-Card $c 680.0 150.0 860.0 790.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.5
    Draw-Text $c "ENTERPRISE MULTI-LAYER MEDIATION (EMLM) & 4 CORE ENGINES" $fH2 $global:COL_NAVY 700.0 170.0

    Draw-Card $c 700.0 210.0 400.0 220.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.0
    Draw-Text $c "1. KNOWLEDGE ENGINE" $fH2 $global:COL_BLUE 715.0 225.0
    Draw-Text $c "* Multi-Format Parsers (PDF, DOCX, XLSX, CSV, JSON)\n* OCR Text Recognition Engine (Tesseract)\n* Sliding-Window Chunking & TF-IDF Vectors\n* Workspace-Isolated Vector Store & RRF Reranking" $fBody $global:COL_NAVY 715.0 255.0

    Draw-Card $c 1120.0 210.0 400.0 220.0 $global:COL_PURPLE_BG $global:COL_PURPLE 8.0 1.0
    Draw-Text $c "2. INTELLIGENCE ENGINE" $fH2 $global:COL_PURPLE 1135.0 225.0
    Draw-Text $c "* Google Gemini 2.5 Flash / Pro Multimodal\n* Context Assembly & Domain System Prompts\n* 8-Stage EMLM Reasoning Execution\n* Factual Citation Grounding & Evidence Grading" $fBody $global:COL_NAVY 1135.0 255.0

    Draw-Card $c 700.0 450.0 400.0 220.0 $global:COL_AMBER_BG $global:COL_AMBER 8.0 1.0
    Draw-Text $c "3. ACTION ENGINE" $fH2 $global:COL_AMBER 715.0 465.0
    Draw-Text $c "* Sandboxed DAG Workflow Execution\n* Enterprise API Adapters (SAP, CRM, S3)\n* Dry-run Simulation & State Rollback\n* Analytical Calculations & Computation Engine" $fBody $global:COL_NAVY 715.0 495.0

    Draw-Card $c 1120.0 450.0 400.0 220.0 $global:COL_RED_BG $global:COL_RED 8.0 1.0
    Draw-Text $c "4. GOVERNANCE ENGINE" $fH2 $global:COL_RED 1135.0 465.0
    Draw-Text $c "* 4-Tier Risk Policy Evaluation (T0 - T3)\n* Two-Person Rule Consensus Validation\n* Evidence Lifecycle Verification (G0, G1, G2)\n* Immutable SOC2 Type II Audit Logging" $fBody $global:COL_NAVY 1135.0 495.0

    # Bottom Persistence Box
    Draw-Card $c 700.0 690.0 820.0 220.0 $global:COL_NAVY_LIGHT $global:COL_BLUE_ACCENT 8.0 1.0
    Draw-Text $c "ORGANIZATIONAL MEMORY & MULTI-TENANT ISOLATION LAYER" $fH2 $global:COL_WHITE 720.0 710.0
    Draw-Text $c "* Multi-Domain Workspace Knowledge Bases (Healthcare | Finance | Education | Manufacturing)\n* Supabase PostgreSQL (Row Level Security RLS, Workspace Memberships & Profiles)\n* Strict Vector Isolation Invariant: Zero Cross-Workspace Data Leakage\n* Audit Event Stream & Historical Precedent Catalog" $fBody $global:COL_WHITE 720.0 745.0

    # Arrows
    Draw-Arrow $c 320.0 260.0 360.0 260.0 $global:COL_BLUE "Voice"
    Draw-Arrow $c 320.0 380.0 360.0 350.0 $global:COL_BLUE "Query"
    Draw-Arrow $c 640.0 350.0 680.0 320.0 $global:COL_BLUE "RAG"
    Draw-Arrow $c 640.0 450.0 680.0 450.0 $global:COL_PURPLE "Pipeline"

    $fH2.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-1-overall-system-architecture.png"
}

# --- Figure 3.2: Four-Engine Architecture ---
function Render-Figure-3-2 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.2" "Four-Engine Architecture" "Detailed responsibilities, interfaces, and inter-engine communication pathways of the core Synaptix platform."
    $fH2 = New-Object System.Drawing.Font ("Segoe UI", 12.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)

    # Engine 1: Knowledge Engine
    Draw-Card $c 80.0 160.0 680.0 350.0 $global:COL_SURFACE $global:COL_BLUE 8.0 2.0
    Draw-Badge $c 100.0 180.0 "ENGINE 1" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null
    Draw-Text $c "KNOWLEDGE ENGINE" $fH2 $global:COL_BLUE 200.0 180.0
    Draw-Text $c "Responsibilities:\n* Multi-format ingestion: PDF, DOCX, XLSX, CSV, JSON, Markdown, Images\n* Tesseract OCR extraction for scanned forms & invoices\n* Sliding-window text chunking (600 tokens, 100 token overlap)\n* Isolated vector embeddings and workspace-partitioned IDF matrices\n* Reciprocal Rank Fusion (RRF) hybrid retrieval (Semantic + BM25 keyword)" $fBody $global:COL_NAVY 100.0 220.0
    Draw-Text $c "Interfaces: ingestDocument(), searchWorkspace(), validateIsolation()" $fBody $global:COL_BLUE 100.0 460.0

    # Engine 2: Intelligence Engine
    Draw-Card $c 840.0 160.0 680.0 350.0 $global:COL_SURFACE $global:COL_PURPLE 8.0 2.0
    Draw-Badge $c 860.0 180.0 "ENGINE 2" $global:COL_PURPLE_BG $global:COL_PURPLE 9.0 | Out-Null
    Draw-Text $c "INTELLIGENCE ENGINE" $fH2 $global:COL_PURPLE 960.0 180.0
    Draw-Text $c "Responsibilities:\n* Adaptive 4-Tier Policy Router evaluating query complexity & risk\n* Foundation model coordination (Google Gemini 2.5 Flash / Pro)\n* Bounded 8-stage EMLM execution pipeline orchestration\n* Factual grounding synthesis with cryptographic source citation mapping\n* Domain prompt tuning (Healthcare HIPAA, Finance SOX, Education FERPA)" $fBody $global:COL_NAVY 860.0 220.0
    Draw-Text $c "Interfaces: evaluateQuery(), executeEmlmPipeline(), generateGroundedAnswer()" $fBody $global:COL_PURPLE 860.0 460.0

    # Engine 3: Action Engine
    Draw-Card $c 80.0 550.0 680.0 350.0 $global:COL_SURFACE $global:COL_AMBER 8.0 2.0
    Draw-Badge $c 100.0 570.0 "ENGINE 3" $global:COL_AMBER_BG $global:COL_AMBER 9.0 | Out-Null
    Draw-Text $c "ACTION ENGINE" $fH2 $global:COL_AMBER 200.0 570.0
    Draw-Text $c "Responsibilities:\n* Directed Acyclic Graph (DAG) autonomous workflow execution\n* Enterprise connectors (SAP ERP, Salesforce CRM, Amazon S3, HTTP Webhooks)\n* Deterministic calculations: variance modeling, statistical aggregations\n* Dry-run simulation and atomic state rollbacks\n* Scheduled automation daemon and cron triggers" $fBody $global:COL_NAVY 100.0 610.0
    Draw-Text $c "Interfaces: executeWorkflow(), runAnalyticsCalculation(), rollbackAction()" $fBody $global:COL_AMBER 100.0 850.0

    # Engine 4: Governance Engine
    Draw-Card $c 840.0 550.0 680.0 350.0 $global:COL_SURFACE $global:COL_RED 8.0 2.0
    Draw-Badge $c 860.0 570.0 "ENGINE 4" $global:COL_RED_BG $global:COL_RED 9.0 | Out-Null
    Draw-Text $c "GOVERNANCE ENGINE" $fH2 $global:COL_RED 960.0 570.0
    Draw-Text $c "Responsibilities:\n* 4-tier risk classification: T0 (Observe), T1 (Reversible), T2 (Outward), T3 (Critical)\n* Two-Person Rule consensus validation for high-risk operations\n* Evidence grading lifecycle: G0 (Extracted), G1 (Verified), G2 (Action-Proven)\n* Step-up multi-factor authentication (MFA) enforcement\n* Immutable SOC2 Type II audit logging and forensic event recording" $fBody $global:COL_NAVY 860.0 610.0
    Draw-Text $c "Interfaces: evaluateRiskTier(), verifyTwoPersonRule(), logAuditEvent()" $fBody $global:COL_RED 860.0 850.0

    # Connectors
    Draw-Arrow $c 760.0 330.0 840.0 330.0 $global:COL_BLUE "Evidence Vectors"
    Draw-Arrow $c 840.0 400.0 760.0 400.0 $global:COL_PURPLE "Query Intent"
    Draw-Arrow $c 1180.0 510.0 1180.0 550.0 $global:COL_RED "Approval Verification"
    Draw-Arrow $c 420.0 510.0 420.0 550.0 $global:COL_AMBER "Execution Signal"

    $fH2.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-2-four-engine-architecture.png"
}

# --- Figure 3.3: Six-Stage Operational Workflow ---
function Render-Figure-3-3 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.3" "Six-Stage Operational Workflow" "End-to-end cognitive progression from query understanding to persistent organizational evolution."
    $fNum = New-Object System.Drawing.Font ("Segoe UI", 16.0, [System.Drawing.FontStyle]::Bold)
    $fTitle = New-Object System.Drawing.Font ("Segoe UI", 12.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.0, [System.Drawing.FontStyle]::Regular)

    $stages = @(
        @{ Num = "1"; Name = "UNDERSTAND"; Color = $global:COL_BLUE; Desc = "* Intent classification\n* Entity recognition\n* Parameter extraction\n* Workspace boundary check\n* Complexity tiering (T1-T4)" },
        @{ Num = "2"; Name = "ORGANIZE"; Color = $global:COL_PURPLE; Desc = "* Domain filtering\n* Hybrid vector retrieval\n* Semantic chunk ranking\n* Entity graph traversal\n* Evidence scoping" },
        @{ Num = "3"; Name = "REASON"; Color = $global:COL_NAVY; Desc = "* EMLM context assembly\n* Multi-step plan synthesis\n* Variance modeling\n* Causal investigation\n* Boundary verification" },
        @{ Num = "4"; Name = "ACT"; Color = $global:COL_AMBER; Desc = "* Tool execution\n* DAG workflow orchestration\n* Governed action staging\n* Approval sign-off check\n* External API mutations" },
        @{ Num = "5"; Name = "VERIFY"; Color = $global:COL_GREEN; Desc = "* Cryptographic citations\n* Ground truth provenance\n* Evidence grading (G0-G2)\n* Post-execution audit\n* Accuracy confirmation" },
        @{ Num = "6"; Name = "EVOLVE"; Color = $global:COL_BLUE_ACCENT; Desc = "* Precedent cataloging\n* Feedback loop capture\n* Baseline calibration\n* Organizational learning\n* Model fine-tuning" }
    )

    $boxW = 210.0; $boxH = 460.0; $startY = 220.0; $spacing = 40.0; $startX = 60.0
    for ($i = 0; $i -lt $stages.Length; $i++) {
        $st = $stages[$i]
        $x = $startX + ($i * ($boxW + $spacing))
        Draw-Card $c $x $startY $boxW $boxH $global:COL_SURFACE $st.Color 8.0 2.0
        
        $pathH = Create-RoundedPath $x $startY $boxW 70.0 8.0
        $bH = New-Object System.Drawing.SolidBrush $st.Color
        $c.Graphics.FillPath($bH, $pathH)
        $bH.Dispose(); $pathH.Dispose()
        
        Draw-Text $c $st.Num $fNum $global:COL_WHITE ($x + 15) ($startY + 15)
        Draw-Text $c $st.Name $fTitle $global:COL_WHITE ($x + 45) ($startY + 22)
        Draw-Text $c $st.Desc $fBody $global:COL_NAVY ($x + 15) ($startY + 90)

        if ($i -lt ($stages.Length - 1)) {
            Draw-Arrow $c ($x + $boxW + 5) ($startY + 230) ($x + $boxW + $spacing - 5) ($startY + 230) $st.Color
        }
    }

    # Feedback bar
    Draw-Card $c 120.0 750.0 1360.0 130.0 $global:COL_BLUE_LIGHT $global:COL_BLUE_ACCENT 8.0 1.5
    Draw-Text $c "CLOSED-LOOP REINFORCEMENT & ORGANIZATIONAL KNOWLEDGE FEEDBACK" $fTitle $global:COL_NAVY 150.0 770.0
    Draw-Text $c "Action outcomes and verified citations (G2) automatically update the organizational memory index,\ncalibrating future reasoning baselines without manual retraining. Invalidated results generate anomaly precedents." $fBody $global:COL_TEXT_SECONDARY 150.0 805.0

    Draw-Arrow $c 1420.0 680.0 1420.0 750.0 $global:COL_BLUE_ACCENT "Evolve Feedback"
    Draw-Arrow $c 120.0 810.0 80.0 680.0 $global:COL_BLUE_ACCENT "Adaptive Learning"

    $fNum.Dispose(); $fTitle.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-3-six-stage-workflow.png"
}

# --- Figure 3.4: EMLM Architecture ---
function Render-Figure-3-4 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.4" "EMLM Architecture and Organizational Memory" "Separation of ephemeral conversation memory from persistent, validated organizational knowledge."
    $fH2 = New-Object System.Drawing.Font ("Segoe UI", 12.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)

    # Ephemeral
    Draw-Card $c 80.0 160.0 420.0 770.0 $global:COL_SURFACE $global:COL_AMBER 10.0 2.0
    Draw-Badge $c 100.0 180.0 "EPHEMERAL CONVERSATION" $global:COL_AMBER_BG $global:COL_AMBER 9.5 | Out-Null
    Draw-Text $c "* Active Session Chat History\n* User Pronouns & Follow-up Queries\n* Scratchpad Analytical Calculations\n* Temporary Voice Audio Buffers\n* Short-term Context Window (10 turns)" $fBody $global:COL_TEXT_SECONDARY 100.0 230.0
    
    Draw-Card $c 100.0 420.0 380.0 220.0 $global:COL_AMBER_BG $global:COL_AMBER 8.0 1.0
    Draw-Text $c "SECURITY BOUNDARY GATE" $fH2 $global:COL_RED 120.0 440.0
    Draw-Text $c "Model-generated answers NEVER\nautomatically become organizational memory.\nStrict zero-pollution barrier prevents\nunsubstantiated LLM hallucinations from\ninfiltrating enterprise knowledge bases." $fBody $global:COL_NAVY 120.0 480.0

    # Mediation
    Draw-Card $c 540.0 160.0 480.0 770.0 $global:COL_SURFACE $global:COL_PURPLE 10.0 2.0
    Draw-Badge $c 560.0 180.0 "EMLM MEDIATION" $global:COL_PURPLE_BG $global:COL_PURPLE 9.5 | Out-Null
    Draw-Text $c "8-STAGE REASONING PIPELINE" $fH2 $global:COL_PURPLE 740.0 180.0
    $stages = @("1. Intent & Parameter Understanding", "2. Workspace Boundary & RBAC Isolation", "3. Evidence & Deterministic Retrieval", "4. Structured Execution Planning", "5. Tool & Capability Execution", "6. Citation Verification & Provenance", "7. Grounded Answer Synthesis", "8. Durable Persistence & Audit Trail")
    for ($i = 0; $i -lt $stages.Length; $i++) {
        $y = 225.0 + ($i * 54.0)
        Draw-Card $c 560.0 $y 440.0 45.0 $global:COL_PURPLE_BG $global:COL_PURPLE 6.0 1.0
        Draw-Text $c $stages[$i] $fBody $global:COL_NAVY 580.0 ($y + 12.0)
    }
    Draw-Card $c 560.0 675.0 440.0 220.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.0
    Draw-Text $c "AI ROUTER & MODEL ARBITRATION" $fH2 $global:COL_BLUE 580.0 695.0
    Draw-Text $c "* Selects Gemini 2.5 Flash / Pro model\n* Injects domain-grounded system prompts\n* Computes latency, cost, and risk threshold\n* Enforces verified citation metadata" $fBody $global:COL_TEXT_SECONDARY 580.0 730.0

    # Persistent
    Draw-Card $c 1060.0 160.0 460.0 770.0 $global:COL_SURFACE $global:COL_BLUE 10.0 2.0
    Draw-Badge $c 1080.0 180.0 "PERSISTENT KNOWLEDGE" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.5 | Out-Null
    Draw-Text $c "* Verified Knowledge Bases (Healthcare, Finance, Education)\n* Multi-tenant RAG Vector Embeddings\n* Cryptographically Grounded Evidence (G0, G1, G2)\n* Enterprise Entity Knowledge Graph\n* Immutable Compliance Audit Trails (SOC2)" $fBody $global:COL_TEXT_SECONDARY 1080.0 230.0

    Draw-Card $c 1080.0 420.0 420.0 220.0 $global:COL_GREEN_BG $global:COL_GREEN 8.0 1.0
    Draw-Text $c "VALIDATED KNOWLEDGE PROMOTION" $fH2 $global:COL_GREEN 1100.0 440.0
    Draw-Text $c "Only information that has passed through\nformal evidence verification or human-approved\ngoverned action execution (G2) is permanently\ncommitted into organizational memory." $fBody $global:COL_NAVY 1100.0 480.0

    Draw-Card $c 1080.0 660.0 420.0 235.0 $global:COL_NAVY_LIGHT $global:COL_BORDER 8.0 1.0
    Draw-Text $c "WORKSPACE ISOLATION GUARDS" $fH2 $global:COL_WHITE 1100.0 680.0
    Draw-Text $c "* Tenant isolation enforced at database layer\n* Mandatory WHERE workspace_id = auth_ws\n* Zero cross-workspace vector retrieval\n* Scoped deletion and atomic re-indexing" $fBody $global:COL_WHITE 1100.0 715.0

    Draw-Arrow $c 1060.0 320.0 1020.0 320.0 $global:COL_BLUE "Evidence Feed"
    Draw-Arrow $c 500.0 320.0 540.0 320.0 $global:COL_AMBER "User Context"
    Draw-Arrow $c 1020.0 510.0 1060.0 510.0 $global:COL_GREEN "Promotion Gate"

    $fH2.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-4-emlm-organizational-memory.png"
}

# --- Figure 3.5: Adaptive AI Router ---
function Render-Figure-3-5 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.5" "Adaptive AI Router Policy Engine" "Dynamic complexity classification, resource allocation, and multi-tier routing architecture."
    $fTitle = New-Object System.Drawing.Font ("Segoe UI", 12.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)

    # Ingestion
    Draw-Card $c 80.0 160.0 360.0 770.0 $global:COL_SURFACE $global:COL_BLUE 10.0 2.0
    Draw-Badge $c 100.0 180.0 "INPUT INGESTION" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.5 | Out-Null
    Draw-Text $c "ROUTER POLICY ENGINE" $fTitle $global:COL_BLUE 100.0 220.0
    Draw-Text $c "Evaluation Criteria:\n1. Semantic Complexity Score\n2. Mutation & Permission Risk Analysis\n3. Required Evidence Depth\n4. Latency SLA (<200ms vs multi-sec)\n5. Cost & Token Optimization\n6. Workspace Domain Policy" $fBody $global:COL_TEXT_SECONDARY 100.0 260.0

    Draw-Card $c 100.0 460.0 320.0 430.0 $global:COL_BLUE_LIGHT $global:COL_BORDER 8.0 1.0
    Draw-Text $c "ROUTING ARBITRATION MATRIX" $fTitle $global:COL_NAVY 120.0 480.0
    Draw-Text $c "Queries are evaluated against regex\nheuristics, mutation verbs, token count,\nand workspace boundary definitions.\n\nOutputs a formal RoutingDecision object:\n* Tier ID\n* Confidence score\n* Target model\n* Requires RAG flag\n* Requires computation flag\n* Requires human approval flag" $fBody $global:COL_TEXT_SECONDARY 120.0 520.0

    # 4 Tiers
    $tiers = @(
        @{ Name = "TIER 1: SIMPLE"; Col = $global:COL_GREEN; Bg = $global:COL_GREEN_BG; SLA = "<150ms"; Path = "Deterministic logic / light response"; Target = "Cache / Regex Engine / Greeting"; Cost = "Zero cost"; Ex = "* Greetings ('Hello', 'Help')\n* Interface navigation ('Go home')\n* System status pings" },
        @{ Name = "TIER 2: MODERATE"; Col = $global:COL_BLUE; Bg = $global:COL_BLUE_LIGHT; SLA = "~1200ms"; Path = "Grounded Workspace RAG"; Target = "Gemini 2.5 Flash + Hybrid Vector Search"; Cost = "Low cost"; Ex = "* Domain questions ('What is Q3 revenue?')\n* Policy definitions ('Sterilization steps')\n* Document excerpt lookups" },
        @{ Name = "TIER 3: COMPLEX"; Col = $global:COL_PURPLE; Bg = $global:COL_PURPLE_BG; SLA = "~2500ms"; Path = "8-Stage EMLM Orchestration"; Target = "Gemini 2.5 Pro + Analytics DAG Engine"; Cost = "Moderate cost"; Ex = "* Deep investigations ('Root cause analysis')\n* Multi-year variance modeling\n* Cross-source reconciliation" },
        @{ Name = "TIER 4: CONSEQUENTIAL"; Col = $global:COL_RED; Bg = $global:COL_RED_BG; SLA = "Variable"; Path = "Governance Gate & Human Sign-off"; Target = "Action Engine + Two-Person Rule Consensus"; Cost = "High governance"; Ex = "* Fund transfers & budget reallocations\n* User permission modifications\n* System configuration mutations" }
    )

    for ($i = 0; $i -lt $tiers.Length; $i++) {
        $t = $tiers[$i]
        $y = 160.0 + ($i * 195.0)
        Draw-Card $c 490.0 $y 1030.0 180.0 $global:COL_SURFACE $t.Col 8.0 2.0
        Draw-Badge $c 510.0 ($y + 15.0) $t.Name $t.Bg $t.Col 9.5 | Out-Null
        Draw-Badge $c 730.0 ($y + 15.0) "SLA: $($t.SLA)" $global:COL_BORDER_LIGHT $global:COL_NAVY 8.5 | Out-Null
        Draw-Badge $c 860.0 ($y + 15.0) $t.Cost $global:COL_BORDER_LIGHT $global:COL_TEXT_SECONDARY 8.5 | Out-Null
        
        Draw-Text $c "Execution Strategy: $($t.Path)" $fTitle $global:COL_NAVY 510.0 ($y + 50.0)
        Draw-Text $c "Target System: $($t.Target)" $fBody $t.Col 510.0 ($y + 80.0)
        Draw-Text $c "Representative Queries:\n$($t.Ex)" $fBody $global:COL_TEXT_SECONDARY 510.0 ($y + 110.0)
        
        Draw-Arrow $c 440.0 ($y + 90.0) 490.0 ($y + 90.0) $t.Col
    }

    $fTitle.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-5-adaptive-ai-router.png"
}

# --- Figure 3.6: Knowledge Ingestion & Retrieval Pipeline ---
function Render-Figure-3-6 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.6" "Knowledge Ingestion and Retrieval Pipeline" "Multi-format processing pipeline with isolated vector indexing, hybrid search, RRF reranking, and citation synthesis."
    $fH2 = New-Object System.Drawing.Font ("Segoe UI", 12.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.0, [System.Drawing.FontStyle]::Regular)

    # Ingestion Flow (Top Half)
    Draw-Card $c 60.0 150.0 1480.0 360.0 $global:COL_SURFACE $global:COL_BLUE 10.0 2.0
    Draw-Badge $c 80.0 170.0 "INGESTION PHASE" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.5 | Out-Null
    Draw-Text $c "INDEPENDENT DOCUMENT INGESTION PIPELINE" $fH2 $global:COL_BLUE 250.0 170.0

    $ingestSteps = @(
        @{ Title = "1. Upload"; Sub = "File Upload`nPDF, DOCX, XLSX`nCSV, JSON, IMG"; X = 85 },
        @{ Title = "2. Validate"; Sub = "Format & Size Check`nSHA-256 Hashing`nIdempotency Gate"; X = 295 },
        @{ Title = "3. Extract"; Sub = "Text Extraction`nMammoth, PDF.js`nTesseract OCR"; X = 505 },
        @{ Title = "4. Classify"; Sub = "Domain Mapping`nEntity Tagging`nMetadata Assembly"; X = 715 },
        @{ Title = "5. Chunk"; Sub = "Semantic Splitting`n600 token window`n100 token overlap"; X = 925 },
        @{ Title = "6. Embed & Index"; Sub = "TF-IDF Vector Calc`nWorkspace Store`nIsolated Index"; X = 1135 },
        @{ Title = "7. Ready"; Sub = "Verified Chunks`nStatus: READY`nAudit Log Entry"; X = 1345 }
    )
    foreach ($s in $ingestSteps) {
        Draw-Card $c $s.X 230.0 175.0 240.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.0
        Draw-Text $c $s.Title $fH2 $global:COL_NAVY ($s.X + 15) 250.0
        Draw-Text $c $s.Sub $fBody $global:COL_TEXT_SECONDARY ($s.X + 15) 290.0
        if ($s.X -lt 1345) {
            Draw-Arrow $c ($s.X + 175) 350.0 ($s.X + 210) 350.0 $global:COL_BLUE
        }
    }

    # Retrieval Flow (Bottom Half)
    Draw-Card $c 60.0 540.0 1480.0 400.0 $global:COL_SURFACE $global:COL_PURPLE 10.0 2.0
    Draw-Badge $c 80.0 560.0 "RETRIEVAL PHASE" $global:COL_PURPLE_BG $global:COL_PURPLE 9.5 | Out-Null
    Draw-Text $c "WORKSPACE-ISOLATED HYBRID RETRIEVAL & SYNTHESIS" $fH2 $global:COL_PURPLE 260.0 560.0

    $retrievalSteps = @(
        @{ Title = "1. User Query"; Sub = "Natural Language`nDomain Expansion`nSession Context"; X = 95 },
        @{ Title = "2. Boundary Check"; Sub = "Verify Workspace ID`nRBAC Permissions`nZero Cross-Leakage"; X = 340 },
        @{ Title = "3. Hybrid Search"; Sub = "Semantic Cosine Sim`nBM25 Keyword Overlap`nCode & Heading Bonus"; X = 585 },
        @{ Title = "4. RRF Reranking"; Sub = "Reciprocal Rank Fusion`nDomain Keyword Boost`nEvidence Grade Weight"; X = 830 },
        @{ Title = "5. Evidence Guard"; Sub = "Evidence Verification`nIf empty -> Honest`nInsufficient State"; X = 1075 },
        @{ Title = "6. Grounded Answer"; Sub = "Gemini 2.5 Synthesis`nFactual Citations`nG2 Verified Evidence"; X = 1320 }
    )
    foreach ($r in $retrievalSteps) {
        Draw-Card $c $r.X 620.0 200.0 280.0 $global:COL_PURPLE_BG $global:COL_PURPLE 6.0 1.0
        Draw-Text $c $r.Title $fH2 $global:COL_NAVY ($r.X + 15) 640.0
        Draw-Text $c $r.Sub $fBody $global:COL_TEXT_SECONDARY ($r.X + 15) 680.0
        if ($r.X -lt 1320) {
            Draw-Arrow $c ($r.X + 200) 760.0 ($r.X + 245) 760.0 $global:COL_PURPLE
        }
    }

    $fH2.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-6-knowledge-ingestion-retrieval.png"
}

# --- Figure 3.7: Evidence Grading and Verification ---
function Render-Figure-3-7 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.7" "Evidence Grading and Verification Lifecycle" "Structured evidence hierarchy ensuring factual provenance, action validation, and contradiction quarantine."
    $fH2 = New-Object System.Drawing.Font ("Segoe UI", 12.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)

    $grades = @(
        @{ Grade = "G0"; Name = "EXTRACTED / UNVERIFIED"; Col = $global:COL_AMBER; Bg = $global:COL_AMBER_BG; Status = "Provisional / Raw"; Desc = "* Initial raw extracted document text\n* OCR unconfirmed extractions\n* Third-party imported records\n* Ineligible for high-risk action justification\n* Displayed with caution badges in UI" },
        @{ Grade = "G1"; Name = "VERIFIED KNOWLEDGE"; Col = $global:COL_BLUE; Bg = $global:COL_BLUE_LIGHT; Status = "Corroborated / Official"; Desc = "* Corroborated by primary organizational source\n* Verified policy documents & standard procedures\n* Approved financial statements & contracts\n* Used as primary grounding evidence in RAG\n* Eligible for standard action guidance" },
        @{ Grade = "G2"; Name = "ACTION-PROVEN"; Col = $global:COL_GREEN; Bg = $global:COL_GREEN_BG; Status = "Cryptographically Proven"; Desc = "* Proven via real successful governed execution\n* Backed by signed two-person audit log\n* Highest trust tier in Synaptix Command\n* Permanent baseline promotion into organizational memory\n* Used as empirical precedent for future reasoning" },
        @{ Grade = "ERR"; Name = "CONTRADICTED / INVALIDATED"; Col = $global:COL_RED; Bg = $global:COL_RED_BG; Status = "Quarantined / Conflicting"; Desc = "* Factually contradicted by newer verified records\n* Superseded financial ledger revisions\n* Failed operational verification\n* Quarantined from generative context\n* Logged in Anomaly Investigation Hub" }
    )

    $boxW = 340.0; $boxH = 680.0; $startY = 180.0; $spacing = 35.0; $startX = 70.0
    for ($i = 0; $i -lt $grades.Length; $i++) {
        $gItem = $grades[$i]
        $x = $startX + ($i * ($boxW + $spacing))
        Draw-Card $c $x $startY $boxW $boxH $global:COL_SURFACE $gItem.Col 10.0 2.0
        Draw-Badge $c ($x + 20) ($startY + 20) $gItem.Grade $gItem.Bg $gItem.Col 12.0 | Out-Null
        Draw-Text $c $gItem.Name $fH2 $gItem.Col ($x + 80) ($startY + 24)
        Draw-Badge $c ($x + 20) ($startY + 70) $gItem.Status $global:COL_BORDER_LIGHT $global:COL_NAVY 9.0 | Out-Null
        Draw-Text $c $gItem.Desc $fBody $global:COL_NAVY ($x + 20) ($startY + 120)

        # Transition arrow to next grade
        if ($i -lt 2) {
            Draw-Arrow $c ($x + $boxW) ($startY + 300) ($x + $boxW + $spacing) ($startY + 300) $global:COL_BLUE "Verify"
        }
    }

    # Red transition arrow to Contradicted
    Draw-Arrow $c 350.0 ($startY + 480) 1140.0 ($startY + 480) $global:COL_RED "Contradicted / Superseded"

    # Bottom explanation
    Draw-Card $c 70.0 890.0 1465.0 70.0 $global:COL_NAVY_LIGHT $global:COL_BLUE_ACCENT 6.0 1.0
    Draw-Text $c "EVIDENCE PRINCIPLE: Evidence grades do not guarantee absolute truth - they quantify operational verification rigor and audit provenance." $fBody $global:COL_WHITE 110.0 915.0

    $fH2.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-7-evidence-grading.png"
}

# --- Figure 3.8: Governed Action and Risk Tiers ---
function Render-Figure-3-8 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.8" "Governed Action and Risk Tiers" "Four-tier operational risk classification with Two-Person Rule consensus validation."
    $fH2 = New-Object System.Drawing.Font ("Segoe UI", 12.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)

    $tiers = @(
        @{ Tier = "T0"; Name = "OBSERVE / READ"; Col = $global:COL_GREEN; Bg = $global:COL_GREEN_BG; Auth = "Standard User"; Approval = "Automated / Zero Approval"; Ex = "* Document search and retrieval\n* Dashboard telemetry viewing\n* Statistical variance summaries\n* Audit log inspection" },
        @{ Tier = "T1"; Name = "REVERSIBLE ACTIONS"; Col = $global:COL_BLUE; Bg = $global:COL_BLUE_LIGHT; Auth = "Specialist Role"; Approval = "Single-Click Self-Approval"; Ex = "* Generating draft policy reports\n* Creating private scratchpad notes\n* Re-indexing own workspace docs\n* Triggering dry-run simulation" },
        @{ Tier = "T2"; Name = "OUTWARD-FACING"; Col = $global:COL_AMBER; Bg = $global:COL_AMBER_BG; Auth = "Manager / Lead"; Approval = "Supervisor Sign-Off Required"; Ex = "* Sending partner email notifications\n* Updating shared CRM records\n* Publishing draft SOP to workspace\n* Scheduling automated workflows" },
        @{ Tier = "T3"; Name = "CRITICAL ACTIONS"; Col = $global:COL_RED; Bg = $global:COL_RED_BG; Auth = "Admin / Owner"; Approval = "Two-Person Rule + Step-up MFA"; Ex = "* Reallocating financial budgets\n* Deleting workspace repositories\n* Granting/revoking user access\n* External SAP ERP mutations" }
    )

    $boxW = 340.0; $boxH = 750.0; $startY = 180.0; $spacing = 35.0; $startX = 70.0
    for ($i = 0; $i -lt $tiers.Length; $i++) {
        $t = $tiers[$i]
        $x = $startX + ($i * ($boxW + $spacing))
        Draw-Card $c $x $startY $boxW $boxH $global:COL_SURFACE $t.Col 10.0 2.0
        Draw-Badge $c ($x + 20) ($startY + 20) $t.Tier $t.Bg $t.Col 12.0 | Out-Null
        Draw-Text $c $t.Name $fH2 $t.Col ($x + 80) ($startY + 24)
        
        Draw-Card $c ($x + 20) ($startY + 70) 300.0 80.0 $t.Bg $t.Col 6.0 1.0
        Draw-Text $c "Authorized Role: $($t.Auth)" $fBody $global:COL_NAVY ($x + 30) ($startY + 80)
        Draw-Text $c "Approval: $($t.Approval)" $fBody $t.Col ($x + 30) ($startY + 110)

        Draw-Text $c "Representative Operations:\n$($t.Ex)" $fBody $global:COL_NAVY ($x + 20) ($startY + 180)

        Draw-Card $c ($x + 20) ($startY + 460) 300.0 250.0 $global:COL_BORDER_LIGHT $global:COL_BORDER 6.0 1.0
        Draw-Text $c "GOVERNANCE GATEWAY" $fH2 $global:COL_NAVY ($x + 35) ($startY + 480)
        if ($t.Tier -eq "T3") {
            Draw-Text $c "* Strict MFA verification challenge\n* Two distinct cryptographic signatures\n* Preview diff modal inspection\n* Pre-execution dry run validation\n* Immediate immutable SOC2 log" $fBody $global:COL_RED ($x + 35) ($startY + 515)
        } elseif ($t.Tier -eq "T2") {
            Draw-Text $c "* Single supervisor review\n* Diff preview verification\n* Timeout escalation queue\n* Audit entry recorded" $fBody $global:COL_AMBER ($x + 35) ($startY + 515)
        } else {
            Draw-Text $c "* Auto-authorized by RBAC\n* Instant non-blocking execution\n* State rollback available\n* Standard access log" $fBody $global:COL_TEXT_SECONDARY ($x + 35) ($startY + 515)
        }
    }

    $fH2.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-8-governed-action-risk-tiers.png"
}

# --- Figure 3.9: Closed-Loop Organizational Learning ---
function Render-Figure-3-9 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.9" "Closed-Loop Organizational Learning Architecture" "Continuous feedback architecture driving automated refinement of intelligence baselines."
    $fTitle = New-Object System.Drawing.Font ("Segoe UI", 12.5, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)

    # 6 Major Nodes in Circular / Rectangular Loop
    $nodes = @(
        @{ X = 150; Y = 220; Name = "1. KNOWLEDGE"; Sub = "Multi-domain RAG Docs\nVector Embeddings\nEntity Graph"; Col = $global:COL_BLUE },
        @{ X = 650; Y = 220; Name = "2. INTELLIGENCE"; Sub = "Adaptive AI Router\nGemini 2.5 Engine\n8-Stage EMLM Plan"; Col = $global:COL_PURPLE },
        @{ X = 1150; Y = 220; Name = "3. GOVERNED ACTION"; Sub = "Risk Tiers T0-T3\nTwo-Person Consensus\nWorkflow Execution"; Col = $global:COL_AMBER },
        @{ X = 1150; Y = 620; Name = "4. OUTCOME AND VERIFY"; Sub = "Action Verification`nAPI Mutation Result`nCryptographic Citation"; Col = $global:COL_GREEN },
        @{ X = 650; Y = 620; Name = "5. EVIDENCE PROVEN"; Sub = "G2 Evidence Upgrade`nFact Provenance Check`nForensic Audit Log"; Col = $global:COL_BLUE_ACCENT },
        @{ X = 150; Y = 620; Name = "6. MEMORY EVOLUTION"; Sub = "Organizational Memory`nPrecedent Cataloging`nBaseline Calibration"; Col = $global:COL_NAVY }
    )

    foreach ($n in $nodes) {
        Draw-Card $c $n.X $n.Y 300.0 180.0 $global:COL_SURFACE $n.Col 10.0 2.5
        Draw-Text $c $n.Name $fTitle $n.Col ($n.X + 25) ($n.Y + 25)
        Draw-Text $c $n.Sub $fBody $global:COL_NAVY ($n.X + 25) ($n.Y + 70)
    }

    # Connecting Loop Arrows
    Draw-Arrow $c 450.0 310.0 650.0 310.0 $global:COL_BLUE "Inference Context"
    Draw-Arrow $c 950.0 310.0 1150.0 310.0 $global:COL_PURPLE "Execution Plan"
    Draw-Arrow $c 1300.0 400.0 1300.0 620.0 $global:COL_AMBER "System Mutation"
    Draw-Arrow $c 1150.0 710.0 950.0 710.0 $global:COL_GREEN "Verified Proof"
    Draw-Arrow $c 650.0 710.0 450.0 710.0 $global:COL_BLUE_ACCENT "Promotion Gate"
    Draw-Arrow $c 300.0 620.0 300.0 400.0 $global:COL_NAVY "Calibrated Baselines"

    # Center Hub Explanation
    Draw-Card $c 520.0 440.0 560.0 140.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.0
    Draw-Text $c "ZERO-POLLUTION CONTINUOUS LEARNING" $fTitle $global:COL_NAVY 550.0 460.0
    Draw-Text $c "The platform evolves without retraining foundation weights. Execution successes`nand confirmed G2 evidence update retrieval embeddings and precedent caches,`npreventing repetitive errors and accelerating operational decision velocity." $fBody $global:COL_TEXT_SECONDARY 550.0 495.0

    $fTitle.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-9-closed-loop-learning.png"
}

# --- Figure 3.10: Data Flow Diagram (Level 1) ---
function Render-Figure-3-10 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.10" "Level 1 Data Flow Diagram (DFD)" "Standard DFD Level 1 notation depicting external entities, core processes, and persistent data stores."
    $fProc = New-Object System.Drawing.Font ("Segoe UI", 11.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.0, [System.Drawing.FontStyle]::Regular)

    # External Entities (Rectangles with double border)
    Draw-Card $c 60.0 180.0 180.0 120.0 $global:COL_SURFACE $global:COL_NAVY 4.0 2.0
    Draw-Text $c "EXTERNAL ENTITY:`nSpecialist / User" $fProc $global:COL_NAVY 80.0 220.0

    Draw-Card $c 60.0 560.0 180.0 120.0 $global:COL_SURFACE $global:COL_NAVY 4.0 2.0
    Draw-Text $c "EXTERNAL ENTITY:`nAuthorized Approver" $fProc $global:COL_NAVY 80.0 600.0

    Draw-Card $c 1360.0 400.0 180.0 120.0 $global:COL_SURFACE $global:COL_NAVY 4.0 2.0
    Draw-Text $c "EXTERNAL ENTITY:`nEnterprise APIs (SAP)" $fProc $global:COL_NAVY 1380.0 440.0

    # Processes (Rounded Bubbles)
    $procs = @(
        @{ Num = "P1.0"; Name = "Authenticate and`nResolve Workspace"; X = 320; Y = 200 },
        @{ Num = "P2.0"; Name = "Evaluate AI Router`nPolicy Tier"; X = 580; Y = 200 },
        @{ Num = "P3.0"; Name = "Retrieve Workspace`nRAG Evidence"; X = 840; Y = 200 },
        @{ Num = "P4.0"; Name = "Execute EMLM`nReasoning Pipeline"; X = 840; Y = 420 },
        @{ Num = "P5.0"; Name = "Evaluate Risk and`nTwo-Person Gate"; X = 580; Y = 600 },
        @{ Num = "P6.0"; Name = "Execute Action and`nRecord Audit Log"; X = 1100; Y = 600 }
    )
    foreach ($p in $procs) {
        Draw-Card $c $p.X $p.Y 180.0 100.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 25.0 2.0
        Draw-Text $c ($p.Num + ': ' + $p.Name) $fProc $global:COL_NAVY ($p.X + 20) ($p.Y + 25)
    }

    # Data Stores (Open-ended parallel lines)
    $stores = @(
        @{ ID = "D1"; Name = "Workspaces and RBAC Rules"; X = 320; Y = 440 },
        @{ ID = "D2"; Name = "Documents and Vector Chunks"; X = 840; Y = 80 },
        @{ ID = "D3"; Name = "Evidence Records (G0-G2)"; X = 1100; Y = 220 },
        @{ ID = "D4"; Name = "Conversations and Chat Log"; X = 580; Y = 440 },
        @{ ID = "D5"; Name = "Immutable SOC2 Audit Trail"; X = 1100; Y = 800 }
    )
    foreach ($ds in $stores) {
        Draw-Card $c $ds.X $ds.Y 200.0 60.0 $global:COL_SURFACE $global:COL_BORDER 0.0 1.5
        Draw-Text $c ($ds.ID + ' - ' + $ds.Name) $fBody $global:COL_BLUE ($ds.X + 15) ($ds.Y + 20)
    }

    # Flow Arrows
    Draw-Arrow $c 240.0 240.0 320.0 240.0 $global:COL_NAVY "1. Query"
    Draw-Arrow $c 500.0 240.0 580.0 240.0 $global:COL_BLUE "2. Auth Context"
    Draw-Arrow $c 760.0 240.0 840.0 240.0 $global:COL_BLUE "3. Target Tier"
    Draw-Arrow $c 930.0 140.0 930.0 200.0 $global:COL_BLUE "Vectors"
    Draw-Arrow $c 930.0 300.0 930.0 420.0 $global:COL_PURPLE "4. Evidence"
    Draw-Arrow $c 840.0 470.0 670.0 600.0 $global:COL_AMBER "5. Action Plan"
    Draw-Arrow $c 240.0 620.0 580.0 620.0 $global:COL_RED "Sign-Off"
    Draw-Arrow $c 760.0 650.0 1100.0 650.0 $global:COL_RED "6. Approved"
    Draw-Arrow $c 1280.0 650.0 1360.0 500.0 $global:COL_NAVY "7. API Mutation"
    Draw-Arrow $c 1200.0 700.0 1200.0 800.0 $global:COL_GREEN "Audit Entry"

    $fProc.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-10-level-1-data-flow.png"
}

# --- Figure 3.11: Use Case Diagram ---
function Render-Figure-3-11 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.11" "UML Use Case Diagram - Synaptix Command Platform" "Actor interactions, boundary definition, and functional system capabilities."
    $fTitle = New-Object System.Drawing.Font ("Segoe UI", 12.0, [System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)

    # System Boundary Box
    Draw-Card $c 340.0 160.0 920.0 790.0 $global:COL_SURFACE $global:COL_BORDER 10.0 2.0
    Draw-Text $c "SYNAPTIX COMMAND PLATFORM BOUNDARY" $fTitle $global:COL_NAVY 360.0 180.0

    # Actors (Left & Right)
    $actors = @(
        @{ Name = "Administrator"; X = 80; Y = 250; Sub = "RBAC, Workspace Mgmt,\nDomain Policy Config" },
        @{ Name = "Enterprise Specialist\n/ Employee"; X = 80; Y = 520; Sub = "RAG Document Ingestion,\nNatural Language Q&A" },
        @{ Name = "Authorized Approver"; X = 80; Y = 780; Sub = "Two-Person Consensus,\nCritical Action Sign-Off" },
        @{ Name = "External Enterprise\nSystem (SAP / S3)"; X = 1320; Y = 500; Sub = "API Mutation Target,\nEvidence Source" }
    )
    foreach ($a in $actors) {
        # Actor Stick figure card
        Draw-Card $c $a.X $a.Y 180.0 140.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.5
        Draw-Text $c $a.Name $fTitle $global:COL_NAVY ($a.X + 15) ($a.Y + 20)
        Draw-Text $c $a.Sub $fBody $global:COL_TEXT_SECONDARY ($a.X + 15) ($a.Y + 70)
    }

    # Use Cases (Ovals in Center)
    $useCases = @(
        @{ Name = "Authenticate & Select Workspace"; Y = 230 },
        @{ Name = "Configure Multi-Domain RAG Policies"; Y = 310 },
        @{ Name = "Ingest Multi-Format Documents (PDF/XLSX)"; Y = 390 },
        @{ Name = "Natural Language & Voice Query (EMLM)"; Y = 470 },
        @{ Name = "Inspect Verified Citations & Evidence Grades"; Y = 550 },
        @{ Name = "Execute Sandboxed Agent Workflows"; Y = 630 },
        @{ Name = "Approve / Reject Governed Actions (T3)"; Y = 710 },
        @{ Name = "Review Immutable SOC2 Audit Trails"; Y = 790 },
        @{ Name = "Execute External API Mutation"; Y = 870 }
    )
    foreach ($uc in $useCases) {
        $ucPath = Create-RoundedPath 520.0 $uc.Y 560.0 55.0 25.0
        $bUc = New-Object System.Drawing.SolidBrush $global:COL_BLUE_LIGHT
        $c.Graphics.FillPath($bUc, $ucPath)
        $pUc = New-Object System.Drawing.Pen $global:COL_BLUE, 1.5
        $c.Graphics.DrawPath($pUc, $ucPath)
        $bUc.Dispose(); $pUc.Dispose(); $ucPath.Dispose()
        Draw-Text $c $uc.Name $fBody $global:COL_NAVY 600.0 ($uc.Y + 16)
    }

    # Association Lines
    $penLine = New-Object System.Drawing.Pen $global:COL_TEXT_MUTED, 1.2
    # Admin links
    $c.Graphics.DrawLine($penLine, 260, 310, 520, 255)
    $c.Graphics.DrawLine($penLine, 260, 310, 520, 335)
    $c.Graphics.DrawLine($penLine, 260, 310, 520, 815)
    # Specialist links
    $c.Graphics.DrawLine($penLine, 260, 580, 520, 255)
    $c.Graphics.DrawLine($penLine, 260, 580, 520, 415)
    $c.Graphics.DrawLine($penLine, 260, 580, 520, 495)
    $c.Graphics.DrawLine($penLine, 260, 580, 520, 575)
    $c.Graphics.DrawLine($penLine, 260, 580, 520, 655)
    # Approver links
    $c.Graphics.DrawLine($penLine, 260, 840, 520, 735)
    # External API links
    $c.Graphics.DrawLine($penLine, 1080, 895, 1320, 560)
    $c.Graphics.DrawLine($penLine, 1080, 415, 1320, 560)
    $penLine.Dispose()

    $fTitle.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-11-use-case-diagram.png"
}

# --- Figure 3.12: Sequence Diagram for a Governed Action Request ---
function Render-Figure-3-12 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 3.12" "UML Sequence Diagram - Governed Action Lifecycle" "Synchronous and asynchronous message exchange for Tier 4 consequential action execution."
    $fTitle = New-Object System.Drawing.Font "Segoe UI", 10.5, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 8.5, ([System.Drawing.FontStyle]::Regular)

    $lifelines = @(
        @{ Name = "User"; X = 120 },
        @{ Name = "Command UI"; X = 300 },
        @{ Name = "AI Router"; X = 480 },
        @{ Name = "EMLM Engine"; X = 660 },
        @{ Name = "Governance"; X = 860 },
        @{ Name = "Approver"; X = 1060 },
        @{ Name = "Action Engine"; X = 1260 },
        @{ Name = "SAP ERP"; X = 1460 }
    )

    $penDotted = New-Object System.Drawing.Pen $global:COL_BORDER, 1.5
    $penDotted.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

    foreach ($l in $lifelines) {
        Draw-Card $c ($l.X - 60) 160.0 120.0 45.0 $global:COL_SURFACE $global:COL_BLUE 6.0 1.5
        Draw-Text $c $l.Name $fTitle $global:COL_NAVY ($l.X - 50) 172.0
        $c.Graphics.DrawLine($penDotted, $l.X, 205, $l.X, 940)
    }
    $penDotted.Dispose()

    # Sequence Messages
    $seq = @(
        @{ X1 = 120; X2 = 300; Y = 240; Label = '1: Reallocate 450k CapEx budget'; Col = $global:COL_NAVY; Ret = $false },
        @{ X1 = 300; X2 = 480; Y = 280; Label = '2: evaluateQuery(query, wsId)'; Col = $global:COL_BLUE; Ret = $false },
        @{ X1 = 480; X2 = 660; Y = 320; Label = '3: TIER_4_CONSEQUENTIAL'; Col = $global:COL_PURPLE; Ret = $false },
        @{ X1 = 660; X2 = 860; Y = 360; Label = '4: evaluateRiskTier(T3 Critical)'; Col = $global:COL_AMBER; Ret = $false },
        @{ X1 = 860; X2 = 1060; Y = 410; Label = '5: Request Two-Person Approval'; Col = $global:COL_RED; Ret = $false },
        @{ X1 = 1060; X2 = 860; Y = 500; Label = '6: Sign-off Confirmed (CFO Vance)'; Col = $global:COL_GREEN; Ret = $true },
        @{ X1 = 860; X2 = 1260; Y = 560; Label = '7: executeGovernedAction()'; Col = $global:COL_AMBER; Ret = $false },
        @{ X1 = 1260; X2 = 1460; Y = 620; Label = '8: POST /api/gl/reallocate'; Col = $global:COL_NAVY; Ret = $false },
        @{ X1 = 1460; X2 = 1260; Y = 680; Label = '9: HTTP 200 (Tx #884102)'; Col = $global:COL_GREEN; Ret = $true },
        @{ X1 = 1260; X2 = 860; Y = 730; Label = '10: Verify and Commit SOC2 Log'; Col = $global:COL_GREEN; Ret = $false },
        @{ X1 = 860; X2 = 300; Y = 790; Label = '11: Action Proven (Evidence G2)'; Col = $global:COL_BLUE; Ret = $true },
        @{ X1 = 300; X2 = 120; Y = 840; Label = '12: Display Execution Receipt'; Col = $global:COL_NAVY; Ret = $true }
    )

    foreach ($s in $seq) {
        $p = New-Object System.Drawing.Pen $s.Col, 1.8
        if ($s.Ret) { $p.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash }
        $p.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 4, 4
        $c.Graphics.DrawLine($p, $s.X1, $s.Y, $s.X2, $s.Y)
        $p.Dispose()

        $midX = [Math]::Min($s.X1, $s.X2) + [Math]::Abs($s.X2 - $s.X1)/2.0 - 100.0
        Draw-Text $c $s.Label $fBody $s.Col $midX ($s.Y - 18)
    }

    # Alt Frame (Two-Person Approval Gate)
    $pAlt = New-Object System.Drawing.Pen $global:COL_RED, 1.2
    $pAlt.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dot
    $c.Graphics.DrawRectangle($pAlt, 760, 390, 360, 130)
    Draw-Text $c "[alt: Two-Person Consensus Gate]" $fBody $global:COL_RED 770.0 395.0
    $pAlt.Dispose()

    $fTitle.Dispose(); $fBody.Dispose()
    Save-Canvas $c "$outputDir\figure-3-12-governed-action-sequence.png"
}

Write-Host "Rendering all Group A diagrams (3.1 to 3.12)..."
Render-Figure-3-1
Render-Figure-3-2
Render-Figure-3-3
Render-Figure-3-4
Render-Figure-3-5
Render-Figure-3-6
Render-Figure-3-7
Render-Figure-3-8
Render-Figure-3-9
Render-Figure-3-10
Render-Figure-3-11
Render-Figure-3-12
Write-Host "All Group A diagrams rendered successfully!"
