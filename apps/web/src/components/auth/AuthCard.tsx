import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export interface AuthCardProps {
  onOpenForgotPassword: () => void;
  onSuccessAuth: (email: string, mode: 'login' | 'signup') => void;
  onGoogleAuth: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onOpenForgotPassword,
  onSuccessAuth,
  onGoogleAuth,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="auth-card" role="region" aria-label="Authentication Form">
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
          />
        ) : (
          <SignupForm
            onSuccess={(email) => onSuccessAuth(email, 'signup')}
            onGoogleAuth={onGoogleAuth}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
};
