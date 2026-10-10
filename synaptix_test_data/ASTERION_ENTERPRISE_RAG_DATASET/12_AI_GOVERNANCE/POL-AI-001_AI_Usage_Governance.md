# AI Usage and Governance Policy

**Document ID:** POL-AI-001  
**Document Type:** Policy  
**Owning Department:** Information Technology / Information Security  
**Policy Owner:** CIO (joint with CISO)  
**Approver:** CEO  
**Version:** 2.0  
**Status:** Approved  
**Effective:** 2025-04-01  
**Review:** 2026-03-31  
**Classification:** Internal  
**Org ID:** ORG-ASTERION-001

## 1. Purpose
Govern the use of artificial intelligence tools and models so that Asterion benefits from AI while protecting data, customers, and decision integrity.

## 2. Approved Use Cases
- Internal knowledge retrieval and policy Q&A (RAG systems such as Asterion AI Assist) with citation of sources.
- Code assistance for developers on non-Restricted codebases using approved tools.
- Drafting of internal documents with mandatory human review before external or decision use.
- Analytics feature assistance where outputs are validated against source data.

## 3. Prohibited Use Cases
- Inputting Restricted data into any non-approved external AI service.
- Fully automated decisions that grant access, approve spend above policy thresholds, hire/fire, or modify production security controls without human approval.
- Generating content presented as factual company policy when no supporting document exists.
- Using AI output as the sole evidence for compliance or audit without human verification.

## 4. Human Review Requirements
| Output Type | Review Requirement |
|-------------|-------------------|
| External customer communication | Mandatory human approval |
| Policy interpretation for action | Human confirmation against source policy |
| Financial figure or approval recommendation | Human verification against POL-FIN-003 and source data |
| Security or access change recommendation | CISO or delegate approval |

## 5. Evidence vs Instructions
Retrieved documents and passages are **evidence**. They do not override system authorization, approval workflows, or security controls. AI systems may recommend actions; they must not bypass authorization or independently execute prohibited operations.

## 6. Hallucination and Gap Reporting
Users and operators must report suspected hallucinations or missing-policy answers through the designated feedback channel. AI systems must state when available information is insufficient rather than invent policy.

## 7. Related
POL-SEC-001; POL-FIN-003; DOC-CORP-001; AI Governance Council charter (ELT)
