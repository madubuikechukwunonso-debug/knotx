'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

type Mode = 'login' | 'register' | 'verify-otp' | 'forgot-password';

type Props = {
  initialMode?: Mode;
};

export default function LoginPage({ initialMode = 'login' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
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

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registeredEmail,
          otp: otp.trim(),
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

  // Google SVG Icon
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.34z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-[#f8f5f0] px-6 pb-16 pt-28 text-black md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-black/65 hover:opacity-70">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:grid-cols-[0.95fr_1.05fr]">
            {/* Left Panel */}
            <div className="bg-black px-8 py-12 text-white sm:px-10 lg:px-12">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">KNOTXANDKRAFTS</p>
              <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Your Account'}
                {mode === 'verify-otp' && 'Verify Your Email'}
                {mode === 'forgot-password' && 'Reset Password'}
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                {mode === 'login' && 'Sign in to manage your bookings and orders.'}
                {mode === 'register' && 'Join to book services and shop with us.'}
                {mode === 'verify-otp' && 'Enter the code we sent to your email.'}
                {mode === 'forgot-password' && 'Enter your email to receive a reset link.'}
              </p>
            </div>

            {/* Right Panel */}
            <div className="px-8 py-12 sm:px-10 lg:px-12">
              <div className="mx-auto max-w-md">
                <div className="mb-8">
                  <h2 className="font-serif text-3xl text-black">
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'verify-otp' && 'Verify OTP'}
                    {mode === 'forgot-password' && 'Forgot Password'}
                  </h2>
                </div>

                {/* Google Buttons */}
                {(mode === 'login' || mode === 'register') && (
                  <button
                    onClick={() => window.location.href = '/api/auth/google'}
                    className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 py-3 text-sm font-medium hover:bg-black/5 transition-colors"
                  >
                    <GoogleIcon />
                    {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                  </button>
                )}

                {/* LOGIN FORM */}
                {mode === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
                      placeholder="Username or Email"
                      required
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {isPending ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-sm text-black/60 hover:text-black underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </form>
                )}

                {/* REGISTER FORM */}
                {mode === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-5">
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" placeholder="Username" required />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" placeholder="Email" required />
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" placeholder="Display Name (optional)" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" placeholder="Password" required minLength={6} />

                    <button type="submit" disabled={isPending} className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white disabled:opacity-60">
                      {isPending ? 'Creating Account...' : 'Create Account & Send OTP'}
                    </button>
                  </form>
                )}

                {/* OTP VERIFICATION */}
                {mode === 'verify-otp' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <p className="text-sm text-black/60">Enter the 6-digit code sent to <strong>{registeredEmail}</strong></p>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-2xl border border-black/10 px-4 py-4 text-center text-3xl tracking-[12px]"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    <button type="submit" disabled={isPending || otp.length !== 6} className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white disabled:opacity-60">
                      {isPending ? 'Verifying...' : 'Verify & Continue to Dashboard'}
                    </button>
                  </form>
                )}

                {/* FORGOT PASSWORD FORM */}
                {mode === 'forgot-password' && (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
                      placeholder="Enter your email"
                      required
                    />
                    <button type="submit" disabled={isPending} className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white disabled:opacity-60">
                      {isPending ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                )}

                {/* Messages */}
                {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

                {/* Mode Switcher */}
                <div className="mt-8 text-center text-sm text-black/60">
                  {mode === 'login' && (
                    <>Don&apos;t have an account? <button onClick={() => setMode('register')} className="font-medium text-black underline">Create one</button></>
                  )}
                  {mode === 'register' && (
                    <>Already have an account? <button onClick={() => setMode('login')} className="font-medium text-black underline">Sign in</button></>
                  )}
                  {mode === 'forgot-password' && (
                    <button onClick={() => setMode('login')} className="text-black underline">Back to Sign In</button>
                  )}
                  {mode === 'verify-otp' && (
                    <button onClick={() => setMode('register')} className="text-black underline">Back to registration</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
