import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ customers: [], summary: { totalCustomers: 0, totalOrders: 0, totalRevenue: 0 }, error }, { status: status || 200 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Fetch all orders strictly belonging to this seller's store
    const storeOrders = await prisma.order.findMany({
      where: {
        storeId: context.store.id
      },
      include: {
        customer: {
          include: {
            profile: true,
            addresses: true
          }
        },
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Aggregate unique customers strictly within this seller's ecosystem
    const customerMap = new Map<string, any>();

    storeOrders.forEach((o) => {
      const customerId = o.customerId || `guest-${o.id}`;
      const customerName = o.customer?.profile?.fullName || (o.customer?.email ? o.customer.email.split('@')[0] : `Customer #${o.id.slice(-5).toUpperCase()}`);
      const email = o.customer?.email || 'N/A';
      const phone = o.customer?.phone || (o.customer?.addresses?.[0]?.phone) || 'N/A';
      const city = o.customer?.addresses?.[0]?.city || 'Dhaka';
      const address = o.customer?.addresses?.[0]?.addressLine1 || '';

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: customerName,
          email,
          phone,
          city,
          address,
          totalOrders: 0,
          totalSpent: 0,
          firstOrderDate: o.createdAt.toISOString(),
          lastOrderDate: o.createdAt.toISOString(),
          recentOrders: []
        });
      }

      const record = customerMap.get(customerId);
      record.totalOrders += 1;
      record.totalSpent += o.total;
      record.recentOrders.push({
        id: o.id,
        date: o.createdAt.toISOString(),
        total: o.total,
        status: o.status,
        itemCount: o.items.length
      });
    });

    let customerList = Array.from(customerMap.values());

    // Apply search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      customerList = customerList.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }

    const totalRevenue = customerList.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrdersCount = customerList.reduce((sum, c) => sum + c.totalOrders, 0);

    return NextResponse.json({
      success: true,
      customers: customerList,
      summary: {
        totalCustomers: customerList.length,
        totalOrders: totalOrdersCount,
        totalRevenue
      }
    });
  } catch (err: any) {
    console.error('Seller Customers GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
