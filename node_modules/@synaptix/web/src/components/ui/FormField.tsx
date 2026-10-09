import React from 'react';
import { Label } from './Label';
import { ErrorMessage } from './ErrorMessage';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  isRequired?: boolean;
  required?: boolean;
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
  required,
  error,
  hint,
  headerAction,
  children,
  className = '',
}) => {
  const isReq = isRequired ?? required;
  return (
    <div className={`form-group ${className}`.trim()}>
      {(label || headerAction) && (
        <div className="field-header-row">
          {label && (
            <Label htmlFor={htmlFor} isRequired={isReq}>
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
