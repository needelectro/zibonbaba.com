'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store, User, Mail, Phone, Lock, Eye, EyeOff, MapPin, Building2,
  FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft,
  ShieldCheck, HelpCircle, Check
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const BUSINESS_CATEGORIES = [
  'Electronics & Gadgets',
  'Apparel & Fashion',
  'Health & Beauty',
  'Home & Kitchen',
  'Groceries & Pantry',
  'Books & Stationery',
  'Toys & Kids',
  'Sports & Fitness',
  'Automotive & Motor Accessories',
  'Jewelry & Luxury Watches',
  'General Retail'
];

const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Comilla', 'Bogra', 'Jessore', 'Cox\'s Bazar', 'Tangail', 'Faridpur',
  'Pabna', 'Noakhali', 'Feni', 'Dinajpur', 'Kushtia', 'Jamalpur'
];

export default function SellerRegisterPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);

  // Form Fields
  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Electronics & Gadgets');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ownerName.trim() || !storeName.trim() || !email.trim() || !phone.trim() || !addressLine.trim()) {
      setError('Please fill in all mandatory store and contact fields.');
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

    if (!agreeTerms) {
      setError('You must accept the Zibonbaba Merchant Service Agreement.');
      return;
    }

    setLoading(true);

    try {
      const fullBusinessAddress = `${addressLine.trim()}, ${upazila.trim() ? upazila.trim() + ', ' : ''}${district}, Bangladesh`;
      const registrationPayload = {
        fullName: ownerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: 'VENDOR_ADMIN',
        storeName: storeName.trim(),
        businessType: businessCategory,
        address: fullBusinessAddress,
        tradeLicense: tradeLicense.trim() || undefined
      };

      // Invalidate and clear any old session credentials first to prevent cross-account contamination
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zibonbaba_token');
        localStorage.removeItem('zibonbaba_user');
        localStorage.removeItem('zibonbaba_role');
        sessionStorage.clear();
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Seller registration failed. Please check your information and try again.');
        return;
      }

      // Establish fresh isolated seller session
      if (data.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('zibonbaba_token', data.accessToken);
        localStorage.setItem('zibonbaba_user', JSON.stringify(data.user));
        localStorage.setItem('zibonbaba_role', 'VENDOR_ADMIN');
        document.cookie = `zibonbaba_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `zibonbaba_role=VENDOR_ADMIN; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `zibonbaba_user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=604800; SameSite=Lax`;

        useStore.setState({
          isLoggedIn: true,
          token: data.accessToken,
          role: 'vendor',
          username: data.user?.fullName || data.user?.email || 'Seller',
          userEmail: data.user?.email || '',
          cart: [],
          orders: []
        });
      }

      setSuccess(true);
    } catch {
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
          <div className="w-20 h-20 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-glow">
            <Store size={40} />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            Application Submitted
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Store Registration Received!
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Thank you for registering <span className="text-white font-semibold">{storeName}</span> on Zibonbaba! Your store application is currently in <span className="text-yellow-400 font-semibold">Pending Admin Verification</span>. Our team reviews all merchant credentials within 24 hours.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left text-xs space-y-2 mb-6">
            <div className="flex items-center justify-between text-gray-400">
              <span>Account Status:</span>
              <span className="font-semibold text-yellow-400">Pending Admin Approval</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Merchant Email:</span>
              <span className="text-white font-mono">{email}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Platform Commission:</span>
              <span className="text-green-400 font-semibold">8.5% Standard</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/seller"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-accent text-gray-950 font-bold py-3 px-5 rounded-lg transition-all shadow-glow text-sm"
            >
              Go to Seller Portal <ArrowRight size={16} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold py-3 px-5 rounded-lg transition-all text-sm"
            >
              Visit Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-gray-900 text-lg shadow-glow">
              Z
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Zibon<span className="text-primary">baba</span>
            </span>
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold tracking-wide uppercase">
            Seller Registration
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-400 hidden sm:inline">Already registered?</span>
          <Link href="/seller/login" className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-1.5 rounded-lg transition-all border border-white/10">
            Seller Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-3xl">
          {/* Header Banner */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Register as a Zibonbaba Merchant
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
              Launch your online store, reach nationwide buyers, and expand your sales in Bangladesh
            </p>
          </div>

          {/* Form Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3.5 mb-6 text-xs sm:text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Store & Business Details */}
              <div>
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Store size={16} /> 1. Business & Store Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Store / Business Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Dhaka Electronics Mart"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Primary Business Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full bg-gray-900 border border-white/10 text-white rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Owner / Representative Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Abir Hasan"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Trade License / Business Registration Number <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={tradeLicense}
                      onChange={(e) => setTradeLicense(e.target.value)}
                      placeholder="e.g. TRAD/DNCC/102938/2024"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Location */}
              <div className="pt-2 border-t border-white/10">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin size={16} /> 2. Contact & Physical Store Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Business Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seller@yourbusiness.com"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Primary Contact Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 17XX-XXXXXX"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      District <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-gray-900 border border-white/10 text-white rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {BANGLADESH_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Thana / Upazila <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      placeholder="e.g. Uttara / Gulshan / Kotwali"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Full Store / Warehouse Physical Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. Holding 45, Road 11, Sector 3, Uttara"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Password & Security */}
              <div className="pt-2 border-t border-white/10">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock size={16} /> 3. Account Security
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Password (min 6 chars) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded bg-white/5 border-white/20 text-primary focus:ring-0 w-4 h-4 mt-0.5"
                  />
                  <span className="text-xs text-gray-400 leading-relaxed">
                    I confirm that all provided store information is accurate and agree to the{' '}
                    <span className="text-yellow-400 font-semibold underline">Zibonbaba Merchant Service Agreement</span>,
                    standard 8.5% platform commission policy, and verification terms.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-extrabold py-3.5 rounded-lg transition-all shadow-glow hover:shadow-[0_0_25px_rgba(255,193,7,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Submitting Store Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Seller Application</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-950 py-4 px-6 text-center text-xs text-gray-500 z-10">
        <p>© {new Date().getFullYear()} Zibonbaba Seller Center. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
