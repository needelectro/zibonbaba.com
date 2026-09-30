import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

const DEFAULT_CATEGORIES = [
  {
    moduleName: 'User & Identity Management',
    groupKey: 'Users',
    items: [
      { id: 'view:users', label: 'View User Profiles', key: 'view:users' },
      { id: 'create:users', label: 'Create New Accounts', key: 'create:users' },
      { id: 'edit:users', label: 'Modify User Role/Details', key: 'edit:users' },
      { id: 'delete:users', label: 'Delete User Accounts', key: 'delete:users' },
      { id: 'suspend:users', label: 'Suspend & Block Users', key: 'suspend:users' },
      { id: 'verify:users', label: 'Verify User Documents', key: 'verify:users' },
    ],
  },
  {
    moduleName: 'Marketplace & Products',
    groupKey: 'Products',
    items: [
      { id: 'view:products', label: 'View Product Catalog', key: 'view:products' },
      { id: 'create:products', label: 'List New Products', key: 'create:products' },
      { id: 'edit:products', label: 'Edit Product Details & Stock', key: 'edit:products' },
      { id: 'delete:products', label: 'Remove Product Listings', key: 'delete:products' },
    ],
  },
  {
    moduleName: 'Vendors & Stores',
    groupKey: 'Vendors',
    items: [
      { id: 'view:vendors', label: 'View Store Listings', key: 'view:vendors' },
      { id: 'approve:vendors', label: 'Approve Vendor KYC', key: 'approve:vendors' },
      { id: 'manage:vendors', label: 'Manage Commission & Status', key: 'manage:vendors' },
    ],
  },
  {
    moduleName: 'Order Processing & Tracking',
    groupKey: 'Orders',
    items: [
      { id: 'view:orders', label: 'View Customer Orders', key: 'view:orders' },
      { id: 'manage:orders', label: 'Dispatch & Update Order Status', key: 'manage:orders' },
      { id: 'cancel:orders', label: 'Cancel & Refund Orders', key: 'cancel:orders' },
    ],
  },
  {
    moduleName: 'Multi-Warehouse & Inventory',
    groupKey: 'Inventory',
    items: [
      { id: 'view:inventory', label: 'View Stock Quantities', key: 'view:inventory' },
      { id: 'manage:inventory', label: 'Adjust Warehouse Stock', key: 'manage:inventory' },
      { id: 'transfer:stock', label: 'Transfer Stock Across Branches', key: 'transfer:stock' },
    ],
  },
  {
    moduleName: 'Finance, ERP & Payouts',
    groupKey: 'Finance',
    items: [
      { id: 'view:finance', label: 'View Financial Ledger', key: 'view:finance' },
      { id: 'manage:finance', label: 'Process Payouts & Withdrawals', key: 'manage:finance' },
      { id: 'view:reports', label: 'Export Analytics Reports', key: 'view:reports' },
    ],
  },
  {
    moduleName: 'Logistics & Dispatch',
    groupKey: 'Delivery',
    items: [
      { id: 'manage:delivery', label: 'Assign Couriers & Hub Dispatch', key: 'manage:delivery' },
    ],
  },
  {
    moduleName: 'Marketing & Promotions',
    groupKey: 'Marketing',
    items: [
      { id: 'manage:marketing', label: 'Manage Coupons & Campaigns', key: 'manage:marketing' },
    ],
  },
  {
    moduleName: 'Support & Tickets',
    groupKey: 'Support',
    items: [
      { id: 'view:tickets', label: 'View Support Tickets', key: 'view:tickets' },
      { id: 'manage:tickets', label: 'Resolve & Respond to Tickets', key: 'manage:tickets' },
    ],
  },
  {
    moduleName: 'System Policies & Settings',
    groupKey: 'Settings',
    items: [
      { id: 'manage:settings', label: 'Platform Global Configuration', key: 'manage:settings' },
    ],
  },
];

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedRoles = roles.map(role => {
      const activePermKeys = new Set(role.permissions.map(rp => rp.permission.key));
      const isSuperAdminOrAdmin = role.name === 'SUPER_ADMIN' || role.name === 'ADMIN';

      const matrix = DEFAULT_CATEGORIES.map(cat => ({
        moduleName: cat.moduleName,
        groupKey: cat.groupKey,
        items: cat.items.map(item => ({
          id: item.id,
          label: item.label,
          key: item.key,
          enabled: isSuperAdminOrAdmin ? true : activePermKeys.has(item.key)
        }))
      }));

      return {
        id: role.id,
        roleKey: role.name,
        name: role.name.replace(/_/g, ' '),
        description: role.description || `${role.name} role configuration`,
        isSystem: role.isSystem,
        matrix,
        permissionsCount: isSuperAdminOrAdmin ? 27 : role.permissions.length,
        createdAt: role.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      roles: formattedRoles
    });
  } catch (err: any) {
    console.error('Admin GET Roles Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { roleId, roleKey, description, permissionKeys } = body;

    const targetRole = await prisma.role.findFirst({
      where: {
        OR: [
          { id: roleId || '' },
          { name: roleKey || '' }
        ]
      }
    });

    if (!targetRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (description !== undefined) {
      await prisma.role.update({
        where: { id: targetRole.id },
        data: { description }
      });
    }

    if (Array.isArray(permissionKeys)) {
      // Find all permissions matching these keys
      const matchedPerms = await prisma.permission.findMany({
        where: { key: { in: permissionKeys } }
      });

      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: targetRole.id }
      });

      // Add selected permissions
      for (const perm of matchedPerms) {
        await prisma.rolePermission.create({
          data: {
            roleId: targetRole.id,
            permissionId: perm.id
          }
        });
      }
    }

    await logAdminAction(
      auth.user?.id || null,
      `Updated permissions for role [${targetRole.name}] (${permissionKeys?.length || 0} active)`
    );

    return NextResponse.json({
      success: true,
      message: `Role ${targetRole.name} updated successfully.`
    });
  } catch (err: any) {
    console.error('Admin PUT Roles Error:', err);
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
    const { name, description, permissionKeys } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Role name is required.' }, { status: 400 });
    }

    const cleanRoleName = name.trim().toUpperCase().replace(/\s+/g, '_');

    const existing = await prisma.role.findUnique({
      where: { name: cleanRoleName }
    });

    if (existing) {
      return NextResponse.json({ error: `Role '${cleanRoleName}' already exists.` }, { status: 409 });
    }

    const newRole = await prisma.role.create({
      data: {
        name: cleanRoleName,
        description: description || `Custom administrative role: ${name.trim()}`,
        isSystem: false
      }
    });

    if (Array.isArray(permissionKeys) && permissionKeys.length > 0) {
      const matchedPerms = await prisma.permission.findMany({
        where: { key: { in: permissionKeys } }
      });

      for (const perm of matchedPerms) {
        await prisma.rolePermission.create({
          data: {
            roleId: newRole.id,
            permissionId: perm.id
          }
        });
      }
    }

    await logAdminAction(
      auth.user?.id || null,
      `Created custom role [${cleanRoleName}]`
    );

    return NextResponse.json({
      success: true,
      message: `Role ${cleanRoleName} created successfully.`,
      role: newRole
    }, { status: 201 });
  } catch (err: any) {
    console.error('Admin POST Role Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required.' }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: 'Role not found.' }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: 'Built-in system roles cannot be deleted.' }, { status: 403 });
    }

    await prisma.role.delete({ where: { id } });

    await logAdminAction(auth.user?.id || null, `Deleted custom role [${role.name}]`);

    return NextResponse.json({
      success: true,
      message: `Role ${role.name} deleted successfully.`
    });
  } catch (err: any) {
    console.error('Admin DELETE Role Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
