import React from 'react';
import { SynaptixLogo } from '../ui/SynaptixLogo';

export const BrandPanel: React.FC = () => {
  const supportingSteps = [
    'Understand',
    'Organize',
    'Reason',
    'Act',
    'Verify',
    'Evolve',
  ];

  return (
    <section className="left-brand-panel" aria-label="Brand Overview">
      {/* System Status Pill */}
      <div className="system-badge">
        <span className="pulse-indicator" />
        Enterprise Intelligence Platform
      </div>

      {/* Main Logo & Subtle Motion Backdrop */}
      <div className="brand-graphic-wrapper">
        <div className="soft-logo-glow" />
        <div className="ambient-navy-ring" />
        <div className="arrow-motion-glow" />

        <SynaptixLogo size="lg" withAmbientGlow />
      </div>

      {/* Brand Statements */}
      <div className="brand-text-content">
        <h2 className="brand-statement">From Knowledge to Action.</h2>

        <div className="supporting-line-container">
          {supportingSteps.map((step, index) => (
            <span key={step} className="step-item">
              <span>{step}</span>
              {index < supportingSteps.length - 1 && <span className="step-dot">•</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
