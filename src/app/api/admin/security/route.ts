import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

// In-memory blacklist for firewall (persists in process memory)
let ipBlacklist = new Set<string>(['185.220.101.4', '45.15.24.99']);

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [activeSessions, recentAudits, totalLogins, failedLogins] = await Promise.all([
      prisma.session.findMany({
        where: { expiresAt: { gt: new Date() } },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              profile: { select: { fullName: true } }
            }
          }
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, role: true } }
        }
      }),
      prisma.loginHistory.count(),
      prisma.loginHistory.count({ where: { status: 'FAILED' } })
    ]);

    return NextResponse.json({
      success: true,
      firewallStatus: 'ACTIVE',
      blockedThreatsCount: failedLogins + ipBlacklist.size,
      blacklistedIps: Array.from(ipBlacklist),
      activeSessions: activeSessions.map(s => ({
        id: s.id,
        user: s.user?.profile?.fullName || s.user?.email?.split('@')[0] || 'User',
        email: s.user?.email || 'Unknown',
        role: s.user?.role || 'CUSTOMER',
        ip: s.ipAddress || '127.0.0.1',
        device: s.userAgent || 'Web Client',
        createdAt: s.createdAt,
        expiresAt: s.expiresAt
      })),
      recentAudits: recentAudits.map(a => ({
        id: a.id,
        user: a.user?.email || 'System',
        role: a.user?.role || 'SYSTEM',
        action: a.action,
        ip: a.ipAddress || '127.0.0.1',
        timestamp: a.createdAt,
        risk: a.action.includes('FAIL') || a.action.includes('BLOCK') ? 'HIGH' : 'LOW'
      })),
      totalLogins,
      failedLogins
    });
  } catch (err: any) {
    console.error('Admin GET Security Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { action, ip, sessionId, userId } = body;

    if (action === 'BLACKLIST_IP' && ip) {
      ipBlacklist.add(ip);
      await logAdminAction(auth.user?.id || null, `Blacklisted IP: ${ip}`);
      return NextResponse.json({
        success: true,
        message: `IP ${ip} added to security firewall blacklist.`,
        blacklistedIps: Array.from(ipBlacklist)
      });
    }

    if (action === 'UNBLACKLIST_IP' && ip) {
      ipBlacklist.delete(ip);
      await logAdminAction(auth.user?.id || null, `Removed IP from blacklist: ${ip}`);
      return NextResponse.json({
        success: true,
        message: `IP ${ip} removed from blacklist.`,
        blacklistedIps: Array.from(ipBlacklist)
      });
    }

    if (action === 'REVOKE_SESSION' && sessionId) {
      await prisma.session.deleteMany({ where: { id: sessionId } });
      await logAdminAction(auth.user?.id || null, `Revoked active user session ID: ${sessionId}`);
      return NextResponse.json({
        success: true,
        message: 'Active session revoked successfully.'
      });
    }

    if (action === 'REVOKE_ALL_USER_SESSIONS' && userId) {
      await prisma.session.deleteMany({ where: { userId } });
      await logAdminAction(auth.user?.id || null, `Revoked all active sessions for user ID: ${userId}`);
      return NextResponse.json({
        success: true,
        message: 'All sessions for user revoked.'
      });
    }

    return NextResponse.json({ error: 'Invalid security action.' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin POST Security Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
