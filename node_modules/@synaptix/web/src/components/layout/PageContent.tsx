import React from 'react';

export interface PageContentProps {
  children: React.ReactNode;
  gap?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  gap = 'var(--sp-6)',
  className = '',
  style,
}) => {
  return (
    <div
      className={`page-content ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
