import React, { useState } from 'react';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  let posStyle: React.CSSProperties = {
    bottom: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
  };
  if (position === 'bottom') {
    posStyle = {
      top: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)',
    };
  } else if (position === 'left') {
    posStyle = {
      right: 'calc(100% + 6px)',
      top: '50%',
      transform: 'translateY(-50%)',
    };
  } else if (position === 'right') {
    posStyle = {
      left: 'calc(100% + 6px)',
      top: '50%',
      transform: 'translateY(-50%)',
    };
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'var(--c-navy)',
            color: '#FFFFFF',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            padding: '4px 8px',
            borderRadius: 'var(--r-sm)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none',
            animation: 'fade-in 0.15s ease',
            ...posStyle,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
