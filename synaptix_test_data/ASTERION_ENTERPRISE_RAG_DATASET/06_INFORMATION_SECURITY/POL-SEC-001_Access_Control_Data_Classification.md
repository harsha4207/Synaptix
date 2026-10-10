# Access Control and Data Classification Policy

**Document ID:** POL-SEC-001  
**Document Type:** Policy  
**Owning Department:** Information Security (DEPT-SEC-001)  
**Policy Owner:** CISO (ROLE-CISO-001)  
**Approver:** CEO  
**Version:** 4.1  
**Status:** Approved  
**Effective:** 2025-04-01  
**Review:** 2026-03-31  
**Classification:** Internal  
**Org ID:** ORG-ASTERION-001

## 1. Purpose
Define data classification levels, access principles, authentication requirements, and rules for granting, reviewing, and revoking access.

## 2. Data Classification Levels
| Level | Definition | Examples | Access Rule |
|-------|------------|----------|-------------|
| Public | Approved for external release | Marketing website, published job ads | No restriction |
| Internal | Standard company information for employees | Org charts, internal wikis, non-sensitive policies | Authenticated employees |
| Confidential | Sensitive business or customer data | Customer contracts, financial forecasts, HR records | Role-based + business need; Manager or data-owner approval |
| Restricted | Highest sensitivity | Credentials vaults, M&A materials, security incident details, production secrets | Explicit named authorization by data owner + CISO (or delegate); time-bound |

## 3. Authentication
- All systems: unique user ID; multi-factor authentication (MFA) mandatory for remote access and for any system containing Confidential or Restricted data.
- Privileged accounts: separate admin IDs; MFA; session logging; quarterly access review.

## 4. Access Grant Principles
1. Least privilege.
2. Need-to-know.
3. No standing access to Restricted data without active ticket and expiry date (max 90 days, renewable).
4. Joiner: access provisioned per role template within 1 business day of start after Manager confirmation.
5. Mover: previous access reviewed within 3 business days of role change.
6. Leaver: all access revoked by end of last working day; privileged access revoked at notification of departure.

## 5. Confidential Finance Document Access Example
An employee may access a Confidential Finance document only if:
- Their role is in Finance, ELT, or a specifically authorized project role; **and**
- There is a documented business need; **and**
- Access is approved by the data owner (typically Finance Director or CFO) or via an approved role template; **and**
- The system enforces MFA and audit logging.

Merely asking a question about the document in an AI assistant does **not** constitute authorization to retrieve or display Restricted or Confidential content beyond the user's permitted scope.

## 6. Prohibited Actions
- Sharing credentials.
- Storing Restricted data on personal devices or unapproved cloud services.
- Using unapproved AI tools with Confidential or Restricted data (see POL-AI-001).

## 7. Related
POL-AI-001; POL-SEC-002 Incident Response; SOP-SEC-001 Access Request; POL-HR-005
