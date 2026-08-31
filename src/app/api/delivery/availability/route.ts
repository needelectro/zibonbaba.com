import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const { isOnline, availabilityStatus } = body;

    const resolvedStatus = availabilityStatus || (isOnline ? 'ONLINE' : 'OFFLINE');
    const resolvedOnline = isOnline !== undefined ? Boolean(isOnline) : (resolvedStatus === 'ONLINE');

    const updated = await prisma.deliveryProfile.upsert({
      where: { userId },
      update: {
        isOnline: resolvedOnline,
        availabilityStatus: resolvedStatus
      },
      create: {
        userId,
        isOnline: resolvedOnline,
        availabilityStatus: resolvedStatus,
        status: 'APPROVED'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${resolvedStatus}`,
      profile: updated
    });
  } catch (err: any) {
    console.error('Delivery Availability PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
