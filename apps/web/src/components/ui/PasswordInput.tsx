import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  isError?: boolean;
  showLockIcon?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ isError, showLockIcon = true, className = '', style, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="input-wrapper" style={{ width: '100%' }}>
        {showLockIcon && (
          <span className="input-icon">
            <Lock size={16} />
          </span>
        )}
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`form-input has-toggle ${isError ? 'input-error' : ''} ${className}`.trim()}
          style={{
            paddingLeft: showLockIcon ? '38px' : 'var(--sp-4)',
            paddingRight: '40px',
            ...style,
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="password-toggle-btn"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
