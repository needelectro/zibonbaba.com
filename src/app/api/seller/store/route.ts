import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!context.store) {
      return NextResponse.json({
        store: null,
        user: context.user,
        isPending: true,
        message: 'No store currently registered for this account.'
      });
    }

    const fullStore = await prisma.store.findUnique({
      where: { id: context.store.id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            avatar: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                bio: true
              }
            }
          }
        },
        _count: {
          select: { products: true, orders: true }
        }
      }
    });

    if (!fullStore) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    // Parse structured metadata from taxInfo if available
    let extraMeta: any = {};
    if (fullStore.taxInfo) {
      try {
        extraMeta = JSON.parse(fullStore.taxInfo);
      } catch (_) {}
    }

    const storePayload = {
      id: fullStore.id,
      name: fullStore.name,
      description: fullStore.description || '',
      logo: fullStore.logo || '',
      banner: fullStore.banner || '',
      commissionRate: fullStore.commissionRate,
      isApproved: fullStore.isApproved,
      createdAt: fullStore.createdAt,
      productsCount: fullStore._count.products,
      ordersCount: fullStore._count.orders,
      phone: extraMeta.phone || fullStore.owner?.phone || '',
      supportEmail: extraMeta.email || fullStore.owner?.email || '',
      address: extraMeta.address || '',
      city: extraMeta.city || 'Dhaka',
      district: extraMeta.district || '',
      businessHours: extraMeta.businessHours || 'Sun - Thu: 9:00 AM - 8:00 PM',
      returnPolicy: extraMeta.returnPolicy || '7-day replacement guarantee for defective items.',
      shippingPolicy: extraMeta.shippingPolicy || 'Standard delivery within 24-72 hours across Bangladesh.',
      socialLinks: extraMeta.socialLinks || { facebook: '', instagram: '', website: '' },
      owner: {
        id: fullStore.owner?.id,
        email: fullStore.owner?.email,
        phone: fullStore.owner?.phone,
        fullName: fullStore.owner?.profile?.fullName || fullStore.owner?.email?.split('@')[0],
        status: fullStore.owner?.status,
        avatar: fullStore.owner?.avatar
      }
    };

    return NextResponse.json({
      success: true,
      store: storePayload,
      isPending: !fullStore.isApproved
    });
  } catch (err: any) {
    console.error('Seller Store API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Store not found.' }, { status: status || 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      logo,
      banner,
      phone,
      supportEmail,
      address,
      city,
      district,
      businessHours,
      returnPolicy,
      shippingPolicy,
      socialLinks,
      ownerFullName
    } = body;

    // Check if store name is being changed and verify uniqueness
    if (name && name.trim() !== context.store.name) {
      const existing = await prisma.store.findUnique({ where: { name: name.trim() } });
      if (existing && existing.id !== context.store.id) {
        return NextResponse.json({ error: 'A store with this name already exists. Please choose another.' }, { status: 409 });
      }
    }

    // Retrieve existing taxInfo metadata to merge
    const currentStore = await prisma.store.findUnique({ where: { id: context.store.id } });
    let existingMeta: any = {};
    if (currentStore?.taxInfo) {
      try {
        existingMeta = JSON.parse(currentStore.taxInfo);
      } catch (_) {}
    }

    const updatedMeta = {
      ...existingMeta,
      ...(phone !== undefined ? { phone: phone.trim() } : {}),
      ...(supportEmail !== undefined ? { email: supportEmail.trim() } : {}),
      ...(address !== undefined ? { address: address.trim() } : {}),
      ...(city !== undefined ? { city: city.trim() } : {}),
      ...(district !== undefined ? { district: district.trim() } : {}),
      ...(businessHours !== undefined ? { businessHours: businessHours.trim() } : {}),
      ...(returnPolicy !== undefined ? { returnPolicy: returnPolicy.trim() } : {}),
      ...(shippingPolicy !== undefined ? { shippingPolicy: shippingPolicy.trim() } : {}),
      ...(socialLinks !== undefined ? { socialLinks } : {})
    };

    const updatedStore = await prisma.store.update({
      where: { id: context.store.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(logo !== undefined ? { logo } : {}),
        ...(banner !== undefined ? { banner } : {}),
        taxInfo: JSON.stringify(updatedMeta)
      }
    });

    // Update owner personal info if provided
    if (ownerFullName) {
      await prisma.profile.upsert({
        where: { userId: context.user.id },
        update: { fullName: ownerFullName.trim() },
        create: { userId: context.user.id, fullName: ownerFullName.trim() }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully.',
      store: {
        ...updatedStore,
        ...updatedMeta
      }
    });
  } catch (err: any) {
    console.error('Seller Store Update API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
