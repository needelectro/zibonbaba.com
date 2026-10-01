import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ products: [], error }, { status: status || 200 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryFilter = searchParams.get('category');
    const statusFilter = searchParams.get('status');

    let whereClause: any = {
      storeId: context.store.id
    };

    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter.toUpperCase();
    }

    if (categoryFilter && categoryFilter !== 'ALL') {
      whereClause.category = {
        name: { equals: categoryFilter, mode: 'insensitive' }
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: q, mode: 'insensitive' } } } }
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: {
          include: {
            inventory: true,
            orderItems: {
              select: { quantity: true }
            }
          }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProducts = products.map((p) => {
      let totalStock = 0;
      let totalSold = 0;
      p.variants.forEach((v) => {
        v.inventory.forEach((inv) => {
          totalStock += inv.quantity;
        });
        v.orderItems.forEach((oi) => {
          totalSold += oi.quantity;
        });
      });

      const firstVariant = p.variants[0];
      let variantAttrs: any = {};
      try {
        if (firstVariant?.attributes) {
          variantAttrs = typeof firstVariant.attributes === 'string' ? JSON.parse(firstVariant.attributes) : firstVariant.attributes;
        }
      } catch (_) {}

      const mainImage = variantAttrs.image || (Array.isArray(variantAttrs.images) && variantAttrs.images[0]) || null;
      const galleryImages = Array.isArray(variantAttrs.images) && variantAttrs.images.length > 0 ? variantAttrs.images : (mainImage ? [mainImage] : []);

      const avgRating = p.reviews.length > 0
        ? Number((p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length).toFixed(1))
        : 5.0;

      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.basePrice,
        discountPrice: variantAttrs.discountPrice || null,
        category: p.category?.name || 'General',
        categoryId: p.categoryId,
        status: p.status,
        sku: firstVariant?.sku || p.id.substring(0, 8).toUpperCase(),
        stock: totalStock,
        totalSold,
        rating: avgRating,
        image: mainImage,
        images: galleryImages,
        specifications: variantAttrs.specifications || {},
        createdAt: p.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      total: formattedProducts.length,
      products: formattedProducts
    });
  } catch (err: any) {
    console.error('Seller Products GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Store not configured.' }, { status: status || 400 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      discountPrice,
      categoryId,
      category,
      sku,
      stock = 20,
      image,
      images,
      specifications,
      status: requestedStatus
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
    }

    // Resolve category
    let targetCategoryId = categoryId;
    if (!targetCategoryId && category) {
      const existingCat = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: category, mode: 'insensitive' } },
            { slug: { equals: category.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } }
          ]
        }
      });
      if (existingCat) {
        targetCategoryId = existingCat.id;
      } else {
        const newCat = await prisma.category.create({
          data: {
            name: category,
            slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)
          }
        });
        targetCategoryId = newCat.id;
      }
    }

    if (!targetCategoryId) {
      const defaultCat = await prisma.category.findFirst();
      targetCategoryId = defaultCat?.id;
    }

    if (!targetCategoryId) {
      return NextResponse.json({ error: 'Valid category is required.' }, { status: 400 });
    }

    const generatedSku = sku && sku.trim() ? sku.trim().toUpperCase() : `SKU-${Date.now().toString().slice(-6)}`;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const numStock = typeof stock === 'string' ? parseInt(stock, 10) : stock;

    // Check SKU duplicate
    const existingSku = await prisma.productVariant.findUnique({ where: { sku: generatedSku } });
    if (existingSku) {
      return NextResponse.json({ error: `SKU code '${generatedSku}' is already in use. Please provide a unique SKU.` }, { status: 409 });
    }

    const primaryImage = image ? image.trim() : (Array.isArray(images) && images.length > 0 ? images[0] : null);
    const gallery = Array.isArray(images) && images.length > 0 ? images : (primaryImage ? [primaryImage] : []);

    const variantAttributes = JSON.stringify({
      variant: 'Standard',
      image: primaryImage,
      images: gallery,
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      specifications: specifications || {}
    });

    // Default status: if store is approved, publish unless draft requested; if pending review, status is PENDING_APPROVAL
    let initialStatus = 'PUBLISHED';
    if (!context.store.isApproved) {
      initialStatus = 'PENDING_APPROVAL';
    } else if (requestedStatus && ['DRAFT', 'PENDING_APPROVAL'].includes(requestedStatus)) {
      initialStatus = requestedStatus;
    }

    // Create product, variant, and inventory
    const newProduct = await prisma.product.create({
      data: {
        storeId: context.store.id,
        categoryId: targetCategoryId,
        name: name.trim(),
        description: description ? description.trim() : '',
        basePrice: numPrice,
        status: initialStatus,
        variants: {
          create: {
            sku: generatedSku,
            price: numPrice,
            attributes: variantAttributes,
            inventory: {
              create: {
                quantity: isNaN(numStock) ? 20 : numStock,
                reorderPoint: 5
              }
            }
          }
        }
      },
      include: {
        category: true,
        variants: {
          include: { inventory: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product SKU created successfully.',
      product: {
        ...newProduct,
        image: primaryImage,
        images: gallery
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Seller Product Create API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
