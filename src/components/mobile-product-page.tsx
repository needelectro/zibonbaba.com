'use client';

import React from 'react';
import { useStore, Product } from '../store/useStore';
import { ArrowLeft, Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function MobileProductPage({ product }: { product: Product }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const isWished = wishlist.includes(product.id);

  return (
    <div className="flex-1 bg-white pb-24 overflow-y-auto animate-slide-up md:hidden">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-neutral-light flex items-center justify-between">
        <Link href="/" className="p-1 text-neutral-dark hover:bg-neutral-light rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-xs font-black text-neutral-dark uppercase tracking-wider truncate max-w-[200px]">
          {product.name}
        </span>
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`p-1.5 rounded-full border ${isWished ? 'bg-primary border-primary text-neutral-dark' : 'border-neutral-light text-neutral-muted'}`}
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Image Gallery */}
      <div className="aspect-square bg-neutral-light w-full relative overflow-hidden border-b border-neutral-light">
        <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-[10px] text-neutral-muted font-bold uppercase mb-1">
            <span>{product.category}</span>
            <span className="text-primary-dark font-extrabold">{product.vendor}</span>
          </div>
          <h1 className="text-base font-black text-neutral-dark leading-snug">{product.name}</h1>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-neutral-dark">৳{product.price.toFixed(2)}</span>
            <span className="text-xs text-neutral-muted line-through font-bold">৳{(product.price * 1.25).toFixed(2)}</span>
          </div>
        </div>

        {/* Specs & Description */}
        <div className="border-t border-neutral-light pt-3">
          <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Description</h3>
          <p className="text-xs text-neutral-muted leading-relaxed">{product.description}</p>
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-3 gap-2 border-t border-neutral-light pt-3 text-center text-[9px] text-neutral-muted font-bold">
          <div className="p-2 bg-neutral-light/50 rounded-lg flex flex-col items-center">
            <ShieldCheck className="w-4 h-4 text-primary-dark mb-1" />
            <span>100% Genuine</span>
          </div>
          <div className="p-2 bg-neutral-light/50 rounded-lg flex flex-col items-center">
            <Truck className="w-4 h-4 text-primary-dark mb-1" />
            <span>Fast Shipping</span>
          </div>
          <div className="p-2 bg-neutral-light/50 rounded-lg flex flex-col items-center">
            <RefreshCw className="w-4 h-4 text-primary-dark mb-1" />
            <span>7 Days Return</span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-neutral-light shadow-lg flex gap-2 z-40">
        <button
          onClick={() => { addToCart(product); alert(`${product.name} added to cart!`); }}
          className="flex-1 bg-primary hover:bg-primary-dark text-neutral-dark font-black text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
