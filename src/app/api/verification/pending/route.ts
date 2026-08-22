import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { context, error, status } = await requireAdminRole(req);
    if (error || !context) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const verifications = await prisma.verificationRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          include: { profile: true, stores: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ verifications });
  } catch (err: any) {
    console.error('Pending Verifications Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
