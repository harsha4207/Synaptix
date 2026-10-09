import React from 'react';

export const BrandPanel: React.FC = () => {
  return (
    <section className="brand-panel right-brand-panel" aria-label="Brand Overview">
      <div className="brand-logo-container">
        <img
          src="/assets/SYNAPTIX Command Logo.png"
          alt="Synaptix Command"
          className="brand-logo-img logo-img-light"
        />
        <img
          src="/assets/SYNAPTIX Command Logo Dark.png"
          alt="Synaptix Command"
          className="brand-logo-img logo-img-dark"
        />
      </div>
    </section>
  );
};
