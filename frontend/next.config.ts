import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'zibonbaba.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'ikocqacatdvhrameqeox.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    if (!backendUrl) {
      return [];
    }
    return [
      {
        source: '/api/seller/:path*',
        destination: `${backendUrl}/api/seller/:path*`
      },
      {
        source: '/api/accounts/:path*',
        destination: `${backendUrl}/api/accounts/:path*`
      },
      {
        source: '/api/accounts',
        destination: `${backendUrl}/api/accounts`
      },
      {
        source: '/api/roles/:path*',
        destination: `${backendUrl}/api/roles/:path*`
      },
      {
        source: '/api/roles',
        destination: `${backendUrl}/api/roles`
      },
      {
        source: '/api/permissions',
        destination: `${backendUrl}/api/permissions`
      },
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/api/admin/:path*`
      },
      {
        source: '/api/verification/:path*',
        destination: `${backendUrl}/api/verification/:path*`
      },
      {
        source: '/api/notifications/:path*',
        destination: `${backendUrl}/api/notifications/:path*`
      },
      {
        source: '/api/notifications',
        destination: `${backendUrl}/api/notifications`
      },
      {
        source: '/api/ai/:path*',
        destination: `${backendUrl}/api/ai/:path*`
      }
    ];
  }
};

export default nextConfig;
