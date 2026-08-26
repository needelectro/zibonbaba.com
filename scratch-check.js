require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.count();
  const stores = await prisma.store.count();
  const products = await prisma.product.count();
  const categories = await prisma.category.count();
  const orders = await prisma.order.count();
  console.log('Database Records Sync Check:', { users, stores, products, categories, orders });
}

check().catch(console.error).finally(() => prisma.$disconnect());
