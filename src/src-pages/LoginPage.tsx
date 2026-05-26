'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

type Mode = 'login' | 'register' | 'verify-otp' | 'forgot-password';

type Props = {
  initialMode?: Mode;
};

export default function LoginPage({ initialMode = 'login' }: Props) {
  const [mode, setMode] = useState<<Mode>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset messages when mode changes
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [mode]);

  // ==================== LOGIN ====================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.message || 'Login failed');
        return;
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  // ==================== REGISTER ====================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          displayName: displayName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        setError(data?.message || 'Registration failed');
        return;
      }

      setRegisteredEmail(email.trim());

      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData?.success) {
        setError(otpData?.message || 'Failed to send OTP');
        return;
      }

      setSuccess('Account created! Check your email for the verification code.');
      setMode('verify-otp');
    } catch (err: any) {
      setError(err.message || 'Something went wrong during registration');
    } finally {
      setIsPending(false);
    }
  };

  // ==================== VERIFY OTP ====================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    const fullOtp = otpDigits.join('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registeredEmail,
          otp: fullOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        setError(data?.message || 'Invalid or expired OTP');
        return;
      }

      setSuccess('Email verified! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsPending(false);
    }
  };

  // ==================== FORGOT PASSWORD ====================
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        setError(data?.message || 'Failed to send reset link');
        return;
      }

      setSuccess('Password reset link has been sent to your email.');
      setForgotEmail('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  // ==================== GOOGLE AUTH ====================
  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtp(newDigits.join(''));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g '').slice(0, 6);
    const newDigits = [...otpDigits];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setOtpDigits(newDigits);
    setOtp(newDigits.join(''));
    if (pasted.length > 0) {
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const modeTitle = {
    login: 'Welcome back',
    register: 'Get started',
    'verify-otp': 'Verify email',
    'forgot-password': 'Reset password',
  };

  const modeSubtitle = {
    login: 'Sign in to your account to continue',
    register: 'Create your account in seconds',
    'verify-otp': `We sent a code to ${registeredEmail || 'your email'}`,
    'forgot-password': "We'll send you a reset link",
  };

  return (
    <>
      <Navigation />

      <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 px-4 pb-12 pt-24 text-slate-900 sm:px-6 lg:px-8">
        {/* Decorative background elements */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          {/* Back link */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-800"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to home
          </Link>

          {/* Main Card */}
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
            {/* Header */}
            <div className="border-b border-slate-100 px-6 py-8 text-center sm:px-10">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                <Sparkles size={20} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {modeTitle[mode]}
              </h1>
              <p className="mt-2 text-sm text-slate-500">{modeSubtitle[mode]}</p>
            </div>

            {/* Body */}
            <div className="px-6 py-8 sm:px-10">
              {/* Google Buttons */}
              {(mode === 'login' || mode === 'register') && (
                <>
                  <button
                    onClick={handleGoogleAuth}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
                  >
                    <GoogleIcon />
                    {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                  </button>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      or
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </>
              )}

              {/* LOGIN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <InputGroup
                    icon={<User size={18} />}
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Username or Email"
                    required
                  />
                  <InputGroup
                    icon={<Lock size={18} />}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <InputGroup
                    icon={<User size={18} />}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                  />
                  <InputGroup
                    icon={<Mail size={18} />}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                  />
                  <InputGroup
                    icon={<User size={18} />}
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name (optional)"
                  />
                  <InputGroup
                    icon={<Lock size={18} />}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              )}

              {/* OTP VERIFICATION */}
              {mode === 'verify-otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        className="h-14 w-12 rounded-xl border-2 border-slate-200 bg-white text-center text-2xl font-bold text-slate-900 shadow-sm transition-all focus:border-slate-900 focus:shadow-md focus:outline-none sm:h-16 sm:w-14"
                        maxLength={1}
                        required
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || otpDigits.join('').length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {mode === 'forgot-password' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <InputGroup
                    icon={<Mail size={18} />}
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              )}

              {/* Messages */}
              {error && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Mode Switcher */}
              <div className="mt-8 text-center text-sm text-slate-500">
                {mode === 'login' && (
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="font-semibold text-slate-900 transition-colors hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                )}
                {mode === 'register' && (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="font-semibold text-slate-900 transition-colors hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode === 'forgot-password' && (
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold text-slate-900 transition-colors hover:underline"
                  >
                    Back to Sign In
                  </button>
                )}
                {mode === 'verify-otp' && (
                  <button
                    onClick={() => setMode('register')}
                    className="font-semibold text-slate-900 transition-colors hover:underline"
                  >
                    Back to registration
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Protected by industry-standard encryption
          </p>
        </div>
      </main>
    </>
  );
}

/* ==================== SUBCOMPONENTS ==================== */

function InputGroup({
  icon,
  rightElement,
  className = '',
  ...props
}: React.InputHTMLAttributes<<HTMLInputElement> & {
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>
      <input
        {...props}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100"
      />
      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.34z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
