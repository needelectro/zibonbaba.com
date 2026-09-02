'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { translations } from '@/utils/translations';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDashboardForRole } from '@/utils/roleRoutes';

export default function LoginPage() {
  const { login, language } = useStore();
  const t = translations[language];
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      // Resolve redirect based on actual stored user role
      let userRole = '';
      if (typeof window !== 'undefined') {
        const uStr = localStorage.getItem('zibonbaba_user');
        if (uStr) {
          try {
            userRole = JSON.parse(uStr).role;
          } catch (_) {}
        }
      }
      const targetPath = getDashboardForRole(userRole || useStore.getState().role);
      router.push(targetPath);
    } else {
      setError(language === 'en' ? 'Invalid credentials or account is locked. Please try again.' : 'ভুল তথ্য বা অ্যাকাউন্ট লক করা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-light/30">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-card border border-neutral-light animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-black text-neutral-dark text-xl mx-auto shadow-sm">
            Z
          </div>
          <h2 className="text-2xl font-black text-neutral-dark tracking-tight">
            {t.loginTitle}
          </h2>
          <p className="text-xs text-neutral-muted">
            {language === 'en' ? 'Sign in to your Zibonbaba account' : 'আপনার জীবনবাবা অ্যাকাউন্টে সাইন ইন করুন'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-dark mb-1.5">{t.emailLabel}</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-neutral-light border border-neutral-light rounded-xl px-4 py-3 text-xs text-neutral-dark outline-none focus:border-primary font-medium"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-dark mb-1.5">{t.passwordLabel}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-light border border-neutral-light rounded-xl px-4 py-3 text-xs text-neutral-dark outline-none focus:border-primary font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-dark"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <Link href="/forgot-password" className="text-[11px] text-primary-dark hover:underline font-bold">
                {t.forgotPassword}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-neutral-dark font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? (
              <span>{language === 'en' ? 'Signing in...' : 'সাইন ইন হচ্ছে...'}</span>
            ) : (
              <>
                <span>{t.signInBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-neutral-light pt-4 space-y-2">
          <p className="text-xs text-neutral-muted">
            {language === 'en' ? "Don't have an account?" : 'অ্যাকাউন্ট নেই?'}{' '}
            <Link href="/register" className="text-primary-dark font-bold hover:underline">
              {language === 'en' ? 'Create one now' : 'এখনই নিবন্ধন করুন'}
            </Link>
          </p>
          <div className="flex justify-center gap-4 text-[11px] text-neutral-muted pt-2 font-medium">
            <Link href="/seller/login" className="hover:text-neutral-dark hover:underline">
              {language === 'en' ? 'Seller Login' : 'বিক্রেতা লগইন'}
            </Link>
            <span>•</span>
            <Link href="/delivery/login" className="hover:text-neutral-dark hover:underline">
              {language === 'en' ? 'Delivery Login' : 'ডেলিভারি লগইন'}
            </Link>
            <span>•</span>
            <Link href="/reseller/login" className="hover:text-neutral-dark hover:underline">
              {language === 'en' ? 'Reseller Login' : 'রিসেলার লগইন'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
