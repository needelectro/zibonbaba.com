import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ coupons });
  } catch (err: any) {
    console.error('Admin Coupons GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { code, discount, expiry } = body;

    if (!code || discount === undefined || !expiry) {
      return NextResponse.json({ error: 'code, discount, and expiry are required.' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discount: parseFloat(discount),
        expiry,
        active: true
      }
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err: any) {
    console.error('Admin Coupons POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required.' }, { status: 400 });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: { active: !!active }
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (err: any) {
    console.error('Admin Coupons PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required.' }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err: any) {
    console.error('Admin Coupons DELETE Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

