'use client';

import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Heart, Store, Truck, RotateCcw, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-dark text-white border-t-4 border-primary mt-auto">
      {/* Top Value Banner */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-neutral-body/40 py-8 px-4 lg:px-8 border-b border-neutral-body/30">
        <div className="flex items-center gap-4 pb-6 md:pb-0 md:pr-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-accent shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold">100% Genuine Products</h4>
            <p className="text-xs text-neutral-muted">Verified merchants and authentic brand warranties.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 py-6 md:py-0 md:px-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-accent shrink-0">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Fast Nationwide Delivery</h4>
            <p className="text-xs text-neutral-muted">Express home delivery across all 64 districts in Bangladesh.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 py-6 md:py-0 md:px-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-accent shrink-0">
            <RotateCcw className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Easy 7-Day Returns</h4>
            <p className="text-xs text-neutral-muted">Hassle-free return & refund protection on eligible orders.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-6 md:pt-0 md:pl-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-accent shrink-0">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Customer Helpline</h4>
            <p className="text-xs text-neutral-muted">Call +880 9612-ZIBONBABA for friendly support.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 py-12 px-4 lg:px-8">
        {/* Brand Column */}
        <div>
          <Link href="/" className="flex items-center gap-2 group mb-4">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center font-extrabold text-neutral-dark text-lg shadow-sm">
              Z
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Zibon<span className="text-primary-accent">baba</span>
            </span>
          </Link>
          <p className="text-xs text-neutral-muted leading-relaxed mb-4">
            Zibonbaba.com is Bangladesh’s premier multi-vendor e-commerce marketplace connecting buyers with verified merchants for quality electronics, fashion, beauty, and essentials.
          </p>
          <div className="flex flex-col gap-2 text-xs text-neutral-muted">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Gulshan 2, Dhaka 1212, Bangladesh</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>+880 9612-ZIBONBABA</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>support@zibonbaba.com</span>
            </div>
          </div>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Customer Care</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-neutral-muted">
            <li><Link href="/tracking" className="hover:text-primary transition-colors">Track Your Order</Link></li>
            <li><Link href="/account/profile" className="hover:text-primary transition-colors">My Customer Account</Link></li>
            <li><Link href="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link></li>
            <li><Link href="/wishlist" className="hover:text-primary transition-colors">Saved Wishlist</Link></li>
            <li><Link href="/account/tickets" className="hover:text-primary transition-colors">Help Center & Support Tickets</Link></li>
          </ul>
        </div>

        {/* Sell on Zibonbaba */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Sell on Zibonbaba</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-neutral-muted">
            <li><Link href="/seller/register" className="hover:text-primary transition-colors font-semibold text-yellow-400">Become a Seller / Open Store</Link></li>
            <li><Link href="/seller/login" className="hover:text-primary transition-colors">Seller Center Login</Link></li>
            <li><Link href="/seller/register" className="hover:text-primary transition-colors">Merchant Guidelines & Policies</Link></li>
            <li><Link href="/seller/login" className="hover:text-primary transition-colors">Seller Support Hub</Link></li>
          </ul>
        </div>

        {/* Newsletter & Updates */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Stay Connected</h4>
          <p className="text-xs text-neutral-muted mb-3">Subscribe to receive exclusive deals, flash sale announcements, and special promo codes.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Zibonbaba deals!'); }} className="flex rounded-md overflow-hidden bg-neutral-light/10 border border-neutral-body/40">
            <input
              type="email"
              placeholder="Your email address..."
              required
              className="bg-transparent text-xs text-white p-2.5 w-full outline-none placeholder:text-neutral-muted"
            />
            <button type="submit" className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-4 py-2.5 shrink-0 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-neutral-darker py-6 border-t border-neutral-body/20 text-center text-xs text-neutral-muted">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 justify-center md:justify-start">
            © {new Date().getFullYear()} Zibonbaba.com. All Rights Reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/" className="hover:text-primary transition-colors">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
