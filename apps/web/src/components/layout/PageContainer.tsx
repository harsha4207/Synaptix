import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '100%',
  className = '',
  style,
}) => {
  return (
    <div
      className={`page-container w-full min-w-0 ${className}`.trim()}
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-6)',
        animation: 'fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >

      {children}
    </div>
  );
};
