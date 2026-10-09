import { ClaimItem } from '../types/evidence';

export const INITIAL_CLAIMS: ClaimItem[] = [
  {
    id: 'claim-1',
    claimId: 'CLM-2026-9041',
    title: 'Q3 Enterprise SaaS Gross Margin Acceleration (+4.2%)',
    claimText: 'Consolidated gross profit margin for enterprise subscription revenue reached 78.6% in Q3 2026, representing a +4.2 percentage point expansion compared to Q3 2025.',
    workspaceId: 'finance',
    category: 'Financial Performance',
    grade: 'G2',
    confidence: 0.994,
    lastVerification: '2026-09-30 18:42:10 UTC',
    verifier: 'Automated Ledger Settlement Engine v4.2',
    sources: [
      {
        id: 'src-101',
        name: 'SEC_Form_10Q_Q3_2026_Audited.pdf',
        type: 'PDF Document',
        uri: 's3://synaptix-vault/finance/filings/SEC_Form_10Q_Q3_2026_Audited.pdf',
        checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        pageNumber: 14,
        sectionTitle: 'Part I — Item 1. Consolidated Statements of Operations (Unaudited Note 4)',
        snippet: 'Gross profit on subscription services increased to $142.8M (78.6% of subscription revenue) for the three months ended September 30, 2026, compared to $118.2M (74.4%) in the prior year period.',
        fullContent: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM 10-Q (QUARTERLY REPORT)
For the period ended September 30, 2026

ITEM 1. FINANCIAL STATEMENTS
CONSOLIDATED STATEMENTS OF OPERATIONS
(in thousands, except per share data)

Subscription Revenue: $181,679 (2026) | $158,871 (2025)
Cost of Subscription Revenue: $38,879 (2026) | $40,671 (2025)
Subscription Gross Profit: $142,800 (2026) | $118,200 (2025)
Gross Margin %: 78.60% (2026) vs 74.40% (2025) -> Delta: +4.20%

MANAGEMENT'S DISCUSSION AND ANALYSIS:
Gross profit on subscription services increased to $142.8M (78.6% of subscription revenue) for the three months ended September 30, 2026, compared to $118.2M (74.4%) in the prior year period. The margin acceleration was driven by compute cost optimizations across multi-region infrastructure and automated tier-migration.`,
        timestamp: '2026-09-30T17:30:00Z',
        authoritativeRating: 'High',
      },
      {
        id: 'src-102',
        name: 'General_Ledger_Q3_2026_Settled.xlsx',
        type: 'Financial Ledger',
        uri: 's3://synaptix-vault/finance/ledgers/GL_Q3_2026_Settled.xlsx',
        checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        rowNumber: 8421,
        sectionTitle: 'Sheet: Account_4010_Sub_Margin_Summary',
        snippet: 'Row 8421: ACC_4010_SUB_REV = $181,679,210.42 | ACC_5010_COGS_SUB = $38,879,112.18 | MarginRatio = 0.786001',
        fullContent: `[LEDGER EXPORT — SAP S/4HANA ERP RECONCILIATION]
TIMESTAMP: 2026-09-30 23:59:59 UTC
BATCH ID: GL-BATCH-2026-Q3-FINAL
STATUS: RECONCILED & LOCKED

Row 8420: ACC_4000_PRO_SERVICES | DR: $0 | CR: $24,119,400.00 | Net: $24,119,400.00
Row 8421: ACC_4010_SUB_REV | DR: $0 | CR: $181,679,210.42 | Net: $181,679,210.42
Row 8422: ACC_5010_COGS_SUB | DR: $38,879,112.18 | CR: $0 | Net: -$38,879,112.18
Row 8423: ACC_5020_COGS_SERVICES | DR: $19,400,220.00 | CR: $0 | Net: -$19,400,220.00

SUMMARY CHECK:
Gross Margin = ($181,679,210.42 - $38,879,112.18) / $181,679,210.42 = 78.6001%
Discrepancy vs Filing: $0.000 (Exact Match)`,
        timestamp: '2026-09-30T18:00:00Z',
        authoritativeRating: 'Direct Ledger',
      }
    ],
    supportingPassages: [
      {
        id: 'psg-1',
        sourceId: 'src-101',
        sourceName: 'SEC_Form_10Q_Q3_2026_Audited.pdf (Page 14)',
        text: 'Gross profit on subscription services increased to $142.8M (78.6% of subscription revenue) for the three months ended September 30, 2026, compared to $118.2M (74.4%) in the prior year period.',
        location: 'Page 14, Paragraph 2, MD&A Section',
        relevanceScore: 0.998,
        highlightedTokens: ['78.6%', 'subscription revenue', '+4.2% expansion', '$142.8M']
      },
      {
        id: 'psg-2',
        sourceId: 'src-102',
        sourceName: 'General_Ledger_Q3_2026_Settled.xlsx (Row 8421)',
        text: 'ACC_4010_SUB_REV ($181,679,210.42) vs ACC_5010_COGS_SUB ($38,879,112.18) yields exactly 78.6001% gross margin.',
        location: 'Row 8421, Column G (Calculated Margin)',
        relevanceScore: 0.995,
        highlightedTokens: ['78.6001%', 'Settled', 'Exact Match']
      }
    ],
    verification: {
      verifiedAt: '2026-09-30 18:42:10 UTC',
      verifiedBy: 'Automated Settlement Engine & Senior Compliance Auditor',
      method: 'Execution Proof Log',
      status: 'passed',
      proofDetails: 'Cryptographic hash chain validated against SEC EDGAR submission checksum and ERP SAP GL immutable transaction block #8921104.',
      auditSignature: 'SIG_EDGAR_ERP_MATCH_9a4f882b',
    },
    relatedActions: [
      {
        id: 'act-201',
        name: 'Automated Revenue Recognition Journal Posting #994',
        type: 'ERP Journal Execution',
        status: 'Completed',
        executedAt: '2026-09-30 18:30:00 UTC',
        impactSummary: 'Posted $181.68M subscription revenue to closed period ledger with 0 reconciliation errors.'
      },
      {
        id: 'act-202',
        name: 'Sync Financial Dashboard Widget #14',
        type: 'Dashboard KPI Refresh',
        status: 'Completed',
        executedAt: '2026-09-30 18:45:00 UTC',
        impactSummary: 'Updated Executive Board KPI Card with certified 78.6% gross margin.'
      }
    ],
    correctionHistory: [
      {
        id: 'cor-1',
        timestamp: '2026-09-28 14:10:00 UTC',
        changedBy: 'Financial Parser Worker',
        previousGrade: 'G0',
        newGrade: 'G1',
        reason: 'Extracted initial draft margin of 78.2% from preliminary flash report, verified up to 78.6% upon receiving finalized reconciliation.'
      },
      {
        id: 'cor-2',
        timestamp: '2026-09-30 18:42:10 UTC',
        changedBy: 'Ledger Settlement Automator',
        previousGrade: 'G1',
        newGrade: 'G2',
        reason: 'Promoted to G2 (Action-Proven) after successful posting and two-way cryptographic match against settled bank ledger rows.'
      }
    ]
  },
  {
    id: 'claim-2',
    claimId: 'CLM-2026-8819',
    title: 'Cloud Compute Infrastructure Cost Reduction (-18.4% YoY)',
    claimText: 'Migrating backend telemetry ingest to ARM64 Graviton instances reduced raw cloud compute expenditure from $4.1M in Q2 to $3.35M in Q3 2026.',
    workspaceId: 'finance',
    category: 'Operational Compliance',
    grade: 'G1',
    confidence: 0.942,
    lastVerification: '2026-10-01 09:15:22 UTC',
    verifier: 'Cloud FinOps Ingestion Pipeline',
    sources: [
      {
        id: 'src-103',
        name: 'AWS_Detailed_Billing_Report_Sep2026.csv',
        type: 'SQL Dataset',
        uri: 's3://synaptix-vault/infrastructure/billing/AWS_CUR_2026_09.csv',
        checksum: 'sha256:3d8a7c29e1f549ab1209ccbbef8193021183aa621980312389ddffaa89104052',
        rowNumber: 124900,
        sectionTitle: 'Service: Amazon Elastic Compute Cloud (EC2)',
        snippet: 'Total Monthly Incurred Cost (EC2 + Savings Plans): $3,346,819.12 vs Jun 2026 $4,102,400.80 (-18.42%)',
        fullContent: `[AWS COST AND USAGE REPORT - SEPTEMBER 2026]
PayerAccountId: 991823901231
Total Spend: $3,346,819.12
Instance Type Breakdown:
- c7g.8xlarge (Graviton3): $1,420,000 (42.4%)
- r7g.16xlarge (Graviton3): $980,000 (29.3%)
- Legacy x86 instances: $946,819 (28.3%)

SAVINGS COMPARISON:
June 2026 (Pre-migration): $4,102,400.80
September 2026: $3,346,819.12
Absolute Reduction: -$755,581.68 (-18.418%)`,
        timestamp: '2026-10-01T08:00:00Z',
        authoritativeRating: 'High',
      }
    ],
    supportingPassages: [
      {
        id: 'psg-3',
        sourceId: 'src-103',
        sourceName: 'AWS_Detailed_Billing_Report_Sep2026.csv (Row 124,900)',
        text: 'Total Monthly Incurred Cost (EC2 + Savings Plans): $3,346,819.12 vs Jun 2026 $4,102,400.80 (-18.42%).',
        location: 'Row 124900, Summary Column B',
        relevanceScore: 0.984,
        highlightedTokens: ['-18.42%', '$3,346,819.12', 'June 2026', 'September 2026']
      }
    ],
    verification: {
      verifiedAt: '2026-10-01 09:15:22 UTC',
      verifiedBy: 'Cloud FinOps Ingestion Pipeline',
      method: 'Multi-Source Cross-Check',
      status: 'passed',
      proofDetails: 'Cross-checked against CloudWatch metric telemetry usage and AWS Organizations automated invoice invoice_id: #INV-99210-AWS.',
      auditSignature: 'SIG_AWS_FINOPS_38810cba',
    },
    relatedActions: [
      {
        id: 'act-203',
        name: 'Auto-Resize EC2 Reservation Allocation',
        type: 'Cloud Infrastructure Adjustment',
        status: 'Completed',
        executedAt: '2026-10-01 10:00:00 UTC',
        impactSummary: 'Purchased 1-year Savings Plan for Graviton fleet locking in an additional 6% margin discount.'
      }
    ],
    correctionHistory: [
      {
        id: 'cor-3',
        timestamp: '2026-10-01 09:15:22 UTC',
        changedBy: 'FinOps Orchestrator',
        previousGrade: 'G0',
        newGrade: 'G1',
        reason: 'Verified raw CSV telemetry against final monthly statement from AWS billing portal.'
      }
    ]
  },
  {
    id: 'claim-3',
    claimId: 'CLM-2026-7492',
    title: 'Vendor Contract Renewal Cap Exceeded by Apex Logistics (+14.8%)',
    claimText: 'Apex Logistics quarterly invoices totaled $1.32M against an authorized quarterly contract ceiling of $1.15M, exceeding contractual threshold by $170,000 without prior change order approval.',
    workspaceId: 'finance',
    category: 'Contractual Obligation',
    grade: 'Contradicted',
    confidence: 0.891,
    lastVerification: '2026-10-02 14:22:05 UTC',
    verifier: 'Procurement Audit Reviewer',
    contradictionReason: 'Claim originally flagged Apex Logistics for over-billing; however, Addendum #4 (signed August 12, 2026) retroactively raised the quarterly cap to $1.40M to accommodate sudden supply chain volume surges. The invoices are fully compliant.',
    sources: [
      {
        id: 'src-104',
        name: 'Master_Services_Agreement_Apex_2025.pdf',
        type: 'PDF Document',
        uri: 's3://synaptix-vault/legal/contracts/MSA_Apex_Logistics_2025.pdf',
        checksum: 'sha256:91280ab4418290ccbd8812993041920847120938491028301928409182309182',
        pageNumber: 8,
        sectionTitle: 'Section 4.2 — Maximum Quarterly Authorization Limits',
        snippet: 'Total fees payable to Service Provider under this Statement of Work shall not exceed $1,150,000 per fiscal quarter without written amendment.',
        fullContent: `MASTER SERVICES AGREEMENT - APEX LOGISTICS
SECTION 4.2: Maximum Quarterly Authorization Limits
Total fees payable to Service Provider under this Statement of Work shall not exceed $1,150,000 per fiscal quarter without written amendment. In the event invoices exceed this threshold, the billing department must suspend excess disbursements until a formal Change Order is executed.`,
        timestamp: '2025-01-10T12:00:00Z',
        authoritativeRating: 'Secondary',
      },
      {
        id: 'src-105',
        name: 'Apex_MSA_Addendum_04_Signed.pdf',
        type: 'PDF Document',
        uri: 's3://synaptix-vault/legal/contracts/Apex_MSA_Addendum_04_Signed.pdf',
        checksum: 'sha256:aa91284709128401928301928301928301928301928301928301928301928301',
        pageNumber: 2,
        sectionTitle: 'Addendum 4 — Expansion of Quarterly Volume Allowance',
        snippet: 'Effective August 1, 2026, Section 4.2 is amended to increase the quarterly authorization cap from $1,150,000 to $1,400,000 for Q3 and Q4 2026.',
        fullContent: `CONTRACT AMENDMENT / ADDENDUM #4
PARTY A: Synaptix Command Enterprise
PARTY B: Apex Logistics Global Services LLC
DATE: August 12, 2026

Recital: Due to unanticipated regional freight volume surges, the parties agree to modify Section 4.2 of the Master Services Agreement.
Amendment: Effective August 1, 2026, Section 4.2 is amended to increase the quarterly authorization cap from $1,150,000 to $1,400,000 for Q3 and Q4 2026. All other terms remain in full effect.

EXECUTED BY:
[Signed] Chief Procurement Officer
[Signed] VP Sales, Apex Logistics`,
        timestamp: '2026-08-12T16:00:00Z',
        authoritativeRating: 'High',
      }
    ],
    supportingPassages: [
      {
        id: 'psg-4',
        sourceId: 'src-104',
        sourceName: 'Master_Services_Agreement_Apex_2025.pdf (Page 8)',
        text: 'Total fees payable to Service Provider under this Statement of Work shall not exceed $1,150,000 per fiscal quarter without written amendment.',
        location: 'Page 8, Section 4.2',
        relevanceScore: 0.720,
        highlightedTokens: ['$1,150,000', 'exceed', 'without written amendment']
      },
      {
        id: 'psg-5',
        sourceId: 'src-105',
        sourceName: 'Apex_MSA_Addendum_04_Signed.pdf (Page 2)',
        text: 'Effective August 1, 2026, Section 4.2 is amended to increase the quarterly authorization cap from $1,150,000 to $1,400,000 for Q3 and Q4 2026.',
        location: 'Page 2, Operative Amendment Clause',
        relevanceScore: 0.999,
        highlightedTokens: ['$1,400,000', 'amended', 'August 1, 2026']
      }
    ],
    verification: {
      verifiedAt: '2026-10-02 14:22:05 UTC',
      verifiedBy: 'Legal Compliance AI & Senior Counsel',
      method: 'Multi-Source Cross-Check',
      status: 'failed',
      proofDetails: 'Claim invalidated: Addendum #4 supersedes original 2025 MSA cap. The invoiced $1.32M is below the amended $1.40M cap.',
      auditSignature: 'SIG_CONTRADICTION_VOID_e9812a4b',
    },
    relatedActions: [
      {
        id: 'act-204',
        name: 'Release Injunction on Vendor Payment Batch #441',
        type: 'Accounts Payable Unfreeze',
        status: 'Completed',
        executedAt: '2026-10-02 14:30:00 UTC',
        impactSummary: 'Removed payment hold on $1.32M wire following proof of signed contract Addendum #4.'
      }
    ],
    correctionHistory: [
      {
        id: 'cor-4',
        timestamp: '2026-09-29 11:00:00 UTC',
        changedBy: 'Invoice Rule Extractor',
        previousGrade: 'G0',
        newGrade: 'G1',
        reason: 'Initial extraction from 2025 base contract flagged an overage violation of $170k.'
      },
      {
        id: 'cor-5',
        timestamp: '2026-10-02 14:22:05 UTC',
        changedBy: 'Legal Contract Reviewer',
        previousGrade: 'G1',
        newGrade: 'Contradicted',
        reason: 'Downgraded to CONTRADICTED after discovering and indexing Addendum #4 which raised the limit to $1.40M.'
      }
    ]
  },
  {
    id: 'claim-4',
    claimId: 'CLM-2026-6104',
    title: 'Projected Q4 Customer Retention Rate (94.5% Estimated)',
    claimText: 'Early cohort renewal intent scores and telemetry NPS indicators project an aggregate customer net retention rate of 94.5% (±1.2%) for Q4 2026.',
    workspaceId: 'finance',
    category: 'Revenue Metric',
    grade: 'G0',
    confidence: 0.685,
    lastVerification: '2026-10-03 06:12:00 UTC',
    verifier: 'Predictive Cohort Extraction Worker',
    sources: [
      {
        id: 'src-106',
        name: 'CSAT_Cohort_Survey_Draft_Oct2026.docx',
        type: 'PDF Document',
        uri: 's3://synaptix-vault/research/surveys/CSAT_Cohort_Oct2026.docx',
        checksum: 'sha256:5501824701293810293847192837491823749182374918237491823749182374',
        pageNumber: 3,
        sectionTitle: 'Section 2 — Preliminary Survey Aggregation',
        snippet: 'Preliminary feedback from 140 enterprise accounts indicates a net renewal propensity of 94.5%, pending full quarterly cohort survey completion.',
        fullContent: `CUSTOMER SUCCESS QUARTERLY FORECAST NOTE
Document Status: DRAFT / IN PROGRESS
Sample Size: 140 / 680 enterprise logos surveyed

Preliminary feedback from 140 enterprise accounts indicates a net renewal propensity of 94.5%, pending full quarterly cohort survey completion. Unweighted variance is currently ±3.8%.`,
        timestamp: '2026-10-03T05:30:00Z',
        authoritativeRating: 'Self-Reported',
      }
    ],
    supportingPassages: [
      {
        id: 'psg-6',
        sourceId: 'src-106',
        sourceName: 'CSAT_Cohort_Survey_Draft_Oct2026.docx (Page 3)',
        text: 'Preliminary feedback from 140 enterprise accounts indicates a net renewal propensity of 94.5%, pending full quarterly cohort survey completion.',
        location: 'Page 3, Section 2',
        relevanceScore: 0.820,
        highlightedTokens: ['Preliminary feedback', '94.5%', 'pending full quarterly cohort survey']
      }
    ],
    verification: {
      verifiedAt: '2026-10-03 06:12:00 UTC',
      verifiedBy: 'Predictive Cohort Extraction Worker',
      method: 'Cryptographic Hash Match',
      status: 'inconclusive',
      proofDetails: 'Source is an unfinalized draft survey document (sample size < 25% of active accounts). Awaiting quarterly close data.',
      auditSignature: 'SIG_UNVERIFIED_PREVIEW_7719ab10',
    },
    relatedActions: [
      {
        id: 'act-205',
        name: 'Schedule Q4 Final Cohort Survey Dispatch',
        type: 'Automated Outreach Workflow',
        status: 'Pending Approval',
        executedAt: 'Scheduled for 2026-10-15',
        impactSummary: 'Will poll remaining 540 enterprise accounts to elevate claim to G1 Verified.'
      }
    ],
    correctionHistory: [
      {
        id: 'cor-6',
        timestamp: '2026-10-03 06:12:00 UTC',
        changedBy: 'Cohort Ingestion Pipeline',
        previousGrade: 'G0',
        newGrade: 'G0',
        reason: 'Ingested raw claim from draft CSAT survey. Flagged as G0 (Extracted / Unverified) due to incomplete cohort sample size.'
      }
    ]
  },
  {
    id: 'claim-5',
    claimId: 'CLM-2026-5520',
    title: 'Data Privacy Standard ISO/IEC 27001:2022 Recertification',
    claimText: 'Enterprise telemetry pipeline and cryptographic key escrow architecture achieved complete zero-non-conformity recertification under ISO/IEC 27001:2022 standards.',
    workspaceId: 'finance',
    category: 'System Anomaly',
    grade: 'G1',
    confidence: 0.998,
    lastVerification: '2026-09-25 11:30:00 UTC',
    verifier: 'External BSI Auditor & SOC2 Compliance Pipeline',
    sources: [
      {
        id: 'src-107',
        name: 'BSI_Audit_Report_ISO27001_2026.pdf',
        type: 'Audit Log',
        uri: 's3://synaptix-vault/compliance/reports/BSI_ISO27001_Final_2026.pdf',
        checksum: 'sha256:d41d8cd98f00b204e9800998ecf8427e99128301928301928301928301928301',
        pageNumber: 1,
        sectionTitle: 'Executive Audit Finding Statement',
        snippet: 'Certificate No. IS 719201 issued with zero major and zero minor non-conformities identified across all 93 Annex A security controls.',
        fullContent: `BRITISH STANDARDS INSTITUTION (BSI)
CERTIFICATE OF REGISTRATION
Information Security Management System - ISO/IEC 27001:2022
Certificate No: IS 719201
Audit Period: September 15 - September 22, 2026

FINDINGS:
Major Non-Conformities: 0
Minor Non-Conformities: 0
Opportunities for Improvement: 2 (Telemetry cold storage rotation interval)

CONCLUSION:
The Information Security Management System complies with all mandatory requirements of ISO/IEC 27001:2022. Recertification is granted with immediate effect for a 3-year term.`,
        timestamp: '2026-09-25T10:00:00Z',
        authoritativeRating: 'High',
      }
    ],
    supportingPassages: [
      {
        id: 'psg-7',
        sourceId: 'src-107',
        sourceName: 'BSI_Audit_Report_ISO27001_2026.pdf (Page 1)',
        text: 'Certificate No. IS 719201 issued with zero major and zero minor non-conformities identified across all 93 Annex A security controls.',
        location: 'Page 1, Findings Section',
        relevanceScore: 0.999,
        highlightedTokens: ['Certificate No. IS 719201', 'zero major and zero minor non-conformities', 'ISO/IEC 27001:2022']
      }
    ],
    verification: {
      verifiedAt: '2026-09-25 11:30:00 UTC',
      verifiedBy: 'External BSI Lead Auditor & Enterprise SecOps Engine',
      method: 'Multi-Source Cross-Check',
      status: 'passed',
      proofDetails: 'Validated digital certificate cryptographic fingerprint against BSI global trust registry certificate repository.',
      auditSignature: 'SIG_BSI_GLOBAL_TRUST_448109ad',
    },
    relatedActions: [
      {
        id: 'act-206',
        name: 'Publish Trust Center Security Attestation Badge',
        type: 'Public Compliance Registry Update',
        status: 'Completed',
        executedAt: '2026-09-25 12:00:00 UTC',
        impactSummary: 'Refreshed public trust portal and customer enterprise RFP security attestation repository.'
      }
    ],
    correctionHistory: [
      {
        id: 'cor-7',
        timestamp: '2026-09-25 11:30:00 UTC',
        changedBy: 'SecOps Auditor',
        previousGrade: 'G0',
        newGrade: 'G1',
        reason: 'Upgraded from G0 draft to G1 Verified following receipt of countersigned BSI certificate.'
      }
    ]
  }
];
