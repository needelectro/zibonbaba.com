import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        stores: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { items: true }
        },
        loginHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        addresses: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        name: user.profile?.fullName,
        walletBalance: user.walletBalance,
        loyaltyPoints: user.loyaltyPoints,
        stores: user.stores,
        orders: user.orders,
        loginHistory: user.loginHistory,
        addresses: user.addresses,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Admin Get User Details Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, status, fullName, phone, password, suspendedReason } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Protect Super Admin account from demotion by non-superadmin
    if (existingUser.role === 'SUPER_ADMIN' && auth.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can modify Super Admin accounts.' }, { status: 403 });
    }

    let updateData: any = {};
    if (role) updateData.role = role.toUpperCase();
    if (status) {
      updateData.status = status.toUpperCase();
      if (status.toUpperCase() === 'SUSPENDED') {
        updateData.suspendedAt = new Date();
        updateData.suspendedReason = suspendedReason || 'Administrative suspension';
      } else {
        updateData.suspendedAt = null;
        updateData.suspendedReason = null;
      }
    }
    if (phone !== undefined) updateData.phone = phone;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        profile: fullName
          ? {
              upsert: {
                create: { fullName },
                update: { fullName }
              }
            }
          : undefined
      },
      include: { profile: true }
    });

    await logAdminAction(
      auth.user?.id || null,
      `Updated user ${existingUser.email}: status=[${updatedUser.status}], role=[${updatedUser.role}]`
    );

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} updated successfully.`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.profile?.fullName,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone
      }
    });
  } catch (err: any) {
    console.error('Admin Update User Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Platform Superadmin accounts cannot be deleted.' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    await logAdminAction(auth.user?.id || null, `Deleted user account ${existingUser.email}`);

    return NextResponse.json({
      success: true,
      message: `User ${existingUser.email} deleted successfully.`
    });
  } catch (err: any) {
    console.error('Admin Delete User Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
