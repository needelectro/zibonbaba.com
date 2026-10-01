import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        query: q,
        results: {
          products: [],
          customers: [],
          vendors: [],
          orders: [],
          transactions: []
        }
      });
    }

    const [
      products,
      customers,
      vendors,
      orders,
      transactions
    ] = await Promise.all([
      // Products & SKU search
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { variants: { some: { sku: { contains: q, mode: 'insensitive' } } } }
          ]
        },
        include: {
          store: { select: { name: true } },
          category: { select: { name: true } },
          variants: { select: { sku: true, price: true } }
        },
        take: 6
      }),

      // Customers search
      prisma.user.findMany({
        where: {
          role: 'CUSTOMER',
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            { profile: { fullName: { contains: q, mode: 'insensitive' } } }
          ]
        },
        include: { profile: true },
        take: 6
      }),

      // Vendors & Stores search
      prisma.store.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { owner: { email: { contains: q, mode: 'insensitive' } } },
            { owner: { profile: { fullName: { contains: q, mode: 'insensitive' } } } }
          ]
        },
        include: {
          owner: { select: { email: true, phone: true } }
        },
        take: 6
      }),

      // Orders & Order ID search
      prisma.order.findMany({
        where: {
          OR: [
            { id: { contains: q, mode: 'insensitive' } },
            { customer: { email: { contains: q, mode: 'insensitive' } } },
            { store: { name: { contains: q, mode: 'insensitive' } } }
          ]
        },
        include: {
          customer: { select: { email: true, profile: { select: { fullName: true } } } },
          store: { select: { name: true } }
        },
        take: 6
      }),

      // Transactions & Withdrawals search
      prisma.withdrawalRequest.findMany({
        where: {
          OR: [
            { id: { contains: q, mode: 'insensitive' } },
            { accountNumber: { contains: q } },
            { transactionRef: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          user: { select: { email: true } }
        },
        take: 6
      })
    ]);

    return NextResponse.json({
      success: true,
      query: q,
      results: {
        products: products.map(p => ({
          id: p.id,
          title: p.name,
          subtitle: `${p.store?.name} • SKU: ${p.variants[0]?.sku || 'N/A'} • ৳${p.basePrice}`,
          category: p.category?.name,
          module: 'marketplace',
          meta: `৳${p.basePrice}`
        })),
        customers: customers.map(c => ({
          id: c.id,
          title: c.profile?.fullName || c.email.split('@')[0],
          subtitle: `${c.email} • Phone: ${c.phone || 'N/A'}`,
          module: 'customers',
          meta: c.status
        })),
        vendors: vendors.map(v => ({
          id: v.id,
          title: v.name,
          subtitle: `Owner: ${v.owner?.email} • ${v.isApproved ? 'Approved' : 'Pending KYC'}`,
          module: 'sellers',
          meta: `${v.commissionRate}% comm`
        })),
        orders: orders.map(o => ({
          id: o.id,
          title: `Order #${o.id.slice(0, 8)}`,
          subtitle: `${o.customer?.profile?.fullName || o.customer?.email || 'Guest'} • ${o.store?.name}`,
          module: 'orders',
          meta: `৳${o.total} (${o.status})`
        })),
        transactions: transactions.map(t => ({
          id: t.id,
          title: `Payout #${t.id.slice(0, 8)}`,
          subtitle: `${t.user?.email} • ${t.paymentMethod} • ${t.accountNumber}`,
          module: 'wallet',
          meta: `৳${t.amount} (${t.status})`
        }))
      }
    });
  } catch (err: any) {
    console.error('Admin Search Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
