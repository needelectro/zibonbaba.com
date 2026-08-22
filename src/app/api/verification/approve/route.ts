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
    const { id, storeId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Verification ID required.' }, { status: 400 });
    }

    const verification = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewNote: 'Approved by Administrator'
      },
      include: { user: true }
    });

    // Approve the store if linked
    if (storeId) {
      await prisma.store.update({
        where: { id: storeId },
        data: { isApproved: true }
      });
    } else if (verification.userId) {
      await prisma.store.updateMany({
        where: { ownerId: verification.userId },
        data: { isApproved: true }
      });
    }

    // Send in-app notification to seller
    await prisma.notification.create({
      data: {
        userId: verification.userId,
        title: 'Store Approved! 🎉',
        body: 'Congratulations! Your seller store application has been approved by the admin. Your catalog is now live.',
        type: 'SUCCESS',
        priority: 'HIGH',
        module: 'MARKETPLACE'
      }
    });

    await logAdminAction(context.user.id, `APPROVED_VERIFICATION: ID=${id}`);

    return NextResponse.json({
      success: true,
      message: 'Seller verification approved successfully.'
    });
  } catch (err: any) {
    console.error('Approve Verification Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
