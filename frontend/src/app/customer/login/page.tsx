'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Store,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getDashboardForRole } from '@/utils/roleRoutes';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const login = useStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Clear old session credentials to prevent stale token pollution
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zibonbaba_token');
        localStorage.removeItem('zibonbaba_user');
        localStorage.removeItem('zibonbaba_role');
        sessionStorage.clear();
      }

      const success = await login(email, password);
      if (success) {
        let userRole = '';
        if (typeof window !== 'undefined') {
          const uStr = localStorage.getItem('zibonbaba_user');
          if (uStr) {
            try {
              const u = JSON.parse(uStr);
              userRole = u.role;
            } catch (_) {}
          }
        }
        
        if (redirectParam && redirectParam.startsWith('/')) {
          router.replace(redirectParam);
        } else {
          const target = getDashboardForRole(userRole || useStore.getState().role);
          router.replace(target);
        }
      } else {
        setError('Invalid credentials or account is suspended. Please try again.');
      }
    } catch {
      setError('Connection failed. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand & Title */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-amber-400 flex items-center justify-center font-black text-slate-950 text-2xl shadow-glow group-hover:scale-105 transition-transform duration-200">
            Z
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">
            Zibon<span className="text-primary">baba</span>
          </span>
        </Link>
        <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
        <p className="text-xs text-slate-400 mt-1">Sign in to your customer account to manage orders</p>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 animate-slide-up">
        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-xs font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-primary hover:text-amber-300 font-bold transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-primary transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-primary w-3.5 h-3.5 rounded"
              />
              <span className="text-xs text-slate-400 font-medium">Keep me signed in</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-accent active:scale-98 disabled:opacity-60 text-slate-950 text-xs font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Customer Hub</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center border-t border-slate-800 pt-4 space-y-3">
          <p className="text-xs text-slate-400 font-medium">
            Don&apos;t have an account?{' '}
            <Link
              href={redirectParam ? `/customer/register?redirect=${encodeURIComponent(redirectParam)}` : '/customer/register'}
              className="text-primary hover:text-amber-300 font-bold transition-colors"
            >
              Create Account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 font-semibold pt-1">
            <Link href="/seller/login" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <Store className="w-3 h-3 text-amber-500" /> Seller Center
            </Link>
            <span>•</span>
            <Link href="/delivery/login" className="hover:text-slate-300 transition-colors">
              Delivery Portal
            </Link>
            <span>•</span>
            <Link href="/reseller/login" className="hover:text-slate-300 transition-colors">
              Reseller Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase mt-3">Loading Secure Portal...</p>
        </div>
      }>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
