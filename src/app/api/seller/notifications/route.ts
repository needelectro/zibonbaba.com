import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context) {
      return NextResponse.json({ notifications: [], unreadCount: 0, error }, { status: status || 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: context.user.id,
        isArchived: false
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err: any) {
    console.error('Seller Notifications GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId: context.user.id, isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (notificationId) {
      // Verify ownership
      const existing = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!existing || existing.userId !== context.user.id) {
        return NextResponse.json({ error: 'Notification not found or access denied.' }, { status: 404 });
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      return NextResponse.json({ success: true, notification: updated });
    }

    return NextResponse.json({ error: 'notificationId or markAllAsRead flag required.' }, { status: 400 });
  } catch (err: any) {
    console.error('Seller Notifications PATCH API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
