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
    const timeframe = searchParams.get('timeframe') || 'month';

    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === 'week' || timeframe === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month' || timeframe === '30days') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === '3months' || timeframe === '90days') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (timeframe === 'year' || timeframe === '12months') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // all time
      startDate = new Date(0);
    }

    // Parallel aggregate queries
    const [
      orders,
      stores,
      categories,
      customersCount,
      vendorsCount,
      productsCount,
      recentOrders
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          store: { select: { id: true, name: true, commissionRate: true } },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { category: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.store.findMany({
        select: {
          id: true,
          name: true,
          commissionRate: true,
          isApproved: true,
          _count: { select: { orders: true, products: true } }
        }
      }),
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } }
        }
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'VENDOR_ADMIN' } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          store: { select: { id: true, name: true } }
        }
      })
    ]);

    // Calculate Financial Metrics from Real Orders
    let grossVolume = 0;
    let platformCommission = 0;
    let completedOrdersCount = 0;
    let pendingOrdersCount = 0;

    const categorySalesMap: Record<string, { name: string; totalSales: number; unitsSold: number }> = {};
    const storeSalesMap: Record<string, { storeName: string; totalSales: number; commission: number; orderCount: number }> = {};

    orders.forEach(order => {
      grossVolume += order.total;
      const commRate = order.store?.commissionRate || 10.0;
      platformCommission += (order.total * commRate) / 100;

      if (order.status === 'DELIVERED') {
        completedOrdersCount++;
      } else if (order.status === 'PENDING' || order.status === 'PROCESSING') {
        pendingOrdersCount++;
      }

      // Store breakdown
      const storeId = order.store?.id || 'unknown';
      const storeName = order.store?.name || 'Direct';
      if (!storeSalesMap[storeId]) {
        storeSalesMap[storeId] = { storeName, totalSales: 0, commission: 0, orderCount: 0 };
      }
      storeSalesMap[storeId].totalSales += order.total;
      storeSalesMap[storeId].commission += (order.total * commRate) / 100;
      storeSalesMap[storeId].orderCount += 1;

      // Category breakdown
      order.items?.forEach(item => {
        const catName = item.variant?.product?.category?.name || 'Uncategorized';
        if (!categorySalesMap[catName]) {
          categorySalesMap[catName] = { name: catName, totalSales: 0, unitsSold: 0 };
        }
        categorySalesMap[catName].totalSales += item.price * item.quantity;
        categorySalesMap[catName].unitsSold += item.quantity;
      });
    });

    const avgOrderValue = orders.length > 0 ? Math.round(grossVolume / orders.length) : 0;

    // Daily Timeline Data for Charts (last 7 days or points)
    const timelineMap: Record<string, { date: string; gmv: number; orders: number; commission: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      timelineMap[key] = {
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        gmv: 0,
        orders: 0,
        commission: 0
      };
    }

    orders.forEach(o => {
      const key = o.createdAt.toISOString().split('T')[0];
      if (timelineMap[key]) {
        timelineMap[key].gmv += o.total;
        timelineMap[key].orders += 1;
        const commRate = o.store?.commissionRate || 10.0;
        timelineMap[key].commission += (o.total * commRate) / 100;
      }
    });

    const timeline = Object.values(timelineMap);

    return NextResponse.json({
      success: true,
      timeframe,
      summary: {
        grossVolume,
        platformCommission: Math.round(platformCommission),
        netMerchantPayout: Math.round(grossVolume - platformCommission),
        totalOrders: orders.length,
        completedOrders: completedOrdersCount,
        pendingOrders: pendingOrdersCount,
        avgOrderValue,
        totalCustomers: customersCount,
        totalVendors: vendorsCount,
        totalProducts: productsCount,
        totalStores: stores.length
      },
      timeline,
      categoryBreakdown: Object.values(categorySalesMap),
      topStores: Object.values(storeSalesMap).sort((a, b) => b.totalSales - a.totalSales),
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customer: o.customer?.profile?.fullName || o.customer?.email || 'Guest',
        store: o.store?.name || 'Direct',
        total: o.total,
        status: o.status,
        date: o.createdAt.toLocaleDateString()
      }))
    });
  } catch (err: any) {
    console.error('Admin GET Reports Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
