import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ orders: [], error }, { status: status || 200 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const statusFilter = searchParams.get('status');

    let whereClause: any = {
      storeId: context.store.id
    };

    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter.toUpperCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { customer: { profile: { fullName: { contains: q, mode: 'insensitive' } } } },
        { customer: { email: { contains: q, mode: 'insensitive' } } },
        { customer: { phone: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          include: {
            profile: true,
            addresses: true
          }
        },
        deliveryAssignment: {
          include: {
            deliveryMan: {
              include: { profile: true }
            }
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5
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

    const commissionRate = context.store?.commissionRate || 8.5;

    const formattedOrders = orders.map((o) => {
      const platformFee = Math.round((o.subTotal * commissionRate) / 100);
      const sellerPayout = o.total - platformFee;
      const primaryAddress = o.customer?.addresses?.[0];

      return {
        id: o.id,
        date: o.createdAt.toISOString(),
        customerName: o.customer?.profile?.fullName || (o.customer?.email ? o.customer.email.split('@')[0] : `Customer #${o.id.slice(-5).toUpperCase()}`),
        customerPhone: o.customer?.phone || primaryAddress?.phone || 'Contact provided on dispatch',
        customerEmail: o.customer?.email || 'N/A',
        shippingAddress: primaryAddress
          ? `${primaryAddress.addressLine1}${primaryAddress.addressLine2 ? ', ' + primaryAddress.addressLine2 : ''}, ${primaryAddress.city}`
          : 'Standard Delivery Address',
        shippingCity: primaryAddress?.city || 'Dhaka',
        subTotal: o.subTotal,
        total: o.total,
        platformFee,
        sellerPayout,
        commissionRate,
        status: o.status,
        version: o.version,
        source: o.source,
        deliveryRider: o.deliveryAssignment?.deliveryMan ? {
          name: o.deliveryAssignment.deliveryMan.profile?.fullName || 'Assigned Courier',
          phone: o.deliveryAssignment.deliveryMan.phone || 'N/A',
          status: o.deliveryAssignment.status
        } : null,
        statusHistory: o.statusHistory.map(h => ({
          previousStatus: h.previousStatus,
          newStatus: h.newStatus,
          changedByName: h.changedByName || 'System',
          date: h.createdAt.toISOString()
        })),
        items: o.items.map((it) => {
          let variantAttrs: any = {};
          try {
            if (it.variant?.attributes) {
              variantAttrs = typeof it.variant.attributes === 'string' ? JSON.parse(it.variant.attributes) : it.variant.attributes;
            }
          } catch (_) {}

          return {
            id: it.id,
            product: {
              id: it.variant?.productId || it.id,
              name: it.variant?.product?.name || 'Product Item',
              price: it.price,
              sku: it.variant?.sku || 'SKU',
              image: variantAttrs.image || (Array.isArray(variantAttrs.images) && variantAttrs.images[0]) || null
            },
            quantity: it.quantity,
            price: it.price,
            total: it.price * it.quantity
          };
        })
      };
    });

    return NextResponse.json({
      success: true,
      total: formattedOrders.length,
      orders: formattedOrders
    });
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
    const { orderId, status: newStatus, expectedVersion, reason } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Order ID and new status are required.' }, { status: 400 });
    }

    // Verify order ownership strictly: order.storeId === context.store.id
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (existingOrder.storeId !== context.store.id) {
      return NextResponse.json({ error: 'Access Denied. You do not own this order.' }, { status: 403 });
    }

    const { executeOrderStatusTransition } = await import('@/lib/services/orderTransitionService');

    const result = await executeOrderStatusTransition({
      orderId,
      targetStatus: newStatus,
      user: {
        id: context.user.id,
        role: context.user.role,
        fullName: context.user.fullName,
        email: context.user.email
      },
      expectedVersion,
      reason
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Seller Order Status PATCH Error:', err);
    const isConflict = err.message && err.message.startsWith('Conflict:');
    const isUnauthorized = err.message && (err.message.includes('Unauthorized') || err.message.includes('permission') || err.message.includes('not permitted'));
    const isBadRequest = err.message && (err.message.includes('Illegal') || err.message.includes('required') || err.message.includes('Invalid'));

    const statusCode = isConflict ? 409 : isUnauthorized ? 403 : isBadRequest ? 400 : 500;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: statusCode });
  }
}
