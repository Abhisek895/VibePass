"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/store/auth';
import {
  getApiErrorMessage,
  login,
  requestOtp,
  socialLogin,
  verifyOtp,
  type AuthResponse,
  type OtpContext,
  type OtpDeliveryMode,
  type SocialProvider,
} from '@/services/api';

type AuthView =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'forgot-username'
  | 'verify-otp'
  | 'reset-password'
  | 'reset-username';

type AuthFlowOtpContext = OtpContext | null;

interface AuthFlowProps {
  initialView?: AuthView;
}

export default function AuthFlow({ initialView }: AuthFlowProps = {}) {
  const { login: authLogin } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [otpContext, setOtpContext] = useState<AuthFlowOtpContext>(null);

  useEffect(() => {
    if (initialView) {
      setView(initialView);
    } else {
      const savedView = sessionStorage.getItem('authView') as AuthView;
      if (savedView) {
        setView(savedView);
        sessionStorage.removeItem('authView');
      }
    }
  }, [initialView]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [otpDeliveryMode, setOtpDeliveryMode] = useState<OtpDeliveryMode | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── States for Reset/Update ──
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');

  const slideVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } },
  };

  const clearTransientState = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setOtpPreview('');
    setOtpDeliveryMode(null);
  };

  /** Store token + user data in AuthProvider and redirect */
  const handleAuthSuccess = (data: AuthResponse) => {
    if (data.accessToken && data.user?.id) {
      authLogin(data.accessToken, {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username || data.user.nickname || data.user.email.split('@')[0],
      });
    }

    // Reset admin mode so the mode selector shows on next load
    import('@/store/admin-mode').then(({ useAdminMode }) => {
      useAdminMode.getState().reset();
    });

    const destination =
      data.isNewUser || !data.user?.username ? '/onboarding' : '/matches';
    window.location.href = destination;
  };

  const handleRequestOtp = async (context: OtpContext, providedUsername?: string) => {
    if (!email) {
      setErrorMsg('Email is required');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const payload = {
        email,
        context,
        ...(context === 'signup'
          ? {
            password,
            username: providedUsername || nickname,
          }
          : {}),
      };
      const data = await requestOtp(payload);
      setOtpContext(context);
      setOtpPreview(data.otpPreview || '');
      setOtpDeliveryMode(data.deliveryMode || null);
      setView('verify-otp');
      setSuccessMsg(data.message || 'OTP sent successfully!');
    } catch (error) {
      setErrorMsg(
        getApiErrorMessage(error, 'Network error. Is the backend running?'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrorMsg('OTP must be 6 digits');
      return;
    }

    if (!otpContext) {
      setErrorMsg('Please request a new OTP first.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const data = await verifyOtp({ email, otp, context: otpContext });
      setSuccessMsg(data.message || 'Verification successful!');

      if (data.accessToken) {
        // For forgot flows, we stay in AuthFlow to complete the reset/recovery
        if (otpContext === 'forgot-password') {
          setView('reset-password');
        } else if (otpContext === 'forgot-username') {
          setView('reset-username');
        } else {
          handleAuthSuccess(data);
        }
      }
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Network error.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { updateMe } = await import('@/services/api/users.service');
      await updateMe({ password: newPassword });
      setSuccessMsg('Password updated successfully!');

      // Now we can redirect
      const { apiRequest } = await import('@/services/api/client');
      const data = await apiRequest<{ id: string; email: string; username?: string | null; nickname?: string }>('/api/v1/users/me', { auth: true });
      handleAuthSuccess({ success: true, accessToken: 'true', user: data });
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Failed to reset password.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetUsername = async (newUsername: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { updateMe } = await import('@/services/api/users.service');
      await updateMe({ username: newUsername });
      setSuccessMsg('Username updated successfully!');

      const { apiRequest } = await import('@/services/api/client');
      const data = await apiRequest<{ id: string; email: string; username?: string | null; nickname?: string }>('/api/v1/users/me', { auth: true });
      handleAuthSuccess({ success: true, accessToken: 'true', user: data });
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Failed to update username.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await socialLogin({
        provider,
        email: email || undefined,
        displayName: nickname || undefined,
        providerUserId: getProviderUserId(provider),
      });

      setSuccessMsg(data.message || `Signed in with ${provider}.`);
      if (data.accessToken) {
        handleAuthSuccess(data);
      }
    } catch (error) {
      setErrorMsg(
        getApiErrorMessage(error, `Unable to sign in with ${provider}.`),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (view === 'register') {
      if (!email || !password) {
        setErrorMsg('Email and Password are required');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters');
        return;
      }

      // Generate a temporary nickname to satisfy backend requirement
      // The user will set their real nickname during onboarding
      const tempNickname = `vibe_${Math.floor(Math.random() * 1000000)}`;
      setNickname(tempNickname);

      void handleRequestOtp('signup', tempNickname);
      return;
    }

    if (view === 'forgot-password') {
      void handleRequestOtp('forgot-password');
      return;
    }

    if (view === 'forgot-username') {
      void handleRequestOtp('forgot-username');
      return;
    }

    if (view === 'verify-otp') {
      void handleVerifyOtp();
      return;
    }

    if (view === 'reset-password') {
      if (newPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('Password must be at least 6 characters');
        return;
      }
      void handleResetPassword(newPassword);
      return;
    }

    if (view === 'reset-username') {
      if (!newUsername.trim()) {
        setErrorMsg('Username is required');
        return;
      }
      void handleResetUsername(newUsername);
      return;
    }

    if (!email || !password) {
      setErrorMsg('Email and Password are required');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    login({ email, password })
      .then((data) => {
        setSuccessMsg(data.message || 'Logged in successfully!');
        if (data.accessToken) {
          handleAuthSuccess(data);
        }
      })
      .catch((error) => {
        setErrorMsg(
          getApiErrorMessage(error, 'Incorrect email or password.'),
        );
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="relative mx-auto min-h-[400px] w-full max-w-sm sm:max-w-md md:max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="vibe-card w-full"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">
              {view === 'login' && 'Welcome back'}
              {view === 'register' && 'Join VibePass'}
              {view === 'forgot-password' && 'Reset Password'}
              {view === 'forgot-username' && 'Recover Username'}
              {view === 'verify-otp' && 'Check your email'}
              {view === 'reset-password' && 'Choose New Password'}
              {view === 'reset-username' && 'Update Nickname'}
            </h2>
            <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
              {view === 'login' && 'Log in to continue your secure session.'}
              {view === 'register' && 'Join anonymously. Reveal by choice.'}
              {view === 'reset-password' && 'Secure your account with a fresh password.'}
              {view === 'reset-username' && 'Confirm or choose a new anonymous identity.'}
              {view === 'verify-otp' &&
                (otpDeliveryMode === 'smtp'
                  ? `We sent a 6-digit code to ${email}`
                  : 'Use the OTP below or the one shown in the backend logs.')}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-lg border border-[rgb(var(--danger),0.2)] bg-[rgb(var(--danger),0.1)] p-3 text-center text-sm text-[rgb(var(--danger))]">
              {errorMsg === 'Incorrect email or password' ? 'Incorrect email or password' : errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-lg border border-[rgb(var(--success),0.2)] bg-[rgb(var(--success),0.1)] p-3 text-center text-sm text-[rgb(var(--success))]">
              {successMsg}
            </div>
          )}

          {(view === 'login' || view === 'register') && (
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-3">
                <SocialButton
                  label="Google"
                  onClick={() => void handleSocialLogin('google')}
                  disabled={isLoading}
                />
                <SocialButton
                  label="Facebook"
                  onClick={() => void handleSocialLogin('facebook')}
                  disabled={isLoading}
                />
                <SocialButton
                  label="Instagram"
                  onClick={() => void handleSocialLogin('instagram')}
                  disabled={isLoading}
                />
              </div>
              <p className="text-center text-xs text-[rgb(var(--text-muted))]">
                Sign in faster with social accounts.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {(view === 'login' || view === 'register') && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-[rgb(var(--bg-secondary))] px-4 py-3 text-[rgb(var(--text-primary))] outline-none transition-all placeholder:text-[rgb(var(--text-muted))] focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-[rgb(var(--bg-secondary))] px-4 py-3 text-[rgb(var(--text-primary))] outline-none transition-all placeholder:text-[rgb(var(--text-muted))] focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                    placeholder="********"
                  />
                </div>
              </div>
            )}

            {view === 'reset-password' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-[rgb(var(--bg-secondary))] px-4 py-3 text-[rgb(var(--text-primary))] outline-none transition-all placeholder:text-[rgb(var(--text-muted))] focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-[rgb(var(--bg-secondary))] px-4 py-3 text-[rgb(var(--text-primary))] outline-none transition-all placeholder:text-[rgb(var(--text-muted))] focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            )}

            {view === 'reset-username' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Your Nickname
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-[rgb(var(--bg-secondary))] px-4 py-3 text-[rgb(var(--text-primary))] outline-none transition-all placeholder:text-[rgb(var(--text-muted))] focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                    placeholder="e.g. VibeMaster"
                  />
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  Verification successful! You can keep your current nickname or choose a new one.
                </p>
              </div>
            )}

            {view === 'verify-otp' && (
              <div className="space-y-3">
                {otpPreview && (
                  <div className="rounded-xl border border-[rgba(var(--accent-primary),0.35)] bg-[rgba(var(--accent-primary),0.08)] px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
                      Development OTP
                    </p>
                    <p className="mt-2 font-mono text-2xl tracking-[0.35em] text-[rgb(var(--text-primary))]">
                      {otpPreview}
                    </p>
                    <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">
                      Email delivery is in local fallback mode, so you can use
                      this code directly.
                    </p>
                  </div>
                )}

                <label className="mb-4 block w-full text-center text-sm font-medium text-[rgb(var(--text-secondary))]">
                  Enter 6-digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full rounded-xl border border-transparent bg-[rgb(var(--bg-secondary))] px-4 py-4 text-center font-mono text-3xl tracking-[1em] text-[rgb(var(--text-primary))] outline-none transition-all placeholder:text-[rgb(var(--text-muted))] focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                  placeholder="------"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary mt-6 w-full ${isLoading
                ? 'skeleton-shimmer cursor-not-allowed text-transparent opacity-70'
                : ''
                }`}
            >
              {!isLoading && (
                <>
                  {view === 'login' && 'Sign In'}
                  {view === 'register' && 'Create Account'}
                  {view === 'forgot-password' && 'Send Reset Code'}
                  {view === 'forgot-username' && 'Send Recovery Code'}
                  {view === 'verify-otp' && 'Verify'}
                  {view === 'reset-password' && 'Update Password'}
                  {view === 'reset-username' && 'Update Nickname'}
                </>
              )}
              {isLoading && 'Processing...'}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center space-y-4 text-sm text-[rgb(var(--text-muted))]">
            {view === 'login' && (
              <>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setView('forgot-password');
                      clearTransientState();
                    }}
                    className="transition-colors hover:text-[rgb(var(--text-primary))]"
                  >
                    Forgot Password?
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => {
                      setView('forgot-username');
                      clearTransientState();
                    }}
                    className="transition-colors hover:text-[rgb(var(--text-primary))]"
                  >
                    Forgot Username?
                  </button>
                </div>
                <div className="w-full border-t border-[rgba(var(--border-subtle),0.1)] pt-4 text-center">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setView('register');
                      clearTransientState();
                    }}
                    className="font-medium text-[rgb(var(--accent-primary))] transition-all hover:brightness-125"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {view === 'register' && (
              <div className="w-full text-center space-y-4">
                <p className="text-[10px] text-[rgb(var(--text-muted))] px-6">
                  By continuing, you agree to our <span className="text-[rgb(var(--text-secondary))] underline cursor-pointer">Terms</span> & <span className="text-[rgb(var(--text-secondary))] underline cursor-pointer">Privacy Policy</span>
                </p>
                <div className="border-t border-[rgba(var(--border-subtle),0.1)] pt-4">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setView('login');
                      clearTransientState();
                    }}
                    className="font-medium text-[rgb(var(--accent-primary))] transition-all hover:brightness-125"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}

            {(view === 'forgot-password' ||
              view === 'forgot-username' ||
              view === 'verify-otp') && (
                <button
                  onClick={() => {
                    setView('login');
                    clearTransientState();
                  }}
                  className="py-2 transition-colors hover:text-[rgb(var(--text-primary))]"
                >
                  {'<- Back to Login'}
                </button>
              )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getProviderUserId(provider: SocialProvider) {
  const storageKey = `vibepass-social-${provider}`;
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const generated = window.crypto.randomUUID();
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

type SocialButtonProps = {
  disabled: boolean;
  label: string;
  onClick: () => void;
};

function SocialButton({ disabled, label, onClick }: SocialButtonProps) {
  const getIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-[rgba(var(--border-subtle),0.18)] bg-[rgba(var(--bg-secondary),0.75)] px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))] transition-all hover:border-[rgba(var(--accent-primary),0.35)] hover:bg-[rgba(var(--bg-secondary),0.95)] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-3"
    >
      {getIcon(label)}
      <span className="sr-only">Continue with {label}</span>
    </button>
  );
}
