/**
 * Role-Based Routing Matrix for Zibonbaba Enterprise
 * Maps user roles to their respective primary dashboard entry points.
 */

export const ROLE_ROUTES: Record<string, string> = {
  // Super Administrator
  SUPER_ADMIN: '/superadmin',
  superadmin: '/superadmin',

  // Platform Administrator & Officers
  ADMIN: '/admin',
  admin: '/admin',
  PLATFORM_MANAGER: '/admin',
  manager: '/admin',
  FINANCE_OFFICER: '/admin',
  accountant: '/admin',
  SUPPORT_AGENT: '/admin',
  support: '/admin',
  COMPLIANCE_OFFICER: '/admin',
  CRM_MANAGER: '/admin',
  crm_manager: '/admin',
  HR_MANAGER: '/admin',
  hr_manager: '/admin',

  // Multi-Vendor Merchant / Seller
  VENDOR_ADMIN: '/seller',
  VENDOR_STAFF: '/seller',
  vendor: '/seller',
  staff: '/seller',

  // Reseller Network
  RESELLER: '/reseller',
  reseller: '/reseller',

  // Delivery & Logistics
  DELIVERY_MAN: '/delivery',
  DELIVERY_MANAGER: '/delivery',
  deliveryman: '/delivery',
  delivery_manager: '/delivery',

  // Standard Customer / Buyer
  CUSTOMER: '/dashboard',
  customer: '/dashboard',
};

/**
 * Returns the target dashboard URL for a given user role.
 * Falls back to '/dashboard' for customer / unknown roles.
 */
export function getDashboardForRole(role?: string | null): string {
  if (!role) return '/dashboard';
  return ROLE_ROUTES[role] || ROLE_ROUTES[role.toUpperCase()] || ROLE_ROUTES[role.toLowerCase()] || '/dashboard';
}
