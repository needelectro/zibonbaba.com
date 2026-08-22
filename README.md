# Zibonbaba.com — Multi-Vendor E-Commerce Marketplace & Seller Center

Phase 1 production-ready multi-vendor e-commerce marketplace platform built with Next.js (App Router), Prisma ORM, PostgreSQL (Supabase), Tailwind CSS, and Zustand.

## Core Features (Phase 1)
- **Dedicated Customer Marketplace**: `/`, `/login`, `/register`, `/products`, `/cart`, `/checkout`, `/wishlist`, `/orders`, `/tracking`
- **Dedicated Seller Center Portal**: `/seller`, `/seller/login`, `/seller/register`, `/seller/forgot-password` with store isolation, catalog management, order processing, and payout management
- **Private Control Plane (Admin)**: `/admin/login`, `/admin` with seller KYC verification, product moderation, commission tracking, and immutable audit logging
- **Multi-Vendor Architecture**: Automated store-level order splitting, inventory synchronization, and 8.5% platform commission calculation
