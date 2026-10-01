import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ items: [], summary: { totalVariants: 0, totalStock: 0, lowStockCount: 0, outOfStockCount: 0 }, error }, { status: status || 200 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const filter = searchParams.get('filter'); // 'all' | 'low' | 'out_of_stock'

    const products = await prisma.product.findMany({
      where: {
        storeId: context.store.id,
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } }
          ]
        } : {})
      },
      include: {
        category: true,
        variants: {
          include: {
            inventory: true,
            orderItems: {
              where: {
                order: {
                  status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING', 'READY_FOR_DELIVERY'] }
                }
              },
              select: { quantity: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    let totalVariants = 0;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const inventoryItems: any[] = [];

    products.forEach((p) => {
      p.variants.forEach((v) => {
        totalVariants++;
        const inv = v.inventory[0];
        const stockQty = inv ? inv.quantity : 0;
        const reorderPt = inv ? inv.reorderPoint : 10;
        const totalSold = v.orderItems.reduce((acc, it) => acc + it.quantity, 0);

        totalStock += stockQty;
        const isOutOfStock = stockQty <= 0;
        const isLowStock = !isOutOfStock && stockQty <= reorderPt;

        if (isOutOfStock) outOfStockCount++;
        if (isLowStock) lowStockCount++;

        let variantAttrs: any = {};
        try {
          if (v.attributes) {
            variantAttrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
          }
        } catch (_) {}

        const itemImage = variantAttrs.image || (Array.isArray(variantAttrs.images) && variantAttrs.images[0]) || null;

        const record = {
          id: v.id,
          productId: p.id,
          productName: p.name,
          categoryName: p.category?.name || 'General',
          sku: v.sku,
          price: v.price || p.basePrice,
          stock: stockQty,
          reorderPoint: reorderPt,
          totalSold,
          isLowStock,
          isOutOfStock,
          status: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'HEALTHY',
          image: itemImage,
          inventoryId: inv?.id || null,
          lastUpdated: inv ? p.updatedAt : p.createdAt
        };

        if (filter === 'low' && !isLowStock) return;
        if (filter === 'out_of_stock' && !isOutOfStock) return;

        inventoryItems.push(record);
      });
    });

    return NextResponse.json({
      success: true,
      items: inventoryItems,
      summary: {
        totalVariants,
        totalStock,
        lowStockCount,
        outOfStockCount
      }
    });
  } catch (err: any) {
    console.error('Seller Inventory GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const body = await request.json();
    const { variantId, quantity, reorderPoint, note } = body;

    if (!variantId || quantity === undefined) {
      return NextResponse.json({ error: 'variantId and quantity are required.' }, { status: 400 });
    }

    // Verify ownership: variant must belong to this seller's store
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        inventory: true
      }
    });

    if (!variant || variant.product.storeId !== context.store.id) {
      return NextResponse.json({ error: 'Access Denied. Product variant does not belong to your store.' }, { status: 403 });
    }

    const newQty = Math.max(0, parseInt(quantity, 10));
    const newReorder = reorderPoint !== undefined ? Math.max(1, parseInt(reorderPoint, 10)) : undefined;

    let updatedInventory;
    const existingInv = variant.inventory[0];
    const prevQty = existingInv ? existingInv.quantity : 0;

    if (existingInv) {
      updatedInventory = await prisma.inventory.update({
        where: { id: existingInv.id },
        data: {
          quantity: newQty,
          ...(newReorder !== undefined ? { reorderPoint: newReorder } : {})
        }
      });
    } else {
      updatedInventory = await prisma.inventory.create({
        data: {
          variantId,
          quantity: newQty,
          reorderPoint: newReorder || 10
        }
      });
    }

    // Update product status if stock went from 0 to positive or vice-versa
    if (newQty === 0 && variant.product.status === 'PUBLISHED') {
      await prisma.product.update({
        where: { id: variant.productId },
        data: { status: 'OUT_OF_STOCK' }
      });
    } else if (newQty > 0 && variant.product.status === 'OUT_OF_STOCK') {
      await prisma.product.update({
        where: { id: variant.productId },
        data: { status: 'PUBLISHED' }
      });
    }

    // Log stock movement audit if note or adjustment made
    const adjustmentDelta = newQty - prevQty;

    return NextResponse.json({
      success: true,
      message: `Stock updated to ${newQty} for SKU ${variant.sku}.`,
      inventory: updatedInventory,
      movement: {
        sku: variant.sku,
        previousStock: prevQty,
        newStock: newQty,
        adjustmentDelta,
        note: note || 'Stock level adjusted in seller portal',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('Seller Inventory PATCH API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
