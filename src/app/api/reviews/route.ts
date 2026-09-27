import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const featured = searchParams.get('featured');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const where: any = { isApproved: true };

    if (productId && productId !== 'all' && productId !== 'general') {
      where.productId = productId;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    const totalCount = await prisma.review.count({ where });
    const avgScore = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 5;

    return NextResponse.json({
      success: true,
      reviews,
      totalCount,
      averageRating: parseFloat(avgScore.toFixed(1))
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve reviews', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, rating, comment, productId, avatar } = body;

    // Optional auth extraction
    const authUser = await getAuthUser(req);

    const cleanComment = (comment || '').trim();
    if (!cleanComment || cleanComment.length < 3) {
      return NextResponse.json(
        { error: 'Review text must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    const cleanRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    
    let reviewerName = (name || '').trim();
    if (!reviewerName) {
      reviewerName = authUser?.fullName || authUser?.email?.split('@')[0] || 'Verified Customer';
    }

    let reviewerRole = (role || '').trim();
    if (!reviewerRole) {
      reviewerRole = authUser ? 'Verified Buyer' : 'Online Consumer';
    }

    const reviewerAvatar = avatar || reviewerName.charAt(0).toUpperCase();

    // Verify productId if provided
    let validProductId: string | null = null;
    if (productId && productId !== 'general' && productId !== 'platform') {
      const prod = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true }
      });
      if (prod) {
        validProductId = prod.id;
      }
    }

    const newReview = await prisma.review.create({
      data: {
        userId: authUser?.id || null,
        productId: validProductId,
        name: reviewerName,
        role: reviewerRole,
        rating: cleanRating,
        comment: cleanComment,
        avatar: reviewerAvatar,
        isApproved: true,
        isFeatured: true
      },
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your review has been posted successfully.',
        review: newReview
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review', details: error.message },
      { status: 500 }
    );
  }
}
