import React from 'react';

export interface SynaptixLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withAmbientGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SynaptixLogo: React.FC<SynaptixLogoProps> = ({
  size = 'md',
  withAmbientGlow = false,
  className = '',
  onClick,
}) => {
  // Exact aspect ratio preserved for /assets/SYNAPTIX Command Logo.png (approx 3.5 : 1)
  let width = 140;
  let height = 40;

  if (size === 'sm') {
    width = 110;
    height = 31;
  } else if (size === 'lg') {
    width = 280;
    height = 80;
  }

  return (
    <div
      className={`synaptix-logo-container ${className}`.trim()}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {withAmbientGlow && (
        <div
          className="logo-ambient-glow"
          style={{
            position: 'absolute',
            inset: '-12px',
            background: 'radial-gradient(ellipse at center, rgba(23, 105, 224, 0.18) 0%, rgba(11, 31, 58, 0.05) 50%, transparent 70%)',
            borderRadius: 'var(--r-xl)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'pulse-dot 4s ease-in-out infinite',
          }}
        />
      )}
      <img
        src="/assets/SYNAPTIX Command Logo.png"
        alt="SYNAPTIX COMMAND"
        width={width}
        height={height}
        className="logo-img-light"
        style={{
          width: `${width}px`,
          height: 'auto',
          maxHeight: `${height}px`,
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
        }}
      />
      <img
        src="/assets/SYNAPTIX Command Logo Dark.png"
        alt="SYNAPTIX COMMAND"
        width={width}
        height={height}
        className="logo-img-dark"
        style={{
          width: `${width}px`,
          height: 'auto',
          maxHeight: `${height}px`,
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
};
