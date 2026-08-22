import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zibonbaba.com — Bangladesh Multi-Vendor Marketplace',
  description: 'Premier multi-vendor e-commerce platform in Bangladesh offering verified seller stores, electronics, apparel, home essentials, and fast nationwide delivery.',
  keywords: 'ecommerce, bangladesh, zibonbaba, multi-vendor, online shopping, electronics, seller center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
