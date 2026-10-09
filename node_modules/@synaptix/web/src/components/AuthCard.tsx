import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthCardProps {
  onOpenForgotPassword: () => void;
  onSuccessAuth: (userEmail: string, mode: 'login' | 'signup') => void;
  onGoogleAuth: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onOpenForgotPassword,
  onSuccessAuth,
  onGoogleAuth,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Field values
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full Name is required';
      }
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      newErrors.email = emailErr;
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccessAuth(email, mode);
    }, 1200);
  };

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

      {/* Dynamic Form with Fade-Slide Transition */}
      <div className="form-transition-container">
        <form key={mode} onSubmit={handleSubmit} className="fade-slide-enter" noValidate>
          {/* Full Name field (Signup state only) */}
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="full-name" className="form-label">
                Full Name
              </label>
              <div className="input-wrapper">
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="Alex Vance"
                  className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                  autoComplete="name"
                />
                <User className="input-icon" size={18} />
              </div>
              {errors.fullName && (
                <span className="field-error-msg">
                  <AlertCircle size={14} /> {errors.fullName}
                </span>
              )}
            </div>
          )}

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Work Email
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="you@company.com"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              <Mail className="input-icon" size={18} />
            </div>
            {errors.email && (
              <span className="field-error-msg">
                <AlertCircle size={14} /> {errors.email}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className="form-group">
            <div className="field-header-row">
              <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>
                Password
              </label>
              {mode === 'login' && (
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenForgotPassword();
                  }}
                  className="forgot-link"
                >
                  Forgot password?
                </a>
              )}
            </div>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                  if (mode === 'signup' && confirmPassword && e.target.value !== confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                  } else if (mode === 'signup' && confirmPassword && e.target.value === confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="••••••••••••"
                className={`form-input has-toggle ${errors.password ? 'input-error' : ''}`}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <Lock className="input-icon" size={18} />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error-msg">
                <AlertCircle size={14} /> {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password field (Signup state only) */}
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                Confirm Password
              </label>
              <div className="input-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (password && e.target.value !== password) {
                      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                    } else {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`form-input has-toggle ${errors.confirmPassword ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <Lock className="input-icon" size={18} />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error-msg">
                  <AlertCircle size={14} /> {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : mode === 'login' ? (
              <>
                Login <ArrowRight size={16} className="btn-arrow-icon" />
              </>
            ) : (
              <>
                Create Account <ArrowRight size={16} className="btn-arrow-icon" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* OR Divider */}
      <div className="divider">
        <span>OR</span>
      </div>

      {/* Google Authentication Button */}
      <button type="button" onClick={onGoogleAuth} className="btn-google">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
      </button>

      {/* Mode Switcher Footer */}
      <footer className="auth-footer">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button type="button" onClick={() => toggleMode('signup')}>
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => toggleMode('login')}>
              Login
            </button>
          </>
        )}
      </footer>
    </div>
  );
};
