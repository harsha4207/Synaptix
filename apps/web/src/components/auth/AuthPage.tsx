import React, { useState } from 'react';
import { BrandPanel } from './BrandPanel';
import { AuthCard } from './AuthCard';
import { ForgotPasswordModal } from '../ForgotPasswordModal';

export interface AuthPageProps {
  onSuccessAuth: (email: string, mode: 'login' | 'signup') => void;
  onGoogleAuth: () => void;
  onAddToast?: (msg: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccessAuth,
  onGoogleAuth,
  onAddToast,
}) => {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  return (
    <main className="app-viewport">
      <div className="centered-page-container">
        {/* Left 48% — Synaptix Branding */}
        <BrandPanel />

        {/* Right 52% — Authentication Card */}
        <section className="right-auth-panel" aria-label="Sign In Section">
          <AuthCard
            onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
            onSuccessAuth={onSuccessAuth}
            onGoogleAuth={onGoogleAuth}
          />
        </section>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccessToast={onAddToast || (() => {})}
      />
    </main>
  );
};
