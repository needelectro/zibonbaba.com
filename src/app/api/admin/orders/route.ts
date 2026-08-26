import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { store: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              phone: true,
              profile: { select: { fullName: true } }
            }
          },
          store: {
            select: {
              id: true,
              name: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
            }
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })
    ]);

    const formattedOrders = orders.map(o => ({
      id: o.id,
      customer: {
        id: o.customer?.id || 'guest',
        name: o.customer?.profile?.fullName || o.customer?.email?.split('@')[0] || 'Guest Customer',
        email: o.customer?.email || 'N/A',
        phone: o.customer?.phone || 'N/A'
      },
      store: {
        id: o.store?.id,
        name: o.store?.name || 'Zibonbaba Direct'
      },
      branch: o.branch?.name || 'Main Fulfillment Hub',
      source: o.source,
      subTotal: o.subTotal,
      tax: o.tax,
      discount: o.discount,
      total: o.total,
      status: o.status,
      items: o.items.map(item => ({
        id: item.id,
        name: item.variant?.product?.name || 'Product Item',
        sku: item.variant?.sku || 'SKU',
        quantity: item.quantity,
        price: item.price
      })),
      createdAt: o.createdAt
    }));

    return NextResponse.json({
      success: true,
      total,
      limit,
      offset,
      orders: formattedOrders
    });
  } catch (err: any) {
    console.error('Admin Get Orders Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required.' }, { status: 400 });
    }

    const normalizedStatus = status.toUpperCase();
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json({ error: `Invalid order status. Allowed values: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: normalizedStatus }
    });

    // Notify customer about order update
    if (existingOrder.customerId) {
      await prisma.notification.create({
        data: {
          userId: existingOrder.customerId,
          title: `Order Status Updated: ${normalizedStatus}`,
          body: `Your order #${orderId.substring(0, 8)} status is now ${normalizedStatus}.`,
          type: normalizedStatus === 'DELIVERED' ? 'SUCCESS' : normalizedStatus === 'CANCELLED' ? 'WARNING' : 'INFO',
          module: 'MARKETPLACE'
        }
      });
    }

    await logAdminAction(
      auth.user?.id || null,
      `Updated order #${orderId} status from [${existingOrder.status}] to [${normalizedStatus}]`
    );

    return NextResponse.json({
      success: true,
      message: `Order #${orderId} updated to ${normalizedStatus}.`,
      order: updated
    });
  } catch (err: any) {
    console.error('Admin Update Order Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
