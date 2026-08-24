'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Product } from '../store/useStore';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  CheckCircle,
  AlertTriangle,
  Building,
  Plus,
  Lock,
  Percent,
  Search,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Truck,
  Flame,
  Sparkles,
  Gift,
  Tag,
  ThumbsUp,
  Store
} from 'lucide-react';
import Link from 'next/link';
import { translations } from '../utils/translations';

export default function MobileHomepage() {
  const {
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    setSelectedCategory,
    setMobileTab,
    language
  } = useStore();

  const t = translations[language];

  // Dynamic Advertisement Slideshow state
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Just For You',
      desc: 'Get flat 30% off on premium catalog',
      linkText: 'Shop Apparel',
      cat: 'Apparel',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Radiant Skin Special',
      desc: 'Up to 20% off on verified skincare',
      linkText: 'Explore Beauty',
      cat: 'Home & Kitchen',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Trending Outfits',
      desc: 'Exclusive new catalog designs active now',
      linkText: 'Discover Now',
      cat: 'Apparel',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    }
  ];

  // Shared Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState({ hrs: 2, min: 14, sec: 45 });
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 4500);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, min: prev.min - 1, sec: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, min: 59, sec: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    const savedRecentIds = localStorage.getItem('zibonbaba-recent');
    if (savedRecentIds) {
      try {
        const ids: string[] = JSON.parse(savedRecentIds);
        const filtered = ids
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => !!p);
        setRecentlyViewed(filtered.slice(0, 5));
      } catch (err) {
        console.error('Failed to parse recently viewed', err);
      }
    } else {
      setRecentlyViewed(products.slice(0, 2));
    }

    return () => {
      clearInterval(slideInterval);
      clearInterval(timer);
    };
  }, [products]);

  const formatNum = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 pb-24 overflow-x-hidden animate-slide-up">
      
      {/* 1. HERO BANNER SLIDER */}
      <section className="relative w-full h-[220px] bg-slate-900 overflow-hidden">
        {slides.map((slide, idx) => {
          const displayTitle = language === 'en' ? slide.title :
            slide.title === 'Just For You' ? 'শুধু আপনার জন্য' :
            slide.title === 'Radiant Skin Special' ? 'উজ্জ্বল ত্বকের বিশেষ অফার' :
            slide.title === 'Trending Outfits' ? 'ট্রেন্ডিং পোশাক কালেকশন' : slide.title;

          const displayDesc = language === 'en' ? slide.desc :
            slide.desc === 'Get flat 30% off on premium catalog' ? 'প্রিমিয়াম ক্যাটালগে ফ্ল্যাট ৩০% ছাড়' :
            slide.desc === 'Up to 20% off on verified skincare' ? 'যাচাইকৃত স্কিনকেয়ারে ২০% পর্যন্ত ছাড়' :
            slide.desc === 'Exclusive new catalog designs active now' ? 'এক্সক্লুসিভ নতুন ক্যাটালগ ডিজাইন সক্রিয়' : slide.desc;

          const displayLinkText = language === 'en' ? slide.linkText :
            slide.linkText === 'Shop Apparel' ? 'পোশাক কিনুন' :
            slide.linkText === 'Explore Beauty' ? 'সৌন্দর্য পণ্য দেখুন' :
            slide.linkText === 'Discover Now' ? 'আবিষ্কার করুন' : slide.linkText;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10"></div>
              <img src={slide.image} alt={displayTitle} className="w-full h-full object-cover" />
              
              <div className="absolute inset-x-5 inset-y-0 z-20 flex flex-col justify-center text-white">
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-1 rounded-full w-fit mb-2 shadow-sm tracking-wider">
                  {language === 'en' ? 'Special Campaign' : 'বিশেষ ক্যাম্পেইন'}
                </span>
                <h2 className="text-xl font-black leading-tight drop-shadow-md">{displayTitle}</h2>
                <p className="text-[11px] text-slate-200 mt-1 line-clamp-1 leading-tight">{displayDesc}</p>
                <button
                  onClick={() => {
                    setSelectedCategory(slide.cat);
                    setMobileTab('categories');
                  }}
                  className="bg-[#FFC107] hover:bg-amber-600 text-slate-950 text-[10px] font-black px-4 py-2 rounded-xl w-fit mt-4 active:scale-95 transition-transform uppercase tracking-wider"
                >
                  {displayLinkText}
                </button>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-3 right-5 z-20 flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeSlide ? 'bg-amber-500 w-3.5' : 'bg-white/50'}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="bg-white px-4 py-6 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Popular Categories</h3>
          <button
            onClick={() => { setSelectedCategory('All'); setMobileTab('categories'); }}
            className="text-[10px] text-amber-500 font-extrabold flex items-center"
          >
            <span>View All</span> <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4">
          {[
            { name: language === 'en' ? 'Electronics' : 'ইলেকট্রনিক্স', cat: 'Electronics', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&auto=format&fit=crop&q=80' },
            { name: language === 'en' ? 'Fashion' : 'ফ্যাশন', cat: 'Apparel', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&auto=format&fit=crop&q=80' },
            { name: language === 'en' ? 'Grocery' : 'মুদিখানা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80' },
            { name: language === 'en' ? 'Beauty' : 'রূপচর্চা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&auto=format&fit=crop&q=80' },
            { name: language === 'en' ? 'Home' : 'গৃহসজ্জা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=80' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedCategory(item.cat);
                setMobileTab('categories');
              }}
              className="flex flex-col items-center cursor-pointer select-none shrink-0"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm border border-slate-100 relative bg-slate-50 flex items-center justify-center">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-650 mt-2 leading-tight">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FLASH DEALS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-red-500 text-white p-1 rounded-lg">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">{t.flashSale}</h2>
            <div className="flex items-center gap-1 ml-2">
              <span className="bg-red-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                {formatNum(timeLeft.hrs)}
              </span>
              <span className="text-[9px] font-black text-red-500">:</span>
              <span className="bg-red-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                {formatNum(timeLeft.min)}
              </span>
              <span className="text-[9px] font-black text-red-500">:</span>
              <span className="bg-red-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                {formatNum(timeLeft.sec)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 4).map((p) => {
            const isWished = wishlist.includes(p.id);
            return (
              <div
                key={p.id}
                className="bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 flex flex-col justify-between relative group shadow-xs"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white mb-2 border border-slate-100">
                  <Link href={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className={`absolute top-1.5 right-1.5 p-1.5 rounded-full border shadow-xs ${
                      isWished ? 'bg-amber-400 border-amber-400 text-slate-900' : 'bg-white/90 border-slate-100 text-slate-400'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                  <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                    -20%
                  </span>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-800 line-clamp-1 leading-tight">{p.name}</h4>
                  <p className="text-[8px] text-slate-400 mt-0.5">{p.vendor}</p>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-xs font-black text-slate-900">৳{(p.price * 80 * 0.8).toFixed(0)}</span>
                    <span className="text-[9px] text-slate-400 line-through">৳{(p.price * 80).toFixed(0)}</span>
                  </div>

                  <button
                    onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                    className="w-full mt-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold py-1.5 rounded-xl transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>{t.addToCart}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. RECENTLY VIEWED PRODUCTS */}
      {recentlyViewed.length > 0 && (
        <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-4 px-4 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">{t.recentlyViewed}</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            {recentlyViewed.map((p) => (
              <Link 
                key={p.id} 
                href={`/product/${p.id}`}
                className="w-20 shrink-0 flex flex-col items-center select-none"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                  <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
                </div>
                <span className="text-[9px] text-slate-600 truncate w-full text-center mt-1 font-bold">
                  {p.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. ALL PRODUCTS CATALOG */}
      <section className="px-4 py-5">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">All Products</h3>
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200/70 rounded-2xl p-3 flex flex-col justify-between shadow-xs"
            >
              <Link href={`/product/${p.id}`} className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2">
                <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
              </Link>
              <div>
                <h4 className="text-[10px] font-black text-slate-800 line-clamp-1 leading-tight">{p.name}</h4>
                <span className="text-xs font-black text-amber-600 mt-1 block">৳{(p.price * 80).toFixed(0)}</span>
                <button
                  onClick={() => { addToCart(p); alert(`${p.name} added!`); }}
                  className="w-full mt-2 bg-slate-900 text-white text-[9px] font-bold py-1.5 rounded-lg active:scale-95"
                >
                  Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
