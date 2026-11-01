# ==============================================================================
# SYNAPTIX COMMAND - Group C & D Outputs Rendering Script (Figures 5.1 to 5.7 & 7.1)
# ==============================================================================

. "$PSScriptRoot\figure_drawing_lib.ps1"

$outputDir = "C:\Users\Harsha MS\Synaptix\docs\figures"
if (-not [System.IO.Directory]::Exists($outputDir)) {
    [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
}

# --- Figure 5.1: Main Command Center Output ---
function Render-Figure-5-1 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Command Center"

    $fH1 = New-Object System.Drawing.Font "Segoe UI", 13.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # User Query Bar
    Draw-Card $c $mainX 75.0 $mainW 75.0 $global:COL_SURFACE $global:COL_BLUE 8.0 1.5
    Draw-Badge $c ($mainX + 20) 90.0 "PROMPT RUN" $global:COL_BLUE $global:COL_WHITE 9.0 | Out-Null
    Draw-Text $c "Cross-examine Q3 CapEx variance across Cost Centers 402 and 710, verify against CapEx Policy Guidelines v4, and determine required risk tier." $fH1 $global:COL_NAVY ($mainX + 130) 90.0
    Draw-Text $c "Query ID: QRY-2026-1101-842 | Workspace: Apex Capital | Model: Gemini 2.5 Pro | Router: Tier 4 Consequential" $fMono $global:COL_TEXT_MUTED ($mainX + 130) 120.0

    # Live Multi-Stage Reasoning Execution Trace
    Draw-Card $c $mainX 165.0 $mainW 210.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "LIVE MULTI-STAGE REASONING TIMELINE (EMLM MEDIATION)" $fH2 $global:COL_NAVY ($mainX + 20) 180.0
    Draw-Badge $c ($mainX + 480) 178.0 "8 / 8 STAGES COMPLETED" $global:COL_GREEN_BG $global:COL_GREEN 8.5 | Out-Null
    Draw-Badge $c ($mainX + 680) 178.0 "TOTAL EXECUTION TIME: 412ms" $global:COL_BLUE_LIGHT $global:COL_BLUE 8.5 | Out-Null

    $traces = @(
        @{ Stage = "1. Parse Intent & Extract Entities"; Detail = "Target: Variance Analysis + Budget Transfer ($450k) | Entities: CC 402, CC 710, Policy v4"; Latency = "18ms"; Col = $global:COL_GREEN },
        @{ Stage = "2. Workspace Domain Isolation Check"; Detail = "Boundary Invariant verified: Scoped strictly to Finance Workspace (#ws-fin-01)"; Latency = "8ms"; Col = $global:COL_GREEN },
        @{ Stage = "3. Hybrid RAG Retrieval (Semantic + BM25)"; Detail = "Fetched 6 relevant chunks from CapEx_Policy_Guidelines_v4 and SAP_GL_Extract. Top RRF: 0.942"; Latency = "84ms"; Col = $global:COL_GREEN },
        @{ Stage = "4. Variance & Ledger Calculation Engine"; Detail = "CC 402 Available: $1,200,000 | CC 710 Surge Overrun: +$412,800 (+18.4% above baseline)"; Latency = "38ms"; Col = $global:COL_GREEN },
        @{ Stage = "5. Policy Compliance & Guardrails Evaluation"; Detail = "CapEx Policy §4.2 rule matched: Reallocations >$250,000 trigger Tier 3 Governance Approval"; Latency = "65ms"; Col = $global:COL_GREEN },
        @{ Stage = "6. Risk Tiering & Consensus Staging"; Detail = "Classified as TIER 3 (Critical Operation) -> Staged Action ACT-2026-9912 awaiting Two-Person Sign-off"; Latency = "22ms"; Col = $global:COL_AMBER }
    )

    $trY = 210.0
    foreach ($tr in $traces) {
        Draw-Card $c ($mainX + 20) $trY 12.0 12.0 $tr.Col $tr.Col 6.0 0.0
        Draw-Text $c $tr.Stage $fH2 $global:COL_NAVY ($mainX + 42) ($trY - 2)
        Draw-Text $c $tr.Detail $fBody $global:COL_TEXT_SECONDARY ($mainX + 380) ($trY - 2)
        Draw-Badge $c ($mainX + $mainW - 120) ($trY - 4) $tr.Latency $global:COL_BG $tr.Col 8.0 | Out-Null
        $trY += 26.0
    }

    # Synthesized Output Card
    Draw-Card $c $mainX 390.0 $mainW 450.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.2
    Draw-Badge $c ($mainX + 25) 410.0 "SYNAPTIX COMMAND SYNTHESIS" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null
    Draw-Badge $c ($mainX + 260) 410.0 "TIER 3 CRITICAL ACTION" $global:COL_RED_BG $global:COL_RED 9.0 | Out-Null
    Draw-Badge $c ($mainX + 470) 410.0 "EVIDENCE GROUNDED: G1" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null

    $resText = "EXECUTIVE VARIANCE CROSS-EXAMINATION REPORT`n`n" +
               "1. Financial Variance Assessment:`n" +
               "   * Cost Center 710 (Cloud Infrastructure): Facing a surge variance of +18.4% above Q3 baseline due to model inference workloads. Operating headroom is depleted to $150,000.`n" +
               "   * Cost Center 402 (Unallocated CapEx): Holds $1,200,000 in uncommitted discretionary reserve. Reallocating $450,000 leaves $750,000 (62.5% liquidity buffer intact).`n`n" +
               "2. Policy & Governance Mandate:`n" +
               "   * CapEx Policy Guidelines v4 (§4.2) explicitly mandates: Any transfer exceeding $250,000 is classified as Tier 3 Critical and requires Two-Person Rule Consensus (Division CFO + Executive VP).`n`n" +
               "3. Recommended Governed Action:`n" +
               "   * Execute mutation to SAP ERP General Ledger Account #884102 transferring $450,000.00 from CC 402 to CC 710.`n" +
               "   * Staged action ID ACT-2026-9912 is ready for dual authorization."
    Draw-TextBox $c $resText $fBody $global:COL_NAVY ($mainX + 25) 445.0 ($mainW - 50) 240.0

    # Attached Evidence Sources Strip
    Draw-Text $c "CITATIONS & EVIDENCE SOURCES (FINANCE DOMAIN):" $fH2 $global:COL_NAVY ($mainX + 25) 700.0
    Draw-Card $c ($mainX + 25) 725.0 620.0 60.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.0
    Draw-Badge $c ($mainX + 40) 735.0 "G1 VERIFIED" $global:COL_BLUE $global:COL_WHITE 8.5 | Out-Null
    Draw-Text $c "CapEx_Policy_Guidelines_v4.docx (Chunk 14) - RRF Score 0.942" $fH2 $global:COL_NAVY ($mainX + 145) 735.0
    Draw-Text $c "SHA-256: e3b0c44298fc1c14... | §4.2 Capital Allocation Thresholds" $fMono $global:COL_TEXT_SECONDARY ($mainX + 145) 758.0

    Draw-Card $c ($mainX + 665) 725.0 640.0 60.0 $global:COL_GREEN_BG $global:COL_GREEN 6.0 1.0
    Draw-Badge $c ($mainX + 680) 735.0 "G2 PROVEN" $global:COL_GREEN $global:COL_WHITE 8.5 | Out-Null
    Draw-Text $c "SAP_General_Ledger_Extract.xlsx (Chunk 08) - RRF Score 0.918" $fH2 $global:COL_NAVY ($mainX + 785) 735.0
    Draw-Text $c "Validated via SAP ERP GL Sync | Cost Center 402 Balances" $fMono $global:COL_TEXT_SECONDARY ($mainX + 785) 758.0

    # Action Trigger Button Bar
    Draw-Card $c $mainX 855.0 $mainW 90.0 $global:COL_AMBER_BG $global:COL_AMBER 8.0 1.2
    Draw-Text $c "GOVERNED ACTION READY FOR SIGN-OFF (ACT-2026-9912):" $fH2 $global:COL_AMBER ($mainX + 25) 870.0
    Draw-Text $c "Requires consensus from Sarah Vance (CFO) and Marcus Sterling (EVP Operations). Pre-execution dry-run verified." $fBody $global:COL_NAVY ($mainX + 25) 900.0
    Draw-Button $c ($mainX + $mainW - 280) 875.0 250.0 48.0 "Open Governance Sign-Off" $global:COL_BLUE

    $fH1.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-5-1-command-center-output.png"
}

# --- Figure 5.2: Sample AI Response with Source Evidence ---
function Render-Figure-5-2 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 5.2" "Sample AI Response with Grounded Source Evidence" "High-resolution output card showing grounded synthesis, citations, and G1/G2 evidence metadata."
    
    $fTitle = New-Object System.Drawing.Font "Segoe UI", 14.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 10.0, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $cardX = 100.0; $cardW = 1400.0

    # Main Grounded Response Container
    Draw-Card $c $cardX 150.0 $cardW 790.0 $global:COL_SURFACE $global:COL_BORDER 10.0 1.5

    # Top Status Banner
    Draw-Card $c ($cardX + 25) 175.0 ($cardW - 50) 50.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.0
    Draw-Badge $c ($cardX + 40) 185.0 "WORKSPACE: APEX CAPITAL (FINANCE)" $global:COL_BLUE $global:COL_WHITE 9.0 | Out-Null
    Draw-Badge $c ($cardX + 340) 185.0 "EVIDENCE INTEGRITY: 100% GROUNDED" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null
    Draw-Badge $c ($cardX + 620) 185.0 "ZERO CROSS-DOMAIN LEAKAGE" $global:COL_PURPLE_BG $global:COL_PURPLE 9.0 | Out-Null
    Draw-Text $c "Audit Hash: 0x9a3eff81... | Evaluated under SOX Section 404 Controls" $fMono $global:COL_TEXT_SECONDARY ($cardX + 880) 190.0

    # Response Header
    Draw-Text $c "CapEx Reallocation Feasibility & Policy Assessment [Ref: ACT-2026-9912]" $fTitle $global:COL_NAVY ($cardX + 25) 245.0
    Draw-Text $c "Synthesized by Gemini 2.5 Pro via Synaptix EMLM Orchestrator | Execution Latency: 412ms" $fBody $global:COL_TEXT_MUTED ($cardX + 25) 275.0

    # Text Body with Interactive Citation Badges
    $b1 = "According to Section 4.2 of CapEx Policy Guidelines v4 [Citation 1], any discretionary capital budget transfer exceeding $250,000 is categorized as a Tier 3 Critical Governed Action. Such operations require formal two-person cryptographic consensus signed by both the Division Chief Financial Officer and an Executive Vice President."
    Draw-TextBox $c $b1 $fBody $global:COL_NAVY ($cardX + 25) 310.0 ($cardW - 50) 65.0

    $b2 = "Cross-referencing the official SAP General Ledger Extract [Citation 2], Cost Center 402 (Unallocated CapEx) maintains a current balance of $1,200,000.00 USD. Deducting the requested $450,000.00 USD leaves $750,000.00 USD, satisfying the liquidity reserve threshold of 50.0% specified in Q3 Financial Review [Citation 3]."
    Draw-TextBox $c $b2 $fBody $global:COL_NAVY ($cardX + 25) 385.0 ($cardW - 50) 65.0

    $b3 = "The target Cost Center 710 (Cloud Infrastructure) is currently running at +18.4% variance ($2,250,000 committed against a $2,400,000 budget). The injected $450,000 will restore operating headroom through fiscal year-end without triggering supplementary CapEx requests."
    Draw-TextBox $c $b3 $fBody $global:COL_NAVY ($cardX + 25) 460.0 ($cardW - 50) 60.0

    # Citations Detail Drawer Box
    $penDiv = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
    $c.Graphics.DrawLine($penDiv, ($cardX + 25), 535, ($cardX + $cardW - 25), 535)
    $penDiv.Dispose()

    Draw-Text $c "FOOTNOTE EVIDENCE PROVENANCE & CRYPTOGRAPHIC VERIFICATION:" $fH2 $global:COL_NAVY ($cardX + 25) 550.0

    # Citation 1 Card
    Draw-Card $c ($cardX + 25) 580.0 ($cardW - 50) 95.0 $global:COL_BG $global:COL_BLUE 6.0 1.2
    Draw-Badge $c ($cardX + 40) 592.0 "[Citation 1]" $global:COL_BLUE $global:COL_WHITE 9.0 | Out-Null
    Draw-Badge $c ($cardX + 140) 592.0 "G1 VERIFIED KNOWLEDGE" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null
    Draw-Text $c "CapEx_Policy_Guidelines_v4.docx | Section 4.2 (Page 14, Chunk 14)" $fH2 $global:COL_NAVY ($cardX + 340) 592.0
    Draw-Text $c "Text: `"Any discretionary capital reallocation exceeding $250,000 must receive prior authorization from both the Division CFO and an EVP...`"" $fBody $global:COL_TEXT_SECONDARY ($cardX + 40) 622.0
    Draw-Text $c "RRF Match: 0.942 | SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" $fMono $global:COL_TEXT_MUTED ($cardX + 40) 648.0

    # Citation 2 Card
    Draw-Card $c ($cardX + 25) 685.0 ($cardW - 50) 95.0 $global:COL_BG $global:COL_GREEN 6.0 1.2
    Draw-Badge $c ($cardX + 40) 697.0 "[Citation 2]" $global:COL_GREEN $global:COL_WHITE 9.0 | Out-Null
    Draw-Badge $c ($cardX + 140) 697.0 "G2 ACTION-PROVEN" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null
    Draw-Text $c "SAP_General_Ledger_Extract.xlsx | Account #884102 (Chunk 08)" $fH2 $global:COL_NAVY ($cardX + 340) 697.0
    Draw-Text $c "Text: `"Cost Center 402 Total Allocation: $1,800,000.00 | Committed: $600,000.00 | Uncommitted Balance: $1,200,000.00 USD`"" $fBody $global:COL_TEXT_SECONDARY ($cardX + 40) 727.0
    Draw-Text $c "RRF Match: 0.918 | Verified via Real-Time SAP ERP Connector | Audit Tx #884102" $fMono $global:COL_TEXT_MUTED ($cardX + 40) 753.0

    # Citation 3 Card
    Draw-Card $c ($cardX + 25) 790.0 ($cardW - 50) 80.0 $global:COL_BG $global:COL_BORDER 6.0 1.0
    Draw-Badge $c ($cardX + 40) 802.0 "[Citation 3]" $global:COL_BORDER $global:COL_NAVY 9.0 | Out-Null
    Draw-Badge $c ($cardX + 140) 802.0 "G1 VERIFIED" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null
    Draw-Text $c "Q3_Financial_Review_2026.pdf | Liquidity & Capital Preservation Targets (Chunk 21)" $fH2 $global:COL_NAVY ($cardX + 280) 802.0
    Draw-Text $c "Text: `"Discretionary capital reserves must maintain a minimum 50% liquidity buffer through end of Q4.`"" $fBody $global:COL_TEXT_SECONDARY ($cardX + 40) 832.0

    # Bottom Actions
    Draw-Button $c ($cardX + 25) 885.0 220.0 42.0 "Export Evidence Chain" $global:COL_BLUE
    Draw-Button $c ($cardX + 265) 885.0 240.0 42.0 "Inspect Full Audit Log" $global:COL_NAVY
    Draw-Button $c ($cardX + $cardW - 275) 885.0 250.0 42.0 "Verify Cryptographic Proof" $global:COL_GREEN

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-5-2-ai-response-source-evidence.png"
}

# --- Figure 5.3: Document Upload and Processing Output ---
function Render-Figure-5-3 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Uploads & Data"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 15.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # Header Card
    Draw-Card $c $mainX 75.0 $mainW 85.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Badge $c ($mainX + 20) 90.0 "INGESTION COMPLETED" $global:COL_GREEN_BG $global:COL_GREEN 9.5 | Out-Null
    Draw-Badge $c ($mainX + 220) 90.0 "JOB ID: JOB-INGEST-7729" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.5 | Out-Null
    Draw-Text $c "Document: CapEx_Policy_Guidelines_v4.docx (2.4 MB) -> 22 Vector Chunks Indexed" $fTitle $global:COL_NAVY ($mainX + 20) 120.0
    Draw-Text $c "Target Workspace: Apex Capital | Target Domain: Finance | Execution Time: 1.42s | Staged Replacement: Active" $fMono $global:COL_TEXT_MUTED ($mainX + 680) 125.0

    # 10-Stage Pipeline Inspection Grid
    Draw-Card $c $mainX 175.0 $mainW 480.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.2
    Draw-Text $c "10-STAGE ASYNCHRONOUS INGESTION PIPELINE EXECUTION AUDIT" $fH2 $global:COL_NAVY ($mainX + 25) 195.0
    Draw-Text $c "All stages executed sequentially in transaction sandbox. Replaced 18 legacy chunks without indexing downtime." $fBody $global:COL_TEXT_SECONDARY ($mainX + 25) 220.0

    $stages = @(
        @{ Num = "Stage 1"; Name = "Format Validation"; Detail = "MIME: application/vnd.openxmlformats | Clean magic bytes"; Time = "12ms"; Status = "VERIFIED" },
        @{ Num = "Stage 2"; Name = "Text Extraction"; Detail = "Extracted 18,420 words and 4 structured financial tables"; Time = "180ms"; Status = "VERIFIED" },
        @{ Num = "Stage 3"; Name = "SHA-256 Deduplication"; Detail = "Hash: e3b0c442...55 | Supersedes v3 with staged migration"; Time = "8ms"; Status = "VERIFIED" },
        @{ Num = "Stage 4"; Name = "Tesseract OCR & Normalization"; Detail = "Scanned signature approvals OCR verified at 99.4% confidence"; Time = "240ms"; Status = "VERIFIED" },
        @{ Num = "Stage 5"; Name = "Sliding-Window Chunking"; Detail = "Generated 22 chunks (600 tokens target, 100 token overlap)"; Time = "35ms"; Status = "VERIFIED" },
        @{ Num = "Stage 6"; Name = "Vector Embedding Generation"; Detail = "Gemini text-embedding-004 generated 22 x 768-dim embeddings"; Time = "480ms"; Status = "VERIFIED" },
        @{ Num = "Stage 7"; Name = "BM25 Vocabulary Update"; Detail = "Finance inverted index updated with 1,240 unique terms"; Time = "45ms"; Status = "VERIFIED" },
        @{ Num = "Stage 8"; Name = "Entity Graph Resolution"; Detail = "Extracted 14 nodes: CapEx, CFO, Cost Center 402, Tier 3"; Time = "110ms"; Status = "VERIFIED" },
        @{ Num = "Stage 9"; Name = "Vector Storage Commit"; Detail = "Atomic write to Supabase pgvector under workspace RLS"; Time = "190ms"; Status = "VERIFIED" },
        @{ Num = "Stage 10"; Name = "Evidence Grade Promotion"; Detail = "Promoted from G0 to G1 (Verified Official Policy Document)"; Time = "120ms"; Status = "PROMOTED" }
    )

    $sY = 255.0
    foreach ($st in $stages) {
        $pLine = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
        $c.Graphics.DrawLine($pLine, ($mainX + 25), $sY, ($mainX + $mainW - 25), $sY)
        $pLine.Dispose()

        Draw-Badge $c ($mainX + 25) ($sY + 6) $st.Num $global:COL_BG $global:COL_NAVY 8.0 | Out-Null
        Draw-Text $c $st.Name $fH2 $global:COL_NAVY ($mainX + 115) ($sY + 8)
        Draw-Text $c $st.Detail $fBody $global:COL_TEXT_SECONDARY ($mainX + 380) ($sY + 8)
        Draw-Badge $c ($mainX + $mainW - 220) ($sY + 6) $st.Time $global:COL_BG $global:COL_BLUE 8.0 | Out-Null
        Draw-Badge $c ($mainX + $mainW - 120) ($sY + 6) $st.Status $global:COL_GREEN_BG $global:COL_GREEN 8.0 | Out-Null

        $sY += 38.0
    }

    # Bottom Chunks Preview Table
    Draw-Card $c $mainX 675.0 $mainW 285.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "GENERATED VECTOR CHUNKS PREVIEW (FINANCE KNOWLEDGE BASE)" $fH2 $global:COL_NAVY ($mainX + 25) 695.0

    $chunks = @(
        @{ ID = "CHK-0014"; Tokens = "584"; Preview = "Section 4.2 - Discretionary Capital Reallocations exceeding $250,000 require Two-Person consensus..."; Grade = "G1 Verified"; Match = "Target §4.2" },
        @{ ID = "CHK-0015"; Tokens = "602"; Preview = "Cost Center 402 reserves are designated for unexpected infrastructure variance and regulatory audits..."; Grade = "G1 Verified"; Match = "CC 402 Scope" },
        @{ ID = "CHK-0016"; Tokens = "540"; Preview = "MFA authentication challenge must be completed within 15 minutes of action staging in Synaptix..."; Grade = "G1 Verified"; Match = "MFA Gate" }
    )
    $chY = 730.0
    foreach ($ch in $chunks) {
        Draw-Card $c ($mainX + 25) $chY ($mainW - 50) 65.0 $global:COL_BG $global:COL_BORDER 6.0 1.0
        Draw-Badge $c ($mainX + 40) ($chY + 18) $ch.ID $global:COL_BLUE_LIGHT $global:COL_BLUE 8.5 | Out-Null
        Draw-Badge $c ($mainX + 145) ($chY + 18) "$($ch.Tokens) tokens" $global:COL_SURFACE $global:COL_NAVY 8.0 | Out-Null
        Draw-Text $c $ch.Preview $fBody $global:COL_NAVY ($mainX + 260) ($chY + 18)
        Draw-Badge $c ($mainX + $mainW - 220) ($chY + 18) $ch.Grade $global:COL_GREEN_BG $global:COL_GREEN 8.5 | Out-Null
        Draw-Text $c $ch.Match $fMono $global:COL_TEXT_MUTED ($mainX + $mainW - 90) ($chY + 22)
        $chY += 75.0
    }

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-5-3-document-upload-processing.png"
}

# --- Figure 5.4: Structured Data Analysis Output ---
function Render-Figure-5-4 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Dashboard"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 15.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # Header
    Draw-Text $c "Structured Financial Data Analysis: SAP General Ledger Extract" $fTitle $global:COL_NAVY $mainX 75.0
    Draw-Text $c "Automated variance modeling, capital commitment ratios, and cost center budget distribution." $fBody $global:COL_TEXT_SECONDARY $mainX 105.0

    # Top KPI Metrics Strip
    $kpis = @(
        @{ Title = "Total CapEx Allocation"; Val = "$14,850,000.00"; Sub = "Fiscal Year 2026"; Col = $global:COL_BLUE },
        @{ Title = "Committed Expenditure"; Val = "$11,240,000.00"; Sub = "75.7% Budget Utilized"; Col = $global:COL_NAVY },
        @{ Title = "Uncommitted Reserves"; Val = "$3,610,000.00"; Sub = "Across 6 Cost Centers"; Col = $global:COL_GREEN },
        @{ Title = "Surge Variance"; Val = "+$412,800.00"; Sub = "CC 710 Cloud Overrun"; Col = $global:COL_AMBER }
    )
    $kW = 310.0; $kX = $mainX
    foreach ($k in $kpis) {
        Draw-Card $c $kX 135.0 $kW 85.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
        Draw-Text $c $k.Title $fBody $global:COL_TEXT_SECONDARY ($kX + 15) 145.0
        Draw-Text $c $k.Val $fTitle $k.Col ($kX + 15) 168.0
        Draw-Text $c $k.Sub $fMono $global:COL_TEXT_MUTED ($kX + 15) 195.0
        $kX += 340.0
    }

    # Left: Cost Center Breakdown Table (w: 780)
    Draw-Card $c $mainX 235.0 780.0 520.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "COST CENTER VARIANCE & ALLOCATION MATRIX" $fH2 $global:COL_NAVY ($mainX + 25) 255.0

    $tblY = 290.0
    Draw-Card $c ($mainX + 15) $tblY 750.0 35.0 $global:COL_BG $global:COL_BORDER 4.0 1.0
    Draw-Text $c "COST CENTER" $fH2 $global:COL_NAVY ($mainX + 25) ($tblY + 8)
    Draw-Text $c "ALLOCATED" $fH2 $global:COL_NAVY ($mainX + 240) ($tblY + 8)
    Draw-Text $c "COMMITTED" $fH2 $global:COL_NAVY ($mainX + 370) ($tblY + 8)
    Draw-Text $c "AVAILABLE" $fH2 $global:COL_NAVY ($mainX + 500) ($tblY + 8)
    Draw-Text $c "VARIANCE" $fH2 $global:COL_NAVY ($mainX + 640) ($tblY + 8)

    $rows = @(
        @{ CC = "402: Unallocated CapEx"; Alloc = "$1,800,000"; Comm = "$600,000"; Avail = "$1,200,000"; Var = "-33.3% (Favorable)"; VarCol = $global:COL_GREEN },
        @{ CC = "710: Cloud Infrastructure"; Alloc = "$2,400,000"; Comm = "$2,250,000"; Avail = "$150,000"; Var = "+18.4% (SURGE)"; VarCol = $global:COL_RED },
        @{ CC = "505: Software Engineering"; Alloc = "$4,200,000"; Comm = "$3,800,000"; Avail = "$400,000"; Var = "+2.1% (Nominal)"; VarCol = $global:COL_BLUE },
        @{ CC = "612: Cybersecurity & Audit"; Alloc = "$1,500,000"; Comm = "$1,100,000"; Avail = "$400,000"; Var = "-12.0% (Favorable)"; VarCol = $global:COL_GREEN },
        @{ CC = "801: Data Center Facilities"; Alloc = "$3,150,000"; Comm = "$2,490,000"; Avail = "$660,000"; Var = "-4.5% (Nominal)"; VarCol = $global:COL_BLUE },
        @{ CC = "920: Corporate Hardware"; Alloc = "$1,800,000"; Comm = "$1,000,000"; Avail = "$800,000"; Var = "-15.0% (Favorable)"; VarCol = $global:COL_GREEN }
    )
    $rY = 335.0
    foreach ($r in $rows) {
        $pRow = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
        $c.Graphics.DrawLine($pRow, ($mainX + 15), $rY, ($mainX + 765), $rY)
        $pRow.Dispose()

        Draw-Text $c $r.CC $fH2 $global:COL_NAVY ($mainX + 25) ($rY + 16)
        Draw-Text $c $r.Alloc $fMono $global:COL_TEXT_SECONDARY ($mainX + 240) ($rY + 16)
        Draw-Text $c $r.Comm $fMono $global:COL_TEXT_SECONDARY ($mainX + 370) ($rY + 16)
        Draw-Text $c $r.Avail $fMono $global:COL_NAVY ($mainX + 500) ($rY + 16)
        Draw-Badge $c ($mainX + 630) ($rY + 12) $r.Var $global:COL_BG $r.VarCol 8.5 | Out-Null
        $rY += 65.0
    }

    # Right: Chart & AI Insights (w: 520)
    $rtX = $mainX + 805.0; $rtW = 525.0
    Draw-Card $c $rtX 235.0 $rtW 520.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "BUDGET UTILIZATION RATIOS" $fH2 $global:COL_NAVY ($rtX + 25) 255.0

    # Utilization Bars
    $bars = @(
        @{ Name = "CC 710: Cloud Infrastructure"; Pct = 93.8; Col = $global:COL_RED },
        @{ Name = "CC 505: Software Engineering"; Pct = 90.5; Col = $global:COL_BLUE },
        @{ Name = "CC 801: Data Center Facilities"; Pct = 79.0; Col = $global:COL_BLUE },
        @{ Name = "CC 612: Cybersecurity & Audit"; Pct = 73.3; Col = $global:COL_GREEN },
        @{ Name = "CC 920: Corporate Hardware"; Pct = 55.6; Col = $global:COL_GREEN },
        @{ Name = "CC 402: Unallocated CapEx"; Pct = 33.3; Col = $global:COL_GREEN }
    )
    $bY = 295.0
    foreach ($b in $bars) {
        Draw-Text $c "$($b.Name) - $($b.Pct)%" $fBody $global:COL_NAVY ($rtX + 25) $bY
        Draw-Card $c ($rtX + 25) ($bY + 20) 470.0 14.0 $global:COL_BG $global:COL_BORDER 4.0 1.0
        $wBar = (470.0 * $b.Pct) / 100.0
        Draw-Card $c ($rtX + 25) ($bY + 20) $wBar 14.0 $b.Col $b.Col 4.0 0.0
        $bY += 46.0
    }

    # AI Insight Callout
    Draw-Card $c ($rtX + 20) 580.0 ($rtW - 40) 155.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.2
    Draw-Text $c "EMLM ANALYTICAL INSIGHT:" $fH2 $global:COL_BLUE ($rtX + 35) 595.0
    $insight = "Cost Center 710 has consumed 93.8% of available capital due to unplanned AI model inferencing workloads. Reallocating $450,000 from CC 402 restores operating headroom to 25.0%, maintaining solvency without requesting new capital authorizations."
    Draw-TextBox $c $insight $fBody $global:COL_NAVY ($rtX + 35) 625.0 ($rtW - 70) 95.0

    # Bottom Full Width Recommendation
    Draw-Card $c $mainX 770.0 $mainW 180.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "GOVERNED ACTION JUSTIFICATION SUMMARY:" $fH2 $global:COL_NAVY ($mainX + 25) 790.0
    Draw-Text $c "1. Data Source: SAP_General_Ledger_Extract.xlsx (SHA-256: e3b0c442...) | Synchronized Today 08:30 UTC" $fMono $global:COL_TEXT_SECONDARY ($mainX + 25) 820.0
    Draw-Text $c "2. Policy Constraint: CapEx Policy v4 mandates Two-Person consensus for any reallocation >$250k." $fMono $global:COL_TEXT_SECONDARY ($mainX + 25) 845.0
    Draw-Text $c "3. Execution Status: Action ACT-2026-9912 generated and staged with dry-run simulation passing 100%." $fMono $global:COL_TEXT_SECONDARY ($mainX + 25) 870.0
    Draw-Button $c ($mainX + $mainW - 260) 880.0 230.0 45.0 "Stage Reallocation Action" $global:COL_BLUE

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-5-4-structured-data-analysis.png"
}

# --- Figure 5.5: Dashboard and Analytics Output ---
function Render-Figure-5-5 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Dashboard"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 15.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # Page Header
    Draw-Text $c "Operational Telemetry & Multi-Domain System Analytics" $fTitle $global:COL_NAVY $mainX 75.0
    Draw-Text $c "Live throughput, router policy distribution, evidence verification funnel, and SOC 2 consensus stats." $fBody $global:COL_TEXT_SECONDARY $mainX 105.0

    # 4 Real-Time Metrics Cards
    $mCards = @(
        @{ Title = "Active Throughput"; Val = "42.5 req/s"; Sub = "Peak: 88.0 req/s"; Col = $global:COL_BLUE },
        @{ Title = "Cache Hit Efficiency"; Val = "38.2%"; Sub = "<15ms Tier 1 hit rate"; Col = $global:COL_GREEN },
        @{ Title = "Average Retrieval Latency"; Val = "164ms"; Sub = "Hybrid Vector + BM25"; Col = $global:COL_PURPLE },
        @{ Title = "Tenant Invariant Violations"; Val = "0 (100% Isolated)"; Sub = "Zero cross-workspace leaks"; Col = $global:COL_GREEN }
    )
    $mcW = 310.0; $mcX = $mainX
    foreach ($mc in $mCards) {
        Draw-Card $c $mcX 135.0 $mcW 85.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
        Draw-Text $c $mc.Title $fBody $global:COL_TEXT_SECONDARY ($mcX + 15) 145.0
        Draw-Text $c $mc.Val $fTitle $mc.Col ($mcX + 15) 168.0
        Draw-Text $c $mc.Sub $fMono $global:COL_TEXT_MUTED ($mcX + 15) 195.0
        $mcX += 340.0
    }

    # Middle Charts Row: 2 Large Chart Cards
    # Left: 24-Hour Query Volume Line Chart (w: 645)
    Draw-Card $c $mainX 235.0 645.0 380.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "24-HOUR QUERY VOLUME BY ROUTING TIER" $fH2 $global:COL_NAVY ($mainX + 25) 255.0
    Draw-Text $c "Dynamic routing breakdown across Tiers 1-4" $fBody $global:COL_TEXT_SECONDARY ($mainX + 25) 280.0

    # Grid Lines
    $chartX = $mainX + 50.0; $chartY = 320.0; $chartW = 560.0; $chartH = 220.0
    $pGrid = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
    for ($g = 0; $g -le 4; $g++) {
        $gy = $chartY + ($g * 55.0)
        $c.Graphics.DrawLine($pGrid, $chartX, $gy, ($chartX + $chartW), $gy)
        Draw-Text $c "$((4 - $g) * 250)" $fMono $global:COL_TEXT_MUTED ($chartX - 35) ($gy - 8)
    }
    $pGrid.Dispose()

    # Time labels
    $times = @("00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00")
    for ($t = 0; $t -lt $times.Count; $t++) {
        $tx = $chartX + ($t * 90.0)
        Draw-Text $c $times[$t] $fMono $global:COL_TEXT_MUTED ($tx - 15) ($chartY + $chartH + 10)
    }

    # Simulated Line Paths
    $pLineBlue = New-Object System.Drawing.Pen $global:COL_BLUE, 2.5
    $points = @(
        (New-Object System.Drawing.PointF ($chartX + 0), ($chartY + 180)),
        (New-Object System.Drawing.PointF ($chartX + 90), ($chartY + 160)),
        (New-Object System.Drawing.PointF ($chartX + 180), ($chartY + 80)),
        (New-Object System.Drawing.PointF ($chartX + 270), ($chartY + 40)),
        (New-Object System.Drawing.PointF ($chartX + 360), ($chartY + 60)),
        (New-Object System.Drawing.PointF ($chartX + 450), ($chartY + 110)),
        (New-Object System.Drawing.PointF ($chartX + 540), ($chartY + 150))
    )
    $c.Graphics.DrawLines($pLineBlue, $points)
    $pLineBlue.Dispose()

    # Right: Evidence Verification Funnel (w: 645)
    $rfX = $mainX + 685.0
    Draw-Card $c $rfX 235.0 645.0 380.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "EVIDENCE VERIFICATION & LIFECYCLE FUNNEL" $fH2 $global:COL_NAVY ($rfX + 25) 255.0
    Draw-Text $c "Progressive trust elevation from raw text extractions to action-proven knowledge" $fBody $global:COL_TEXT_SECONDARY ($rfX + 25) 280.0

    # Funnel Bars
    $funnel = @(
        @{ Stage = "G0: Raw Extracted Document Chunks"; Count = "1,482 Chunks (100%)"; Col = $global:COL_AMBER; W = 580.0 },
        @{ Stage = "Corroborated by Primary Domain Policy"; Count = "1,120 Chunks (75.5%)"; Col = $global:COL_BLUE; W = 460.0 },
        @{ Stage = "G1: Verified Knowledge (Official Policy)"; Count = "948 Chunks (64.0%)"; Col = $global:COL_BLUE_ACCENT; W = 380.0 },
        @{ Stage = "Validated via Successful Governed Actions"; Count = "410 Chunks (27.6%)"; Col = $global:COL_PURPLE; W = 280.0 },
        @{ Stage = "G2: Action-Proven Permanent Precedent"; Count = "356 Chunks (24.0%)"; Col = $global:COL_GREEN; W = 220.0 }
    )
    $fnY = 320.0
    foreach ($fn in $funnel) {
        Draw-Text $c $fn.Stage $fH2 $global:COL_NAVY ($rfX + 25) $fnY
        Draw-Text $c $fn.Count $fMono $global:COL_TEXT_SECONDARY ($rfX + 460) $fnY
        Draw-Card $c ($rfX + 25) ($fnY + 22) $fn.W 20.0 $fn.Col $fn.Col 4.0 0.0
        $fnY += 56.0
    }

    # Bottom Row: Active Workspace Health Matrix
    Draw-Card $c $mainX 635.0 $mainW 320.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "ACTIVE ENTERPRISE WORKSPACES & ISOLATION HEALTH" $fH2 $global:COL_NAVY ($mainX + 25) 655.0

    $wsHealth = @(
        @{ Name = "Apex Capital (Finance)"; Domain = "Finance (SOX/IFRS)"; Docs = "148 Files"; Chunks = "1,482"; Latency = "164ms"; Actions = "342"; Status = "STRICT ISOLATION"; Col = $global:COL_GREEN },
        @{ Name = "Memorial Health System"; Domain = "Healthcare (HIPAA)"; Docs = "312 Files"; Chunks = "3,840"; Latency = "182ms"; Actions = "890"; Status = "STRICT ISOLATION"; Col = $global:COL_GREEN },
        @{ Name = "St. Jude Academic Research"; Domain = "Education (FERPA)"; Docs = "94 Files"; Chunks = "820"; Latency = "140ms"; Actions = "120"; Status = "STRICT ISOLATION"; Col = $global:COL_GREEN },
        @{ Name = "Vanguard Precision Aero"; Domain = "Manufacturing (AS9100)"; Docs = "205 Files"; Chunks = "2,110"; Latency = "172ms"; Actions = "415"; Status = "STRICT ISOLATION"; Col = $global:COL_GREEN }
    )
    $whY = 700.0
    foreach ($wh in $wsHealth) {
        $pW = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
        $c.Graphics.DrawLine($pW, ($mainX + 25), $whY, ($mainX + $mainW - 25), $whY)
        $pW.Dispose()

        Draw-Text $c $wh.Name $fH2 $global:COL_NAVY ($mainX + 30) ($whY + 12)
        Draw-Text $c $wh.Domain $fBody $global:COL_TEXT_SECONDARY ($mainX + 320) ($whY + 12)
        Draw-Text $c "$($wh.Docs) | $($wh.Chunks) Chunks" $fMono $global:COL_NAVY ($mainX + 580) ($whY + 12)
        Draw-Text $c "Latency: $($wh.Latency)" $fMono $global:COL_TEXT_MUTED ($mainX + 830) ($whY + 12)
        Draw-Text $c "Actions: $($wh.Actions)" $fMono $global:COL_TEXT_MUTED ($mainX + 990) ($whY + 12)
        Draw-Badge $c ($mainX + 1140) ($whY + 10) $wh.Status $global:COL_GREEN_BG $wh.Col 8.5 | Out-Null

        $whY += 50.0
    }

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-5-5-dashboard-analytics-output.png"
}

# --- Figure 5.6: Agent Workflow Execution Output ---
function Render-Figure-5-6 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Agent Workflows"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 15.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 8.5, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # Header Card
    Draw-Card $c $mainX 75.0 $mainW 85.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Badge $c ($mainX + 20) 90.0 "WORKFLOW EXECUTION RUN #88194" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null
    Draw-Badge $c ($mainX + 300) 90.0 "STATUS: COMMITTED (SUCCESS)" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null
    Draw-Badge $c ($mainX + 560) 90.0 "TWO-PERSON CONSENSUS: VERIFIED" $global:COL_PURPLE_BG $global:COL_PURPLE 9.0 | Out-Null
    Draw-Text $c "Workflow: CapEx Budget Variance & Reallocation Pipeline | Initiator: Sarah Vance (CFO)" $fTitle $global:COL_NAVY ($mainX + 20) 120.0
    Draw-Text $c "Target System: SAP ERP GL API | Total Duration: 318ms | Audit Block: #48102" $fMono $global:COL_TEXT_MUTED ($mainX + 800) 125.0

    # Left: Step-by-Step Execution Logs (w: 780)
    Draw-Card $c $mainX 175.0 780.0 780.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "STEP-BY-STEP EXECUTION RUN LOGS" $fH2 $global:COL_NAVY ($mainX + 25) 195.0

    $logs = @(
        @{ Time = "[12:15:30.102]"; Step = "Step 1: Ledger Ingestion"; Msg = "Fetched 148 GL records from SAP ERP API (Status 200 OK)"; Status = "PASS"; Col = $global:COL_GREEN },
        @{ Time = "[12:15:30.116]"; Step = "Step 2: Variance Modeling"; Msg = "Identified CC 710 surge: +$412,800 (+18.4% above baseline)"; Status = "PASS"; Col = $global:COL_GREEN },
        @{ Time = "[12:15:30.154]"; Step = "Step 3: Policy Compliance Check"; Msg = "CapEx Policy v4 verified: >$250k reallocations require Two-Person rule"; Status = "PASS"; Col = $global:COL_GREEN },
        @{ Time = "[12:15:30.219]"; Step = "Step 4: Action Staging (ACT-2026-9912)"; Msg = "Created staging payload for SAP GL #884102. Dry-run verified 100%"; Status = "STAGED"; Col = $global:COL_BLUE },
        @{ Time = "[12:15:30.340]"; Step = "Step 5: Signer 1 Consensus"; Msg = "Sarah Vance (CFO) signed with TOTP challenge (Sig: 0x8F92...C14)"; Status = "SIGNED"; Col = $global:COL_GREEN },
        @{ Time = "[12:18:44.890]"; Step = "Step 6: Signer 2 Consensus"; Msg = "Marcus Sterling (EVP) signed with FIDO2 Key (Sig: 0x4D11...E82)"; Status = "SIGNED"; Col = $global:COL_GREEN },
        @{ Time = "[12:18:45.012]"; Step = "Step 7: Atomic Execution Target"; Msg = "POST /api/gl/v1/reallocate committed $450k transfer (Tx #884102)"; Status = "COMMITTED"; Col = $global:COL_GREEN },
        @{ Time = "[12:18:45.045]"; Step = "Step 8: Evidence Promotion Gate"; Msg = "Promoted SAP GL record Chunk #08 to Evidence Grade G2 (Action-Proven)"; Status = "PROMOTED"; Col = $global:COL_PURPLE },
        @{ Time = "[12:18:45.080]"; Step = "Step 9: SOC2 Audit Recording"; Msg = "Committed immutable event to Merkle audit stream (Block #48102)"; Status = "SEALED"; Col = $global:COL_GREEN }
    )

    $logY = 230.0
    foreach ($lg in $logs) {
        Draw-Card $c ($mainX + 20) $logY 740.0 70.0 $global:COL_BG $global:COL_BORDER 6.0 1.0
        Draw-Text $c "$($lg.Time)  $($lg.Step)" $fH2 $global:COL_NAVY ($mainX + 35) ($logY + 12)
        Draw-Badge $c ($mainX + 640) ($logY + 10) $lg.Status $global:COL_SURFACE $lg.Col 8.5 | Out-Null
        Draw-Text $c $lg.Msg $fMono $global:COL_TEXT_SECONDARY ($mainX + 35) ($logY + 40)
        $logY += 82.0
    }

    # Right: JSON Payload Output Terminal (w: 520)
    $tX = $mainX + 805.0; $tW = 525.0
    Draw-Card $c $tX 175.0 $tW 780.0 $global:COL_NAVY_DARK $global:COL_BORDER 8.0 1.5
    Draw-Text $c "EXECUTION RESULT PAYLOAD (JSON)" $fH2 $global:COL_BLUE_ACCENT ($tX + 25) 195.0

    $json = "{\n" +
            "  `"actionId`": `"ACT-2026-9912`",\n" +
            "  `"status`": `"COMMITTED`",\n" +
            "  `"timestamp`": `"2026-11-01T12:18:45.012Z`",\n" +
            "  `"workspaceId`": `"ws-apex-finance`",\n" +
            "  `"riskTier`": `"TIER_3_CRITICAL`",\n" +
            "  `"twoPersonConsensus`": {\n" +
            "    `"status`": `"VERIFIED`",\n" +
            "    `"signer1`": {\n" +
            "      `"name`": `"Sarah Vance`",\n" +
            "      `"role`": `"Division CFO`",\n" +
            "      `"signature`": `"0x8F92...C14`"\n" +
            "    },\n" +
            "    `"signer2`": {\n" +
            "      `"name`": `"Marcus Sterling`",\n" +
            "      `"role`": `"EVP Operations`",\n" +
            "      `"signature`": `"0x4D11...E82`"\n" +
            "    }\n" +
            "  },\n" +
            "  `"mutation`": {\n" +
            "    `"target`": `"SAP_ERP_GL_API`",\n" +
            "    `"transactionId`": 884102,\n" +
            "    `"debitCostCenter`": 710,\n" +
            "    `"creditCostCenter`": 402,\n" +
            "    `"amount`": 450000.00,\n" +
            "    `"currency`": `"USD`"\n" +
            "  },\n" +
            "  `"evidenceUpgrade`": {\n" +
            "    `"chunkId`": `"CHK-0008`",\n" +
            "    `"newGrade`": `"G2_ACTION_PROVEN`",\n" +
            "    `"hash`": `"e3b0c442...`"\n" +
            "  },\n" +
            "  `"audit`": {\n" +
            "    `"block`": 48102,\n" +
            "    `"merkleRoot`": `"0x9a3e...ff81`"\n" +
            "  }\n" +
            "}"
    Draw-TextBox $c $json $fMono $global:COL_WHITE ($tX + 25) 235.0 ($tW - 50) 650.0

    Draw-Button $c ($tX + 25) 900.0 ($tW - 50) 40.0 "Download Signed Execution Receipt" $global:COL_BLUE

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-5-6-agent-workflow-execution.png"
}

# --- Figure 5.7: Action Verification or Approval Output ---
function Render-Figure-5-7 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-HeaderBlock $c "Figure 5.7" "Action Verification and Governance Approval Output" "Cryptographically sealed execution receipt with two-person signatures, diff proof, and G2 promotion."

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 16.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.5, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 10.0, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.5, ([System.Drawing.FontStyle]::Regular)

    $boxX = 120.0; $boxW = 1360.0

    # Receipt Container
    Draw-Card $c $boxX 150.0 $boxW 790.0 $global:COL_SURFACE $global:COL_GREEN 10.0 2.0

    # Top Receipt Header
    Draw-Card $c ($boxX + 30) 180.0 ($boxW - 60) 80.0 $global:COL_GREEN_BG $global:COL_GREEN 8.0 1.0
    Draw-Badge $c ($boxX + 50) 195.0 "ACTION VERIFIED & COMMITTED" $global:COL_GREEN $global:COL_WHITE 10.0 | Out-Null
    Draw-Badge $c ($boxX + 340) 195.0 "IMMUTABLE SOC 2 AUDIT PROOF" $global:COL_BLUE_LIGHT $global:COL_BLUE 10.0 | Out-Null
    Draw-Text $c "Receipt ID: RCPT-SOC2-2026-9912 | Target: SAP ERP General Ledger | Tx #884102" $fTitle $global:COL_NAVY ($boxX + 50) 225.0

    # Mutation Summary Strip
    Draw-Card $c ($boxX + 30) 280.0 ($boxW - 60) 120.0 $global:COL_BG $global:COL_BORDER 8.0 1.0
    Draw-Text $c "EXECUTED TRANSACTION DETAILS:" $fH2 $global:COL_NAVY ($boxX + 50) 295.0
    Draw-Text $c "Action Type: POST /api/gl/v1/reallocate-budget | Execution Timestamp: 2026-11-01 12:18:45 UTC`nAmount: $450,000.00 USD`nFrom: Cost Center 402 (Unallocated CapEx) -> Balance reduced from $1.2M to $750k`nTo: Cost Center 710 (Cloud Infrastructure) -> Allocation increased from $850k to $1.3M" $fBody $global:COL_NAVY ($boxX + 50) 325.0

    # Two-Person Cryptographic Signatures Box
    Draw-Text $c "CRYPTOGRAPHIC DUAL-AUTHORIZATION SIGNATURES:" $fH2 $global:COL_NAVY ($boxX + 30) 425.0

    # Signer 1 Card
    Draw-Card $c ($boxX + 30) 455.0 620.0 140.0 $global:COL_SURFACE $global:COL_GREEN 8.0 1.5
    Draw-Badge $c ($boxX + 50) 470.0 "PRIMARY SIGNER: CONFIRMED" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null
    Draw-Text $c "Sarah Vance - Division Chief Financial Officer" $fH2 $global:COL_NAVY ($boxX + 50) 500.0
    Draw-Text $c "Auth Factor: Okta Verify TOTP + Corporate Certificate" $fBody $global:COL_TEXT_SECONDARY ($boxX + 50) 525.0
    Draw-Text $c "Signature: 0x8F92A1B704EC8991F2604810287CC14E" $fMono $global:COL_NAVY ($boxX + 50) 555.0

    # Signer 2 Card
    Draw-Card $c ($boxX + 710) 455.0 620.0 140.0 $global:COL_SURFACE $global:COL_GREEN 8.0 1.5
    Draw-Badge $c ($boxX + 730) 470.0 "SECONDARY CO-SIGNER: CONFIRMED" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null
    Draw-Text $c "Marcus Sterling - Executive Vice President Operations" $fH2 $global:COL_NAVY ($boxX + 730) 500.0
    Draw-Text $c "Auth Factor: FIDO2 Hardware Key + Step-up Challenge" $fBody $global:COL_TEXT_SECONDARY ($boxX + 730) 525.0
    Draw-Text $c "Signature: 0x4D110793EB4091A8820461299831FE82" $fMono $global:COL_NAVY ($boxX + 730) 555.0

    # Evidence Promotion Banner
    Draw-Card $c ($boxX + 30) 615.0 ($boxW - 60) 100.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.2
    Draw-Badge $c ($boxX + 50) 630.0 "EVIDENCE ELEVATION" $global:COL_BLUE $global:COL_WHITE 9.0 | Out-Null
    Draw-Badge $c ($boxX + 220) 630.0 "PROMOTED TO GRADE G2 (ACTION-PROVEN)" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null
    Draw-Text $c "Knowledge Source: SAP_General_Ledger_Extract.xlsx (Chunk #08) has been promoted to G2 Action-Proven.`nExecution receipt and transaction hash are permanently archived as precedent for future AI Router evaluations." $fBody $global:COL_NAVY ($boxX + 50) 660.0

    # Merkle Block Audit Stamp
    Draw-Card $c ($boxX + 30) 735.0 ($boxW - 60) 80.0 $global:COL_NAVY_DARK $global:COL_BORDER 6.0 1.0
    Draw-Text $c "IMMUTABLE FORENSIC AUDIT STAMP - SOC 2 TYPE II COMPLIANCE" $fH2 $global:COL_WHITE ($boxX + 50) 750.0
    Draw-Text $c "Block: #48102 | Merkle Root: 0x9a3e58b10fca4482 | SHA-256 Digest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" $fMono $global:COL_BORDER ($boxX + 50) 775.0

    # Bottom Actions
    Draw-Button $c ($boxX + 30) 840.0 280.0 45.0 "Download Cryptographic Audit File" $global:COL_BLUE
    Draw-Button $c ($boxX + 330) 840.0 240.0 45.0 "Inspect SAP ERP Ledger" $global:COL_NAVY
    Draw-Button $c ($boxX + $boxW - 310) 840.0 280.0 45.0 "Return to Command Center" $global:COL_GREEN

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-5-7-action-verification-approval.png"
}

# --- Figure 7.1: Additional Supporting Screenshot (Multi-Domain Workspace RAG Configuration) ---
function Render-Figure-7-1 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Settings"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 15.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # Header
    Draw-Text $c "Multi-Domain Workspace RAG Architecture & Isolation Management" $fTitle $global:COL_NAVY $mainX 75.0
    Draw-Text $c "Configure workspace-isolated knowledge partitions, retrieval hybrid weights, and domain compliance rules." $fBody $global:COL_TEXT_SECONDARY $mainX 105.0

    # 4 Workspaces Cards Grid (Top)
    $workspaces = @(
        @{ Name = "Apex Capital"; Domain = "Finance (SOX/IFRS)"; Docs = "148 Files"; Chunks = "1,482"; Active = $true; Col = $global:COL_BLUE },
        @{ Name = "Memorial Health"; Domain = "Healthcare (HIPAA)"; Docs = "312 Files"; Chunks = "3,840"; Active = $false; Col = $global:COL_GREEN },
        @{ Name = "St. Jude Research"; Domain = "Education (FERPA)"; Docs = "94 Files"; Chunks = "820"; Active = $false; Col = $global:COL_PURPLE },
        @{ Name = "Vanguard Precision"; Domain = "Manufacturing (AS9100)"; Docs = "205 Files"; Chunks = "2,110"; Active = $false; Col = $global:COL_AMBER }
    )
    $wsW = 310.0; $wsX = $mainX
    foreach ($w in $workspaces) {
        $bg = if ($w.Active) { $global:COL_BLUE_LIGHT } else { $global:COL_SURFACE }
        $border = if ($w.Active) { $global:COL_BLUE } else { $global:COL_BORDER }
        Draw-Card $c $wsX 135.0 $wsW 100.0 $bg $border 8.0 1.5
        Draw-Text $c $w.Name $fH2 $global:COL_NAVY ($wsX + 15) 148.0
        Draw-Badge $c ($wsX + 180) 146.0 $w.Domain $global:COL_BG $w.Col 8.0 | Out-Null
        Draw-Text $c "$($w.Docs) | $($w.Chunks) Chunks" $fMono $global:COL_TEXT_SECONDARY ($wsX + 15) 180.0
        $statusText = if ($w.Active) { "CURRENTLY ACTIVE" } else { "ISOLATED PARTITION" }
        Draw-Text $c $statusText $fMono $border ($wsX + 15) 205.0
        $wsX += 340.0
    }

    # Configuration Form (Left: w: 680)
    $cfgX = $mainX; $cfgW = 680.0
    Draw-Card $c $cfgX 255.0 $cfgW 680.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "FINANCE WORKSPACE RAG PARAMETERS" $fH2 $global:COL_NAVY ($cfgX + 25) 275.0

    $configs = @(
        @{ Label = "Embedding Model"; Val = "Gemini text-embedding-004 (768 dimensions)"; Sub = "Workspace isolated vector space" },
        @{ Label = "Hybrid Retrieval Weights"; Val = "Semantic Vector: 0.60 | BM25 Keyword: 0.40"; Sub = "Reciprocal Rank Fusion constant k = 60" },
        @{ Label = "Sliding Window Chunking"; Val = "Chunk Size: 600 tokens | Overlap: 100 tokens"; Sub = "Optimized for SEC filings & financial ledgers" },
        @{ Label = "Confidence Threshold"; Val = "0.75 Minimum Similarity Score"; Sub = "Sub-threshold chunks quarantined to G0" },
        @{ Label = "Maximum Retrieval Context"; Val = "Top 8 Chunks per Query"; Sub = "Bounded prompt context budget" },
        @{ Label = "PostgreSQL RLS Invariant"; Val = "ENABLED (workspace_id = app.current_workspace_id)"; Sub = "Guarantees zero cross-tenant leakage" }
    )

    $cY = 315.0
    foreach ($cfg in $configs) {
        Draw-Card $c ($cfgX + 25) $cY ($cfgW - 50) 80.0 $global:COL_BG $global:COL_BORDER 6.0 1.0
        Draw-Text $c $cfg.Label $fH2 $global:COL_NAVY ($cfgX + 40) ($cY + 12)
        Draw-Text $c $cfg.Val $fMono $global:COL_BLUE ($cfgX + 40) ($cY + 35)
        Draw-Text $c $cfg.Sub $fBody $global:COL_TEXT_SECONDARY ($cfgX + 40) ($cY + 56)
        $cY += 95.0
    }

    Draw-Button $c ($cfgX + 25) 865.0 280.0 45.0 "Save RAG Configuration" $global:COL_BLUE
    Draw-Button $c ($cfgX + 320) 865.0 280.0 45.0 "Re-index Workspace Vectors" $global:COL_NAVY

    # Right: Domain Vocabulary & Isolation Playground (w: 620)
    $rX = $mainX + 710.0; $rW = 620.0
    Draw-Card $c $rX 255.0 $rW 680.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "DOMAIN VOCABULARY & COMPLIANCE GUARDRAILS" $fH2 $global:COL_NAVY ($rX + 25) 275.0

    Draw-Text $c "Registered Financial Domain Terms:" $fBody $global:COL_TEXT_SECONDARY ($rX + 25) 310.0
    $terms = @("CapEx", "OpEx", "General Ledger", "SOX 404", "IFRS 16", "EBITDA", "Cost Center", "Liquidity Buffer", "SAP ERP", "Variance", "Precedent", "GAAP")
    $tX = $rX + 25.0; $tY = 335.0
    foreach ($t in $terms) {
        Draw-Badge $c $tX $tY $t $global:COL_BLUE_LIGHT $global:COL_BLUE 8.5 | Out-Null
        $tX += 135.0
        if ($tX -gt ($rX + $rW - 140)) {
            $tX = $rX + 25.0
            $tY += 36.0
        }
    }

    # Isolation Test Console
    Draw-Text $c "CROSS-WORKSPACE ISOLATION SIMULATION TEST:" $fH2 $global:COL_NAVY ($rX + 25) 450.0
    Draw-Card $c ($rX + 25) 480.0 ($rW - 50) 350.0 $global:COL_NAVY_DARK $global:COL_BORDER 6.0 1.0
    
    $simLog = "[SIMULATION CONSOLE: Multi-Domain Isolation Verification]`n" +
              "----------------------------------------------------------`n" +
              "> Testing retrieval query across all workspace domains...`n" +
              "> Query: 'Retrieve clinical trial patient dosage protocol'`n`n" +
              "[Attempt 1: Context = Apex Capital (Finance Workspace)]`n" +
              "  SQL Filter: WHERE workspace_id = 'ws-apex-finance'`n" +
              "  Result: 0 records found. (Status: 100% BLOCKED & ISOLATED)`n`n" +
              "[Attempt 2: Direct Vector Scan on Healthcare Table]`n" +
              "  RLS Policy: workspace_memberships check`n" +
              "  Result: Permission Denied (403 Forbidden). Audit logged.`n`n" +
              "[PASS] Isolation Invariant Verified: No cross-workspace leakage."
    Draw-TextBox $c $simLog $fMono $global:COL_WHITE ($rX + 40) 500.0 ($rW - 80) 310.0

    Draw-Button $c ($rX + 25) 865.0 ($rW - 50) 45.0 "Run Full Isolation Audit Suite" $global:COL_GREEN

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-7-1-additional-supporting-screenshot.png"
}

Write-Host "Rendering Group C & D figures (5.1 to 5.7 and 7.1)..."
Render-Figure-5-1
Render-Figure-5-2
Render-Figure-5-3
Render-Figure-5-4
Render-Figure-5-5
Render-Figure-5-6
Render-Figure-5-7
Render-Figure-7-1
Write-Host "All Group C & D figures rendered successfully!"
