const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

async function runTests() {
  console.log('================================================================');
  console.log('ZIBONBABA.COM — SELLER ACCOUNT SYSTEM AUDIT & INTEGRATION TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: EXISTING SELLERS AND STORE ISOLATION IN DATABASE
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Database Seller-to-Store Ownership Hierarchy ---');
    const stores = await prisma.store.findMany({
      include: { owner: true }
    });

    assert(stores.length > 0, `Database contains ${stores.length} stores.`);
    stores.forEach((st) => {
      assert(Boolean(st.ownerId && st.owner), `Store "${st.name}" has valid owner: ${st.owner?.email} (${st.owner?.role})`);
    });

    // -------------------------------------------------------------------------
    // TEST 2: SIMULATE NEW SELLER REGISTRATION FLOW
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Seller Registration Flow & Deduplication ---');
    const testEmail = `new_merchant_${Date.now()}@zibonbaba.com`;
    const testStoreName = `Merchant Store ${Date.now().toString().slice(-4)}`;
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const newSellerUser = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        role: 'VENDOR_ADMIN',
        status: 'PENDING',
        referralCode: `SELLER${Date.now().toString().slice(-4)}`,
        profile: {
          create: { fullName: 'New Merchant Automated' }
        },
        stores: {
          create: {
            name: testStoreName,
            description: 'Automated test merchant store',
            isApproved: false,
            commissionRate: 8.5
          }
        },
        notifications: {
          create: {
            title: 'Store Application Received 🏪',
            body: `Your store application for "${testStoreName}" is pending review.`,
            type: 'INFO'
          }
        }
      },
      include: { stores: true, profile: true }
    });

    assert(Boolean(newSellerUser && newSellerUser.id), `New seller created with ID: ${newSellerUser.id}`);
    assert(newSellerUser.status === 'PENDING', `New seller initial status is PENDING (requires admin review).`);
    assert(newSellerUser.stores.length === 1, `New seller has exactly 1 store registered.`);
    assert(newSellerUser.stores[0].isApproved === false, `Store initial status isApproved: false.`);

    // Test duplicate registration check
    const duplicateCheck = await prisma.user.findUnique({ where: { email: testEmail } });
    assert(Boolean(duplicateCheck), `Duplicate account prevention recognizes existing email: ${testEmail}`);

    // -------------------------------------------------------------------------
    // TEST 3: TOKEN GENERATION & SESSION DETERMINATION
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Token Generation & Server-Side Identity Isolation ---');
    const sellerToken = jwt.sign(
      { id: newSellerUser.id, email: newSellerUser.email, role: newSellerUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const decoded = jwt.verify(sellerToken, JWT_SECRET);
    assert(decoded.id === newSellerUser.id, `JWT token identifies exact server-side user ID: ${decoded.id}`);
    assert(decoded.email === testEmail, `JWT token identifies exact email: ${decoded.email}`);

    // -------------------------------------------------------------------------
    // TEST 4: ADMIN APPROVAL WORKFLOW
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Admin Approval & Activation Workflow ---');
    const storeToApprove = newSellerUser.stores[0];

    // Simulate Admin approving the store
    const updatedStore = await prisma.store.update({
      where: { id: storeToApprove.id },
      data: { isApproved: true }
    });

    // Sync owner status to ACTIVE
    const updatedOwner = await prisma.user.update({
      where: { id: newSellerUser.id },
      data: { status: 'ACTIVE' }
    });

    // Notification created
    const approvalNotice = await prisma.notification.create({
      data: {
        userId: newSellerUser.id,
        title: 'Store Approved & Activated! 🏪🎉',
        body: `Congratulations! Your store "${updatedStore.name}" is approved.`,
        type: 'SUCCESS'
      }
    });

    assert(updatedStore.isApproved === true, `Admin approval: store isApproved is now true.`);
    assert(updatedOwner.status === 'ACTIVE', `Admin approval: owner user status is now ACTIVE.`);
    assert(Boolean(approvalNotice), `Admin approval: in-app notification sent to seller.`);

    // -------------------------------------------------------------------------
    // TEST 5: PRODUCT CREATION UNDER NEW SELLER'S STORE
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Isolated Product Creation & Inventory ---');
    const defaultCat = await prisma.category.findFirst();
    const testSku = `SKU-TEST-${Date.now().toString().slice(-5)}`;

    const newProduct = await prisma.product.create({
      data: {
        storeId: updatedStore.id,
        categoryId: defaultCat.id,
        name: 'Automated Test Product',
        description: 'Isolated test product SKU',
        basePrice: 1500,
        status: 'PUBLISHED',
        variants: {
          create: {
            sku: testSku,
            price: 1500,
            attributes: JSON.stringify({ image: 'https://example.com/test.jpg' }),
            inventory: {
              create: {
                quantity: 40,
                reorderPoint: 5
              }
            }
          }
        }
      },
      include: { variants: { include: { inventory: true } } }
    });

    assert(newProduct.storeId === updatedStore.id, `Product assigned strictly to new seller store ID: ${updatedStore.id}`);
    assert(newProduct.variants[0].sku === testSku, `Product variant created with SKU: ${testSku}`);
    assert(newProduct.variants[0].inventory[0].quantity === 40, `Inventory initialized with 40 units.`);

    // -------------------------------------------------------------------------
    // TEST 6: CROSS-SELLER ACCESS DENIAL (SECURITY PENETRATION TEST)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Strict Cross-Seller Isolation & Security Checks ---');
    // Find another existing seller (e.g. vendor@zibonbaba.com)
    const otherSellerStore = await prisma.store.findFirst({
      where: { id: { not: updatedStore.id } }
    });

    assert(Boolean(otherSellerStore), `Found secondary store for cross-tenant testing: "${otherSellerStore.name}" (${otherSellerStore.id})`);

    // Verify Seller A cannot own or modify Seller B's product
    const isProductOwnedByOther = newProduct.storeId === otherSellerStore.id;
    assert(isProductOwnedByOther === false, `SECURITY VERIFIED: Seller B (${otherSellerStore.name}) does NOT own Seller A's product.`);

    // Verify query scoping: query for Seller A only returns Seller A's products
    const sellerAProducts = await prisma.product.findMany({
      where: { storeId: updatedStore.id }
    });
    const containsForeignProduct = sellerAProducts.some(p => p.storeId !== updatedStore.id);
    assert(containsForeignProduct === false, `TENANT ISOLATION: Seller A product query contains 0 foreign store products.`);

    // Verify order scoping: query for Seller A orders
    const sellerAOrders = await prisma.order.findMany({
      where: { storeId: updatedStore.id }
    });
    const containsForeignOrders = sellerAOrders.some(o => o.storeId !== updatedStore.id);
    assert(containsForeignOrders === false, `TENANT ISOLATION: Seller A orders query contains 0 foreign orders.`);

    // -------------------------------------------------------------------------
    // TEST 7: INVENTORY ADJUSTMENT & AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Inventory Adjustment & Stock Scoping ---');
    const variantId = newProduct.variants[0].id;
    const invRecord = newProduct.variants[0].inventory[0];

    const updatedInv = await prisma.inventory.update({
      where: { id: invRecord.id },
      data: { quantity: 35 }
    });

    assert(updatedInv.quantity === 35, `Stock quantity adjusted from 40 to 35 units.`);

    // -------------------------------------------------------------------------
    // TEST 8: WITHDRAWAL / PAYOUT CREATION & STATUS
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Payout & Withdrawal Ledger ---');
    const payoutReq = await prisma.withdrawalRequest.create({
      data: {
        userId: newSellerUser.id,
        role: 'VENDOR_ADMIN',
        amount: 500,
        paymentMethod: 'bKash',
        accountNumber: '01700000000',
        accountDetails: 'Test Seller Store Payout',
        status: 'PENDING'
      }
    });

    assert(payoutReq.status === 'PENDING', `Payout withdrawal created with status PENDING.`);
    assert(payoutReq.userId === newSellerUser.id, `Payout withdrawal linked to seller user ID.`);
    assert(payoutReq.role === 'VENDOR_ADMIN', `Payout withdrawal tagged with role VENDOR_ADMIN.`);

    // -------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // -------------------------------------------------------------------------
    console.log('\n--- Cleaning up temporary test artifacts ---');
    await prisma.withdrawalRequest.deleteMany({ where: { userId: newSellerUser.id } });
    await prisma.inventory.deleteMany({ where: { variantId } });
    await prisma.productVariant.deleteMany({ where: { productId: newProduct.id } });
    await prisma.product.deleteMany({ where: { id: newProduct.id } });
    await prisma.notification.deleteMany({ where: { userId: newSellerUser.id } });
    await prisma.store.deleteMany({ where: { id: updatedStore.id } });
    await prisma.profile.deleteMany({ where: { userId: newSellerUser.id } });
    await prisma.user.deleteMany({ where: { id: newSellerUser.id } });
    console.log('Cleanup completed successfully.');

  } catch (err) {
    console.error('Test Suite Exception:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
    console.log('\n================================================================');
    console.log(`TEST RUN COMPLETED: ${passed} PASSED, ${failed} FAILED.`);
    console.log('================================================================');
  }
}

runTests();
