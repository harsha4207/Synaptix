import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export interface AuthCardProps {
  onOpenForgotPassword: () => void;
  onSuccessAuth: (email: string, mode: 'login' | 'signup') => void;
  onGoogleAuth: () => void;
  defaultMode?: 'login' | 'signup';
  onBackToLanding?: () => void;
  isGoogleLoading?: boolean;
  errorMessage?: string | null;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onOpenForgotPassword,
  onSuccessAuth,
  onGoogleAuth,
  defaultMode = 'login',
  onBackToLanding,
  isGoogleLoading = false,
  errorMessage = null,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  // Sync mode if defaultMode changes externally (e.g. navigation trigger)
  React.useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  return (
    <div className="auth-card" role="region" aria-label="Authentication Form">
      {onBackToLanding && (
        <button
          type="button"
          className="auth-back-landing-btn"
          onClick={onBackToLanding}
          aria-label="Back to landing page"
        >
          ← Back to Synaptix Overview
        </button>
      )}
      {/* Header */}
      <header className="auth-header">
        <h1>Welcome to Synaptix Command</h1>
        <p>
          {mode === 'login'
            ? 'Sign in to continue to your workspace'
            : 'Create your enterprise workspace account'}
        </p>
      </header>

      {/* Dynamic Form with Fade Transition */}
      <div className="form-transition-container" key={mode}>
        {mode === 'login' ? (
          <LoginForm
            onSuccess={(email) => onSuccessAuth(email, 'login')}
            onGoogleAuth={onGoogleAuth}
            onOpenForgotPassword={onOpenForgotPassword}
            onSwitchToSignup={() => setMode('signup')}
            isGoogleLoading={isGoogleLoading}
            errorMessage={errorMessage}
          />
        ) : (
          <SignupForm
            onSuccess={(email) => onSuccessAuth(email, 'signup')}
            onGoogleAuth={onGoogleAuth}
            onSwitchToLogin={() => setMode('login')}
            isGoogleLoading={isGoogleLoading}
            errorMessage={errorMessage}
          />
        )}
      </div>
    </div>
  );
};
