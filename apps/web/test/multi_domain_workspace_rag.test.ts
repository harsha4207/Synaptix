/**
 * SYNAPTIX COMMAND — Multi-Domain, Workspace-Isolated RAG Test Suite
 *
 * Comprehensive end-to-end automated tests verifying:
 * 1. Independent Workspace RAG configurations (Healthcare, Finance, Education)
 * 2. Multi-domain understanding and specialized terminology expansion
 * 3. Independent document ingestion pipelines with rich metadata preservation
 * 4. Zero-trust workspace vector isolation (Workspace A retrieves only A; Workspace B retrieves only B)
 * 5. Honest empty state handling in unpopulated workspaces (Workspace C returns 0 chunks, never cross-leaks)
 * 6. Protection against cross-workspace direct ID lookups and unauthorized deletions
 * 7. Safe staged re-indexing without cross-tenant interference
 * 8. Complete vector cleanup upon document deletion
 * 9. RBAC permission enforcement (viewer cannot upload/delete; admin can update config)
 * 10. Concurrent multi-workspace document ingestion stability
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ragStore } from '../src/lib/rag/store';
import { workspaceRagConfigService } from '../src/lib/rag/workspaceRagConfig';
import { domainRegistry } from '../src/lib/rag/domainRegistry';
import { multiDomainRetrieval } from '../src/lib/rag/multiDomainRetrieval';
import { ingestionPipeline } from '../src/lib/rag/ingestionPipeline';
import type { SupportedFileType } from '../src/lib/rag/types';

describe('Multi-Domain, Workspace-Isolated RAG Architecture', () => {
  const WS_HEALTHCARE = 'workspace-healthcare';
  const WS_FINANCE = 'workspace-finance';
  const WS_EDUCATION = 'workspace-education';
  const ORG_ID = 'synaptix-enterprise';

  beforeEach(() => {
    ragStore.clearMemory();
    workspaceRagConfigService.clear();
  });

  // ── 1. Workspace Configuration & Multi-Domain Registry ────────────────────
  describe('Workspace RAG Configuration & Domain Understanding', () => {
    it('initializes independent domain-specific RAG configurations per workspace', () => {
      const healthCfg = workspaceRagConfigService.getOrCreateConfig(WS_HEALTHCARE, 'healthcare');
      const finCfg = workspaceRagConfigService.getOrCreateConfig(WS_FINANCE, 'finance');
      const eduCfg = workspaceRagConfigService.getOrCreateConfig(WS_EDUCATION, 'education');

      expect(healthCfg.workspace_id).toBe(WS_HEALTHCARE);
      expect(healthCfg.domain_name).toBe('Healthcare');
      expect(healthCfg.chunking_strategy).toBe('semantic');
      expect(healthCfg.retrieval_strategy).toBe('hybrid');

      expect(finCfg.workspace_id).toBe(WS_FINANCE);
      expect(finCfg.domain_name).toBe('Finance');

      expect(eduCfg.workspace_id).toBe(WS_EDUCATION);
      expect(eduCfg.domain_name).toBe('Education');

      // Configurations are independent entities
      expect(healthCfg.knowledge_base_id).not.toBe(finCfg.knowledge_base_id);
      expect(finCfg.knowledge_base_id).not.toBe(eduCfg.knowledge_base_id);
    });

    it('expands domain-specific terminology based on workspace domain profile', () => {
      const healthDomain = domainRegistry.getDomain('healthcare');
      const finDomain = domainRegistry.getDomain('finance');

      const healthExpansions = domainRegistry.expandDomainTokens('patient clinical protocol compliance', healthDomain);
      expect(healthExpansions).toContain('patient');
      expect(healthExpansions).toContain('clinical');
      expect(healthExpansions).toContain('protocol');

      const finExpansions = domainRegistry.expandDomainTokens('quarterly ebitda revenue reconciliation', finDomain);
      expect(finExpansions).toContain('ebitda');
      expect(finExpansions).toContain('revenue');
      expect(finExpansions).toContain('reconciliation');
    });

    it('supports registering and configuring custom enterprise domains', () => {
      const customDomain = domainRegistry.registerCustomDomain({
        name: 'Aerospace Systems',
        code: 'AEROSPACE',
        description: 'Avionics telemetry, propulsion maintenance and FAA compliance',
        terminologySynonyms: ['avionics', 'telemetry', 'propulsion', 'faa', 'mach'],
        systemPromptInstruction: 'You are an aerospace engineer assistant. Ground all flight metrics in FAA guidelines.',
        complianceFrameworks: ['FAA Part 25', 'DO-178C'],
      });

      expect(customDomain.isCustom).toBe(true);
      const retrieved = domainRegistry.getDomain('AEROSPACE');
      expect(retrieved.name).toBe('Aerospace Systems');
      expect(retrieved.complianceFrameworks).toContain('DO-178C');
    });

    it('allows authorized administrators to update RAG parameters and bumps configuration_version', () => {
      workspaceRagConfigService.getOrCreateConfig(WS_FINANCE, 'finance');
      const updated = workspaceRagConfigService.updateConfig(WS_FINANCE, {
        top_k: 8,
        similarity_threshold: 0.12,
        chunk_size: 800,
        retrieval_strategy: 'semantic_only',
      });

      expect(updated.top_k).toBe(8);
      expect(updated.similarity_threshold).toBe(0.12);
      expect(updated.chunk_size).toBe(800);
      expect(updated.retrieval_strategy).toBe('semantic_only');
      expect(updated.configuration_version).toBe(2);
    });
  });

  // ── 2. Independent Ingestion Pipeline & Metadata Preservation ─────────────
  describe('Independent Document Ingestion Pipeline', () => {
    it('ingests multi-format documents preserving full workspace metadata and chunk isolation', async () => {
      const healthcareDocContent = `
        CLINICAL PROTOCOL CP-904: ONCOLOGY IMMUNOTHERAPY CLINICAL TRIAL
        Primary Investigator: Dr. Eleanor Vance, MD.
        Facility: Synaptix Medical Center, Division of Cellular Therapeutics.
        Protocol Specification: Administer 200mg monoclonal antibody bi-weekly.
        Patient Monitoring: Vital signs and metabolic panels measured at 24h, 48h, and 7 days.
        HIPAA Authorization: Full de-identification protocol strictly verified under 45 CFR 164.514.
      `;

      const healthFile = new File([healthcareDocContent], 'clinical_protocol_cp904.txt', { type: 'text/plain' });
      const { documentId, jobId } = await ingestionPipeline.ingestDocument(healthFile, WS_HEALTHCARE, ORG_ID, {
        userRole: 'admin',
        evidenceGrade: 'G2',
      });

      expect(documentId).toBeDefined();
      expect(jobId).toBeDefined();

      // Verify document record
      const doc = await ragStore.getDocument(documentId, WS_HEALTHCARE);
      expect(doc).not.toBeNull();
      expect(doc?.workspaceId).toBe(WS_HEALTHCARE);
      expect(doc?.filename).toBe('clinical_protocol_cp904.txt');
      expect(doc?.status).toBe('READY');
      expect(doc?.domainName).toBe('Healthcare');

      // Verify chunks and preserved metadata
      const chunks = await ragStore.getChunksByDocument(documentId, WS_HEALTHCARE);
      expect(chunks.length).toBeGreaterThan(0);
      for (const chk of chunks) {
        expect(chk.workspaceId).toBe(WS_HEALTHCARE);
        expect(chk.documentId).toBe(documentId);
        expect(chk.domainId).toBe('domain-healthcare');
        expect(chk.evidenceGrade).toBe('G2');
        expect(chk.contentHash).toBeDefined();
        expect(chk.embedding).toBeDefined();
      }
    });

    it('enforces RBAC upload restrictions (blocks viewers from ingesting documents)', async () => {
      const file = new File(['Some content'], 'unauthorized_file.txt', { type: 'text/plain' });
      await expect(
        ingestionPipeline.ingestDocument(file, WS_HEALTHCARE, ORG_ID, {
          userRole: 'viewer',
        })
      ).rejects.toThrow('Unauthorized: User role "viewer" cannot upload documents');
    });
  });

  // ── 3. Mandatory Workspace Isolation Retrieval Tests ──────────────────────
  describe('Mandatory Workspace Isolation & Zero-Leakage Retrieval', () => {
    let healthDocId: string;
    let finDocId: string;

    beforeEach(async () => {
      // 1. Upload Healthcare Document to Workspace A
      const healthContent = `
        HOSPITAL SURGICAL OPERATING POLICY - STERILIZATION PROTOCOL MED-771
        Department: Surgical Services & Infection Control.
        Surgical Suite autoclave calibration must maintain 134°C at 2.2 bar pressure for 18 minutes.
        Surgical checklist sign-off by head anesthesiologist Dr. Marcus Thorne.
        Emergency Code Blue escalation route: Line 4402 trauma center.
      `;
      const healthFile = new File([healthContent], 'surgical_sterilization_med771.txt', { type: 'text/plain' });
      const resHealth = await ingestionPipeline.ingestDocument(healthFile, WS_HEALTHCARE, ORG_ID, {
        userRole: 'admin',
        evidenceGrade: 'G2',
      });
      healthDocId = resHealth.documentId;

      // 2. Upload Finance Document to Workspace B
      const financeContent = `
        ASTERION ENTERPRISE Q3 CONSOLIDATED FINANCIAL AUDIT REPORT
        Chief Financial Officer: Sarah Vance, CPA.
        Total Q3 Operating Revenue: $84,250,000 USD representing 14.2% YoY expansion.
        EBITDA Margin: 28.4% with gross adjusted profit of $23,927,000 USD.
        Authorized Capital Expenditure (CapEx) ceiling set at $6,500,000 for server infrastructure.
        Approved audit verification by Deloitte under SOX Section 404.
      `;
      const finFile = new File([financeContent], 'q3_financial_audit_report.txt', { type: 'text/plain' });
      const resFin = await ingestionPipeline.ingestDocument(finFile, WS_FINANCE, ORG_ID, {
        userRole: 'admin',
        evidenceGrade: 'G2',
      });
      finDocId = resFin.documentId;

      // 3. Workspace C (Education) remains intentionally empty
    });

    it('queries Workspace A and retrieves ONLY Workspace A content', async () => {
      const res = await multiDomainRetrieval.query({
        query: 'What is the autoclave sterilization calibration and temperature under MED-771?',
        workspaceId: WS_HEALTHCARE,
        organizationId: ORG_ID,
      });

      expect(res.hasSufficientEvidence).toBe(true);
      expect(res.citations.length).toBeGreaterThanOrEqual(1);
      expect(res.answer).toContain('134°C');
      expect(res.citations[0].filename).toBe('surgical_sterilization_med771.txt');

      // Crucial Isolation Invariant: MUST NOT leak any Finance data
      for (const cite of res.citations) {
        expect(cite.filename).not.toContain('financial');
        expect(cite.excerpt).not.toContain('$84,250,000');
        expect(cite.excerpt).not.toContain('EBITDA');
      }
    });

    it('queries Workspace B and retrieves ONLY Workspace B content', async () => {
      const res = await multiDomainRetrieval.query({
        query: 'What was the Q3 operating revenue, EBITDA margin, and CapEx ceiling?',
        workspaceId: WS_FINANCE,
        organizationId: ORG_ID,
      });

      expect(res.hasSufficientEvidence).toBe(true);
      expect(res.citations.length).toBeGreaterThanOrEqual(1);
      expect(res.answer).toContain('$84,250,000');
      expect(res.citations[0].filename).toBe('q3_financial_audit_report.txt');

      // Crucial Isolation Invariant: MUST NOT leak any Healthcare data
      for (const cite of res.citations) {
        expect(cite.filename).not.toContain('surgical');
        expect(cite.excerpt).not.toContain('autoclave');
        expect(cite.excerpt).not.toContain('MED-771');
      }
    });

    it('queries Workspace C (Education, empty) and returns ZERO chunks with honest insufficient evidence state', async () => {
      // Query Workspace C for Healthcare or Finance keywords
      const queryInEdu = await multiDomainRetrieval.query({
        query: 'What was the Q3 operating revenue, EBITDA margin, and autoclave sterilization protocol?',
        workspaceId: WS_EDUCATION,
        organizationId: ORG_ID,
      });

      // Isolation Invariant: Must return zero citations and never silently fall back
      expect(queryInEdu.hasSufficientEvidence).toBe(false);
      expect(queryInEdu.citations).toHaveLength(0);
      expect(queryInEdu.retrievedChunkCount).toBe(0);
      expect(queryInEdu.confidenceLevel).toBe('INSUFFICIENT');
      expect(queryInEdu.answer).toContain('No relevant evidence was found in the Education');
      expect(queryInEdu.answer).not.toContain('$84,250,000');
      expect(queryInEdu.answer).not.toContain('134°C');
    });

    it('rejects cross-workspace document lookup by direct ID', async () => {
      // Lookup Healthcare document from Healthcare workspace -> Success
      const validLookup = await ragStore.getDocument(healthDocId, WS_HEALTHCARE);
      expect(validLookup).not.toBeNull();
      expect(validLookup?.filename).toBe('surgical_sterilization_med771.txt');

      // Cross-workspace lookup: Attempt to access Healthcare document from Finance workspace -> Must return null
      const crossLookup = await ragStore.getDocument(healthDocId, WS_FINANCE);
      expect(crossLookup).toBeNull();

      // Cross-workspace lookup: Attempt to access Finance document from Education workspace -> Must return null
      const crossLookup2 = await ragStore.getDocument(finDocId, WS_EDUCATION);
      expect(crossLookup2).toBeNull();
    });

    it('rejects cross-workspace deletion attempts protecting tenant data integrity', async () => {
      // Attempt to delete Healthcare document while authenticated in Finance workspace
      await expect(
        ingestionPipeline.deleteDocument(healthDocId, WS_FINANCE, 'admin')
      ).rejects.toThrow('not found in workspace');

      // Verify that Healthcare document was NOT deleted and remains intact
      const healthDocStillExists = await ragStore.getDocument(healthDocId, WS_HEALTHCARE);
      expect(healthDocStillExists).not.toBeNull();
      expect(healthDocStillExists?.status).toBe('READY');
    });

    it('re-indexes Workspace A without modifying or disturbing Workspace B', async () => {
      const finChunksBefore = await ragStore.getChunksByWorkspace(WS_FINANCE);
      const finDocsBefore = await ragStore.getDocumentsByWorkspace(WS_FINANCE);

      // Reindex Workspace A (Healthcare)
      const rebuildResult = await ingestionPipeline.reindexWorkspace(WS_HEALTHCARE);
      expect(rebuildResult.reindexedDocs).toBe(1);

      // Verify Workspace B (Finance) chunks and docs remained untouched
      const finChunksAfter = await ragStore.getChunksByWorkspace(WS_FINANCE);
      const finDocsAfter = await ragStore.getDocumentsByWorkspace(WS_FINANCE);

      expect(finChunksAfter.length).toBe(finChunksBefore.length);
      expect(finDocsAfter.length).toBe(finDocsBefore.length);
      expect(finChunksAfter[0].id).toBe(finChunksBefore[0].id);
    });

    it('safely deletes a document and verifies complete chunk removal without residue', async () => {
      // Delete Healthcare document from Healthcare workspace
      await ingestionPipeline.deleteDocument(healthDocId, WS_HEALTHCARE, 'admin');

      // Healthcare document and its chunks must be completely gone
      const healthDocAfter = await ragStore.getDocument(healthDocId, WS_HEALTHCARE);
      expect(healthDocAfter).toBeNull();

      const healthChunksAfter = await ragStore.getChunksByWorkspace(WS_HEALTHCARE);
      expect(healthChunksAfter).toHaveLength(0);

      // Subsequent query in Workspace A returns insufficient evidence
      const queryAfterDelete = await multiDomainRetrieval.query({
        query: 'What is autoclave temperature under MED-771?',
        workspaceId: WS_HEALTHCARE,
        organizationId: ORG_ID,
      });
      expect(queryAfterDelete.hasSufficientEvidence).toBe(false);
      expect(queryAfterDelete.citations).toHaveLength(0);

      // Finance workspace remains completely intact and unaffected
      const finDocStillValid = await ragStore.getDocument(finDocId, WS_FINANCE);
      expect(finDocStillValid).not.toBeNull();
      const finChunksStillValid = await ragStore.getChunksByWorkspace(WS_FINANCE);
      expect(finChunksStillValid.length).toBeGreaterThan(0);
    });

    it('executes automated isolation verification check with 100% pass rate', async () => {
      const isolationReportA = await ragStore.validateIsolation(WS_HEALTHCARE);
      expect(isolationReportA.isIsolated).toBe(true);
      expect(isolationReportA.violations).toHaveLength(0);

      const isolationReportB = await ragStore.validateIsolation(WS_FINANCE);
      expect(isolationReportB.isIsolated).toBe(true);
      expect(isolationReportB.violations).toHaveLength(0);

      const isolationReportC = await ragStore.validateIsolation(WS_EDUCATION);
      expect(isolationReportC.isIsolated).toBe(true);
      expect(isolationReportC.violations).toHaveLength(0);
    });
  });

  // ── 4. Concurrent Multi-Workspace Ingestion ───────────────────────────────
  describe('Concurrent Multi-Workspace Ingestion Stability', () => {
    it('concurrently ingests distinct documents into multiple workspaces without race conditions or cross-contamination', async () => {
      const docHealthPromise = ingestionPipeline.ingestDocument(
        new File(['Patient electronic health record emergency triage data.'], 'patient_triage.txt', { type: 'text/plain' }),
        WS_HEALTHCARE,
        ORG_ID,
        { userRole: 'member', evidenceGrade: 'G1' }
      );

      const docFinPromise = ingestionPipeline.ingestDocument(
        new File(['Corporate balance sheet accounts payable ledger data.'], 'accounts_payable.txt', { type: 'text/plain' }),
        WS_FINANCE,
        ORG_ID,
        { userRole: 'member', evidenceGrade: 'G1' }
      );

      const docEduPromise = ingestionPipeline.ingestDocument(
        new File(['Undergraduate curriculum accreditation standards syllabus.'], 'curriculum_syllabus.txt', { type: 'text/plain' }),
        WS_EDUCATION,
        ORG_ID,
        { userRole: 'member', evidenceGrade: 'G1' }
      );

      // Run all 3 concurrently
      const [resHealth, resFin, resEdu] = await Promise.all([docHealthPromise, docFinPromise, docEduPromise]);

      expect(resHealth.documentId).toBeDefined();
      expect(resFin.documentId).toBeDefined();
      expect(resEdu.documentId).toBeDefined();

      // Verify each workspace owns exactly 1 document and respective chunks
      const healthDocs = await ragStore.getDocumentsByWorkspace(WS_HEALTHCARE);
      const finDocs = await ragStore.getDocumentsByWorkspace(WS_FINANCE);
      const eduDocs = await ragStore.getDocumentsByWorkspace(WS_EDUCATION);

      expect(healthDocs).toHaveLength(1);
      expect(healthDocs[0].filename).toBe('patient_triage.txt');

      expect(finDocs).toHaveLength(1);
      expect(finDocs[0].filename).toBe('accounts_payable.txt');

      expect(eduDocs).toHaveLength(1);
      expect(eduDocs[0].filename).toBe('curriculum_syllabus.txt');

      // Zero-cross contamination check across all 3
      const reportH = await ragStore.validateIsolation(WS_HEALTHCARE);
      const reportF = await ragStore.validateIsolation(WS_FINANCE);
      const reportE = await ragStore.validateIsolation(WS_EDUCATION);

      expect(reportH.isIsolated).toBe(true);
      expect(reportF.isIsolated).toBe(true);
      expect(reportE.isIsolated).toBe(true);
    });
  });
});

