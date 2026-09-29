import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutClient from '@/components/layout-client';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Zibonbaba.com | Bangladesh’s Premier Multi-Vendor Online Marketplace',
    template: '%s | Zibonbaba.com',
  },
  description: 'Shop authentic electronics, fashion, lifestyle, home essentials & groceries with fastest doorstep delivery across all 64 districts in Bangladesh. Enjoy Cash on Delivery, bKash & secure cards.',
  keywords: [
    'Zibonbaba',
    'Online Shopping Bangladesh',
    'Daraz Alternative Bangladesh',
    'E-commerce Bangladesh',
    'bKash Online Shopping',
    'Cash on Delivery Dhaka',
    'Multi-vendor marketplace',
    'Bangladeshi Online Store'
  ],
  authors: [{ name: 'Zibonbaba Team' }],
  creator: 'Zibonbaba Bangladesh',
  publisher: 'Zibonbaba.com',
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Zibonbaba.com | Bangladesh’s Premier Multi-Vendor Online Marketplace',
    description: 'Shop authentic products with fastest doorstep delivery across all 64 districts. Enjoy Cash on Delivery, bKash & card payments.',
    url: baseUrl,
    siteName: 'Zibonbaba.com',
    locale: 'en_BD',
    type: 'website',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Zibonbaba.com Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zibonbaba.com | Online Shopping in Bangladesh',
    description: 'Shop authentic products with fastest doorstep delivery across 64 districts in Bangladesh.',
    images: ['/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zibonbaba" />
      </head>
      <body className={`flex flex-col min-h-screen bg-neutral-light ${inter.className}`}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
