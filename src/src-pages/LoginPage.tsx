'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { LogIn, UserPlus, ArrowLeft, Mail } from 'lucide-react';

type Mode = 'login' | 'register' | 'verify-otp';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
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

      // Registration successful → Send OTP
      setRegisteredEmail(email.trim());
      
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData?.success) {
        setError(otpData?.message || 'Failed to send OTP. Please try again.');
        return;
      }

      setSuccess('Account created! We sent a verification code to your email.');
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

      setSuccess('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsPending(false);
    }
  };

  // ==================== GOOGLE SIGN UP ====================
  const handleGoogleSignUp = () => {
    // Redirect to Google OAuth endpoint
    // You need to create src/app/api/auth/google/route.ts using your Google Client ID & Secret from Google Cloud Console
    window.location.href = '/api/auth/google';
  };

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-[#f8f5f0] px-6 pb-16 pt-28 text-black md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-black/65 hover:opacity-70">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:grid-cols-[0.95fr_1.05fr]">
            {/* Left Side */}
            <div className="bg-black px-8 py-12 text-white sm:px-10 lg:px-12">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">KNOTXANDKRAFTS</p>
              <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Your Account'}
                {mode === 'verify-otp' && 'Verify Your Email'}
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                {mode === 'login' && 'Sign in to manage your bookings, orders and profile.'}
                {mode === 'register' && 'Join Knotx & Krafts to book services and shop premium products.'}
                {mode === 'verify-otp' && 'Enter the 6-digit code we sent to your email.'}
              </p>
            </div>

            {/* Right Side - Forms */}
            <div className="px-8 py-12 sm:px-10 lg:px-12">
              <div className="mx-auto max-w-md">
                <div className="mb-8">
                  <h2 className="font-serif text-3xl text-black">
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'verify-otp' && 'Verify OTP'}
                  </h2>
                </div>

                {/* Google Sign Up Button */}
                {mode === 'register' && (
                  <button
                    onClick={handleGoogleSignUp}
                    className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 py-3 text-sm font-medium hover:bg-black/5 transition-colors"
                  >
                    <Mail size={18} /> Sign up with Google
                  </button>
                )}

                {/* LOGIN FORM */}
                {mode === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">Username or Email</label>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                        placeholder="Enter username or email"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                        placeholder="Enter password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <LogIn size={18} /> {isPending ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                )}

                {/* REGISTER FORM */}
                {mode === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">Username</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" placeholder="Choose a username" required />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" placeholder="you@example.com" required />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">Display Name (Optional)</label>
                      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" placeholder="How should we call you?" />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" placeholder="Create a strong password" required minLength={6} />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <UserPlus size={18} /> {isPending ? 'Creating Account...' : 'Create Account & Send OTP'}
                    </button>
                  </form>
                )}

                {/* OTP VERIFICATION FORM */}
                {mode === 'verify-otp' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <p className="text-sm text-black/60">
                      Enter the 6-digit code sent to <strong>{registeredEmail}</strong>
                    </p>

                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-2xl border border-black/10 px-4 py-4 text-center text-3xl tracking-[12px] font-mono"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />

                    <button
                      type="submit"
                      disabled={isPending || otp.length !== 6}
                      className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {isPending ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Resend OTP
                        fetch('/api/auth/send-otp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: registeredEmail }),
                        });
                        setSuccess('New code sent!');
                      }}
                      className="w-full text-sm text-black/60 hover:text-black underline"
                    >
                      Didn&apos;t receive the code? Resend
                    </button>
                  </form>
                )}

                {/* Messages */}
                {error && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                {/* Mode Switcher */}
                <div className="mt-8 text-center text-sm text-black/60">
                  {mode === 'login' && (
                    <>Don&apos;t have an account? <button onClick={() => setMode('register')} className="font-medium text-black underline">Create one</button></>
                  )}
                  {mode === 'register' && (
                    <>Already have an account? <button onClick={() => setMode('login')} className="font-medium text-black underline">Sign in</button></>
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
```
