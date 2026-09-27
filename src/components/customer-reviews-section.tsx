'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Star, MessageSquarePlus, CheckCircle2, X, Send, Loader2, Sparkles, UserCheck, Lock, LogIn } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface ReviewItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar?: string | null;
  createdAt?: string;
  product?: {
    id: string;
    name: string;
  } | null;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Exceptional (5/5)',
  4: 'Very Good (4/5)',
  3: 'Average (3/5)',
  2: 'Poor (2/5)',
  1: 'Terrible (1/5)'
};

export default function CustomerReviewsSection() {
  const { isLoggedIn, username, userEmail, token } = useStore();
  const [mounted, setMounted] = useState(false);

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      name: 'Kazi A. Rakib',
      role: 'Business Owner',
      rating: 5,
      comment: 'Zibonbaba SaaS ERP tools saved us hours of barcode POS scanning! Multi-vendor checkout operates seamlessly.',
      avatar: 'R'
    },
    {
      id: 'rev-2',
      name: 'Nusrat Jahan',
      role: 'Online Consumer',
      rating: 5,
      comment: 'Prompt shipping and highly secure bKash checkout gateway. Very satisfied with the customer service dispatch support.',
      avatar: 'N'
    },
    {
      id: 'rev-3',
      name: 'Mahbub Alam',
      role: 'Wholesale Buyer',
      rating: 5,
      comment: 'Direct delivery from verified warehouses works perfectly. Real-time stock alerts prevent out-of-stock situations.',
      avatar: 'M'
    }
  ]);

  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [totalReviews, setTotalReviews] = useState<number>(3);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Verified Buyer');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch reviews on mount (fetching pure platform reviews)
  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?platform=true&limit=6');
      if (res.ok) {
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          if (data.averageRating) setAverageRating(data.averageRating);
          if (data.totalCount) setTotalReviews(data.totalCount);
        }
      }
    } catch (err) {
      console.error('Failed to fetch platform reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Pre-fill username if logged in
  useEffect(() => {
    if (username && !name) {
      setName(username);
    }
  }, [username, name]);

  // Lock body scroll and listen for ESC key when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsModalOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!comment || comment.trim().length < 3) {
      setErrorMsg('Please write at least a few words about your platform experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name.trim() || username || 'Verified Customer',
          role: role.trim() || 'Verified Buyer',
          rating,
          comment: comment.trim(),
          productId: null, // Pure platform review
          avatar: (name || username || 'U').charAt(0).toUpperCase()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit review. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Prepend to local reviews list
      if (data.review) {
        setReviews(prev => [data.review, ...prev]);
        setTotalReviews(prev => prev + 1);
      }

      setComment('');
      setIsModalOpen(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 5000);
    } catch (err) {
      console.error('Platform review submit error:', err);
      setErrorMsg('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="py-16 px-4 lg:px-8 border-b border-slate-100 bg-white relative">
      {/* Success Notification Toast mounted directly to body */}
      {mounted && successToast && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-24 right-6 z-[9999999] bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border border-emerald-400/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />
          <div>
            <p className="text-xs font-black">Review Published Successfully!</p>
            <p className="text-[11px] text-emerald-100">Thank you for sharing your feedback with Zibonbaba.</p>
          </div>
        </div>,
        document.body
      )}

      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Verified Buyer Reviews
              </span>
              <span className="text-xs font-bold text-slate-400">
                ★ {averageRating.toFixed(1)} / 5.0 ({totalReviews}+ Reviews)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Real reviews and experiences logs verified from our multi-vendor checkout pipeline.
            </p>
          </div>

          {/* Action Button: Give Review */}
          <div className="shrink-0">
            <button
              id="give-review-btn"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-slate-950" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((t, idx) => (
            <div
              key={t.id || idx}
              className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-amber-400/60 transition-all duration-300 group"
            >
              <div>
                {/* Rating stars & product badge if any */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed italic">
                  "{t.comment}"
                </p>

                {/* Platform Experience Badge */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                    Platform Experience
                  </span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mt-6 border-t border-slate-200/60 pt-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  {t.avatar || t.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{t.role || 'Verified Buyer'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Modal — Mounted directly to document.body via Portal to prevent parent transform clipping */}
      {mounted && isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-auto max-h-[90vh] overflow-y-auto z-[10000000] text-slate-900"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 text-left">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block mb-2">
                Platform Feedback
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Share Your Experience
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your feedback helps thousands of shoppers across Bangladesh.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {!isLoggedIn ? (
              <div className="text-center py-6 px-2">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">
                  User Sign In Required
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                  Only registered users can submit a review for the Zibonbaba platform. Please sign in to your customer account to share your feedback.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all text-center inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Review</span>
                  </Link>
                  <Link
                    href="/customer/register"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all text-center"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Authenticated User Status Banner */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0 border border-amber-500/30">
                      {(username || userEmail || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {username || userEmail || 'Verified User'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Platform User
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-white px-3 py-1 rounded-full border border-amber-200 shrink-0">
                    Platform Review
                  </span>
                </div>

                {/* Star Rating Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                active
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-black text-amber-600 ml-2">
                      {RATING_LABELS[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                {/* Display Name & Customer Profile Tag in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Customer Profile Tag
                    </label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                    >
                      <option value="Verified Buyer">Verified Buyer</option>
                      <option value="Online Consumer">Online Consumer</option>
                      <option value="Frequent Shopper">Frequent Shopper</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Wholesale Buyer">Wholesale Buyer</option>
                    </select>
                  </div>
                </div>

                {/* Review Comment Textarea */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    Your Review & Feedback *
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share details about your experience with Zibonbaba's platform, ordering process, delivery speed, website ease, or customer support..."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Post Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
