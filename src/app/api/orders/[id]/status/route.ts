import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

const VALID_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'DISPATCHED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const newStatus = (body.status || '').toUpperCase().trim();

    if (!newStatus) {
      return NextResponse.json({ error: 'New order status is required.' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid order status '${newStatus}'. Allowed: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { store: true, customer: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Role check: Admins, Staff, and Store Owners can update status
    const role = user.role.toUpperCase();
    const isStaffOrAdmin = [
      'SUPER_ADMIN',
      'ADMIN',
      'MANAGER',
      'ACCOUNTANT',
      'CUSTOMER_SUPPORT',
      'WAREHOUSE_MANAGER',
      'INVENTORY_MANAGER',
      'DELIVERY_MANAGER',
      'DELIVERY_MAN',
      'COURIER'
    ].includes(role);

    const isStoreOwner = order.store && order.store.ownerId === user.id;

    if (!isStaffOrAdmin && !isStoreOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to change this order lifecycle status.' },
        { status: 403 }
      );
    }

    const previousStatus = order.status;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: newStatus }
    });

    // Create real-time notification for customer
    if (order.customerId) {
      try {
        await prisma.notification.create({
          data: {
            userId: order.customerId,
            title: `Order Status Updated: ${newStatus}`,
            body: `Your order #${id.substring(0, 8)} status is now ${newStatus}.`,
            type: newStatus === 'DELIVERED' ? 'SUCCESS' : newStatus === 'CANCELLED' ? 'WARNING' : 'INFO',
            module: 'MARKETPLACE'
          }
        });
      } catch (_) {}
    }

    await logAdminAction(
      user.id,
      `ORDER_STATUS_UPDATE: Order #${id} changed from [${previousStatus}] to [${newStatus}]`
    );

    return NextResponse.json({
      success: true,
      message: `Order #${id.substring(0, 8)} status updated to ${newStatus}.`,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        total: updatedOrder.total,
        createdAt: updatedOrder.createdAt
      }
    });

  } catch (err: any) {
    console.error('Order Status Update Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error updating order.' }, { status: 500 });
  }
}
