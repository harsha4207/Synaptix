import React, { useState } from 'react';
import { User, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { FormField } from '../ui/FormField';
import { Separator } from '../ui/Separator';
import { GoogleSignInButton } from '../ui/GoogleSignInButton';

export interface SignupFormProps {
  onSuccess: (email: string) => void;
  onGoogleAuth: () => void;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onGoogleAuth,
  onSwitchToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid work email';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      errs.terms = 'You must accept the Enterprise Service Agreement';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(email);
    }, 1100);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form-content">
      {/* Google Sign-In prominent at top */}
      <GoogleSignInButton
        onClick={onGoogleAuth}
        text="Sign up with Google"
      />

      {/* Separator before email form */}
      <Separator label="Or continue with" />

      {/* Full Name */}
      <FormField
        label="Full Name"
        htmlFor="signup-name"
        isRequired
        error={errors.fullName}
      >
        <Input
          id="signup-name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          placeholder="Alex Vance"
          autoComplete="name"
          leftIcon={<User size={16} />}
          isError={!!errors.fullName}
        />
      </FormField>

      {/* Work Email */}
      <FormField
        label="Corporate Email"
        htmlFor="signup-email"
        isRequired
        error={errors.email}
      >
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="alex.vance@enterprise.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          isError={!!errors.email}
        />
      </FormField>

      {/* Password */}
      <FormField
        label="Password"
        htmlFor="signup-password"
        isRequired
        error={errors.password}
        hint="Min. 8 characters with letters and numbers"
      >
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Create master password"
          autoComplete="new-password"
          isError={!!errors.password}
        />
      </FormField>

      {/* Confirm Password */}
      <FormField
        label="Confirm Password"
        htmlFor="signup-confirm-password"
        isRequired
        error={errors.confirmPassword}
      >
        <PasswordInput
          id="signup-confirm-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          placeholder="Re-enter password"
          autoComplete="new-password"
          isError={!!errors.confirmPassword}
        />
      </FormField>

      {/* Terms Checkbox */}
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: 'var(--sp-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--c-text-2)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
            }}
            style={{ accentColor: 'var(--c-blue)', borderRadius: '4px', marginTop: '2px' }}
          />
          <span>
            I agree to the <strong style={{ color: 'var(--c-text-1)' }}>Enterprise Service Agreement</strong> and{' '}
            <strong style={{ color: 'var(--c-text-1)' }}>Security Governance Policies</strong>.
          </span>
        </label>
        {errors.terms && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-danger)', marginTop: '4px' }}>
            {errors.terms}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        rightIcon={<ArrowRight size={16} className="btn-arrow-icon" />}
      >
        Create Enterprise Account
      </Button>

      {/* Switch to Login */}
      <div className="auth-footer-prompt">
        <span>Already have an enterprise account?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="switch-mode-btn"
        >
          Sign In
        </button>
      </div>
    </form>
  );
};
