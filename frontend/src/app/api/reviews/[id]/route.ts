import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Allow author or admins to delete
    const isAdmin = ADMIN_ROLES.includes(authUser.role);
    const isAuthor = review.userId === authUser.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: 'Permission denied to delete this review' }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);

    if (!authUser || !ADMIN_ROLES.includes(authUser.role)) {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const { isApproved, isFeatured } = body;

    const data: any = {};
    if (typeof isApproved === 'boolean') data.isApproved = isApproved;
    if (typeof isFeatured === 'boolean') data.isFeatured = isFeatured;

    const updated = await prisma.review.update({
      where: { id },
      data
    });

    return NextResponse.json({
      success: true,
      review: updated
    });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review', details: error.message },
      { status: 500 }
    );
  }
}
