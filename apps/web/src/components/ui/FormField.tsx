import React from 'react';
import { Label } from './Label';
import { ErrorMessage } from './ErrorMessage';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  isRequired?: boolean;
  error?: string;
  hint?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  isRequired,
  error,
  hint,
  headerAction,
  children,
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {(label || headerAction) && (
        <div className="field-header-row">
          {label && (
            <Label htmlFor={htmlFor} isRequired={isRequired}>
              {label}
            </Label>
          )}
          {headerAction}
        </div>
      )}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      <ErrorMessage message={error} />
    </div>
  );
};
