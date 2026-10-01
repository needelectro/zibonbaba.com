import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({
        totalGMV: 0,
        netEarnings: 0,
        platformCommission: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalProducts: 0,
        lowStockCount: 0,
        totalCustomers: 0,
        salesTrend: [],
        bestSellers: [],
        recentOrders: [],
        commissionRate: 8.5
      });
    }

    const storeId = context.store.id;
    const commissionRate = context.store.commissionRate || 8.5;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d'; // 'today' | '7d' | '30d' | '3m' | '12m' | 'custom'
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Calculate Date Threshold
    const now = new Date();
    let filterStartDate = new Date();

    if (range === 'today') {
      filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7d') {
      filterStartDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      filterStartDate.setDate(now.getDate() - 30);
    } else if (range === '3m') {
      filterStartDate.setMonth(now.getMonth() - 3);
    } else if (range === '12m') {
      filterStartDate.setFullYear(now.getFullYear() - 1);
    } else if (range === 'custom' && startDateParam) {
      filterStartDate = new Date(startDateParam);
    } else {
      filterStartDate.setDate(now.getDate() - 30);
    }

    const filterEndDate = range === 'custom' && endDateParam ? new Date(endDateParam) : now;

    // 1. Fetch Orders for this store within date filter
    const [allTimeOrders, filteredOrders, products] = await Promise.all([
      prisma.order.findMany({
        where: { storeId },
        select: {
          id: true,
          total: true,
          subTotal: true,
          status: true,
          customerId: true,
          createdAt: true
        }
      }),
      prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: filterStartDate,
            lte: filterEndDate
          }
        },
        include: {
          customer: {
            include: { profile: true }
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
      }),
      prisma.product.findMany({
        where: { storeId },
        include: {
          variants: {
            include: { inventory: true }
          }
        }
      })
    ]);

    // KPI Metrics calculation
    let filteredGrossSales = 0;
    let filteredPlatformCommission = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    const customerIdSet = new Set<string>();

    filteredOrders.forEach((o) => {
      filteredGrossSales += o.total;
      const fee = Math.round((o.subTotal * commissionRate) / 100);
      filteredPlatformCommission += fee;

      const st = (o.status || '').toUpperCase();
      if (['PENDING', 'CONFIRMED', 'PROCESSING'].includes(st)) {
        pendingOrders++;
      } else if (['DELIVERED', 'COMPLETED'].includes(st)) {
        completedOrders++;
      }

      if (o.customerId) {
        customerIdSet.add(o.customerId);
      }
    });

    const netEarnings = Math.max(0, filteredGrossSales - filteredPlatformCommission);

    // Products & Inventory KPI
    let lowStockCount = 0;
    products.forEach((p) => {
      p.variants.forEach((v) => {
        const inv = v.inventory[0];
        if (inv && inv.quantity <= inv.reorderPoint) {
          lowStockCount++;
        }
      });
    });

    // Best-selling products aggregation from filtered orders
    const productSalesMap = new Map<string, { id: string; name: string; sku: string; unitsSold: number; revenue: number }>();

    filteredOrders.forEach((o) => {
      o.items.forEach((it) => {
        const prodId = it.variant?.productId || it.id;
        const prodName = it.variant?.product?.name || 'Product';
        const sku = it.variant?.sku || 'SKU';

        if (!productSalesMap.has(prodId)) {
          productSalesMap.set(prodId, {
            id: prodId,
            name: prodName,
            sku,
            unitsSold: 0,
            revenue: 0
          });
        }

        const entry = productSalesMap.get(prodId)!;
        entry.unitsSold += it.quantity;
        entry.revenue += it.price * it.quantity;
      });
    });

    const bestSellers = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Generate real daily/monthly revenue chart data based on range
    const trendMap = new Map<string, { label: string; sales: number; orders: number }>();

    // Prepare time buckets
    const isShortRange = range === 'today' || range === '7d' || range === '30d';

    if (range === 'today') {
      for (let h = 0; h < 24; h += 3) {
        const key = `${h.toString().padStart(2, '0')}:00`;
        trendMap.set(key, { label: key, sales: 0, orders: 0 });
      }
      filteredOrders.forEach((o) => {
        const h = o.createdAt.getHours();
        const bucketHour = Math.floor(h / 3) * 3;
        const key = `${bucketHour.toString().padStart(2, '0')}:00`;
        const item = trendMap.get(key);
        if (item) {
          item.sales += o.total;
          item.orders += 1;
        }
      });
    } else if (range === '7d' || range === '30d') {
      const daysCount = range === '7d' ? 7 : 30;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendMap.set(key, { label, sales: 0, orders: 0 });
      }
      filteredOrders.forEach((o) => {
        const key = o.createdAt.toISOString().split('T')[0];
        const item = trendMap.get(key);
        if (item) {
          item.sales += o.total;
          item.orders += 1;
        }
      });
    } else {
      // Monthly aggregation for 3m, 12m, custom
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        trendMap.set(key, { label, sales: 0, orders: 0 });
      }
      filteredOrders.forEach((o) => {
        const d = o.createdAt;
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const item = trendMap.get(key);
        if (item) {
          item.sales += o.total;
          item.orders += 1;
        }
      });
    }

    const salesTrend = Array.from(trendMap.values());

    // Recent orders (top 6)
    const recentOrders = filteredOrders.slice(0, 6).map((o) => {
      const platformFee = Math.round((o.subTotal * commissionRate) / 100);
      return {
        id: o.id,
        date: o.createdAt.toISOString(),
        customerName: o.customer?.profile?.fullName || (o.customer?.email ? o.customer.email.split('@')[0] : 'Verified Buyer'),
        total: o.total,
        netPayout: o.total - platformFee,
        status: o.status,
        itemCount: o.items.length
      };
    });

    return NextResponse.json({
      success: true,
      range,
      kpis: {
        totalGrossSales: filteredGrossSales,
        netEarnings,
        platformCommission: filteredPlatformCommission,
        totalOrders: filteredOrders.length,
        pendingOrders,
        completedOrders,
        totalProducts: products.length,
        lowStockCount,
        totalCustomers: customerIdSet.size || (filteredOrders.length > 0 ? filteredOrders.length : 0),
        commissionRate
      },
      salesTrend,
      bestSellers,
      recentOrders
    });
  } catch (err: any) {
    console.error('Seller Analytics GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
