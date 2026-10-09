import React from 'react';

export const BrandSection: React.FC = () => {
  const supportingSteps = [
    "Understand",
    "Organize",
    "Reason",
    "Act",
    "Verify",
    "Evolve"
  ];

  return (
    <section className="left-brand-panel" aria-label="Brand Overview">
      {/* System Status Pill */}
      <div className="system-badge">
        <span className="pulse-indicator"></span>
        Enterprise Intelligence Platform
      </div>

      {/* Main Logo & Elegant Ambient Motion Backdrop */}
      <div className="brand-graphic-wrapper">
        {/* Soft radial blue glow behind logo */}
        <div className="soft-logo-glow" />

        {/* Slow subtle navy ring pulse/rotation */}
        <div className="ambient-navy-ring" />
        
        {/* Directional forward arrow motion glow */}
        <div className="arrow-motion-glow" />

        {/* Synaptix Command Official Logo */}
        <img
          src="/assets/SYNAPTIX Command Logo.png"
          alt="SYNAPTIX COMMAND Logo"
          className="logo-image"
          width="310"
          height="88"
          loading="eager"
        />
      </div>

      {/* Brand Statements */}
      <div className="brand-text-content">
        <h2 className="brand-statement">
          From Knowledge to Action.
        </h2>
        
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

