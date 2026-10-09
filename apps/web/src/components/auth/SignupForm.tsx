import React, { useState } from 'react';
import { User, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { FormField } from '../ui/FormField';
import { Separator } from '../ui/Separator';

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

      {/* Divider */}
      <Separator label="Or continue with" />

      {/* Google SSO */}
      <button
        type="button"
        onClick={onGoogleAuth}
        className="google-sso-btn"
        aria-label="Sign up with Google Enterprise"
      >
        <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Google Enterprise SSO</span>
      </button>

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
