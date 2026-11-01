/**
 * SYNAPTIX COMMAND — Multi-Domain Registry & Semantic Understanding
 *
 * Defines domain configurations, specialized terminology dictionaries,
 * compliance frameworks, and domain-grounded prompt templates.
 * Supports built-in enterprise domains and dynamic custom domain additions.
 */

export interface WorkspaceDomain {
  id: string;
  name: string;
  code: string;
  description: string;
  terminologySynonyms: string[];
  systemPromptInstruction: string;
  complianceFrameworks: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BUILT_IN_DOMAINS: Record<string, WorkspaceDomain> = {
  healthcare: {
    id: 'domain-healthcare',
    name: 'Healthcare',
    code: 'HEALTHCARE',
    description: 'Clinical protocols, hospital administrative operations, and HIPAA-compliant patient care analytics',
    terminologySynonyms: [
      'clinical', 'patient', 'hipaa', 'diagnosis', 'protocol', 'pharmaceutical',
      'physician', 'ehr', 'emr', 'trial', 'hospital', 'fda', 'utilization',
      'triage', 'discharge', 'formulary', 'inpatient', 'outpatient', 'vital_signs'
    ],
    systemPromptInstruction: `You are an expert healthcare operations and medical intelligence assistant for the Healthcare workspace. 
Answer questions using only verified healthcare workspace evidence. 
Maintain strict patient privacy (HIPAA compliance), respect clinical boundaries, and preserve medical, drug, and protocol terminology accurately.
If evidence is insufficient, explicitly state that clinical documentation in this workspace does not contain the required information.`,
    complianceFrameworks: ['HIPAA', 'HITECH', 'FDA 21 CFR Part 11', 'SOC2 Type II'],
    isCustom: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },

  finance: {
    id: 'domain-finance',
    name: 'Finance',
    code: 'FINANCE',
    description: 'Financial intelligence, revenue modeling, expenditure auditing, and corporate regulatory compliance',
    terminologySynonyms: [
      'ebitda', 'revenue', 'pnl', 'margin', 'expenditure', 'audit', 'sox', 'gaap',
      'balance_sheet', 'cash_flow', 'procurement', 'ledger', 'variance', 'forecast',
      'fiscal_year', 'q1', 'q2', 'q3', 'q4', 'cost_center', 'reconciliation', 'capex', 'opex'
    ],
    systemPromptInstruction: `You are a senior financial analyst and audit assistant for the Finance workspace. 
Answer questions about revenue, budgets, variance, expenditures, and financial procedures using only retrieved evidence. 
Preserve numerical values, fiscal quarters, currency notations ($/€/£), and percentages exactly without alteration.
If evidence is insufficient, state that the financial repository lacks the requested ledger or transaction records.`,
    complianceFrameworks: ['SOX', 'GAAP', 'IFRS', 'SEC Regulations'],
    isCustom: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },

  education: {
    id: 'domain-education',
    name: 'Education',
    code: 'EDUCATION',
    description: 'Academic curriculum standards, institutional policies, student learning outcomes, and accreditation',
    terminologySynonyms: [
      'curriculum', 'accreditation', 'syllabus', 'faculty', 'gpa', 'student_outcome',
      'pedagogy', 'grading', 'enrollment', 'coursework', 'transcript', 'retention',
      'tuition', 'matriculation', 'degree_requirement', 'tenure', 'academic_board'
    ],
    systemPromptInstruction: `You are an academic intelligence assistant for the Education workspace. 
Answer questions regarding curriculum standards, institutional policies, and student assessment metrics using only authorized workspace records.
Maintain student educational privacy (FERPA compliance) and quote institutional policies faithfully.
If evidence is insufficient, state that educational policy or curriculum documents are not present in this workspace.`,
    complianceFrameworks: ['FERPA', 'Title IX', 'Regional Accreditation Standards'],
    isCustom: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },

  manufacturing: {
    id: 'domain-manufacturing',
    name: 'Manufacturing',
    code: 'MANUFACTURING',
    description: 'Industrial production engineering, quality assurance SOPs, supply chain logistics, and ISO compliance',
    terminologySynonyms: [
      'sop', 'six_sigma', 'quality_control', 'iso9001', 'assembly', 'yield',
      'defect_rate', 'cnc', 'procurement', 'inventory', 'supply_chain', 'tolerance',
      'bill_of_materials', 'bom', 'lead_time', 'downtime', 'calibration', 'batch_record'
    ],
    systemPromptInstruction: `You are an industrial manufacturing operations engineer assistant for the Manufacturing workspace. 
Answer questions on operational workflows, equipment manuals, quality specifications, and defect mitigation using only indexed workspace records.
Ensure technical tolerances, standard operating procedure (SOP) references, and safety codes are cited verbatim.
If evidence is insufficient, state that operational manuals or SOPs for this operation are not indexed.`,
    complianceFrameworks: ['ISO 9001', 'ISO 14001', 'OSHA Safety Guidelines', 'GMP'],
    isCustom: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },

  research: {
    id: 'domain-research',
    name: 'Research',
    code: 'RESEARCH',
    description: 'Scientific literature synthesis, hypothesis testing, clinical trial evaluation, and experimental methodology',
    terminologySynonyms: [
      'hypothesis', 'methodology', 'literature', 'peer_review', 'statistical_significance',
      'p_value', 'findings', 'experiment', 'dataset', 'citation', 'meta_analysis',
      'confidence_interval', 'cohort', 'sample_size', 'reproducibility', 'control_group'
    ],
    systemPromptInstruction: `You are a scientific research intelligence assistant for the Research workspace. 
Analyze literature, methodologies, experimental designs, and empirical findings based strictly on retrieved research evidence. 
Clearly distinguish verified empirical results from speculative hypotheses or secondary inferences.
If evidence is insufficient, report that indexed research publications and datasets do not substantiate the claim.`,
    complianceFrameworks: ['Good Laboratory Practice (GLP)', 'Open Science Framework', 'IRB'],
    isCustom: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },

  business: {
    id: 'domain-business',
    name: 'Business Strategy',
    code: 'BUSINESS',
    description: 'Enterprise competitive positioning, strategic go-to-market planning, vendor management, and organizational policy',
    terminologySynonyms: [
      'strategy', 'market_share', 'gtm', 'vendor', 'contract', 'merger',
      'stakeholder', 'governance', 'procurement', 'kpi', 'okr', 'competitive_advantage',
      'swot', 'market_penetration', 'partnership', 'risk_register', 'operating_model'
    ],
    systemPromptInstruction: `You are an enterprise strategic advisor assistant for the Business Strategy workspace. 
Deliver strategic, market, and organizational insights grounded solely in authorized corporate policy, contracts, and strategic documents.
Preserve business terms, milestone dates, and partner obligations accurately.
If evidence is insufficient, state that the strategy repository lacks documents regarding this strategic inquiry.`,
    complianceFrameworks: ['Corporate Governance Framework', 'SOC2', 'ISO 27001'],
    isCustom: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },
};

export class DomainRegistryService {
  private customDomains: Map<string, WorkspaceDomain> = new Map();

  /**
   * Resolves a domain definition by domain id, name, or code.
   * Defaults to 'business' if not recognized.
   */
  public getDomain(identifier: string): WorkspaceDomain {
    const key = identifier.toLowerCase().trim().replace(/^domain-/, '');
    
    // Check built-in
    if (BUILT_IN_DOMAINS[key]) {
      return BUILT_IN_DOMAINS[key];
    }
    for (const d of Object.values(BUILT_IN_DOMAINS)) {
      if (d.id.toLowerCase() === identifier.toLowerCase() || d.name.toLowerCase() === key || d.code.toLowerCase() === key) {
        return d;
      }
    }

    // Check custom domains
    const custom = this.customDomains.get(key) || this.customDomains.get(identifier);
    if (custom) return custom;

    // Fallback default
    return BUILT_IN_DOMAINS['business'];
  }

  /**
   * Registers a new custom domain dynamically (Administrator action).
   */
  public registerCustomDomain(domain: Omit<WorkspaceDomain, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'> & { id?: string }): WorkspaceDomain {
    const id = domain.id || `domain-${domain.code.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`;
    const now = new Date().toISOString();
    const newDomain: WorkspaceDomain = {
      ...domain,
      id,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };
    this.customDomains.set(id.toLowerCase(), newDomain);
    this.customDomains.set(domain.code.toLowerCase(), newDomain);
    this.customDomains.set(domain.name.toLowerCase(), newDomain);
    return newDomain;
  }

  /**
   * Lists all available domains (built-in + custom).
   */
  public listDomains(): WorkspaceDomain[] {
    const map = new Map<string, WorkspaceDomain>();
    for (const d of Object.values(BUILT_IN_DOMAINS)) {
      map.set(d.id, d);
    }
    for (const d of this.customDomains.values()) {
      map.set(d.id, d);
    }
    return Array.from(map.values());
  }

  /**
   * Expands query tokens using the domain's synonym dictionary.
   */
  public expandDomainTokens(query: string, domain: WorkspaceDomain): string[] {
    const qLower = query.toLowerCase();
    const expansions: string[] = [];
    for (const syn of domain.terminologySynonyms) {
      const synWord = syn.replace(/_/g, ' ');
      if (qLower.includes(synWord) || qLower.includes(syn)) {
        expansions.push(syn);
      }
    }
    return expansions;
  }

  /**
   * Generates a domain-grounded system instruction prompt for foundation models.
   */
  public getSystemPromptForDomain(domain: WorkspaceDomain, workspaceName?: string): string {
    const nameStr = workspaceName ? `the ${workspaceName} workspace` : `the ${domain.name} domain`;
    return `${domain.systemPromptInstruction}\n\nWorkspace Context: You are currently operating inside ${nameStr}. Never access, reference, or extrapolate data from other workspaces. Rely solely on validated evidence.`;
  }
}

export const domainRegistry = new DomainRegistryService();

