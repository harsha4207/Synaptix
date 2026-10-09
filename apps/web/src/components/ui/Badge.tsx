import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'navy' | 'success' | 'warning' | 'destructive' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulseDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'blue',
  size = 'md',
  dot = false,
  pulseDot = false,
  children,
  className = '',
  style,
  ...props
}) => {
  let variantClass = 'badge-blue';
  if (variant === 'navy') variantClass = 'badge-navy';
  else if (variant === 'success') variantClass = 'badge-success';
  else if (variant === 'warning') variantClass = 'badge-warning';
  else if (variant === 'destructive') variantClass = 'badge-danger';
  else if (variant === 'outline') variantClass = 'badge-muted';
  else if (variant === 'default') variantClass = 'badge-navy';

  let dotColor = 'var(--c-blue)';
  if (variant === 'success') dotColor = 'var(--c-success)';
  else if (variant === 'warning') dotColor = '#F59E0B';
  else if (variant === 'destructive') dotColor = 'var(--c-danger)';
  else if (variant === 'navy') dotColor = 'var(--c-navy)';
  else if (variant === 'outline') dotColor = 'var(--c-text-3)';

  const sizeStyle: React.CSSProperties =
    size === 'sm'
      ? { fontSize: '10px', padding: '2px 6px' }
      : size === 'lg'
      ? { fontSize: '12px', padding: '4px 12px' }
      : {};

  return (
    <span
      className={`badge ${variantClass} ${className}`.trim()}
      style={{ ...sizeStyle, ...style }}
      {...props}
    >
      {dot && (
        <span
          className={`status-dot ${pulseDot ? 'status-dot-live' : ''}`}
          style={{ backgroundColor: dotColor }}
        />
      )}
      {children}
    </span>
  );
};
