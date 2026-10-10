# Duplicate Invoice Investigation Report
**Aether Dynamics Corp — Finance Operations**  
**Document ID:** FIN-INV-INV-2024-001  
**Date Prepared:** 2025-03-12  
**Prepared by:** Synthetic Finance Controls Team  
**Status:** Closed — Synthetic Test Case

## 1. Executive Summary
Two potential duplicate invoice scenarios were identified during routine AP reconciliation for fiscal periods 2023–2024. Both cases have been flagged for prototype testing of anomaly detection and evidence tracking within SYNAPTIX COMMAND.

## 2. Case A — Exact Invoice Number Reuse
| Field | Occurrence 1 | Occurrence 2 |
|-------|--------------|--------------|
| Invoice Number | INV-2023-1087 | INV-2023-1087 |
| Transaction ID | TXN-10087 | TXN-10222 |
| Vendor | Quantum Parts Supply (VND-1002) | Quantum Parts Supply (VND-1002) |
| Amount | $12,847.50 | $12,847.50 |
| Dates | 2023-08-14 | 2023-08-16 |
| Status | Paid | Pending |

**Root Cause (Synthetic):** Data entry error during system migration test. Second entry created manually without system validation.

**Expected Detection:** Exact match on Invoice_Number + Vendor_ID + Amount.

## 3. Case B — Near-Duplicate with Variance
| Field | Occurrence 1 | Occurrence 2 |
|-------|--------------|--------------|
| Invoice Number | INV-2024-1112 | INV-2024-1112 |
| Transaction ID | TXN-10112 | TXN-10223 |
| Amount | Original | +2% variance |
| Status | Approved | Pending |

**Root Cause (Synthetic):** Partial re-submission after partial credit discussion; second entry not linked to credit memo.

## 4. Recommended Controls
1. Enforce unique Invoice_Number + Vendor_ID constraint at ingestion.
2. Flag any second submission within 14 days of original for same vendor/amount ±3%.
3. Require dual approval for any invoice > $10,000 that matches an existing number.

## 5. Evidence References
- Source file: `Expense_Transactions.csv`
- Source file: `Invoice_Register.xlsx`
- Related policy: `Finance_Approval_Policy.md`

## 6. Synthetic Test Notes
This document intentionally documents planted anomalies for RAG and analytics testing. No real financial loss occurred. All identifiers are fictional.
