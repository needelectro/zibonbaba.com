'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { translations } from '@/utils/translations';
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { language } = useStore();
  const t = translations[language];
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
          role: 'CUSTOMER'
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess(language === 'en' ? 'Account created successfully! Redirecting to login...' : 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! লগইন পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(data.error || (language === 'en' ? 'Registration failed. Please try again.' : 'নিবন্ধন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'));
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
            {t.registerTitle}
          </h2>
          <p className="text-xs text-neutral-muted">
            {language === 'en' ? 'Create a customer account on Zibonbaba' : 'জীবনবাবা তে কাস্টমার অ্যাকাউন্ট তৈরি করুন'}
          </p>
        </div>

        {/* Status Alerts */}
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
            <label className="block text-xs font-bold text-neutral-dark mb-1.5">{t.fullName}</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="w-full bg-neutral-light border border-neutral-light rounded-xl px-4 py-3 text-xs text-neutral-dark outline-none focus:border-primary font-medium"
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-neutral-dark mb-1.5">{t.phone} ({language === 'en' ? 'optional' : 'ঐচ্ছিক'})</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1700 000000"
                className="w-full bg-neutral-light border border-neutral-light rounded-xl px-4 py-3 text-xs text-neutral-dark outline-none focus:border-primary font-medium"
              />
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-dark mb-1.5">{t.passwordLabel}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'en' ? 'Min 6 characters' : 'কমপক্ষে ৬ অক্ষরের'}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-neutral-dark font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? (
              <span>{language === 'en' ? 'Creating account...' : 'অ্যাকাউন্ট তৈরি হচ্ছে...'}</span>
            ) : (
              <>
                <span>{t.signUpBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-neutral-light pt-4">
          <p className="text-xs text-neutral-muted">
            {language === 'en' ? 'Already have an account?' : 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?'}{' '}
            <Link href="/login" className="text-primary-dark font-bold hover:underline">
              {language === 'en' ? 'Sign in here' : 'এখানে সাইন ইন করুন'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
