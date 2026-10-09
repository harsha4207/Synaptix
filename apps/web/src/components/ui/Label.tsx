import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ isRequired, children, className = '', ...props }, ref) => {
    return (
      <label ref={ref} className={`form-label ${className}`.trim()} {...props}>
        {children}
        {isRequired && (
          <span style={{ color: 'var(--c-danger)', marginLeft: '4px' }} aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
