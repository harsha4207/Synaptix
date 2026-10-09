import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'blue';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      loading = false,
      leftIcon,
      icon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isActuallyLoading = isLoading || loading;
    const leadingIcon = leftIcon || icon;

    // Determine class based on variant
    let variantClass = 'btn-secondary';
    if (variant === 'primary') variantClass = 'btn-primary';
    else if (variant === 'blue') variantClass = 'btn-blue';
    else if (variant === 'ghost') variantClass = 'btn-ghost';
    else if (variant === 'outline') variantClass = 'btn-secondary';
    else if (variant === 'destructive') variantClass = 'btn-danger';

    let sizeClass = '';
    if (size === 'sm') sizeClass = 'btn-sm';
    else if (size === 'lg') sizeClass = 'btn-lg';
    else if (size === 'icon') sizeClass = 'btn-icon';

    const fullWidthClass = fullWidth ? 'btn-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isActuallyLoading}
        className={`btn ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim()}
        {...props}
      >
        {isActuallyLoading ? (
          <Loader2 className="spinner spinner-dark" size={size === 'sm' ? 14 : 16} />
        ) : (
          leadingIcon && <span className="btn-icon-start">{leadingIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isActuallyLoading && rightIcon && <span className="btn-icon-end">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
