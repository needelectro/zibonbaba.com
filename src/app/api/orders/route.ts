import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getAuthUser, logAdminAction } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized. Please sign in to place an order.' }, { status: 401 });

  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Shopping cart items cannot be empty.' }, { status: 400 });
    }

    const customerId = user.id;

    const createdOrders = await prisma.$transaction(async (tx) => {
      // 1. Group items by their storeId
      const storeItemsMap = new Map<string, Array<{ dbVariant: any; quantity: number }>>();

      for (const item of items) {
        const sku = item.product?.sku;
        if (!sku) continue;

        const dbVariant = await tx.productVariant.findUnique({
          where: { sku },
          include: {
            product: { include: { store: true } },
            inventory: true
          }
        });

        if (!dbVariant) {
          throw new Error(`Product SKU ${sku} is no longer available.`);
        }

        const requestedQty = item.quantity || 1;
        const primaryInv = dbVariant.inventory[0];
        if (primaryInv && primaryInv.quantity < requestedQty) {
          throw new Error(`Insufficient stock for ${dbVariant.product.name}. Available: ${primaryInv.quantity}`);
        }

        // Deduct inventory
        if (primaryInv) {
          await tx.inventory.update({
            where: { id: primaryInv.id },
            data: { quantity: Math.max(0, primaryInv.quantity - requestedQty) }
          });
        }

        const storeId = dbVariant.product.storeId;
        if (!storeItemsMap.has(storeId)) {
          storeItemsMap.set(storeId, []);
        }
        storeItemsMap.get(storeId)!.push({ dbVariant, quantity: requestedQty });
      }

      if (storeItemsMap.size === 0) {
        throw new Error('No valid products found in order payload.');
      }

      const ordersList = [];

      // 2. Create dedicated Order record for each store
      for (const [storeId, storeItems] of Array.from(storeItemsMap.entries())) {
        let subTotal = 0;
        const orderItemsData = [];

        for (const sItem of storeItems) {
          const itemTotal = sItem.dbVariant.price * sItem.quantity;
          subTotal += itemTotal;

          orderItemsData.push({
            variantId: sItem.dbVariant.id,
            quantity: sItem.quantity,
            price: sItem.dbVariant.price
          });
        }

        const tax = Math.round(subTotal * 0.05);
        const shipping = 60.0; // ৳60 standard delivery
        const total = subTotal + tax + shipping;

        const order = await tx.order.create({
          data: {
            customerId,
            storeId,
            source: 'ONLINE',
            subTotal,
            tax,
            discount: 0.0,
            total,
            status: 'PENDING',
            items: {
              create: orderItemsData
            }
          },
          include: {
            store: true,
            items: { include: { variant: { include: { product: true } } } }
          }
        });

        ordersList.push(order);
      }

      return ordersList;
    });

    await logAdminAction(customerId, `ORDER_ONLINE_PLACED: OrdersCount=${createdOrders.length}`);

    // Create customer in-app notification
    await prisma.notification.create({
      data: {
        userId: customerId,
        title: 'Order Placed Successfully! 🛍️',
        body: `Your order (#${createdOrders[0].id.substring(0, 8).toUpperCase()}) has been received and sent to merchants for packing.`,
        type: 'SUCCESS',
        priority: 'HIGH',
        module: 'MARKETPLACE'
      }
    });

    return NextResponse.json({
      success: true,
      orders: createdOrders,
      orderId: createdOrders[0].id,
      total: createdOrders.reduce((sum, o) => sum + o.total, 0),
      message: 'Order recorded to database successfully!'
    }, { status: 201 });

  } catch (err: any) {
    console.error('Order Placement API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to place order.' }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const role = user.role;
    let dbOrders;

    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MANAGER') {
      dbOrders = await prisma.order.findMany({
        include: {
          customer: { include: { profile: true } },
          store: true,
          items: { include: { variant: { include: { product: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'VENDOR_ADMIN' || role === 'SELLER') {
      const store = await prisma.store.findFirst({ where: { ownerId: user.id } });
      if (!store) return NextResponse.json({ orders: [] });

      dbOrders = await prisma.order.findMany({
        where: { storeId: store.id },
        include: {
          customer: { include: { profile: true } },
          store: true,
          items: { include: { variant: { include: { product: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      dbOrders = await prisma.order.findMany({
        where: { customerId: user.id },
        include: {
          store: true,
          items: { include: { variant: { include: { product: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const formattedOrders = dbOrders.map((o: any) => {
      const cartItems = o.items.map((it: any) => ({
        product: {
          id: it.variant?.product?.id || it.id,
          name: it.variant?.product?.name || 'Product Item',
          price: it.price,
          sku: it.variant?.sku || 'SKU',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
        },
        quantity: it.quantity
      }));

      return {
        id: o.id,
        date: o.createdAt.toISOString().split('T')[0],
        items: cartItems,
        total: o.total,
        subTotal: o.subTotal,
        status: o.status,
        source: o.source,
        storeName: o.store?.name || 'Zibonbaba Store',
        customerName: o.customer?.profile?.fullName || o.customer?.email || 'Marketplace Customer'
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (err: any) {
    console.error('Orders GET API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
