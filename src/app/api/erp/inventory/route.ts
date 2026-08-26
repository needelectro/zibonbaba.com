import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

async function getUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user || !['VENDOR_ADMIN', 'VENDOR_STAFF', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized or insufficient permissions' }, { status: 403 });
  }

  try {
    const store = await prisma.store.findFirst({ where: { ownerId: user.id } });
    if (!store) return NextResponse.json({ stock: [] });

    const inventoryItems = await prisma.inventory.findMany({
      where: {
        OR: [
          { warehouse: { storeId: store.id } },
          { branch: { storeId: store.id } }
        ]
      },
      include: {
        variant: { include: { product: true } },
        warehouse: true,
        branch: true
      }
    });

    const stock = inventoryItems.map((inv: any) => ({
      sku: inv.variant.sku,
      productName: inv.variant.product.name,
      quantity: inv.quantity,
      reorderPoint: inv.reorderPoint,
      warehouse: inv.warehouse ? inv.warehouse.name : null,
      branch: inv.branch ? inv.branch.name : null
    }));

    return NextResponse.json({ stock });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
