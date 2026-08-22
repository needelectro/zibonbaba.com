import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { context, error, status } = await requireAdminRole(req);
    if (error || !context) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const [
      totalUsers,
      totalStores,
      totalOrders,
      totalProducts,
      orders,
      pendingVerifications
    ] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({
        select: { total: true, subTotal: true, status: true }
      }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } })
    ]);

    let totalGMV = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;

    orders.forEach((o) => {
      totalGMV += o.total;
      if (o.status === 'PENDING') pendingOrders++;
      if (o.status === 'DELIVERED') deliveredOrders++;
    });

    return NextResponse.json({
      totalUsers,
      totalStores,
      totalOrders,
      totalProducts,
      totalGMV,
      pendingOrders,
      deliveredOrders,
      pendingVerifications,
      databaseStatus: 'CONNECTED'
    });
  } catch (err: any) {
    console.error('Admin Platform Stats Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
