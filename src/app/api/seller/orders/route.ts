import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ orders: [], error }, { status: status || 200 });
    }

    const orders = await prisma.order.findMany({
      where: { storeId: context.store.id },
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
    });

    const formattedOrders = orders.map((o) => {
      const commissionRate = context.store?.commissionRate || 8.5;
      const platformFee = Math.round((o.subTotal * commissionRate) / 100);
      const sellerPayout = o.total - platformFee;

      return {
        id: o.id,
        date: o.createdAt.toISOString(),
        customerName: `Verified Buyer (#${o.id.slice(-6).toUpperCase()})`,
        customerPhone: null,
        subTotal: o.subTotal,
        total: o.total,
        platformFee,
        sellerPayout,
        status: o.status,
        source: o.source,
        items: o.items.map((it) => ({
          product: {
            id: it.variant?.productId || it.id,
            name: it.variant?.product?.name || 'Product Item',
            price: it.price,
            sku: it.variant?.sku || 'SKU'
          },
          quantity: it.quantity
        }))
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (err: any) {
    console.error('Seller Orders GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const body = await request.json();
    const { orderId, status: newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Order ID and new status are required.' }, { status: 400 });
    }

    // Ownership check: Verify this order belongs to the seller's store
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const isOwner = order.storeId === context.store.id;
    const isAdmin = context.user.role === 'SUPER_ADMIN' || context.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access Denied. You cannot modify another seller\'s order.' }, { status: 403 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus.toUpperCase() }
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${newStatus.toUpperCase()}`,
      order: updatedOrder
    });
  } catch (err: any) {
    console.error('Seller Order Status PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
