'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle2, Tag, ArrowRight, ArrowLeft,
  ShoppingBag, Sparkles
} from 'lucide-react';
import { useStore } from '@/store/useStore';

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  required?: boolean;
}

function Field({ id, label, type = 'text', value, onChange, placeholder, icon, required = true }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
        {label}{!required && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
        <input
          id={id}
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to continue.');
      return;
    }

    const body: Record<string, string> = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      role: 'CUSTOMER',
    };
    if (referralCode.trim()) {
      body.referralCode = referralCode.trim();
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || 'Registration failed. Please try again.');
        return;
      }

      try {
        await login(email.trim().toLowerCase(), password);
      } catch (_) {}

      setSuccess(true);
    } catch {
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-dark relative overflow-hidden px-4">
        <Link
          href="/"
          className="absolute top-4 left-4 z-50 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-modal p-8 sm:p-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={36} className="text-green-400 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Welcome to Zibonbaba! 🎉</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Your customer account is ready with 100 welcome bonus loyalty points. Start exploring thousands of products today!
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-accent text-gray-900 font-bold px-6 py-3 rounded-lg transition-all shadow-glow text-sm"
              >
                Start Shopping <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold px-6 py-3 rounded-lg transition-all text-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-neutral-dark py-8 px-4 sm:px-6">
      <Link
        href="/"
        className="absolute top-4 left-4 z-50 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
        aria-label="Back to Home"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950" />
        <div className="absolute top-[-10%] right-[-10%] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />
      </div>
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,193,7,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,193,7,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary shadow-glow mb-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">Z</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Create Customer Account</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Join Zibonbaba to enjoy seamless shopping, express delivery, and exclusive rewards</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-modal p-6 sm:p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3.5 py-2.5 mb-4 text-xs sm:text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <Field
              id="reg-fullname"
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              placeholder="e.g. Rashedul Karim"
              icon={<User size={16} />}
            />
            <Field
              id="reg-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
            />
            <Field
              id="reg-phone"
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+880 1XXX-XXXXXX"
              icon={<Phone size={16} />}
              required={false}
            />
            <Field
              id="reg-referral"
              label="Referral Code"
              value={referralCode}
              onChange={setReferralCode}
              placeholder="e.g. ZB8X9K2"
              icon={<Tag size={16} />}
              required={false}
            />
            <Field
              id="reg-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Min. 6 characters"
              icon={<Lock size={16} />}
            />
            <Field
              id="reg-confirm-password"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter your password"
              icon={<Lock size={16} />}
            />

            <div className="pt-1">
              <label htmlFor="terms-checkbox" className="flex items-start gap-2.5 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border border-white/20 rounded bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    {termsAccepted && <CheckCircle2 size={11} className="text-gray-900" />}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-400 leading-relaxed select-none">
                  I agree to the{' '}
                  <span className="text-primary hover:text-yellow-300 font-semibold cursor-pointer transition-colors">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-primary hover:text-yellow-300 font-semibold cursor-pointer transition-colors">Privacy Policy</span>
                </span>
              </label>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-accent active:bg-primary-dark text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-glow hover:shadow-[0_0_20px_rgba(255,193,7,0.4)] disabled:opacity-60 disabled:cursor-not-allowed mt-3 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-yellow-300 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Want to sell products on Zibonbaba?{' '}
            <Link href="/seller/register" className="text-yellow-400 hover:text-yellow-300 font-medium underline transition-colors">
              Register as a Seller
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
