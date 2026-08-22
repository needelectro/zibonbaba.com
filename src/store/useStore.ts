import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId?: string;
  rating: number;
  reviewsCount?: number;
  image: string;
  images?: string[];
  stock: number;
  sku: string;
  vendor: string;
  storeId?: string;
  description?: string;
  tags?: string[];
  badge?: string;
  attributes?: Record<string, string>;
  isFlashDeal?: boolean;
  flashDealEnd?: string;
  flashDiscount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  subTotal?: number;
  discount?: number;
  shipping?: number;
  status: 'PENDING' | 'PROCESSING' | 'DISPATCHED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  source?: 'ONLINE' | 'POS' | 'RESELLER';
  paymentMethod?: string;
  paymentStatus?: 'PAID' | 'UNPAID' | 'REFUNDED';
  shippingAddress?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  status?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  createdAt: string;
}

interface StoreState {
  products: Product[];
  categories: string[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  crmCustomers: Customer[];
  notifications: NotificationItem[];
  selectedCategory: string;
  searchQuery: string;
  priceRange: [number, number];
  selectedBrand: string;
  sortBy: string;
  isLoggedIn: boolean;
  user: any | null;
  role: string;
  token: string | null;
  username: string;

  setProducts: (products: Product[]) => void;
  fetchProducts: () => Promise<void>;
  fetchHomepage: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchCrmCustomers: () => Promise<void>;
  addToCart: (product: Product, quantity?: number, options?: { color?: string; size?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSelectedBrand: (brand: string) => void;
  setSortBy: (sort: string) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  markNotificationRead: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: ['All', 'Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports'],
      cart: [],
      wishlist: [],
      orders: [],
      crmCustomers: [],
      notifications: [],
      selectedCategory: 'All',
      searchQuery: '',
      priceRange: [0, 500000],
      selectedBrand: 'All',
      sortBy: 'featured',
      isLoggedIn: false,
      user: null,
      role: 'CUSTOMER',
      token: null,
      username: '',

      setProducts: (products) => set({ products }),

      fetchProducts: async () => {
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            if (data.products && Array.isArray(data.products)) {
              set({ products: data.products });
            }
          }
        } catch (err) {
          console.error('Fetch products error:', err);
        }
      },

      fetchHomepage: async () => {
        try {
          const res = await fetch('/api/homepage');
          if (res.ok) {
            const data = await res.json();
            if (data.featuredProducts) {
              set({ products: data.featuredProducts });
            }
            if (data.categories) {
              const catNames = ['All', ...data.categories.map((c: any) => c.name)];
              set({ categories: catNames });
            }
          }
        } catch (err) {
          console.error('Fetch homepage error:', err);
        }
      },

      fetchOrders: async () => {
        const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
        if (!token) return;
        try {
          const res = await fetch('/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.orders) set({ orders: data.orders });
          }
        } catch (err) {
          console.error('Fetch orders error:', err);
        }
      },

      fetchCrmCustomers: async () => {
        const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
        if (!token) return;
        try {
          const res = await fetch('/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.users) {
              const custs: Customer[] = data.users.map((u: any) => ({
                id: u.id,
                name: u.profile?.fullName || u.email,
                email: u.email,
                phone: u.phone || '',
                ordersCount: u._count?.orders || 0,
                totalSpent: 0,
                status: u.status
              }));
              set({ crmCustomers: custs });
            }
          }
        } catch (err) {
          console.error('Fetch CRM customers error:', err);
        }
      },

      addToCart: (product, quantity = 1, options) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex((item) => item.product.id === product.id);
        if (existingIndex > -1) {
          const updated = [...currentCart];
          updated[existingIndex].quantity += quantity;
          set({ cart: updated });
        } else {
          set({
            cart: [
              ...currentCart,
              {
                product,
                quantity,
                selectedColor: options?.color,
                selectedSize: options?.size
              }
            ]
          });
        }
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        });
      },

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) => {
        const current = get().wishlist;
        if (current.includes(productId)) {
          set({ wishlist: current.filter((id) => id !== productId) });
        } else {
          set({ wishlist: [...current, productId] });
        }
      },

      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setPriceRange: (range) => set({ priceRange: range }),
      setSelectedBrand: (brand) => set({ selectedBrand: brand }),
      setSortBy: (sort) => set({ sortBy: sort }),

      login: async (email, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (res.ok && data.accessToken) {
            const user = data.user;
            set({
              isLoggedIn: true,
              user,
              role: user.role || 'CUSTOMER',
              token: data.accessToken,
              username: user.fullName || user.email
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('zibonbaba_token', data.accessToken);
              localStorage.setItem('zibonbaba_role', user.role || 'CUSTOMER');
              localStorage.setItem('zibonbaba_user', JSON.stringify(user));
            }
            return true;
          }
          return false;
        } catch (err) {
          console.error('Login error:', err);
          return false;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (_) {}
        set({
          isLoggedIn: false,
          user: null,
          role: 'CUSTOMER',
          token: null,
          username: ''
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('zibonbaba_token');
          localStorage.removeItem('zibonbaba_role');
          localStorage.removeItem('zibonbaba_user');
          document.cookie = 'zibonbaba_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'zibonbaba_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'zibonbaba_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },

      addProduct: async (product) => {
        const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
        try {
          const res = await fetch('/api/seller/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              name: product.name,
              price: product.price,
              category: product.category,
              sku: product.sku,
              stock: product.stock,
              description: product.description
            })
          });
          if (res.ok) {
            get().fetchProducts();
          }
        } catch (_) {
          set({ products: [product, ...get().products] });
        }
      },

      updateProduct: async (id, updates) => {
        const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
        try {
          await fetch(`/api/seller/products/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updates)
          });
          get().fetchProducts();
        } catch (_) {
          set({
            products: get().products.map((p) => (p.id === id ? { ...p, ...updates } : p))
          });
        }
      },

      deleteProduct: async (id) => {
        const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
        try {
          await fetch(`/api/seller/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ products: get().products.filter((p) => p.id !== id) });
        } catch (_) {
          set({ products: get().products.filter((p) => p.id !== id) });
        }
      },

      updateOrderStatus: async (orderId, status) => {
        const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
        try {
          await fetch('/api/seller/orders', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ orderId, status })
          });
          get().fetchOrders();
        } catch (_) {
          set({
            orders: get().orders.map((o) => (o.id === orderId ? { ...o, status: status as any } : o))
          });
        }
      },

      addCustomer: async (customer) => {
        set({ crmCustomers: [customer, ...get().crmCustomers] });
      },

      markNotificationRead: (id) => {
        set({
          notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        });
      }
    }),
    {
      name: 'zibonbaba_marketplace_storage',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        role: state.role,
        token: state.token,
        username: state.username
      })
    }
  )
);
