import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Database,
  FileCheck2,
  Lock,
  Search,
  CheckCircle2,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  Cpu,
  Clock,
  Terminal,
  Activity,
  UserCheck,
  FileText,
  Building2,
  FolderLock,
  Menu,
  X
} from 'lucide-react';
import { SynaptixLogo } from '../ui/SynaptixLogo';
import { AnimatedHeroBackground } from './AnimatedHeroBackground';

export interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenSignup,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'workspaces' | 'evidence' | 'governed-actions'>('workspaces');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-root">
      {/* 1. STICKY CLEAN WHITE NAVIGATION HEADER */}
      <header className="landing-nav" role="banner">
        <div className="landing-nav-inner">
          <div className="landing-brand-wrap">
            <SynaptixLogo size="md" />
            <div className="landing-brand-divider" aria-hidden="true" />
            <span className="landing-badge-env" aria-label="Enterprise Edition">ENTERPRISE</span>
          </div>

          <nav className="landing-links" aria-label="Main Navigation">
            <a href="#overview" onClick={(e) => scrollToSection(e, 'overview')}>Platform</a>
            <a href="#capabilities" onClick={(e) => scrollToSection(e, 'capabilities')}>Capabilities</a>
            <a href="#preview" onClick={(e) => scrollToSection(e, 'preview')}>Interface Preview</a>
            <a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')}>User Journey</a>
            <a href="#governance" onClick={(e) => scrollToSection(e, 'governance')}>Governance & Audit</a>
          </nav>

          <div className="landing-nav-actions">
            <button
              type="button"
              className="btn btn-outline-nav"
              onClick={onOpenLogin}
              id="landing-nav-login-btn"
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn btn-primary-nav"
              onClick={onOpenSignup}
              id="landing-nav-signup-btn"
            >
              Get Started
              <ArrowRight size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="landing-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="landing-mobile-menu" role="dialog" aria-label="Mobile Navigation">
            <nav className="mobile-nav-links">
              <a href="#overview" onClick={(e) => scrollToSection(e, 'overview')}>Platform</a>
              <a href="#capabilities" onClick={(e) => scrollToSection(e, 'capabilities')}>Capabilities</a>
              <a href="#preview" onClick={(e) => scrollToSection(e, 'preview')}>Interface Preview</a>
              <a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')}>User Journey</a>
              <a href="#governance" onClick={(e) => scrollToSection(e, 'governance')}>Governance & Audit</a>
            </nav>
            <div className="mobile-nav-buttons">
              <button
                type="button"
                className="btn btn-outline-nav w-full"
                onClick={() => { setIsMobileMenuOpen(false); onOpenLogin(); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-primary-nav w-full"
                onClick={() => { setIsMobileMenuOpen(false); onOpenSignup(); }}
              >
                Get Started <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="overview">
        {/* 2. CINEMATIC HERO SECTION WITH SMOOTH ANIMATED BACKGROUND */}
        <section className="landing-hero" aria-labelledby="hero-heading">
          {/* Live smooth animated background */}
          <AnimatedHeroBackground />

          <div className="landing-hero-container">
            <div className="landing-hero-badge">
              <span className="hero-status-dot" aria-hidden="true"></span>
              <span className="hero-badge-text">Synaptix Command 3.2 • Governed Enterprise Intelligence</span>
            </div>

            <h1 id="hero-heading" className="landing-hero-title">
              Autonomous Intelligence with <span className="hero-title-highlight">Strict Boundary Governance</span>
            </h1>

            <p className="landing-hero-description">
              Unify organizational knowledge across isolated enterprise domains. Synaptix Command analyzes heterogeneous
              documents and signals, correlates ground-truth evidence, and executes audited workflows under explicit human authorization.
            </p>

            <div className="landing-hero-cta-group">
              <button
                type="button"
                className="btn btn-hero-primary"
                onClick={onOpenSignup}
                id="hero-get-started-btn"
              >
                Access Command Console
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-hero-secondary"
                onClick={onOpenLogin}
                id="hero-sign-in-btn"
              >
                Sign In with SSO / Credentials
              </button>
            </div>

            {/* Operational Metrics Sub-Banner */}
            <div className="landing-hero-stats">
              <div className="hero-stat-card">
                <span className="hero-stat-val">3 Enterprise Domains</span>
                <span className="hero-stat-label">Isolated Fin, Bio & Tech Boundaries</span>
              </div>
              <div className="hero-stat-divider" aria-hidden="true" />
              <div className="hero-stat-card">
                <span className="hero-stat-val">100% G1 Grounded</span>
                <span className="hero-stat-label">Every insight mapped to source evidence</span>
              </div>
              <div className="hero-stat-divider" aria-hidden="true" />
              <div className="hero-stat-card">
                <span className="hero-stat-val">Two-Person Rule</span>
                <span className="hero-stat-label">Step-up auth & governed rollbacks</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE PRODUCT PREVIEW SHOWCASE */}
        <section id="preview" className="landing-preview-section" aria-labelledby="preview-heading">
          <div className="landing-section-header">
            <span className="section-eyebrow">Real Production Interface</span>
            <h2 id="preview-heading" className="section-title">Designed for Enterprise Workspaces</h2>
            <p className="section-subtitle">
              Inspect how Synaptix Command structures workspace boundaries, correlates ground truth, and tracks sensitive actions.
            </p>

            {/* Preview Switcher Tabs */}
            <div className="preview-tab-selector" role="tablist" aria-label="Product Showcase Tabs">
              <button
                role="tab"
                aria-selected={activePreviewTab === 'workspaces'}
                className={`preview-tab-btn ${activePreviewTab === 'workspaces' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('workspaces')}
              >
                <Layers size={15} />
                <span>Workspace Hub</span>
              </button>
              <button
                role="tab"
                aria-selected={activePreviewTab === 'evidence'}
                className={`preview-tab-btn ${activePreviewTab === 'evidence' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('evidence')}
              >
                <FileCheck2 size={15} />
                <span>Evidence Chain & Verification</span>
              </button>
              <button
                role="tab"
                aria-selected={activePreviewTab === 'governed-actions'}
                className={`preview-tab-btn ${activePreviewTab === 'governed-actions' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('governed-actions')}
              >
                <Lock size={15} />
                <span>Governed Actions & Step-Up Auth</span>
              </button>
            </div>
          </div>

          <div className="preview-frame-wrapper">
            <div className="preview-window-frame">
              <div className="preview-window-header">
                <div className="window-dots" aria-hidden="true">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="window-address-bar">
                  <Lock size={11} className="address-lock-icon" />
                  <span>https://synaptix.enterprise.internal/command/console</span>
                </div>
                <div className="window-status-pill">
                  <span className="pulse-dot-green" />
                  <span>Boundary Enforced</span>
                </div>
              </div>

              {/* Tab 1 Content: Workspace Hub Preview */}
              {activePreviewTab === 'workspaces' && (
                <div className="preview-tab-content fade-in" role="tabpanel">
                  <div className="mock-hub-banner">
                    <div>
                      <div className="mock-title">Active Workspace Boundaries</div>
                      <div className="mock-subtitle">Role-scoped environments with strict tenant isolation and knowledge separation.</div>
                    </div>
                    <div className="mock-hub-badge">3 Domains Active</div>
                  </div>

                  <div className="mock-workspace-grid">
                    <div className="mock-ws-card active-card">
                      <div className="mock-ws-top">
                        <div className="mock-ws-icon finance-icon"><Building2 size={16} /></div>
                        <span className="badge badge-success">Authorized</span>
                      </div>
                      <h4 className="mock-ws-title">Finance & Portfolio Intel</h4>
                      <p className="mock-ws-desc">Algorithmic risk positions, liquidity forecasts, and SEC filing verifications.</p>
                      <div className="mock-ws-meta">
                        <span>142 Documents</span>
                        <span>•</span>
                        <span>8 Dashboards</span>
                        <span>•</span>
                        <span className="ws-time">Updated 3m ago</span>
                      </div>
                    </div>

                    <div className="mock-ws-card">
                      <div className="mock-ws-top">
                        <div className="mock-ws-icon bio-icon"><Activity size={16} /></div>
                        <span className="badge badge-success">Authorized</span>
                      </div>
                      <h4 className="mock-ws-title">BioPharma Clinical Research</h4>
                      <p className="mock-ws-desc">Drug discovery trials, molecular binding signals, and FDA cohort telemetry.</p>
                      <div className="mock-ws-meta">
                        <span>320 Documents</span>
                        <span>•</span>
                        <span>14 Models</span>
                        <span>•</span>
                        <span className="ws-time">Updated 12m ago</span>
                      </div>
                    </div>

                    <div className="mock-ws-card">
                      <div className="mock-ws-top">
                        <div className="mock-ws-icon tech-icon"><Cpu size={16} /></div>
                        <span className="badge badge-success">Authorized</span>
                      </div>
                      <h4 className="mock-ws-title">Infrastructure & Cloud Core</h4>
                      <p className="mock-ws-desc">Kubernetes clusters, distributed tracing, and automated remediation policies.</p>
                      <div className="mock-ws-meta">
                        <span>89 Runbooks</span>
                        <span>•</span>
                        <span>32 Automated Actions</span>
                        <span>•</span>
                        <span className="ws-time">Updated 1m ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2 Content: Evidence Chain Preview */}
              {activePreviewTab === 'evidence' && (
                <div className="preview-tab-content fade-in" role="tabpanel">
                  <div className="mock-evidence-container">
                    <div className="mock-evidence-header">
                      <div className="mock-evidence-tag">
                        <ShieldCheck size={14} className="text-success" />
                        <strong>Ground Truth Level: G1 Cryptographically Verified</strong>
                      </div>
                      <span className="mock-evidence-id">SYN-EV-94183</span>
                    </div>

                    <div className="mock-evidence-body">
                      <h4 className="mock-evidence-heading">Q3 Liquidity Coverage Ratio Variance (+3.4%)</h4>
                      <p className="mock-evidence-quote">
                        “Synthesized deduction from Tier-1 asset disclosures in filing SEC-10Q filed 2026-09-30, confirmed against treasury internal ledger #TL-9942.”
                      </p>

                      <div className="mock-evidence-steps">
                        <div className="mock-step done">
                          <CheckCircle2 size={13} />
                          <span>Original Source Document Retrieved (SHA-256 matched)</span>
                        </div>
                        <div className="mock-step done">
                          <CheckCircle2 size={13} />
                          <span>Extracted Paragraph Confidence: 99.4% (Direct Text Citation)</span>
                        </div>
                        <div className="mock-step done">
                          <CheckCircle2 size={13} />
                          <span>Zero Hallucination Gate: Passed (Strict Cross-Document Anchor)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3 Content: Governed Actions Preview */}
              {activePreviewTab === 'governed-actions' && (
                <div className="preview-tab-content fade-in" role="tabpanel">
                  <div className="mock-actions-container">
                    <div className="mock-action-item critical">
                      <div className="action-item-info">
                        <div className="action-item-tags">
                          <span className="risk-badge risk-critical">Risk Tier: Critical</span>
                          <span className="status-badge badge-warning"><Clock size={11} /> Pending Dual Sign-Off</span>
                        </div>
                        <h4 className="action-title">Adjust High-Frequency Margin Requirement to 15.5%</h4>
                        <p className="action-desc">Target: Exchange Liquidity Gateway 04 • Requires 2 Senior Officer approvals.</p>
                      </div>
                      <div className="action-controls">
                        <button type="button" className="btn btn-sm btn-outline" disabled>
                          <Lock size={12} /> Step-Up Auth
                        </button>
                        <button type="button" className="btn btn-sm btn-primary" onClick={onOpenLogin}>
                          Inspect Approval
                        </button>
                      </div>
                    </div>

                    <div className="mock-action-item medium">
                      <div className="action-item-info">
                        <div className="action-item-tags">
                          <span className="risk-badge risk-medium">Risk Tier: Medium</span>
                          <span className="status-badge badge-success"><CheckCircle2 size={11} /> Executed & Audited</span>
                        </div>
                        <h4 className="action-title">Invalidate Stale Redis Cache on Ingestion Worker Node</h4>
                        <p className="action-desc">Execution confirmed. Audit hash: 8f9a2b8e • Automated rollback snapshot active.</p>
                      </div>
                      <div className="action-controls">
                        <span className="audit-hash">Audit #AU-4091</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. CAPABILITIES SECTION */}
        <section id="capabilities" className="landing-capabilities" aria-labelledby="capabilities-heading">
          <div className="landing-section-header">
            <span className="section-eyebrow">Enterprise Core</span>
            <h2 id="capabilities-heading" className="section-title">Governed Capabilities Across Every Layer</h2>
            <p className="section-subtitle">
              Engineered for organizations where intelligence must be verifiable, auditable, and subject to strict boundary separation.
            </p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="cap-icon-box">
                <FolderLock size={22} />
              </div>
              <h3>Workspace Domain Boundaries</h3>
              <p>
                Strict multi-tenant and multi-department segmentation. Datasets, documents, and workflows remain bounded within
                explicit security domains without cross-tenant leakage.
              </p>
              <ul className="cap-checklist">
                <li><CheckCircle2 size={13} /> Strict RBAC & workspace membership</li>
                <li><CheckCircle2 size={13} /> Isolated document vector indices</li>
                <li><CheckCircle2 size={13} /> Domain-specific operational policies</li>
              </ul>
            </div>

            <div className="capability-card">
              <div className="cap-icon-box">
                <Search size={22} />
              </div>
              <h3>Grounded Evidence Engine</h3>
              <p>
                Eliminate unverified AI claims. Every conclusion surfaced by Synaptix Command links directly to exact source citations,
                document coordinates, and confidence levels.
              </p>
              <ul className="cap-checklist">
                <li><CheckCircle2 size={13} /> G1 cryptographic source verification</li>
                <li><CheckCircle2 size={13} /> Direct PDF and tabular coordinate matching</li>
                <li><CheckCircle2 size={13} /> Full verification audit trail</li>
              </ul>
            </div>

            <div className="capability-card">
              <div className="cap-icon-box">
                <SlidersHorizontal size={22} />
              </div>
              <h3>Governed Action Framework</h3>
              <p>
                Safely bridge intelligence into real-world action. Low-risk operations can be automated while medium and critical actions
                mandate step-up authentication and two-person sign-off.
              </p>
              <ul className="cap-checklist">
                <li><CheckCircle2 size={13} /> Tiered risk classifications (Low to Critical)</li>
                <li><CheckCircle2 size={13} /> Automated pre-execution dry runs</li>
                <li><CheckCircle2 size={13} /> One-click rollback mechanisms</li>
              </ul>
            </div>

            <div className="capability-card">
              <div className="cap-icon-box">
                <Terminal size={22} />
              </div>
              <h3>Interactive Command & Analytics</h3>
              <p>
                Converse with domain intelligence through a unified command interface. Run complex cross-document analyses,
                query live operational telemetry, and plot real-time KPIs.
              </p>
              <ul className="cap-checklist">
                <li><CheckCircle2 size={13} /> Real-time telemetry and dashboarding</li>
                <li><CheckCircle2 size={13} /> Multi-turn contextual reasoning</li>
                <li><CheckCircle2 size={13} /> Global Cmd+K omni-search</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. THREE-STEP USER JOURNEY */}
        <section id="workflow" className="landing-workflow" aria-labelledby="workflow-heading">
          <div className="landing-section-header">
            <span className="section-eyebrow">Operational Methodology</span>
            <h2 id="workflow-heading" className="section-title">The Three-Phase Synaptix Journey</h2>
            <p className="section-subtitle">
              How teams move from unstructured enterprise chaos to decisive, governed execution.
            </p>
          </div>

          <div className="journey-steps-grid">
            <div className="journey-step-card">
              <div className="step-number-badge">01</div>
              <div className="step-content">
                <h3>Ingest & Domain Segmentation</h3>
                <p>
                  Connect documents, filings, databases, and operational telemetry. Synaptix assigns assets to explicit workspace boundaries,
                  enforcing strict organizational authorization from moment zero.
                </p>
                <div className="step-footer-pill">
                  <Database size={12} /> Boundary-Enforced Ingestion
                </div>
              </div>
            </div>

            <div className="journey-arrow-divider" aria-hidden="true">
              <ChevronRight size={24} />
            </div>

            <div className="journey-step-card">
              <div className="step-number-badge">02</div>
              <div className="step-content">
                <h3>Synthesize & Verify Evidence</h3>
                <p>
                  The engine identifies correlations, detects operational anomalies, and formulates strategic hypotheses—with every
                  finding anchored to immutable, viewable ground-truth evidence.
                </p>
                <div className="step-footer-pill">
                  <FileCheck2 size={12} /> Zero-Hallucination Gate
                </div>
              </div>
            </div>

            <div className="journey-arrow-divider" aria-hidden="true">
              <ChevronRight size={24} />
            </div>

            <div className="journey-step-card">
              <div className="step-number-badge">03</div>
              <div className="step-content">
                <h3>Authorize & Governed Execution</h3>
                <p>
                  Review proposed operational actions. Senior engineers or officers authorize executions through step-up authentication.
                  All state changes are permanently logged to the audit trail.
                </p>
                <div className="step-footer-pill">
                  <ShieldCheck size={12} /> Complete Audit Ledger
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. GOVERNANCE & AUDITABILITY SECTION */}
        <section id="governance" className="landing-governance" aria-labelledby="governance-heading">
          <div className="governance-container">
            <div className="governance-text-side">
              <div className="governance-eyebrow">
                <ShieldCheck size={16} /> Transparent Architecture
              </div>
              <h2 id="governance-heading">Strict Governance Without Hand-Wavy Guarantees</h2>
              <p>
                In high-stakes enterprise environments, AI cannot be a black box with arbitrary execution power.
                Synaptix Command enforces verification and accountability through concrete architectural constraints.
              </p>

              <div className="gov-points-list">
                <div className="gov-point-item">
                  <div className="gov-point-icon"><UserCheck size={18} /></div>
                  <div>
                    <h4>Human-in-the-Loop Authority</h4>
                    <p>High-risk mutations require dual sign-off. The platform cannot bypass configured authorization boundaries.</p>
                  </div>
                </div>

                <div className="gov-point-item">
                  <div className="gov-point-icon"><FileText size={18} /></div>
                  <div>
                    <h4>Immutable Audit Trail</h4>
                    <p>Every query, evidence retrieval, approval request, and action execution is logged with user identity and timestamp.</p>
                  </div>
                </div>

                <div className="gov-point-item">
                  <div className="gov-point-icon"><Lock size={18} /></div>
                  <div>
                    <h4>Zero Data Mixture Across Workspaces</h4>
                    <p>Data ingested into one workspace cannot be queried or referenced from another workspace boundary.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="governance-card-side">
              <div className="gov-spec-card">
                <div className="gov-spec-header">
                  <Terminal size={14} />
                  <span>Enforced Governance Specification</span>
                </div>
                <div className="gov-spec-body">
                  <div className="gov-spec-row">
                    <span className="spec-label">Access Model</span>
                    <span className="spec-value">Role-Based Access Control (RBAC)</span>
                  </div>
                  <div className="gov-spec-row">
                    <span className="spec-label">Approval Pattern</span>
                    <span className="spec-value">Two-Person Rule on Critical Tiers</span>
                  </div>
                  <div className="gov-spec-row">
                    <span className="spec-label">Evidence Standard</span>
                    <span className="spec-value">G1 Level (Source Document Citation)</span>
                  </div>
                  <div className="gov-spec-row">
                    <span className="spec-label">Rollback Support</span>
                    <span className="spec-value">Automated state snapshots on execution</span>
                  </div>
                  <div className="gov-spec-row">
                    <span className="spec-label">Authentication</span>
                    <span className="spec-value">Enterprise SSO (Google) & Multi-Factor Auth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CALL TO ACTION */}
        <section className="landing-cta-banner">
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">Ready to Command Your Enterprise Intelligence?</h2>
            <p className="cta-banner-subtitle">
              Step into the Synaptix Command Workspace Hub or authenticate with your corporate credentials.
            </p>
            <div className="cta-banner-buttons">
              <button
                type="button"
                className="btn btn-cta-primary"
                onClick={onOpenSignup}
                id="cta-signup-btn"
              >
                Create Workspace Account
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-cta-secondary"
                onClick={onOpenLogin}
                id="cta-login-btn"
              >
                Sign In to Existing Workspace
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 8. ENTERPRISE FOOTER */}
      <footer className="landing-footer" role="contentinfo">
        <div className="landing-footer-inner">
          <div className="footer-brand-col">
            <SynaptixLogo size="sm" />
            <p className="footer-tagline">
              Enterprise intelligence and governed execution platform for mission-critical operations.
            </p>
            <p className="footer-copyright">
              © {new Date().getFullYear()} Synaptix Command Systems. All rights reserved.
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul>
              <li><a href="#overview" onClick={(e) => scrollToSection(e, 'overview')}>Command Console</a></li>
              <li><a href="#capabilities" onClick={(e) => scrollToSection(e, 'capabilities')}>Workspace Boundaries</a></li>
              <li><a href="#preview" onClick={(e) => scrollToSection(e, 'preview')}>Evidence Chain</a></li>
              <li><a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')}>Operational Workflow</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Governance</h4>
            <ul>
              <li><a href="#governance" onClick={(e) => scrollToSection(e, 'governance')}>Two-Person Approval</a></li>
              <li><a href="#governance" onClick={(e) => scrollToSection(e, 'governance')}>Audit Logging</a></li>
              <li><a href="#preview" onClick={(e) => scrollToSection(e, 'preview')}>Step-Up Authentication</a></li>
              <li><a href="#capabilities" onClick={(e) => scrollToSection(e, 'capabilities')}>Zero Hallucination Gate</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Access</h4>
            <ul>
              <li><button type="button" className="footer-link-btn" onClick={onOpenLogin}>Sign In</button></li>
              <li><button type="button" className="footer-link-btn" onClick={onOpenSignup}>Create Account</button></li>
              <li><button type="button" className="footer-link-btn" onClick={onOpenLogin}>Enterprise SSO</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
