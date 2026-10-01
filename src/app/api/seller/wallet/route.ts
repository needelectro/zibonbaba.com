import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({
        availableBalance: 0,
        pendingBalance: 0,
        totalWithdrawn: 0,
        grossSales: 0,
        platformCommission: 0,
        commissionRate: 8.5,
        payouts: [],
        commissionBreakdown: []
      });
    }

    const sellerStore = context.store;
    const commissionRate = sellerStore.commissionRate || 8.5;

    // Fetch all orders for this store
    const orders = await prisma.order.findMany({
      where: { storeId: sellerStore.id },
      orderBy: { createdAt: 'desc' }
    });

    let totalGrossSales = 0;
    let totalPlatformCommission = 0;
    let settledGrossSales = 0;
    let settledPlatformCommission = 0;
    let pendingGrossSales = 0;

    const commissionBreakdown: any[] = [];

    orders.forEach((o) => {
      totalGrossSales += o.total;
      const orderFee = Math.round((o.subTotal * commissionRate) / 100);
      const sellerNet = o.total - orderFee;
      totalPlatformCommission += orderFee;

      const st = (o.status || '').toUpperCase();
      const isSettled = ['DELIVERED', 'COMPLETED'].includes(st);
      const isPending = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'IN_TRANSIT'].includes(st);

      if (isSettled) {
        settledGrossSales += o.total;
        settledPlatformCommission += orderFee;
      } else if (isPending) {
        pendingGrossSales += sellerNet;
      }

      commissionBreakdown.push({
        orderId: o.id,
        date: o.createdAt.toISOString(),
        orderAmount: o.total,
        commissionRate,
        commissionAmount: orderFee,
        netEarnings: sellerNet,
        status: o.status
      });
    });

    const netSettledEarnings = Math.max(0, settledGrossSales - settledPlatformCommission);

    // Fetch payout / withdrawal requests from WithdrawalRequest table
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: {
        userId: context.user.id
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalPaidOut = 0;
    let pendingWithdrawalAmount = 0;

    const formattedPayouts = withdrawalRequests.map((w) => {
      const st = w.status.toUpperCase();
      if (st === 'COMPLETED' || st === 'PAID') {
        totalPaidOut += w.amount;
      } else if (st === 'PENDING' || st === 'PROCESSING') {
        pendingWithdrawalAmount += w.amount;
      }

      return {
        id: w.id,
        amount: w.amount,
        paymentMethod: w.paymentMethod,
        accountNumber: w.accountNumber,
        status: w.status,
        date: w.createdAt.toISOString(),
        notes: w.notes,
        adminNote: w.adminNote,
        transactionRef: w.transactionRef,
        processedAt: w.processedAt?.toISOString() || null
      };
    });

    // Available balance = Settled earnings - (Paid out + Currently pending requests)
    const availableBalance = Math.max(0, netSettledEarnings - (totalPaidOut + pendingWithdrawalAmount));

    return NextResponse.json({
      success: true,
      availableBalance,
      pendingBalance: pendingGrossSales,
      totalWithdrawn: totalPaidOut,
      pendingWithdrawalAmount,
      totalGrossSales,
      platformCommission: totalPlatformCommission,
      commissionRate,
      payouts: formattedPayouts,
      commissionBreakdown: commissionBreakdown.slice(0, 50)
    });
  } catch (err: any) {
    console.error('Seller Wallet GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const body = await request.json();
    const { amount, paymentMethod, accountNumber, accountDetails, notes } = body;

    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid payout amount greater than ৳0 is required.' }, { status: 400 });
    }

    if (numAmount < 500) {
      return NextResponse.json({ error: 'Minimum payout withdrawal threshold is ৳500.' }, { status: 400 });
    }

    if (!accountNumber || !accountNumber.trim()) {
      return NextResponse.json({ error: 'Account or mobile wallet number is required.' }, { status: 400 });
    }

    const validMethods = ['bKash', 'Nagad', 'Rocket', 'Bank Transfer'];
    const chosenMethod = validMethods.includes(paymentMethod) ? paymentMethod : 'bKash';

    // Verify current available balance
    const completedOrders = await prisma.order.findMany({
      where: {
        storeId: context.store.id,
        status: { in: ['DELIVERED', 'COMPLETED'] }
      },
      select: { total: true, subTotal: true }
    });

    const commissionRate = context.store.commissionRate || 8.5;
    let settledGross = 0;
    let settledComm = 0;
    completedOrders.forEach(o => {
      settledGross += o.total;
      settledComm += Math.round((o.subTotal * commissionRate) / 100);
    });

    const netSettled = Math.max(0, settledGross - settledComm);

    const existingWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        userId: context.user.id,
        status: { in: ['PENDING', 'PROCESSING', 'COMPLETED', 'PAID', 'APPROVED'] }
      },
      select: { amount: true }
    });

    const committedAmount = existingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = Math.max(0, netSettled - committedAmount);

    if (numAmount > availableBalance) {
      return NextResponse.json({
        error: `Insufficient available balance. You requested ৳${numAmount.toLocaleString()}, but your available balance is ৳${availableBalance.toLocaleString()}.`
      }, { status: 400 });
    }

    // Create official WithdrawalRequest record for Admin Review & Settlement
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId: context.user.id,
        role: 'VENDOR_ADMIN',
        amount: numAmount,
        paymentMethod: chosenMethod,
        accountNumber: accountNumber.trim(),
        accountDetails: accountDetails || `${context.store.name} Merchant Payout`,
        notes: notes || undefined,
        status: 'PENDING'
      }
    });

    // Also record transaction entry for ledger
    await prisma.walletTransaction.create({
      data: {
        userId: context.user.id,
        type: 'DEBIT',
        amount: numAmount,
        description: `Payout request #${withdrawal.id.slice(-6).toUpperCase()} via ${chosenMethod} to ${accountNumber.trim()}`,
        reference: withdrawal.id,
        balance: availableBalance - numAmount
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: context.user.id,
        title: 'Payout Request Submitted 💳',
        body: `Your withdrawal request for ৳${numAmount.toLocaleString()} via ${chosenMethod} has been submitted for platform review.`,
        type: 'INFO',
        priority: 'MEDIUM',
        module: 'FINANCE'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Payout request for ৳${numAmount.toLocaleString()} submitted successfully.`,
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        date: withdrawal.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Seller Payout Request POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
