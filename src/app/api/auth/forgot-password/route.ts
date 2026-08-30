import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json({
        message: 'If this email is registered, a password reset link has been dispatched.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    const resetUrl = `/forgot-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(`[PASSWORD_RESET] Email: ${cleanEmail}, Reset Token: ${token}`);

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, a password reset link has been dispatched.',
      resetToken: token,
      resetUrl
    });
  } catch (err: any) {
    console.error('Auth Forgot Password Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
