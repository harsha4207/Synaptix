import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ isError, leftIcon, rightIcon, className = '', style, ...props }, ref) => {
    return (
      <div className="input-wrapper" style={{ width: '100%' }}>
        {leftIcon && <span className="input-icon">{leftIcon}</span>}
        <input
          ref={ref}
          className={`form-input ${isError ? 'input-error' : ''} ${className}`.trim()}
          style={{
            paddingLeft: leftIcon ? '38px' : 'var(--sp-4)',
            paddingRight: rightIcon ? '38px' : 'var(--sp-4)',
            ...style,
          }}
          {...props}
        />
        {rightIcon && (
          <span
            style={{
              position: 'absolute',
              right: 'var(--sp-3)',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--c-text-3)',
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
