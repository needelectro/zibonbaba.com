'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Tag,
  ArrowRight,
  ArrowLeft,
  Store,
  Sparkles,
  Gift,
  ShieldCheck
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
      <label htmlFor={id} className="block text-xs font-semibold text-gray-300 mb-1.5">
        {label}{!required && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
        <input
          id={id}
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
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

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          role: 'CUSTOMER',
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/customer/login?registered=1');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/5 relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-yellow-400 flex items-center justify-center font-extrabold text-gray-950 text-base shadow-glow">
            Z
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">
            Zibon<span className="text-primary">baba</span>
          </span>
        </Link>
        <Link
          href="/customer/login"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Already have an account?</span>
          <span className="text-primary font-bold">Sign in</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3">
                <User size={22} />
              </div>
              <h1 className="text-xl font-black text-white">Create Customer Account</h1>
              <p className="text-xs text-gray-400 mt-1">Join Zibonbaba for seamless multi-vendor shopping</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-red-400 font-semibold animate-fade-in">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-5 p-3.5 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-green-400 font-semibold animate-fade-in">
                <CheckCircle2 size={16} className="shrink-0 text-green-400" />
                <span>Account created! Redirecting to login...</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="e.g. Tanvir Ahmed"
                icon={<User size={15} />}
              />

              <Field
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                icon={<Mail size={15} />}
              />

              <Field
                id="phone"
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+880 1700-000000"
                icon={<Phone size={15} />}
                required={false}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Min 6 chars"
                  icon={<Lock size={15} />}
                />
                <Field
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat password"
                  icon={<Lock size={15} />}
                />
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <label htmlFor="referralCode" className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                  <Tag size={12} className="text-yellow-400" />
                  <span>Referral Code</span>
                  <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Gift size={15} />
                  </span>
                  <input
                    id="referralCode"
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ZB-REF-100"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm uppercase tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <span className="text-primary hover:underline">Terms of Service</span> and{' '}
                  <span className="text-primary hover:underline">Privacy Policy</span>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-extrabold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Merchant / Reseller registration link */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2 text-center text-xs text-gray-400">
              <p>
                Want to sell products on Zibonbaba?{' '}
                <Link href="/seller/register" className="text-primary hover:underline font-bold">
                  Open a Seller Store
                </Link>
              </p>
              <p>
                Earn commissions by sharing products?{' '}
                <Link href="/reseller/register" className="text-yellow-400 hover:underline font-bold">
                  Join as Reseller
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-gray-600 relative z-10">
        © {new Date().getFullYear()} Zibonbaba.com — All rights reserved.
      </footer>
    </div>
  );
}
