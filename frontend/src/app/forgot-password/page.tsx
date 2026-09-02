'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { translations } from '@/utils/translations';
import { Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { language } = useStore();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess(data.message || (language === 'en' ? 'Password reset instructions have been sent to your email.' : 'পাসওয়ার্ড রিসেট নির্দেশাবলী আপনার ইমেইলে পাঠানো হয়েছে।'));
      } else {
        setError(data.error || (language === 'en' ? 'Failed to send reset link. Please try again.' : 'রিসেট লিঙ্ক পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'));
      }
    } catch {
      setLoading(false);
      setError(language === 'en' ? 'Connection error. Please try again.' : 'সার্ভার সংযোগ সমস্যা। আবার চেষ্টা করুন।');
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
            {language === 'en' ? 'Forgot Password?' : 'পাসওয়ার্ড ভুলে গেছেন?'}
          </h2>
          <p className="text-xs text-neutral-muted">
            {language === 'en'
              ? 'Enter your registered email and we will send you a reset link.'
              : 'আপনার নিবন্ধিত ইমেইল লিখুন এবং আমরা আপনাকে একটি রিসেট লিঙ্ক পাঠাব।'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl p-3 flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{success}</span>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-neutral-dark font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? (
              <span>{language === 'en' ? 'Sending link...' : 'লিঙ্ক পাঠানো হচ্ছে...'}</span>
            ) : (
              <>
                <span>{language === 'en' ? 'Send Reset Link' : 'রিসেট লিঙ্ক পাঠান'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-neutral-light pt-4">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-neutral-muted hover:text-neutral-dark font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Back to Login' : 'লগইনে ফিরে যান'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
