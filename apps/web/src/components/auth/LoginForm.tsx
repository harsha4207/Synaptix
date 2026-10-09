import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { FormField } from '../ui/FormField';
import { Separator } from '../ui/Separator';
import { GoogleSignInButton } from '../ui/GoogleSignInButton';

export interface LoginFormProps {
  onSuccess: (email: string) => void;
  onGoogleAuth: () => void;
  onOpenForgotPassword: () => void;
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onGoogleAuth,
  onOpenForgotPassword,
  onSwitchToSignup,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(email);
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form-content">
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
