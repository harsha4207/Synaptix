import React, { useState } from 'react';
import { BrandPanel } from './BrandPanel';
import { AuthCard } from './AuthCard';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { ResetPasswordModal } from './ResetPasswordModal';

export interface AuthPageProps {
  onSuccessAuth: (email: string, mode: 'login' | 'signup') => void;
  onGoogleAuth: () => void;
  onAddToast?: (msg: string) => void;
  initialMode?: 'login' | 'signup';
  onBackToLanding?: () => void;
  isGoogleLoading?: boolean;
  errorMessage?: string | null;
  isResetPasswordOpen?: boolean;
  onCloseResetPassword?: () => void;
  onResetPasswordSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccessAuth,
  onGoogleAuth,
  onAddToast,
  initialMode = 'login',
  onBackToLanding,
  isGoogleLoading = false,
  errorMessage = null,
  isResetPasswordOpen = false,
  onCloseResetPassword = () => {},
  onResetPasswordSuccess = () => {},
}) => {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  return (
    <main className="app-viewport">
      <div className="centered-page-container">
        {/* Left Side — Authentication Card */}
        <section className="left-auth-panel auth-panel" aria-label="Sign In Section">
          <AuthCard
            onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
            onSuccessAuth={onSuccessAuth}
            onGoogleAuth={onGoogleAuth}
            defaultMode={initialMode}
            onBackToLanding={onBackToLanding}
            isGoogleLoading={isGoogleLoading}
            errorMessage={errorMessage}
          />
        </section>

        {/* Right Side — Synaptix Command Branding */}
        <BrandPanel />
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccessToast={onAddToast || (() => {})}
      />

      {/* Reset Password Modal (Recovery Flow) */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={onCloseResetPassword}
        onSuccess={onResetPasswordSuccess}
        onAddToast={onAddToast || (() => {})}
      />
    </main>
  );
};
