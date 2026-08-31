import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan, logAdminAction } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const { id } = await params;
    const userId = context.user.id;
    const body = await request.json();
    const { newStatus, otp, failedReason, proofNotes, codCollected } = body;

    if (!newStatus) {
      return NextResponse.json({ error: 'Target status is required.' }, { status: 400 });
    }

    const normalizedTarget = newStatus.toUpperCase().trim();

    // Fetch assignment
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: {
        deliveryManId: userId,
        OR: [{ id }, { orderId: id }]
      },
      include: {
        order: {
          include: { resellerOrder: true }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Delivery assignment not found or access denied.' }, { status: 404 });
    }

    const currentStatus = assignment.status;

    // Validate state machine transitions
    const validTransitions: Record<string, string[]> = {
      ASSIGNED: ['ACCEPTED', 'REJECTED'],
      ACCEPTED: ['PICKED_UP', 'REJECTED'],
      PICKED_UP: ['IN_TRANSIT', 'FAILED'],
      IN_TRANSIT: ['DELIVERED', 'FAILED', 'RETURNED'],
      FAILED: ['IN_TRANSIT', 'RETURNED']
    };

    if (!validTransitions[currentStatus]?.includes(normalizedTarget) && currentStatus !== normalizedTarget) {
      return NextResponse.json({
        error: `Invalid transition from ${currentStatus} to ${normalizedTarget}.`
      }, { status: 400 });
    }

    // If marking DELIVERED, verify OTP if OTP was configured
    if (normalizedTarget === 'DELIVERED') {
      if (assignment.deliveryOtp && otp) {
        if (otp.toString().trim() !== assignment.deliveryOtp.toString().trim()) {
          return NextResponse.json({ error: 'Invalid delivery OTP entered. Please verify with customer.' }, { status: 400 });
        }
      }
    }

    // Execute atomic update transaction
    const updated = await prisma.$transaction(async (tx) => {
      const now = new Date();

      const updateData: any = {
        status: normalizedTarget,
        ...(proofNotes ? { proofNotes } : {}),
        ...(codCollected !== undefined ? { codCollected: Boolean(codCollected) } : {})
      };

      if (normalizedTarget === 'ACCEPTED') updateData.acceptedAt = now;
      if (normalizedTarget === 'PICKED_UP') updateData.pickedUpAt = now;
      if (normalizedTarget === 'DELIVERED') updateData.deliveredAt = now;
      if (normalizedTarget === 'FAILED') {
        updateData.failedAt = now;
        updateData.failedReason = failedReason || 'Delivery attempt failed';
      }

      // 1. Update assignment
      const updatedAssignment = await tx.deliveryAssignment.update({
        where: { id: assignment.id },
        data: updateData
      });

      // 2. Sync main Order status
      let mappedOrderStatus = 'PROCESSING';
      if (normalizedTarget === 'ACCEPTED') mappedOrderStatus = 'PROCESSING';
      else if (normalizedTarget === 'PICKED_UP' || normalizedTarget === 'IN_TRANSIT') mappedOrderStatus = 'SHIPPED';
      else if (normalizedTarget === 'DELIVERED') mappedOrderStatus = 'DELIVERED';
      else if (normalizedTarget === 'FAILED') mappedOrderStatus = 'PROCESSING';
      else if (normalizedTarget === 'RETURNED') mappedOrderStatus = 'CANCELLED';

      await tx.order.update({
        where: { id: assignment.orderId },
        data: { status: mappedOrderStatus }
      });

      // 3. Sync ResellerOrder status if this is a reseller order
      if (assignment.order?.resellerOrder) {
        const ro = assignment.order.resellerOrder;
        await tx.resellerOrder.update({
          where: { id: ro.id },
          data: {
            status: normalizedTarget,
            ...(normalizedTarget === 'DELIVERED' ? { payoutStatus: 'AVAILABLE' } : {})
          }
        });

        // If DELIVERED, credit profit to Reseller's wallet
        if (normalizedTarget === 'DELIVERED' && ro.resellerProfit > 0) {
          const resellerUser = await tx.user.findUnique({ where: { id: ro.resellerId } });
          const newBal = (resellerUser?.walletBalance || 0) + ro.resellerProfit;
          
          await tx.user.update({
            where: { id: ro.resellerId },
            data: { walletBalance: newBal }
          });

          await tx.walletTransaction.create({
            data: {
              userId: ro.resellerId,
              type: 'CREDIT',
              amount: ro.resellerProfit,
              balance: newBal,
              description: `Profit from delivered customer order #${ro.orderId.slice(0, 8).toUpperCase()}`,
              reference: ro.orderId
            }
          });

          // Notify Reseller
          await tx.notification.create({
            data: {
              userId: ro.resellerId,
              title: 'Order Delivered & Profit Credited! 💰',
              body: `Order #${ro.orderId.slice(0, 8).toUpperCase()} was delivered! ৳${ro.resellerProfit.toLocaleString()} profit added to your wallet.`,
              type: 'SUCCESS',
              priority: 'HIGH',
              module: 'WALLET'
            }
          });
        }
      }

      // 4. If DELIVERED, credit delivery fee to Delivery Driver's wallet
      if (normalizedTarget === 'DELIVERED') {
        const deliveryFee = assignment.deliveryFee || 120.0;
        const driverUser = await tx.user.findUnique({ where: { id: userId } });
        const newDriverBal = (driverUser?.walletBalance || 0) + deliveryFee;

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: newDriverBal }
        });

        await tx.deliveryProfile.updateMany({
          where: { userId },
          data: {
            completedDeliveries: { increment: 1 },
            totalEarnings: { increment: deliveryFee },
            ...(Boolean(codCollected) ? { cashInHand: { increment: assignment.codAmount } } : {})
          }
        });

        await tx.walletTransaction.create({
          data: {
            userId,
            type: 'CREDIT',
            amount: deliveryFee,
            balance: newDriverBal,
            description: `Delivery fee payout for completed order #${assignment.orderId.slice(0, 8).toUpperCase()}`,
            reference: assignment.orderId
          }
        });

        // Notify Delivery Driver
        await tx.notification.create({
          data: {
            userId,
            title: 'Delivery Completed & Fee Credited! 🎉',
            body: `Great job! You delivered order #${assignment.orderId.slice(0, 8).toUpperCase()}. ৳${deliveryFee} credited to your wallet.`,
            type: 'SUCCESS',
            priority: 'HIGH',
            module: 'DELIVERY'
          }
        });
      }

      return updatedAssignment;
    });

    await logAdminAction(userId, `DELIVERY_STATUS_TRANSITION: AssignmentId=${assignment.id}, Status=${normalizedTarget}`);

    return NextResponse.json({
      success: true,
      message: `Delivery status updated to ${normalizedTarget}`,
      assignment: updated
    });

  } catch (err: any) {
    console.error('Delivery Status POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
