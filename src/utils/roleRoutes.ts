export function getDashboardForRole(role?: string): string {
  if (!role) return '/';

  const normalized = role.trim().toUpperCase();

  switch (normalized) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'ADMIN':
    case 'MANAGER':
    case 'ACCOUNTANT':
    case 'CUSTOMER_SUPPORT':
    case 'MARKETING':
    case 'WAREHOUSE_MANAGER':
    case 'INVENTORY_MANAGER':
    case 'DELIVERY_MANAGER':
      return '/admin';
    case 'VENDOR_ADMIN':
    case 'VENDOR_STAFF':
    case 'SELLER':
    case 'VENDOR':
      return '/seller';
    case 'RESELLER':
      return '/reseller';
    case 'DELIVERY_MAN':
      return '/delivery';
    case 'CUSTOMER':
    default:
      return '/';
  }
}
