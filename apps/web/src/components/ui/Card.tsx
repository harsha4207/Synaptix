import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  shadow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, shadow = true, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card ${shadow ? 'card-shadow' : ''} ${interactive ? 'card-interactive' : ''} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ action, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card-header ${className}`.trim()}
        style={{
          padding: 'var(--sp-5) var(--sp-6) var(--sp-3)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--sp-4)',
        }}
        {...props}
      >
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = 'h3', className = '', style, children, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={className}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: 'var(--c-text-1)',
          lineHeight: 1.3,
          margin: 0,
          ...style,
        }}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', style, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={className}
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--c-text-2)',
          marginTop: 'var(--sp-1)',
          lineHeight: 1.45,
          ...style,
        }}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ noPadding = false, className = '', style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card-content ${className}`.trim()}
        style={{
          padding: noPadding ? '0' : 'var(--sp-4) var(--sp-6) var(--sp-6)',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  borderTop?: boolean;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ borderTop = true, className = '', style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card-footer ${className}`.trim()}
        style={{
          padding: 'var(--sp-4) var(--sp-6)',
          borderTop: borderTop ? '1px solid var(--c-border)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sp-3)',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';
