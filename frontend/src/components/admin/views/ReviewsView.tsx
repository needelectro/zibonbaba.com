'use client';

import React from 'react';
import { Star, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';

interface ReviewItem {
  id: string;
  name: string;
  role?: string;
  comment: string;
  rating: number;
  isFeatured?: boolean;
  product?: { name: string };
  createdAt?: string;
}

interface ReviewsViewProps {
  reviews: ReviewItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onToggleFeatured: (id: string, currentFeatured: boolean) => void;
  onDeleteReview: (id: string) => void;
  isLight: boolean;
}

export default function ReviewsView({
  reviews = [],
  isLoading,
  onRefresh,
  onToggleFeatured,
  onDeleteReview,
  isLight
}: ReviewsViewProps) {
  const featuredCount = reviews.filter((r) => r.isFeatured).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Customer Reviews & Testimonials Moderation
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Moderate buyer ratings, feature genuine customer testimonials on the public storefront, and prune spam.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Reviews ({reviews.length})</span>
        </button>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews recorded"
          description="Customer testimonials and product reviews will show up here for moderation."
          icon={Star}
          isLight={isLight}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                      />
                    ))}
                  </div>

                  <span
                    className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                      rev.isFeatured
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                    }`}
                  >
                    {rev.isFeatured ? '★ Featured on Home' : 'Standard'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 italic mb-3 font-medium leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.product && (
                  <p className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400 truncate mb-2">
                    SKU Item: {rev.product.name}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between mt-3">
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{rev.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{rev.role || 'Verified Buyer'}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleFeatured(rev.id, Boolean(rev.isFeatured))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      rev.isFeatured
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30'
                        : isLight
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {rev.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => onDeleteReview(rev.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition cursor-pointer"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
