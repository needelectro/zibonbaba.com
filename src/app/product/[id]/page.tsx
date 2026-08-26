'use client';

import React, { useState, useEffect, use } from 'react';
import { useStore, Product } from '@/store/useStore';
import { Star, ShieldAlert, CheckCircle, ShoppingCart, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileProductPage from '@/components/mobile-product-page';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { products, addToCart, fetchProducts } = useStore();
  const [liveProduct, setLiveProduct] = useState<Product | null>(null);

  const { isMobile, isMounted } = useIsMobile();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
    fetch(`/api/products/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) setLiveProduct(data.product);
      })
      .catch(() => {});
  }, [resolvedParams.id, fetchProducts, products.length]);

  const product = liveProduct || products.find((p) => p.id === resolvedParams.id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-400">Loading product details...</p>
        <Link href="/" className="text-xs text-primary font-bold hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  if (isMobile && isMounted) {
    return <MobileProductPage product={product} />;
  }

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([
    { author: 'Imtiaz Alam', rating: 5, date: '2026-07-11', text: 'Stunning audio clarity! The noise cancellation blocks office chatter completely. Worth the price.' },
    { author: 'Farhana Yeasmin', rating: 4, date: '2026-07-08', text: 'Comfortable fit for long hours. Premium yellow highlighting on Zibonbaba packaging looked amazing.' }
  ]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newText) {
      alert('Please fill out name and review text.');
      return;
    }
    const newRev = {
      author: newAuthor,
      rating: newRating,
      date: new Date().toISOString().split('T')[0],
      text: newText,
    };
    setReviews([newRev, ...reviews]);
    setNewAuthor('');
    setNewText('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up space-y-10">
      {/* Back to Shop link */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-dark hover:text-primary-dark transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 lg:p-10 rounded-lg border border-neutral-light shadow-card">
        {/* Left Column: Image Container */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-neutral-light rounded-lg overflow-hidden border border-neutral-light">
            <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-square bg-neutral-light rounded overflow-hidden border-2 border-primary border-dashed">
              <img src={product.image} alt="Thumbnail 1" className="object-cover w-full h-full opacity-80" />
            </div>
            <div className="aspect-square bg-neutral-light rounded overflow-hidden border border-neutral-light">
              <img src={product.image} alt="Thumbnail 2" className="object-cover w-full h-full opacity-60 hover:opacity-100 transition-opacity" />
            </div>
            <div className="aspect-square bg-neutral-light rounded overflow-hidden border border-neutral-light">
              <img src={product.image} alt="Thumbnail 3" className="object-cover w-full h-full opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Right Column: Meta details and checkout options */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-primary/20 text-neutral-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Verified Seller: {product.vendor}
              </span>
              <span className="text-xs font-semibold text-success flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> In Stock
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-dark mt-3">{product.name}</h1>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs font-extrabold text-neutral-dark flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-current" />
                {product.rating}
              </span>
              <span className="text-xs text-neutral-muted">({reviews.length} Customer reviews)</span>
            </div>
          </div>

          <div className="py-4 border-t border-b border-neutral-light flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-muted font-semibold">SKU: <span className="font-mono text-neutral-dark font-bold">{product.sku}</span></p>
              <p className="text-2xl font-extrabold text-neutral-dark mt-1">৳{product.price.toFixed(2)}</p>
            </div>
            <div className="text-right text-xs">
              <p className="text-neutral-muted font-semibold">Category</p>
              <p className="font-bold text-neutral-dark mt-1">{product.category}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Description</h3>
            <p className="text-xs text-neutral-body leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity selector and Cart controls */}
          <div className="space-y-4 pt-4 border-t border-neutral-light">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center justify-between border border-neutral-light rounded-xl bg-neutral-light overflow-hidden h-12 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-xs font-bold hover:bg-neutral-muted/20 h-full flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-extrabold text-neutral-dark">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-xs font-bold hover:bg-neutral-muted/20 h-full flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  addToCart(product, quantity);
                  alert(`${quantity} units of "${product.name}" added to cart!`);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                onClick={() => {
                  addToCart(product, quantity);
                  window.location.href = '/checkout';
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                Buy Now
              </button>
            </div>

            {/* Marketplace Guarantees Badge */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-light text-center text-[10px]">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-800 block">✓ Genuine Product</span>
                <span className="text-slate-400">100% authentic warranty</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-800 block">✓ Express Delivery</span>
                <span className="text-slate-400">All 64 districts in BD</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-800 block">✓ 7 Days Return</span>
                <span className="text-slate-400">Buyer protection policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review System Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Reviews List */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-lg border border-neutral-light shadow-card space-y-6">
          <h2 className="text-lg font-bold text-neutral-dark border-b border-neutral-light pb-3">
            Customer Reviews ({reviews.length})
          </h2>
          <div className="space-y-4 divide-y divide-neutral-light">
            {reviews.map((rev, i) => (
              <div key={i} className={`${i > 0 ? 'pt-4' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-dark">{rev.author}</h4>
                  <span className="text-[10px] text-neutral-muted">{rev.date}</span>
                </div>
                <div className="flex items-center gap-0.5 my-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3 h-3 ${idx < rev.rating ? 'text-warning fill-current' : 'text-neutral-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-neutral-body leading-relaxed">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Write a Review Form */}
        <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card h-fit space-y-4">
          <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2">
            Write verified Review
          </h2>
          {reviewSuccess && (
            <div className="bg-success/15 border border-success text-success text-[10px] p-2.5 rounded font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Review posted successfully to store logs.
            </div>
          )}
          <form onSubmit={handleAddReview} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-neutral-muted mb-1">Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rana Ahmed"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-muted mb-1">Rating Stars *</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
                className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3">3 Stars (Average)</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1">1 Star (Very Poor)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-muted mb-1">Review Description *</label>
              <textarea
                required
                placeholder="Describe your purchase, shipping velocity, or vendor quality..."
                rows={3}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
