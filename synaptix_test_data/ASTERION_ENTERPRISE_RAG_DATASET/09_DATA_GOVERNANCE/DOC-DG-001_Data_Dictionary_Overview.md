# Enterprise Data Dictionary — Overview

**Document ID:** DOC-DG-001  
**Version:** 1.0 | **Status:** Approved | **Effective:** 2025-04-01  
**Owner:** Chief Data Officer | **Org:** ORG-ASTERION-001

## 1. Purpose
Catalog major structured datasets used for analytics and RAG grounding.

## 2. Dataset Index
| Dataset ID | Name | Owner | Classification | Primary Key | Location |
|------------|------|-------|----------------|-------------|----------|
| DS-FIN-001 | Approval Matrix | CFO | Internal | matrix_id | 04_FINANCE_AND_ACCOUNTING/APPROVAL_MATRIX.csv |
| DS-FIN-002 | Expense Claims Sample | CFO | Confidential | claim_id | 13_STRUCTURED_DATASETS/FIN_Expense_Claims_Sample.xlsx |
| DS-HR-001 | Role Catalog | CHRO | Internal | role_id | 02_ORGANIZATION_AND_ROLES/ROLE_CATALOG.csv |
| DS-PRC-001 | Vendor Master | Head of Procurement | Internal | vendor_id | 13_STRUCTURED_DATASETS/VENDOR_MASTER.csv |
| DS-RSK-001 | Risk Register | CISO / Compliance | Confidential | risk_id | 11_RISK_AND_AUDIT/RISK_REGISTER.csv |
| DS-PRJ-001 | Project Master | COO | Internal | project_id | 13_STRUCTURED_DATASETS/PROJECT_MASTER.csv |
| DS-META-001 | Document Metadata | Compliance | Internal | document_id | DOCUMENT_METADATA.csv |

## 3. Data Quality Rules (Global)
- Primary keys unique and non-null.
- Amounts in INR unless currency column present.
- Dates ISO 8601 (YYYY-MM-DD).
- Status values restricted to documented enums.
- synthetic=Yes on all demonstration rows.

## 4. Related
GLOSSARY.csv; POL-SEC-001 classification rules
