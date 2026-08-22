import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { context, error, status } = await requireAdminRole(req);
    if (error || !context) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const body = await req.json();
    const { id, reason } = body;

    if (!id) {
      return NextResponse.json({ error: 'Verification ID required.' }, { status: 400 });
    }

    const verification = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewNote: reason || 'Application rejected during review'
      }
    });

    // Send in-app notification to seller
    await prisma.notification.create({
      data: {
        userId: verification.userId,
        title: 'Store Application Update ⚠️',
        body: `Your store application was not approved. Reason: ${reason || 'Missing or incorrect documentation.'}`,
        type: 'ALERT',
        priority: 'HIGH',
        module: 'MARKETPLACE'
      }
    });

    await logAdminAction(context.user.id, `REJECTED_VERIFICATION: ID=${id}`);

    return NextResponse.json({
      success: true,
      message: 'Seller verification rejected.'
    });
  } catch (err: any) {
    console.error('Reject Verification Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
