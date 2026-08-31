import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { error, status } = await requireAdminRole(request);
    if (error) return NextResponse.json({ error }, { status });

    // Orders without a deliveryAssignment or where delivery assignment is REJECTED
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
        OR: [
          { deliveryAssignment: null },
          { deliveryAssignment: { status: 'REJECTED' } }
        ]
      },
      include: {
        customer: { include: { profile: true } },
        store: true,
        resellerOrder: true,
        items: {
          include: {
            variant: { include: { product: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = orders.map((o) => {
      const ro = o.resellerOrder;
      const cust = o.customer;
      const recipientName = ro?.customerName || cust?.profile?.fullName || 'Valued Customer';
      const recipientPhone = ro?.customerPhone || cust?.phone || 'N/A';
      const shippingAddress = ro?.shippingAddress || 'Customer Address, Bangladesh';

      return {
        id: o.id,
        date: o.createdAt.toISOString(),
        customerName: recipientName,
        customerPhone: recipientPhone,
        address: shippingAddress,
        district: ro?.district || 'Dhaka',
        upazila: ro?.upazila || '',
        total: o.total,
        isResellerOrder: Boolean(ro),
        resellerProfit: ro?.resellerProfit || 0,
        storeName: o.store?.name || 'Zibonbaba Seller Store',
        itemsCount: o.items.length,
        itemsSummary: o.items.map(it => `${it.quantity}x ${it.variant?.product?.name || 'Product'}`).join(', ')
      };
    });

    return NextResponse.json({
      success: true,
      orders: formatted,
      total: formatted.length
    });
  } catch (err: any) {
    console.error('Admin Unassigned Orders GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
