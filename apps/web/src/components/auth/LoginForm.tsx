import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { FormField } from '../ui/FormField';
import { Separator } from '../ui/Separator';
import { GoogleSignInButton } from '../ui/GoogleSignInButton';
import { useSupabaseAuth } from '../../lib/supabase/SupabaseAuthContext';

export interface LoginFormProps {
  onSuccess: (email: string) => void;
  onGoogleAuth: () => void;
  onOpenForgotPassword: () => void;
  onSwitchToSignup: () => void;
  isGoogleLoading?: boolean;
  errorMessage?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onGoogleAuth,
  onOpenForgotPassword,
  onSwitchToSignup,
  isGoogleLoading = false,
  errorMessage = null,
}) => {
  const { signInWithEmail } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const formatErrorMessage = (err: Error | string): string => {
    const raw = typeof err === 'string' ? err : err.message || '';
    const lower = raw.toLowerCase();
    if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
      return 'Invalid email or password. If you previously used Google to sign in, please click "Sign in with Google" below, or confirm your email.';
    }
    if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox or confirm the user in the Supabase dashboard.';
    }
    if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('fetch failed')) {
      return 'Unable to reach the authentication service. Please check your network connection.';
    }
    return raw;
  };

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isGoogleLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    setLocalError(null);

    try {
      const res = await signInWithEmail(email.trim(), password);
      if (res.error) {
        setLocalError(formatErrorMessage(res.error));
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccess(email.trim());
    } catch (err) {
      setLocalError(formatErrorMessage(err instanceof Error ? err : String(err)));
      setIsLoading(false);
    }
  };

  const activeError = localError || errorMessage;

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form-content">
      {/* Authentication Error Banner */}
      {activeError && (
        <div
          className="auth-error-banner"
          style={{
            padding: '0.65rem 0.9rem',
            marginBottom: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            fontSize: '0.82rem',
            lineHeight: 1.4,
          }}
          role="alert"
        >
          {activeError}
        </div>
      )}

      {/* Email Address */}
      <FormField
        label="Work Email"
        htmlFor="login-email"
        isRequired
        error={errors.email}
      >
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="name@organization.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          isError={!!errors.email}
        />
      </FormField>

      {/* Password with Forgot Password link below field */}
      <FormField
        label="Password"
        htmlFor="login-password"
        isRequired
        error={errors.password}
      >
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Enter your security password"
          autoComplete="current-password"
          isError={!!errors.password}
        />
        <div className="forgot-password-row">
          <button
            type="button"
            onClick={onOpenForgotPassword}
            className="forgot-password-link"
          >
            Forgot password?
          </button>
        </div>
      </FormField>

      {/* Remember Me Option */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--c-text-2)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ accentColor: 'var(--c-blue)', borderRadius: '4px' }}
          />
          <span>Remember this device for 30 days</span>
        </label>
      </div>

      {/* Sign In Primary Action */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        rightIcon={<ArrowRight size={16} className="btn-arrow-icon" />}
      >
        Sign In to Workspace
      </Button>

      {/* Divider */}
      <Separator label="Or continue with" />

      {/* Google Sign-In */}
      <GoogleSignInButton
        onClick={onGoogleAuth}
        text="Sign in with Google"
        isLoading={isGoogleLoading}
        disabled={isLoading || isGoogleLoading}
      />

      {/* Switch to Signup */}
      <div className="auth-footer-prompt">
        <span>Don't have an enterprise account?</span>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="switch-mode-btn"
        >
          Create Workspace
        </button>
      </div>
    </form>
  );
};
