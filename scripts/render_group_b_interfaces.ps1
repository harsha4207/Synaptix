# ==============================================================================
# SYNAPTIX COMMAND - Group B Interfaces Rendering Script (Figures 4.1 to 4.7)
# ==============================================================================

. "$PSScriptRoot\figure_drawing_lib.ps1"

$outputDir = "C:\Users\Harsha MS\Synaptix\docs\figures"
if (-not [System.IO.Directory]::Exists($outputDir)) {
    [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
}

# --- Figure 4.1: Login / Authentication Interface ---
function Render-Figure-4-1 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    
    # Left Hero Brand Panel (Navy #0B1F3A)
    $bHero = New-Object System.Drawing.SolidBrush $global:COL_NAVY
    $c.Graphics.FillRectangle($bHero, 0, 0, 640, 1000)
    $bHero.Dispose()
    
    # Inner Accent Glow
    $pAccent = New-Object System.Drawing.Pen $global:COL_NAVY_LIGHT, 2.0
    $c.Graphics.DrawRectangle($pAccent, 40, 40, 560, 920)
    $pAccent.Dispose()

    $fHeroLogo = New-Object System.Drawing.Font "Segoe UI", 24.0, ([System.Drawing.FontStyle]::Bold)
    $fHeroTag = New-Object System.Drawing.Font "Segoe UI", 13.0, ([System.Drawing.FontStyle]::Regular)
    $fHeroH2 = New-Object System.Drawing.Font "Segoe UI", 12.0, ([System.Drawing.FontStyle]::Bold)
    $fHeroBody = New-Object System.Drawing.Font "Segoe UI", 10.0, ([System.Drawing.FontStyle]::Regular)

    # Brand Header
    $bDot = New-Object System.Drawing.SolidBrush $global:COL_BLUE_ACCENT
    $c.Graphics.FillEllipse($bDot, 80, 105, 14, 14)
    $bDot.Dispose()
    Draw-Text $c "SYNAPTIX COMMAND" $fHeroLogo $global:COL_WHITE 105.0 90.0
    Draw-Text $c "Adaptive Enterprise Intelligence, Knowledge and Governed Action Platform" $fHeroTag $global:COL_BLUE_LIGHT 80.0 145.0

    # Enterprise Pillars List
    $pillars = @(
        @{ Title = "Multi-Domain Workspace Isolation"; Desc = "Hardware-like data isolation for Healthcare, Finance, Education and Manufacturing knowledge bases." },
        @{ Title = "Adaptive 4-Tier AI Router"; Desc = "Cost-optimal, ultra-low latency routing dynamically scaling from Tier 1 cache to Tier 4 human-governed actions." },
        @{ Title = "Cryptographic G0-G2 Evidence"; Desc = "Zero hallucinations with verified source citations, hash proofs, and immutable SOC2 audit records." },
        @{ Title = "Two-Person Governed Execution"; Desc = "Enterprise safety gates requiring cryptographic multi-party consensus for critical mutations." }
    )

    $y = 260.0
    foreach ($p in $pillars) {
        Draw-Card $c 80.0 $y 480.0 100.0 $global:COL_NAVY_LIGHT $global:COL_BLUE_ACCENT 8.0 1.0
        Draw-Text $c $p.Title $fHeroH2 $global:COL_WHITE 100.0 ($y + 15)
        Draw-TextBox $c $p.Desc $fHeroBody $global:COL_BORDER 100.0 ($y + 45) 440.0 45.0
        $y += 120.0
    }

    # Security Cert Badges
    Draw-Card $c 80.0 820.0 480.0 80.0 $global:COL_NAVY_DARK $global:COL_BORDER 6.0 1.0
    Draw-Badge $c 100.0 845.0 "SOC 2 TYPE II" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null
    Draw-Badge $c 225.0 845.0 "HIPAA READY" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null
    Draw-Badge $c 345.0 845.0 "AES-256 ENCRYPTED" $global:COL_PURPLE_BG $global:COL_PURPLE 9.0 | Out-Null

    # Right Login Form Area
    $fTitle = New-Object System.Drawing.Font "Segoe UI", 22.0, ([System.Drawing.FontStyle]::Bold)
    $fSub = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Regular)
    $fLabel = New-Object System.Drawing.Font "Segoe UI", 10.0, ([System.Drawing.FontStyle]::Bold)
    $fInput = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Regular)
    $fBtn = New-Object System.Drawing.Font "Segoe UI", 11.5, ([System.Drawing.FontStyle]::Bold)

    $formX = 820.0
    Draw-Text $c "Sign In to Synaptix Command" $fTitle $global:COL_NAVY $formX 140.0
    Draw-Text $c "Select your corporate identity provider or enter your domain credentials." $fSub $global:COL_TEXT_SECONDARY $formX 185.0

    # SSO Buttons
    Draw-Card $c $formX 240.0 600.0 48.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.5
    Draw-Text $c "[Okta]  Sign in with Okta Enterprise SSO" $fLabel $global:COL_NAVY ($formX + 160) 254.0

    Draw-Card $c $formX 300.0 600.0 48.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.5
    Draw-Text $c "[Azure AD]  Sign in with Microsoft Entra ID" $fLabel $global:COL_NAVY ($formX + 155) 314.0

    # Divider
    $pDiv = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
    $c.Graphics.DrawLine($pDiv, $formX, 390, ($formX + 600), 390)
    $pDiv.Dispose()
    Draw-Card $c ($formX + 220) 378.0 160.0 24.0 $global:COL_BG $global:COL_BG 0.0 0.0
    Draw-Text $c "or enterprise email" $fSub $global:COL_TEXT_MUTED ($formX + 235) 380.0

    # Inputs
    Draw-Text $c "Corporate Work Email" $fLabel $global:COL_NAVY $formX 430.0
    Draw-Card $c $formX 455.0 600.0 48.0 $global:COL_SURFACE $global:COL_BLUE 8.0 1.5
    Draw-Text $c "sarah.vance@apexcapital.internal" $fInput $global:COL_NAVY ($formX + 16) 468.0

    Draw-Text $c "Password" $fLabel $global:COL_NAVY $formX 525.0
    Draw-Card $c $formX 550.0 600.0 48.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.2
    Draw-Text $c "************************" $fInput $global:COL_NAVY ($formX + 16) 565.0

    Draw-Text $c "Workspace Realm / Domain" $fLabel $global:COL_NAVY $formX 620.0
    Draw-Card $c $formX 645.0 600.0 48.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.2
    Draw-Text $c "apex-capital.synaptix.io  (Domain: Finance)" $fInput $global:COL_TEXT_SECONDARY ($formX + 16) 658.0
    Draw-Badge $c ($formX + 490) 654.0 "ISOLATED" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null

    # Sign In Button
    Draw-Card $c $formX 730.0 600.0 52.0 $global:COL_BLUE $global:COL_BLUE 8.0 0.0
    Draw-Text $c "Sign In to Workspace Hub" $fBtn $global:COL_WHITE ($formX + 205) 744.0

    # Footer Notice
    Draw-TextBox $c "Notice: Synaptix Command sessions are cryptographically signed and monitored for SOC 2 Type II audit compliance. Zero unauthorized cross-workspace traversal is tolerated." $fHeroBody $global:COL_TEXT_MUTED $formX 820.0 600.0 50.0

    $fHeroLogo.Dispose(); $fHeroTag.Dispose(); $fHeroH2.Dispose(); $fHeroBody.Dispose()
    $fTitle.Dispose(); $fSub.Dispose(); $fLabel.Dispose(); $fInput.Dispose(); $fBtn.Dispose()
    Save-Canvas $c "$outputDir\figure-4-1-login-authentication.png"
}

# --- Figure 4.2: Main Workspace / Chat Interface ---
function Render-Figure-4-2 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Command Center"

    $fH1 = New-Object System.Drawing.Font "Segoe UI", 14.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # Top Workspace Status Bar
    Draw-Card $c $mainX 75.0 $mainW 48.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Badge $c ($mainX + 15) 86.0 "WORKSPACE: APEX CAPITAL" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.5 | Out-Null
    Draw-Badge $c ($mainX + 220) 86.0 "DOMAIN: FINANCE (SOX/IFRS)" $global:COL_GREEN_BG $global:COL_GREEN 9.5 | Out-Null
    Draw-Badge $c ($mainX + 440) 86.0 "EMLM: GEMINI 2.5 PRO" $global:COL_PURPLE_BG $global:COL_PURPLE 9.5 | Out-Null
    Draw-Badge $c ($mainX + 630) 86.0 "ROUTER: AUTO-TIER 1-4" $global:COL_AMBER_BG $global:COL_AMBER 9.5 | Out-Null
    Draw-Text $c "Active Knowledge Base: 1,482 Chunks Indexed | Isolation Guard: Active" $fBody $global:COL_TEXT_SECONDARY ($mainX + 850) 89.0

    # User Query Card
    Draw-Card $c $mainX 140.0 $mainW 85.0 $global:COL_SURFACE $global:COL_BLUE 8.0 1.5
    Draw-Badge $c ($mainX + 20) 155.0 "SARAH VANCE (CFO)" $global:COL_NAVY_LIGHT $global:COL_WHITE 9.0 | Out-Null
    Draw-Text $c "Reallocate $450,000 from underutilized Q3 CapEx to Cloud Infrastructure to meet surge capacity." $fH1 $global:COL_NAVY ($mainX + 200) 155.0
    Draw-Text $c "Timestamp: 2026-11-01 12:15:30 UTC | Input Channel: Natural Language Command Bar | Workspace Isolation Verified" $fBody $global:COL_TEXT_MUTED ($mainX + 200) 188.0

    # EMLM Reasoning HUD Card
    Draw-Card $c $mainX 240.0 $mainW 120.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.2
    Draw-Text $c "EMLM 8-STAGE REASONING EXECUTION HUD" $fH2 $global:COL_BLUE ($mainX + 20) 255.0
    Draw-Badge $c ($mainX + 380) 253.0 "ROUTED: TIER 4 CONSEQUENTIAL" $global:COL_RED_BG $global:COL_RED 8.5 | Out-Null
    Draw-Badge $c ($mainX + 620) 253.0 "LATENCY: 412ms" $global:COL_GREEN_BG $global:COL_GREEN 8.5 | Out-Null

    $reasonStages = @(
        @{ Name = "1. Parse Intent"; Time = "18ms"; Status = "Done" },
        @{ Name = "2. Domain RAG"; Time = "84ms"; Status = "Done" },
        @{ Name = "3. RRF Hybrid Rank"; Time = "42ms"; Status = "Done" },
        @{ Name = "4. Policy Guardrail"; Time = "65ms"; Status = "Done" },
        @{ Name = "5. Variance Calc"; Time = "38ms"; Status = "Done" },
        @{ Name = "6. Risk Tiering (T3)"; Time = "22ms"; Status = "Done" },
        @{ Name = "7. Staged Action"; Time = "78ms"; Status = "Done" },
        @{ Name = "8. Two-Person Gate"; Time = "65ms"; Status = "Action Required" }
    )
    $stX = $mainX + 20.0
    foreach ($st in $reasonStages) {
        $cCol = if ($st.Status -eq "Action Required") { $global:COL_RED } else { $global:COL_GREEN }
        Draw-Card $c $stX 285.0 150.0 60.0 $global:COL_SURFACE $cCol 6.0 1.0
        Draw-Text $c $st.Name $fBody $global:COL_NAVY ($stX + 10) 292.0
        Draw-Text $c "$($st.Time) | $($st.Status)" $fMono $cCol ($stX + 10) 315.0
        $stX += 162.0
    }

    # Assistant Response & Evidence Grounding Card
    Draw-Card $c $mainX 375.0 $mainW 430.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.2
    Draw-Badge $c ($mainX + 20) 395.0 "SYNAPTIX AI ORCHESTRATOR" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null
    Draw-Badge $c ($mainX + 240) 395.0 "TIER 3 CRITICAL ACTION STAGED" $global:COL_RED_BG $global:COL_RED 9.0 | Out-Null
    Draw-Badge $c ($mainX + 490) 395.0 "EVIDENCE: G1 VERIFIED" $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null

    $respText = "Based on your Finance Workspace knowledge base, I have evaluated the proposed $450,000 budget reallocation:`n`n" +
                "1. Policy Compliance: According to CapEx Policy Guidelines v4 (§4.2), discretionary capital reallocations exceeding $250,000 are classified as Tier 3 Critical Operations. They require Two-Person Rule consensus validation (Division CFO + Executive Vice President).`n`n" +
                "2. Budget Availability: General Ledger Extract confirms Cost Center 402 (Unallocated CapEx) currently possesses $1,200,000.00 in uncommitted funds. The proposed transfer leaves $750,000.00, preserving a safe 62.5% liquidity buffer.`n`n" +
                "3. Operational Staging: The mutation payload has been pre-validated and staged against SAP ERP GL Account #884102. An authorization modal has been generated awaiting co-signer consensus."
    Draw-TextBox $c $respText $fBody $global:COL_NAVY ($mainX + 20) 430.0 ($mainW - 40) 140.0

    # Attached Evidence Strip
    Draw-Text $c "GROUNDED RETRIEVAL EVIDENCE SOURCES (FINANCE DOMAIN):" $fH2 $global:COL_NAVY ($mainX + 20) 580.0
    
    Draw-Card $c ($mainX + 20) 610.0 620.0 80.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.0
    Draw-Badge $c ($mainX + 35) 620.0 "G1 VERIFIED" $global:COL_BLUE $global:COL_WHITE 8.0 | Out-Null
    Draw-Text $c "CapEx_Policy_Guidelines_v4.docx (Chunk 14)" $fH2 $global:COL_NAVY ($mainX + 130) 620.0
    Draw-Text $c "Match: 0.942 RRF | Section 4.2 Capital Allocation Thresholds | SHA256: e3b0c442..." $fMono $global:COL_TEXT_SECONDARY ($mainX + 35) 650.0

    Draw-Card $c ($mainX + 660) 610.0 640.0 80.0 $global:COL_GREEN_BG $global:COL_GREEN 6.0 1.0
    Draw-Badge $c ($mainX + 675) 620.0 "G2 PROVEN" $global:COL_GREEN $global:COL_WHITE 8.0 | Out-Null
    Draw-Text $c "SAP_General_Ledger_Extract.xlsx (Chunk 08)" $fH2 $global:COL_NAVY ($mainX + 765) 620.0
    Draw-Text $c "Match: 0.918 RRF | Cost Center 402 Balance Sheet | Validated via SAP GL Sync" $fMono $global:COL_TEXT_SECONDARY ($mainX + 675) 650.0

    # Action Status Callout Box
    Draw-Card $c ($mainX + 20) 710.0 ($mainW - 40) 75.0 $global:COL_AMBER_BG $global:COL_AMBER 6.0 1.2
    Draw-Text $c "GOVERNANCE ACTION GATE TRIGGERED:" $fH2 $global:COL_AMBER ($mainX + 40) 725.0
    Draw-Text $c "Action ID: ACT-2026-9912 is currently PENDING consensus. Signer 1 (Sarah Vance) confirmed. Awaiting Signer 2 (Marcus Sterling - EVP Operations)." $fBody $global:COL_NAVY ($mainX + 40) 750.0
    Draw-Button $c ($mainX + 1050) 725.0 220.0 42.0 "Inspect Staged Action" $global:COL_BLUE

    # Bottom Command Prompt Input Bar
    Draw-Card $c $mainX 820.0 $mainW 65.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.5
    Draw-Text $c "Ask Synaptix Command or trigger governed enterprise workflow... [Voice / Natural Language]" $fBody $global:COL_TEXT_MUTED ($mainX + 60) 842.0
    Draw-Card $c ($mainX + 15) 835.0 32.0 32.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 16.0 1.0
    Draw-Text $c "[MIC]" $fMono $global:COL_BLUE ($mainX + 20) 843.0
    Draw-Button $c ($mainX + $mainW - 140) 832.0 120.0 42.0 "Send HUD" $global:COL_BLUE

    # Quick Prompts
    Draw-Text $c "Quick Actions:" $fBody $global:COL_TEXT_SECONDARY $mainX 905.0
    Draw-Card $c ($mainX + 90) 900.0 220.0 30.0 $global:COL_SURFACE $global:COL_BORDER 15.0 1.0
    Draw-Text $c "Simulate CapEx Rollback" $fBody $global:COL_BLUE ($mainX + 110) 906.0
    Draw-Card $c ($mainX + 325) 900.0 250.0 30.0 $global:COL_SURFACE $global:COL_BORDER 15.0 1.0
    Draw-Text $c "Export SOC2 Audit Evidence" $fBody $global:COL_BLUE ($mainX + 345) 906.0
    Draw-Card $c ($mainX + 590) 900.0 220.0 30.0 $global:COL_SURFACE $global:COL_BORDER 15.0 1.0
    Draw-Text $c "Inspect Evidence Lineage" $fBody $global:COL_BLUE ($mainX + 610) 906.0

    $fH1.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-4-2-main-workspace-chat.png"
}

# --- Figure 4.3: Uploads & Data Interface ---
function Render-Figure-4-3 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Uploads & Data"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 16.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # Page Header
    Draw-Text $c "Document Knowledge Ingestion & Vector Management" $fTitle $global:COL_NAVY $mainX 75.0
    Draw-Text $c "Upload, chunk, vectorize and govern enterprise documents isolated to the Finance workspace." $fBody $global:COL_TEXT_SECONDARY $mainX 105.0

    # Workspace KPI Mini-Cards
    $stats = @(
        @{ Title = "Total Ingested Files"; Val = "148 Files"; Sub = "Finance Workspace Only" },
        @{ Title = "Vector Chunks"; Val = "1,482 Chunks"; Sub = "600-token sliding window" },
        @{ Title = "Storage Consumption"; Val = "142.8 MB"; Sub = "Vector embeddings + raw text" },
        @{ Title = "Isolation Invariant"; Val = "Strict (100%)"; Sub = "Zero cross-domain leakage" }
    )
    $statW = 310.0; $statX = $mainX
    foreach ($st in $stats) {
        Draw-Card $c $statX 135.0 $statW 80.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
        Draw-Text $c $st.Title $fBody $global:COL_TEXT_SECONDARY ($statX + 15) 145.0
        Draw-Text $c $st.Val $fTitle $global:COL_BLUE ($statX + 15) 165.0
        Draw-Text $c $st.Sub $fMono $global:COL_TEXT_MUTED ($statX + 15) 192.0
        $statX += 340.0
    }

    # Drag-and-Drop Ingestion Zone
    Draw-Card $c $mainX 235.0 $mainW 120.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.5
    Draw-Text $c "Drag and drop enterprise files here to ingest into Finance Knowledge Base" $fH2 $global:COL_BLUE ($mainX + 420) 265.0
    Draw-Text $c "Supported formats: PDF, DOCX, XLSX, CSV, JSON, Markdown, Images (Tesseract OCR Engine enabled)" $fBody $global:COL_TEXT_SECONDARY ($mainX + 370) 290.0
    Draw-Button $c ($mainX + 540) 315.0 240.0 32.0 "Browse Files to Ingest" $global:COL_BLUE

    # Document Table Container
    Draw-Card $c $mainX 375.0 $mainW 580.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0

    # Table Controls (Search & Domain filter)
    Draw-Card $c ($mainX + 20) 395.0 400.0 38.0 $global:COL_BG $global:COL_BORDER 6.0 1.0
    Draw-Text $c "Search documents by name, chunk content or hash..." $fBody $global:COL_TEXT_MUTED ($mainX + 35) 405.0
    Draw-Badge $c ($mainX + 440) 398.0 "FILTER: DOMAIN = FINANCE" $global:COL_BLUE_LIGHT $global:COL_BLUE 9.0 | Out-Null
    Draw-Badge $c ($mainX + 660) 398.0 "INDEX STATUS: ALL (148)" $global:COL_BORDER_LIGHT $global:COL_TEXT_SECONDARY 9.0 | Out-Null
    Draw-Button $c ($mainX + $mainW - 200) 395.0 180.0 38.0 "Batch Re-index RAG" $global:COL_NAVY

    # Table Header Row
    $tblY = 450.0
    Draw-Card $c ($mainX + 15) $tblY ($mainW - 30) 40.0 $global:COL_BG $global:COL_BORDER 4.0 1.0
    Draw-Text $c "DOCUMENT NAME" $fH2 $global:COL_NAVY ($mainX + 30) ($tblY + 12)
    Draw-Text $c "DOMAIN" $fH2 $global:COL_NAVY ($mainX + 380) ($tblY + 12)
    Draw-Text $c "FORMAT" $fH2 $global:COL_NAVY ($mainX + 490) ($tblY + 12)
    Draw-Text $c "CHUNKS" $fH2 $global:COL_NAVY ($mainX + 580) ($tblY + 12)
    Draw-Text $c "INDEX STATUS" $fH2 $global:COL_NAVY ($mainX + 670) ($tblY + 12)
    Draw-Text $c "EVIDENCE GRADE" $fH2 $global:COL_NAVY ($mainX + 820) ($tblY + 12)
    Draw-Text $c "UPLOADED BY" $fH2 $global:COL_NAVY ($mainX + 980) ($tblY + 12)
    Draw-Text $c "ACTIONS" $fH2 $global:COL_NAVY ($mainX + 1150) ($tblY + 12)

    # Document Rows
    $docs = @(
        @{ Name = "Q3_Financial_Review_2026.pdf"; Domain = "Finance"; Fmt = "PDF"; Chunks = "34"; Status = "100% Indexed"; StatusCol = $global:COL_GREEN; Grade = "G1 Verified"; GradeCol = $global:COL_BLUE; By = "Sarah Vance"; Act = "Inspect | Chunks" },
        @{ Name = "CapEx_Policy_Guidelines_v4.docx"; Domain = "Finance"; Fmt = "DOCX"; Chunks = "22"; Status = "100% Indexed"; StatusCol = $global:COL_GREEN; Grade = "G1 Verified"; GradeCol = $global:COL_BLUE; By = "Compliance Lead"; Act = "Inspect | Chunks" },
        @{ Name = "SAP_General_Ledger_Extract.xlsx"; Domain = "Finance"; Fmt = "XLSX"; Chunks = "68"; Status = "100% Indexed"; StatusCol = $global:COL_GREEN; Grade = "G2 Action-Proven"; GradeCol = $global:COL_GREEN; By = "SAP Sync Daemon"; Act = "Inspect | Chunks" },
        @{ Name = "Vendor_Contract_AmazonAWS.pdf"; Domain = "Finance"; Fmt = "PDF"; Chunks = "18"; Status = "100% Indexed"; StatusCol = $global:COL_GREEN; Grade = "G1 Verified"; GradeCol = $global:COL_BLUE; By = "Legal Counsel"; Act = "Inspect | Chunks" },
        @{ Name = "Clinical_Trial_Protocol_v2.pdf"; Domain = "Healthcare"; Fmt = "PDF"; Chunks = "--"; Status = "QUARANTINED"; StatusCol = $global:COL_RED; Grade = "ISOLATED"; GradeCol = $global:COL_RED; By = "Healthcare WS"; Act = "Blocked (RLS)" },
        @{ Name = "Manufacturing_SOP_Assembly.pdf"; Domain = "Manufacturing"; Fmt = "PDF"; Chunks = "--"; Status = "QUARANTINED"; StatusCol = $global:COL_RED; Grade = "ISOLATED"; GradeCol = $global:COL_RED; By = "Mfg WS"; Act = "Blocked (RLS)" }
    )

    $rowY = 500.0
    foreach ($d in $docs) {
        $pRow = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
        $c.Graphics.DrawLine($pRow, ($mainX + 15), $rowY, ($mainX + $mainW - 15), $rowY)
        $pRow.Dispose()

        Draw-Text $c $d.Name $fH2 $global:COL_NAVY ($mainX + 30) ($rowY + 15)
        Draw-Text $c $d.Domain $fBody $global:COL_TEXT_SECONDARY ($mainX + 380) ($rowY + 15)
        Draw-Badge $c ($mainX + 490) ($rowY + 12) $d.Fmt $global:COL_BG $global:COL_NAVY 8.0 | Out-Null
        Draw-Text $c $d.Chunks $fBody $global:COL_NAVY ($mainX + 595) ($rowY + 15)
        Draw-Badge $c ($mainX + 670) ($rowY + 12) $d.Status $global:COL_BG $d.StatusCol 8.0 | Out-Null
        Draw-Badge $c ($mainX + 820) ($rowY + 12) $d.Grade $global:COL_BG $d.GradeCol 8.0 | Out-Null
        Draw-Text $c $d.By $fBody $global:COL_TEXT_SECONDARY ($mainX + 980) ($rowY + 15)
        Draw-Text $c $d.Act $fBody $global:COL_BLUE ($mainX + 1150) ($rowY + 15)

        $rowY += 60.0
    }

    # Bottom Invariant Notice
    Draw-Card $c ($mainX + 20) 880.0 ($mainW - 40) 60.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.0
    Draw-Text $c "WORKSPACE ISOLATION INVARIANT GUARANTEE:" $fH2 $global:COL_BLUE ($mainX + 35) 892.0
    Draw-Text $c "Rows 5 and 6 illustrate cross-tenant protection: files from Healthcare and Manufacturing workspaces are quarantined and invisible to retrieval queries in this Finance session." $fBody $global:COL_NAVY ($mainX + 35) 915.0

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-4-3-uploads-data.png"
}

# --- Figure 4.4: Dashboard Interface ---
function Render-Figure-4-4 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Dashboard"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 16.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)
    $fKPIVal = New-Object System.Drawing.Font "Segoe UI", 20.0, ([System.Drawing.FontStyle]::Bold)

    $mainX = 245.0; $mainW = 1330.0

    # Header
    Draw-Text $c "Executive Intelligence & Operational Governance Telemetry" $fTitle $global:COL_NAVY $mainX 75.0
    Draw-Text $c "Live platform metrics, AI router distributions, evidence grading, and governed action logs." $fBody $global:COL_TEXT_SECONDARY $mainX 105.0

    # 4 KPI Cards
    $kpis = @(
        @{ Title = "Ingested Chunks"; Val = "1,482"; Trend = "+14% this month"; Col = $global:COL_BLUE },
        @{ Title = "AI Queries Mediated"; Val = "12,890"; Trend = "Avg latency: 184ms"; Col = $global:COL_PURPLE },
        @{ Title = "Governed Actions"; Val = "342"; Trend = "100% SOC2 verified"; Col = $global:COL_AMBER },
        @{ Title = "System Reliability"; Val = "99.98%"; Trend = "Zero tenant leaks"; Col = $global:COL_GREEN }
    )
    $kpiW = 310.0; $kpiX = $mainX
    foreach ($k in $kpis) {
        Draw-Card $c $kpiX 135.0 $kpiW 100.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
        Draw-Text $c $k.Title $fBody $global:COL_TEXT_SECONDARY ($kpiX + 20) 150.0
        Draw-Text $c $k.Val $fKPIVal $k.Col ($kpiX + 20) 175.0
        Draw-Text $c $k.Trend $fMono $global:COL_TEXT_MUTED ($kpiX + 20) 210.0
        $kpiX += 340.0
    }

    # Middle Charts Row
    # Left Chart: AI Router Distribution
    Draw-Card $c $mainX 255.0 645.0 320.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "AI ROUTING DISTRIBUTION BY POLICY TIER" $fH2 $global:COL_NAVY ($mainX + 20) 275.0
    Draw-Text $c "Total 12,890 queries evaluated via cost & latency optimizer" $fBody $global:COL_TEXT_SECONDARY ($mainX + 20) 300.0

    $tiersChart = @(
        @{ Name = "Tier 1: Simple / Cached"; Pct = 42; Val = "5,414 queries (42%)"; Col = $global:COL_GREEN; Time = "12ms" },
        @{ Name = "Tier 2: Moderate Hybrid RAG"; Pct = 36; Val = "4,640 queries (36%)"; Col = $global:COL_BLUE; Time = "240ms" },
        @{ Name = "Tier 3: Complex EMLM Pipeline"; Pct = 18; Val = "2,320 queries (18%)"; Col = $global:COL_PURPLE; Time = "580ms" },
        @{ Name = "Tier 4: Consequential Action"; Pct = 4; Val = "516 queries (4%)"; Col = $global:COL_RED; Time = "1,240ms" }
    )
    $barY = 340.0
    foreach ($tc in $tiersChart) {
        Draw-Text $c "$($tc.Name) - $($tc.Val)" $fBody $global:COL_NAVY ($mainX + 20) $barY
        Draw-Card $c ($mainX + 20) ($barY + 22) 590.0 16.0 $global:COL_BG $global:COL_BORDER 4.0 1.0
        $barW = (590.0 * $tc.Pct) / 100.0
        Draw-Card $c ($mainX + 20) ($barY + 22) $barW 16.0 $tc.Col $tc.Col 4.0 0.0
        $barY += 56.0
    }

    # Right Chart: Evidence Grade Breakdown & Workflow Status
    Draw-Card $c ($mainX + 685) 255.0 645.0 320.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "EVIDENCE VERIFICATION & GOVERNANCE COMPLIANCE" $fH2 $global:COL_NAVY ($mainX + 705) 275.0
    Draw-Text $c "Distribution of knowledge grades and action consensus rates" $fBody $global:COL_TEXT_SECONDARY ($mainX + 705) 300.0

    # Evidence Grades
    Draw-Text $c "Active Knowledge Evidence Distribution:" $fH2 $global:COL_NAVY ($mainX + 705) 340.0
    Draw-Badge $c ($mainX + 705) 375.0 "G0: EXTRACTED" $global:COL_AMBER_BG $global:COL_AMBER 10.0 | Out-Null
    Draw-Text $c "178 Chunks (12%)" $fBody $global:COL_TEXT_SECONDARY ($mainX + 850) 380.0

    Draw-Badge $c ($mainX + 705) 420.0 "G1: VERIFIED" $global:COL_BLUE_LIGHT $global:COL_BLUE 10.0 | Out-Null
    Draw-Text $c "948 Chunks (64%)" $fBody $global:COL_TEXT_SECONDARY ($mainX + 850) 425.0

    Draw-Badge $c ($mainX + 705) 465.0 "G2: ACTION-PROVEN" $global:COL_GREEN_BG $global:COL_GREEN 10.0 | Out-Null
    Draw-Text $c "356 Chunks (24%)" $fBody $global:COL_TEXT_SECONDARY ($mainX + 850) 470.0

    # Right side: Two-Person Consensus stats
    Draw-Card $c ($mainX + 1040) 340.0 270.0 200.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.0
    Draw-Text $c "TWO-PERSON CONSENSUS" $fH2 $global:COL_BLUE ($mainX + 1055) 355.0
    Draw-Text $c "Governed Requests: 342`nConfirmed: 338 (98.8%)`nRejected / Timed Out: 4`nAverage Consensus: 14 mins`nViolations Detected: 0" $fBody $global:COL_NAVY ($mainX + 1055) 390.0

    # Bottom Table: Recent Governed Operations
    Draw-Card $c $mainX 595.0 $mainW 365.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "RECENT GOVERNED ACTIONS & AUDIT STREAM" $fH2 $global:COL_NAVY ($mainX + 20) 615.0

    $actionsTbl = @(
        @{ ID = "ACT-2026-9912"; Name = "Reallocate $450k CapEx to Cloud"; Risk = "T3 Critical"; Grade = "G1 Verified"; Status = "PENDING 2-PERSON"; Col = $global:COL_RED; Time = "Today 12:15" },
        @{ ID = "ACT-2026-9884"; Name = "Generate Q3 Financial Compliance Report"; Risk = "T1 Reversible"; Grade = "G1 Verified"; Status = "EXECUTED"; Col = $global:COL_GREEN; Time = "Today 10:42" },
        @{ ID = "ACT-2026-9850"; Name = "Sync SAP General Ledger Account #884102"; Risk = "T2 Outward"; Grade = "G2 Proven"; Status = "EXECUTED"; Col = $global:COL_GREEN; Time = "Today 08:30" },
        @{ ID = "ACT-2026-9799"; Name = "Revoke Stale API Token for Vendor S3"; Risk = "T3 Critical"; Grade = "G2 Proven"; Status = "EXECUTED"; Col = $global:COL_GREEN; Time = "Yesterday 18:20" },
        @{ ID = "ACT-2026-9742"; Name = "Batch Re-index Finance Documents"; Risk = "T1 Reversible"; Grade = "G1 Verified"; Status = "EXECUTED"; Col = $global:COL_GREEN; Time = "Yesterday 14:10" }
    )

    $actY = 650.0
    foreach ($a in $actionsTbl) {
        $pAct = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
        $c.Graphics.DrawLine($pAct, ($mainX + 20), $actY, ($mainX + $mainW - 20), $actY)
        $pAct.Dispose()

        Draw-Text $c $a.ID $fMono $global:COL_TEXT_MUTED ($mainX + 20) ($actY + 12)
        Draw-Text $c $a.Name $fH2 $global:COL_NAVY ($mainX + 180) ($actY + 12)
        Draw-Badge $c ($mainX + 600) ($actY + 10) $a.Risk $global:COL_BG $global:COL_AMBER 8.5 | Out-Null
        Draw-Badge $c ($mainX + 750) ($actY + 10) $a.Grade $global:COL_BG $global:COL_BLUE 8.5 | Out-Null
        Draw-Badge $c ($mainX + 900) ($actY + 10) $a.Status $global:COL_BG $a.Col 8.5 | Out-Null
        Draw-Text $c $a.Time $fMono $global:COL_TEXT_SECONDARY ($mainX + 1150) ($actY + 12)

        $actY += 52.0
    }

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose(); $fKPIVal.Dispose()
    Save-Canvas $c "$outputDir\figure-4-4-dashboard.png"
}

# --- Figure 4.5: Agent Workflows Interface ---
function Render-Figure-4-5 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Agent Workflows"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 16.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.5, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0; $mainW = 1330.0

    # Header
    Draw-Text $c "Autonomous Agent Workflows & DAG Orchestration Studio" $fTitle $global:COL_NAVY $mainX 75.0
    Draw-Text $c "Define, schedule, simulate and monitor multi-step directed acyclic graph agent operations." $fBody $global:COL_TEXT_SECONDARY $mainX 105.0

    Draw-Button $c ($mainX + $mainW - 220) 75.0 200.0 42.0 "+ Create New Workflow" $global:COL_BLUE

    # Workflow Cards
    $workflows = @(
        @{ 
            Name = "WF-01: CapEx Budget Reconciliation & Reallocation"; 
            Trigger = "Scheduled Daily at 08:00 UTC + Webhook Trigger"; 
            Status = "EXECUTING (WAITING APPROVAL)"; 
            StatusCol = $global:COL_AMBER;
            Nodes = @(
                @{ Step = "1. Ingest Ledger"; Status = "Complete (14ms)"; Col = $global:COL_GREEN },
                @{ Step = "2. Variance Calc"; Status = "Complete (38ms)"; Col = $global:COL_GREEN },
                @{ Step = "3. Compliance Check"; Status = "Complete (65ms)"; Col = $global:COL_GREEN },
                @{ Step = "4. Two-Person Gate"; Status = "Pending Co-Sign"; Col = $global:COL_AMBER },
                @{ Step = "5. SAP GL Mutation"; Status = "Staged"; Col = $global:COL_TEXT_MUTED }
            )
        },
        @{ 
            Name = "WF-02: Automated Vendor Contract Audit & Compliance"; 
            Trigger = "Event: On Document Ingestion to Finance Workspace"; 
            Status = "ACTIVE (IDLE)"; 
            StatusCol = $global:COL_GREEN;
            Nodes = @(
                @{ Step = "1. OCR Extraction"; Status = "Ready"; Col = $global:COL_GREEN },
                @{ Step = "2. SLA Clause Match"; Status = "Ready"; Col = $global:COL_GREEN },
                @{ Step = "3. Grade Evidence (G1)"; Status = "Ready"; Col = $global:COL_GREEN },
                @{ Step = "4. Commit Precedent"; Status = "Ready"; Col = $global:COL_GREEN }
            )
        },
        @{ 
            Name = "WF-03: Multi-Domain Knowledge Base Re-Indexing & RRF Calibration"; 
            Trigger = "Cron: 0 0 1 * * (Monthly 1st at Midnight)"; 
            Status = "SCHEDULED"; 
            StatusCol = $global:COL_BLUE;
            Nodes = @(
                @{ Step = "1. Scan Stale Chunks"; Status = "Scheduled"; Col = $global:COL_BLUE },
                @{ Step = "2. Re-compute IDF"; Status = "Scheduled"; Col = $global:COL_BLUE },
                @{ Step = "3. Vector Re-embedding"; Status = "Scheduled"; Col = $global:COL_BLUE },
                @{ Step = "4. Baseline Benchmark"; Status = "Scheduled"; Col = $global:COL_BLUE }
            )
        }
    )

    $cardY = 145.0
    foreach ($wf in $workflows) {
        Draw-Card $c $mainX $cardY $mainW 235.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.2
        Draw-Text $c $wf.Name $fH2 $global:COL_NAVY ($mainX + 25) ($cardY + 20)
        Draw-Badge $c ($mainX + 680) ($cardY + 18) $wf.Status $global:COL_BG $wf.StatusCol 9.0 | Out-Null
        Draw-Text $c "Trigger: $($wf.Trigger)" $fBody $global:COL_TEXT_SECONDARY ($mainX + 25) ($cardY + 50)

        # DAG Node Strip
        $nodeX = $mainX + 25.0
        for ($i = 0; $i -lt $wf.Nodes.Count; $i++) {
            $nd = $wf.Nodes[$i]
            Draw-Card $c $nodeX ($cardY + 90) 210.0 80.0 $global:COL_BG $nd.Col 6.0 1.5
            Draw-Text $c $nd.Step $fH2 $global:COL_NAVY ($nodeX + 15) ($cardY + 105)
            Draw-Text $c $nd.Status $fMono $nd.Col ($nodeX + 15) ($cardY + 135)

            if ($i -lt ($wf.Nodes.Count - 1)) {
                # Arrow between nodes
                Draw-Arrow $c ($nodeX + 210) ($cardY + 130) ($nodeX + 245) ($cardY + 130) $global:COL_BLUE ""
            }
            $nodeX += 250.0
        }

        # Card Actions
        Draw-Button $c ($mainX + $mainW - 320) ($cardY + 185) 140.0 34.0 "Execution Logs" $global:COL_SURFACE
        Draw-Button $c ($mainX + $mainW - 160) ($cardY + 185) 130.0 34.0 "Run Now" $global:COL_BLUE

        $cardY += 265.0
    }

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-4-5-agent-workflows.png"
}

# --- Figure 4.6: Evidence / Source Details Interface ---
function Render-Figure-4-6 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Evidence Explorer"

    $fTitle = New-Object System.Drawing.Font "Segoe UI", 16.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.5, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.0, ([System.Drawing.FontStyle]::Regular)

    $mainX = 245.0

    # Background table / list
    Draw-Text $c "Cryptographic Evidence Lineage & Provenance Hub" $fTitle $global:COL_NAVY $mainX 75.0
    Draw-Text $c "Inspect verified citations, source text extractions, SHA-256 hashes, and audit proofs." $fBody $global:COL_TEXT_SECONDARY $mainX 105.0

    Draw-Card $c $mainX 140.0 680.0 800.0 $global:COL_SURFACE $global:COL_BORDER 8.0 1.0
    Draw-Text $c "CITED EVIDENCE CATALOG (WORKSPACE: FINANCE)" $fH2 $global:COL_NAVY ($mainX + 20) 165.0
    
    $evidItems = @(
        @{ ID = "CIT-FIN-2026-0842"; Doc = "CapEx_Policy_Guidelines_v4.docx"; Chunk = "Chunk #14"; Grade = "G1 Verified"; Col = $global:COL_BLUE; Active = $true },
        @{ ID = "CIT-FIN-2026-0843"; Doc = "SAP_General_Ledger_Extract.xlsx"; Chunk = "Chunk #08"; Grade = "G2 Proven"; Col = $global:COL_GREEN; Active = $false },
        @{ ID = "CIT-FIN-2026-0790"; Doc = "Q3_Financial_Review_2026.pdf"; Chunk = "Chunk #21"; Grade = "G1 Verified"; Col = $global:COL_BLUE; Active = $false },
        @{ ID = "CIT-FIN-2026-0761"; Doc = "Vendor_Contract_AmazonAWS.pdf"; Chunk = "Chunk #03"; Grade = "G1 Verified"; Col = $global:COL_BLUE; Active = $false },
        @{ ID = "CIT-FIN-2026-0689"; Doc = "Draft_Budget_Proposal_v1.docx"; Chunk = "Chunk #02"; Grade = "G0 Extracted"; Col = $global:COL_AMBER; Active = $false }
    )
    $eY = 210.0
    foreach ($ei in $evidItems) {
        $bg = if ($ei.Active) { $global:COL_BLUE_LIGHT } else { $global:COL_SURFACE }
        Draw-Card $c ($mainX + 20) $eY 640.0 75.0 $bg $global:COL_BORDER 6.0 1.0
        Draw-Badge $c ($mainX + 35) ($eY + 15) $ei.Grade $global:COL_BG $ei.Col 8.5 | Out-Null
        Draw-Text $c $ei.Doc $fH2 $global:COL_NAVY ($mainX + 150) ($eY + 15)
        Draw-Text $c "ID: $($ei.ID) | $($ei.Chunk) | Domain: Finance" $fMono $global:COL_TEXT_SECONDARY ($mainX + 35) ($eY + 45)
        $eY += 90.0
    }

    # Right Evidence Inspector Drawer (x: 950 to 1570)
    $drawerX = 950.0; $drawerW = 620.0
    Draw-Card $c $drawerX 140.0 $drawerW 800.0 $global:COL_SURFACE $global:COL_BLUE 8.0 2.0
    Draw-Text $c "EVIDENCE PROVENANCE INSPECTOR" $fH2 $global:COL_BLUE ($drawerX + 25) 165.0
    Draw-Badge $c ($drawerX + 460) 163.0 "G1 VERIFIED" $global:COL_BLUE $global:COL_WHITE 9.0 | Out-Null

    # Metadata Grid
    $meta = @(
        @{ K = "Citation ID"; V = "CIT-FIN-2026-0842" },
        @{ K = "Source Document"; V = "CapEx_Policy_Guidelines_v4.docx" },
        @{ K = "Workspace Domain"; V = "Apex Capital - Finance (Isolated)" },
        @{ K = "Document Section"; V = "Section 4.2 - Capital Allocation Thresholds" },
        @{ K = "Ingestion Job ID"; V = "JOB-INGEST-7729 (Stage 10 Complete)" },
        @{ K = "Corroboration"; V = "Official Board Policy Document (Signed 2026)" }
    )
    $mY = 215.0
    foreach ($m in $meta) {
        Draw-Text $c $m.K $fBody $global:COL_TEXT_SECONDARY ($drawerX + 25) $mY
        Draw-Text $c $m.V $fH2 $global:COL_NAVY ($drawerX + 200) $mY
        $mY += 32.0
    }

    # Cryptographic Hash Box
    Draw-Card $c ($drawerX + 25) 420.0 ($drawerW - 50) 65.0 $global:COL_BG $global:COL_BORDER 6.0 1.0
    Draw-Text $c "SHA-256 Cryptographic Hash:" $fBody $global:COL_TEXT_SECONDARY ($drawerX + 35) 430.0
    Draw-Text $c "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" $fMono $global:COL_NAVY ($drawerX + 35) 455.0

    # Extracted Text Box
    Draw-Text $c "EXTRACTED VERIFIED TEXT SNIPPET:" $fH2 $global:COL_NAVY ($drawerX + 25) 505.0
    $snip = "`"Any discretionary capital reallocation exceeding $250,000 must receive prior authorization from both the Division Chief Financial Officer and an Executive Vice President. The transaction must specify target general ledger account codes and cost center allocations.`""
    Draw-Card $c ($drawerX + 25) 530.0 ($drawerW - 50) 130.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.0
    Draw-TextBox $c $snip $fBody $global:COL_NAVY ($drawerX + 40) 545.0 ($drawerW - 80) 100.0

    # RRF Scoring Breakdown
    Draw-Text $c "HYBRID RETRIEVAL METRICS:" $fH2 $global:COL_NAVY ($drawerX + 25) 680.0
    $metrics = @(
        @{ Label = "Semantic Vector Cosine"; Score = "0.924" },
        @{ Label = "BM25 Keyword Frequency"; Score = "0.891" },
        @{ Label = "Reciprocal Rank Fusion (RRF)"; Score = "0.942 (Rank #1)" }
    )
    $metY = 710.0
    foreach ($mt in $metrics) {
        Draw-Text $c $mt.Label $fBody $global:COL_NAVY ($drawerX + 25) $metY
        Draw-Badge $c ($drawerX + 440) ($metY - 3) $mt.Score $global:COL_GREEN_BG $global:COL_GREEN 9.0 | Out-Null
        $metY += 36.0
    }

    # Action Buttons
    Draw-Button $c ($drawerX + 25) 860.0 250.0 42.0 "Export Audit Proof (JSON)" $global:COL_BLUE
    Draw-Button $c ($drawerX + 300) 860.0 250.0 42.0 "Inspect Full Document" $global:COL_NAVY

    $fTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-4-6-evidence-source-details.png"
}

# --- Figure 4.7: Action Preview or Approval Interface ---
function Render-Figure-4-7 {
    $c = New-Canvas 1600 1000 "#F8FAFC"
    Draw-AppHeader $c "Apex Capital (Finance)" "Sarah Vance"
    Draw-Sidebar $c "Governed Actions"

    # Semi-transparent modal backdrop overlay
    $bOverlay = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(180, 11, 31, 58))
    $c.Graphics.FillRectangle($bOverlay, 0, 0, 1600, 1000)
    $bOverlay.Dispose()

    $fModalTitle = New-Object System.Drawing.Font "Segoe UI", 16.0, ([System.Drawing.FontStyle]::Bold)
    $fH2 = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fBody = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Regular)
    $fMono = New-Object System.Drawing.Font "Consolas", 9.5, ([System.Drawing.FontStyle]::Regular)

    # Modal Box (Centered: x: 300, y: 100, w: 1000, h: 800)
    $mX = 300.0; $mY = 100.0; $mW = 1000.0; $mH = 800.0
    Draw-Card $c $mX $mY $mW $mH $global:COL_SURFACE $global:COL_RED 12.0 2.5

    # Modal Header
    Draw-Badge $c ($mX + 35) ($mY + 30) "TIER 3: CRITICAL GOVERNED ACTION" $global:COL_RED_BG $global:COL_RED 10.0 | Out-Null
    Draw-Badge $c ($mX + 340) ($mY + 30) "TWO-PERSON CONSENSUS GATE" $global:COL_AMBER_BG $global:COL_AMBER 10.0 | Out-Null
    Draw-Text $c "Financial Budget Mutation Authorization Request" $fModalTitle $global:COL_NAVY ($mX + 35) ($mY + 65)
    Draw-Text $c "Action ID: ACT-2026-9912 | Target: SAP ERP Production GL | Workspace: Apex Capital (Finance)" $fMono $global:COL_TEXT_SECONDARY ($mX + 35) ($mY + 100)

    # Summary Strip
    Draw-Card $c ($mX + 35) ($mY + 130) ($mW - 70) 70.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 8.0 1.0
    Draw-Text $c "PROPOSED TRANSACTION: Reallocate $450,000.00 USD from Cost Center 402 to Cost Center 710" $fH2 $global:COL_BLUE ($mX + 50) ($mY + 145)
    Draw-Text $c "Grounded in Evidence: CIT-FIN-2026-0842 (CapEx Policy §4.2) & SAP Ledger Sync #902" $fBody $global:COL_NAVY ($mX + 50) ($mY + 168)

    # Side-by-Side Diff Preview
    Draw-Text $c "STATE MUTATION DIFF (PREVIEW):" $fH2 $global:COL_NAVY ($mX + 35) ($mY + 220)

    # Left: Current State
    Draw-Card $c ($mX + 35) ($mY + 245) 440.0 160.0 $global:COL_BG $global:COL_BORDER 6.0 1.0
    Draw-Text $c "CURRENT PRODUCTION STATE" $fH2 $global:COL_NAVY ($mX + 50) ($mY + 260)
    Draw-Text $c "Cost Center 402 (Unallocated CapEx):`n  Available Balance: $1,200,000.00 USD`n`nCost Center 710 (Cloud Infrastructure):`n  Current Allocation: $850,000.00 USD" $fMono $global:COL_TEXT_SECONDARY ($mX + 50) ($mY + 290)

    # Right: Proposed State (After mutation)
    Draw-Card $c ($mX + 525) ($mY + 245) 440.0 160.0 $global:COL_GREEN_BG $global:COL_GREEN 6.0 1.5
    Draw-Text $c "PROPOSED MUTATION STATE (AFTER EXECUTION)" $fH2 $global:COL_GREEN ($mX + 540) ($mY + 260)
    Draw-Text $c "Cost Center 402 (Unallocated CapEx):`n  Post-Transfer Balance: $750,000.00 USD (-$450k)`n`nCost Center 710 (Cloud Infrastructure):`n  Post-Transfer Allocation: $1,300,000.00 USD (+$450k)" $fMono $global:COL_NAVY ($mX + 540) ($mY + 290)

    # Two-Person Signers Status Box
    Draw-Text $c "TWO-PERSON CONSENSUS SIGN-OFF STATUS:" $fH2 $global:COL_NAVY ($mX + 35) ($mY + 425)

    Draw-Card $c ($mX + 35) ($mY + 450) ($mW - 70) 120.0 $global:COL_BG $global:COL_BORDER 8.0 1.0

    # Signer 1
    Draw-Card $c ($mX + 55) ($mY + 465) 420.0 85.0 $global:COL_SURFACE $global:COL_GREEN 6.0 1.2
    Draw-Text $c "Signer 1: Sarah Vance (Division CFO)" $fH2 $global:COL_NAVY ($mX + 70) ($mY + 478)
    Draw-Badge $c ($mX + 70) ($mY + 505) "CONFIRMED (SIGNED)" $global:COL_GREEN_BG $global:COL_GREEN 8.5 | Out-Null
    Draw-Text $c "Sig: 0x8F92...C14 | 12:15:30 UTC" $fMono $global:COL_TEXT_MUTED ($mX + 225) ($mY + 510)

    # Signer 2
    Draw-Card $c ($mX + 515) ($mY + 465) 420.0 85.0 $global:COL_SURFACE $global:COL_AMBER 6.0 1.2
    Draw-Text $c "Signer 2: Marcus Sterling (EVP Operations)" $fH2 $global:COL_NAVY ($mX + 530) ($mY + 478)
    Draw-Badge $c ($mX + 530) ($mY + 505) "AWAITING AUTHORIZATION" $global:COL_AMBER_BG $global:COL_AMBER 8.5 | Out-Null
    Draw-Text $c "Challenge SMS/MFA Sent" $fMono $global:COL_TEXT_MUTED ($mX + 710) ($mY + 510)

    # Step-Up MFA Challenge
    Draw-Text $c "STEP-UP ENTERPRISE MFA VERIFICATION CODE:" $fH2 $global:COL_NAVY ($mX + 35) ($mY + 595)
    $mfaX = $mX + 35.0
    $code = @("4", "8", "1", "0", "9", "2")
    foreach ($digit in $code) {
        Draw-Card $c $mfaX ($mY + 625) 45.0 50.0 $global:COL_SURFACE $global:COL_BLUE 6.0 1.5
        Draw-Text $c $digit $fModalTitle $global:COL_NAVY ($mfaX + 13) ($mY + 635)
        $mfaX += 58.0
    }
    Draw-Text $c "Enter 6-digit TOTP token generated by Okta Verify or Duo Security." $fBody $global:COL_TEXT_SECONDARY ($mX + 410) ($mY + 640)

    # Action Buttons
    Draw-Button $c ($mX + 35) ($mY + 715) 220.0 50.0 "Reject / Cancel" $global:COL_RED
    Draw-Button $c ($mX + 580) ($mY + 715) 385.0 50.0 "Authorize and Commit to SAP ERP" $global:COL_GREEN

    $fModalTitle.Dispose(); $fH2.Dispose(); $fBody.Dispose(); $fMono.Dispose()
    Save-Canvas $c "$outputDir\figure-4-7-action-preview-approval.png"
}

Write-Host "Rendering Group B Interface figures (4.1 to 4.7)..."
Render-Figure-4-1
Render-Figure-4-2
Render-Figure-4-3
Render-Figure-4-4
Render-Figure-4-5
Render-Figure-4-6
Render-Figure-4-7
Write-Host "All Group B Interface figures rendered successfully!"
