import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, Order, PromoCode, Campaign, User, DashboardStats, ProductFilters } from '@/types';

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Products
  products: Product[];
  featuredProducts: Product[];
  getProductById: (id: string) => Product | undefined;
  filterProducts: (filters: ProductFilters) => Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: number) => void;
  updateCartQuantity: (productId: string, size: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  
  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingInfo?: { number: string; url: string }) => void;
  getOrderById: (id: string) => Order | undefined;
  getUserOrders: (userId: string) => Order[];
  
  // Promo Codes
  promoCodes: PromoCode[];
  validatePromoCode: (code: string, orderTotal: number) => { valid: boolean; discount: number; message?: string };
  addPromoCode: (promoCode: Omit<PromoCode, 'id' | 'usageCount'>) => void;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;
  
  // Campaigns
  campaigns: Campaign[];
  getActiveCampaigns: () => Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  
  // Dashboard
  getDashboardStats: () => DashboardStats;
}

// Sample products data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Air Jordan 1 High Heritage',
    brand: 'Jordan',
    model: 'Air Jordan 1',
    price: 285,
    originalPrice: 350,
    images: ['/hero_jordan1_heritage.jpg'],
    sizes: [
      { size: 7, available: true, quantity: 2 },
      { size: 8, available: true, quantity: 5 },
      { size: 8.5, available: true, quantity: 3 },
      { size: 9, available: true, quantity: 4 },
      { size: 9.5, available: true, quantity: 2 },
      { size: 10, available: true, quantity: 6 },
      { size: 11, available: true, quantity: 3 },
    ],
    condition: 'Like New',
    description: 'The Air Jordan 1 High Heritage features a classic Chicago-inspired colorway with premium leather construction.',
    features: ['Premium leather upper', 'Air-Sole unit', 'Rubber outsole', 'Classic high-top design'],
    sku: 'AJ1-HH-2023',
    category: 'Basketball',
    tags: ['jordan', 'high-top', 'heritage', 'chicago'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Dunk Low Pink',
    brand: 'Nike',
    model: 'Dunk Low',
    price: 145,
    originalPrice: 180,
    images: ['/dunk_low_pink.jpg'],
    sizes: [
      { size: 6, available: true, quantity: 3 },
      { size: 6.5, available: true, quantity: 2 },
      { size: 7, available: true, quantity: 5 },
      { size: 7.5, available: true, quantity: 4 },
      { size: 8, available: true, quantity: 6 },
      { size: 8.5, available: true, quantity: 3 },
      { size: 9, available: true, quantity: 4 },
    ],
    condition: 'Like New',
    description: 'The Nike Dunk Low in Pink features a smooth leather upper with a clean two-tone colorway.',
    features: ['Leather upper', 'Foam midsole', 'Rubber outsole', 'Low-top silhouette'],
    sku: 'NK-DL-PINK',
    category: 'Lifestyle',
    tags: ['nike', 'dunk', 'pink', 'low-top'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Yeezy Boost 350 Zebra',
    brand: 'Adidas',
    model: 'Yeezy Boost 350',
    price: 320,
    originalPrice: 400,
    images: ['/yeezy_zebra.jpg'],
    sizes: [
      { size: 7, available: true, quantity: 2 },
      { size: 8, available: true, quantity: 3 },
      { size: 9, available: true, quantity: 4 },
      { size: 10, available: true, quantity: 5 },
      { size: 11, available: true, quantity: 3 },
      { size: 12, available: true, quantity: 2 },
      { size: 13, available: true, quantity: 1 },
    ],
    condition: 'Excellent',
    description: 'The Adidas Yeezy Boost 350 Zebra features the iconic black and white Primeknit pattern.',
    features: ['Primeknit upper', 'Boost cushioning', 'Rubber outsole', 'Sock-like fit'],
    sku: 'AD-YZ-ZEBRA',
    category: 'Lifestyle',
    tags: ['adidas', 'yeezy', 'zebra', 'boost'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Air Force 1 Low White',
    brand: 'Nike',
    model: 'Air Force 1',
    price: 95,
    originalPrice: 120,
    images: ['/af1_white.jpg'],
    sizes: [
      { size: 6, available: true, quantity: 8 },
      { size: 7, available: true, quantity: 10 },
      { size: 8, available: true, quantity: 12 },
      { size: 9, available: true, quantity: 15 },
      { size: 10, available: true, quantity: 10 },
      { size: 11, available: true, quantity: 8 },
      { size: 12, available: true, quantity: 6 },
      { size: 13, available: true, quantity: 4 },
    ],
    condition: 'Like New',
    description: 'The iconic Nike Air Force 1 Low in all white. A timeless classic for any collection.',
    features: ['Leather upper', 'Air-Sole unit', 'Rubber outsole', 'Perforated toe box'],
    sku: 'NK-AF1-WHITE',
    category: 'Lifestyle',
    tags: ['nike', 'air force 1', 'white', 'classic'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Jordan 1 Mid Grey',
    brand: 'Jordan',
    model: 'Air Jordan 1',
    price: 165,
    originalPrice: 200,
    images: ['/jordan1_mid_grey.jpg'],
    sizes: [
      { size: 7, available: true, quantity: 3 },
      { size: 8, available: true, quantity: 4 },
      { size: 9, available: true, quantity: 5 },
      { size: 10, available: true, quantity: 4 },
      { size: 11, available: true, quantity: 3 },
      { size: 12, available: true, quantity: 2 },
      { size: 13, available: true, quantity: 2 },
      { size: 14, available: true, quantity: 1 },
    ],
    condition: 'Excellent',
    description: 'The Air Jordan 1 Mid in Grey features a premium canvas and suede construction.',
    features: ['Canvas and suede upper', 'Air-Sole unit', 'Rubber outsole', 'Mid-top design'],
    sku: 'AJ1-MID-GREY',
    category: 'Basketball',
    tags: ['jordan', 'mid', 'grey', 'canvas'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'New Balance 550 White Green',
    brand: 'New Balance',
    model: '550',
    price: 125,
    originalPrice: 150,
    images: ['/nb_550_white_green.jpg'],
    sizes: [
      { size: 7, available: true, quantity: 4 },
      { size: 8, available: true, quantity: 5 },
      { size: 9, available: true, quantity: 6 },
      { size: 10, available: true, quantity: 5 },
      { size: 11, available: true, quantity: 4 },
      { size: 12, available: true, quantity: 3 },
    ],
    condition: 'Like New',
    description: 'The New Balance 550 in White and Green brings vintage basketball style to the modern era.',
    features: ['Leather upper', 'EVA midsole', 'Rubber outsole', 'Vintage design'],
    sku: 'NB-550-WG',
    category: 'Basketball',
    tags: ['new balance', '550', 'green', 'vintage'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Dunk Low Panda',
    brand: 'Nike',
    model: 'Dunk Low',
    price: 145,
    originalPrice: 180,
    images: ['/grid_dunk_panda.jpg'],
    sizes: [
      { size: 7, available: true, quantity: 5 },
      { size: 8, available: true, quantity: 6 },
      { size: 9, available: true, quantity: 7 },
      { size: 10, available: true, quantity: 6 },
      { size: 11, available: true, quantity: 5 },
      { size: 12, available: true, quantity: 4 },
    ],
    condition: 'Like New',
    description: 'The Nike Dunk Low Panda features the iconic black and white colorway.',
    features: ['Leather upper', 'Foam midsole', 'Rubber outsole', 'Classic colorway'],
    sku: 'NK-DL-PANDA',
    category: 'Lifestyle',
    tags: ['nike', 'dunk', 'panda', 'black white'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Jordan 4 Retro',
    brand: 'Jordan',
    model: 'Air Jordan 4',
    price: 320,
    originalPrice: 400,
    images: ['/grid_jordan4.jpg'],
    sizes: [
      { size: 8, available: true, quantity: 2 },
      { size: 8.5, available: true, quantity: 3 },
      { size: 9, available: true, quantity: 3 },
      { size: 9.5, available: true, quantity: 2 },
      { size: 10, available: true, quantity: 4 },
      { size: 11, available: true, quantity: 2 },
    ],
    condition: 'Excellent',
    description: 'The Air Jordan 4 Retro features premium materials and iconic design elements.',
    features: ['Leather and mesh upper', 'Air-Sole unit', 'Rubber outsole', 'Iconic wings detail'],
    sku: 'AJ4-RETRO',
    category: 'Basketball',
    tags: ['jordan', 'retro', '4', 'premium'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Sample promo codes
const samplePromoCodes: PromoCode[] = [
  {
    id: '1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 100,
    usageLimit: 100,
    usageCount: 23,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    description: '10% off your first order over $100',
  },
  {
    id: '2',
    code: 'SUMMER25',
    type: 'percentage',
    value: 25,
    maxDiscount: 100,
    usageLimit: 50,
    usageCount: 12,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    description: 'Summer sale - 25% off (max $100 discount)',
  },
];

// Sample campaigns
const sampleCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Jordan Week',
    description: 'Special discounts on all Jordan sneakers',
    discountType: 'percentage',
    discountValue: 15,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    brand: 'Jordan',
  },
  {
    id: '2',
    name: 'New Arrivals',
    description: 'Check out our latest drops',
    discountType: 'fixed',
    discountValue: 20,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    tags: ['new'],
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Mock login - in real app, this would call an API
        if (email === 'admin@shoely.com' && password === 'admin') {
          set({
            user: {
              id: '1',
              email: 'admin@shoely.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin',
              orders: [],
              createdAt: new Date().toISOString(),
            },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      // Products
      products: sampleProducts,
      featuredProducts: sampleProducts.slice(0, 4),
      
      getProductById: (id: string) => {
        return get().products.find(p => p.id === id);
      },
      
      filterProducts: (filters: ProductFilters) => {
        let filtered = get().products.filter(p => p.isActive);
        
        if (filters.brand) {
          filtered = filtered.filter(p => p.brand === filters.brand);
        }
        
        if (filters.category) {
          filtered = filtered.filter(p => p.category === filters.category);
        }
        
        if (filters.condition) {
          filtered = filtered.filter(p => p.condition === filters.condition);
        }
        
        if (filters.minPrice !== undefined) {
          filtered = filtered.filter(p => p.price >= filters.minPrice!);
        }
        
        if (filters.maxPrice !== undefined) {
          filtered = filtered.filter(p => p.price <= filters.maxPrice!);
        }
        
        if (filters.size !== undefined) {
          filtered = filtered.filter(p => 
            p.sizes.some(s => s.size === filters.size && s.available)
          );
        }
        
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.brand.toLowerCase().includes(search) ||
            p.model.toLowerCase().includes(search) ||
            p.tags.some(t => t.toLowerCase().includes(search))
          );
        }
        
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'price-asc':
              filtered.sort((a, b) => a.price - b.price);
              break;
            case 'price-desc':
              filtered.sort((a, b) => b.price - a.price);
              break;
            case 'newest':
              filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              break;
          }
        }
        
        return filtered;
      },
      
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ products: [...state.products, newProduct] }));
      },
      
      updateProduct: (id, updates) => {
        set(state => ({
          products: state.products.map(p => 
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set(state => ({
          products: state.products.map(p => 
            p.id === id ? { ...p, isActive: false, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      
      // Cart
      cart: [],
      
      addToCart: (item) => {
        set(state => {
          const existing = state.cart.find(
            i => i.productId === item.productId && i.size === item.size
          );
          if (existing) {
            return {
              cart: state.cart.map(i =>
                i.productId === item.productId && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        });
      },
      
      removeFromCart: (productId, size) => {
        set(state => ({
          cart: state.cart.filter(i => !(i.productId === productId && i.size === size)),
        }));
      },
      
      updateCartQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size);
          return;
        }
        set(state => ({
          cart: state.cart.map(i =>
            i.productId === productId && i.size === size
              ? { ...i, quantity }
              : i
          ),
        }));
      },
      
      clearCart: () => {
        set({ cart: [] });
      },
      
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Orders
      orders: [],
      
      createOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ orders: [...state.orders, newOrder] }));
        return newOrder;
      },
      
      updateOrderStatus: (orderId, status, trackingInfo) => {
        set(state => ({
          orders: state.orders.map(o =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  trackingNumber: trackingInfo?.number || o.trackingNumber,
                  trackingUrl: trackingInfo?.url || o.trackingUrl,
                  updatedAt: new Date().toISOString(),
                }
              : o
          ),
        }));
      },
      
      getOrderById: (id) => {
        return get().orders.find(o => o.id === id);
      },
      
      getUserOrders: (userId) => {
        return get().orders.filter(o => o.customer.email === userId);
      },
      
      // Promo Codes
      promoCodes: samplePromoCodes,
      
      validatePromoCode: (code, orderTotal) => {
        const promo = get().promoCodes.find(
          p => p.code.toUpperCase() === code.toUpperCase() && p.isActive
        );
        
        if (!promo) {
          return { valid: false, discount: 0, message: 'Invalid promo code' };
        }
        
        const now = new Date();
        if (new Date(promo.startDate) > now || new Date(promo.endDate) < now) {
          return { valid: false, discount: 0, message: 'Promo code expired' };
        }
        
        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
          return { valid: false, discount: 0, message: 'Promo code usage limit reached' };
        }
        
        if (promo.minOrderAmount && orderTotal < promo.minOrderAmount) {
          return { valid: false, discount: 0, message: `Minimum order amount is $${promo.minOrderAmount}` };
        }
        
        let discount = 0;
        if (promo.type === 'percentage') {
          discount = orderTotal * (promo.value / 100);
          if (promo.maxDiscount) {
            discount = Math.min(discount, promo.maxDiscount);
          }
        } else {
          discount = promo.value;
        }
        
        return { valid: true, discount: Math.round(discount * 100) / 100 };
      },
      
      addPromoCode: (promoCodeData) => {
        const newPromoCode: PromoCode = {
          ...promoCodeData,
          id: Math.random().toString(36).substr(2, 9),
          usageCount: 0,
        };
        set(state => ({ promoCodes: [...state.promoCodes, newPromoCode] }));
      },
      
      updatePromoCode: (id, updates) => {
        set(state => ({
          promoCodes: state.promoCodes.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },
      
      deletePromoCode: (id) => {
        set(state => ({
          promoCodes: state.promoCodes.filter(p => p.id !== id),
        }));
      },
      
      // Campaigns
      campaigns: sampleCampaigns,
      
      getActiveCampaigns: () => {
        const now = new Date();
        return get().campaigns.filter(
          c => c.isActive && new Date(c.startDate) <= now && new Date(c.endDate) >= now
        );
      },
      
      addCampaign: (campaignData) => {
        const newCampaign: Campaign = {
          ...campaignData,
          id: Math.random().toString(36).substr(2, 9),
        };
        set(state => ({ campaigns: [...state.campaigns, newCampaign] }));
      },
      
      updateCampaign: (id, updates) => {
        set(state => ({
          campaigns: state.campaigns.map(c =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },
      
      deleteCampaign: (id) => {
        set(state => ({
          campaigns: state.campaigns.filter(c => c.id !== id),
        }));
      },
      
      // Dashboard
      getDashboardStats: () => {
        const orders = get().orders;
        const products = get().products;
        
        return {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
          pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
          lowStockProducts: products.filter(p => 
            p.sizes.some(s => s.quantity <= 2)
          ).length,
          recentOrders: orders.slice(-5).reverse(),
          salesChart: [],
        };
      },
    }),
    {
      name: 'shoely-storage',
      partialize: (state) => ({ cart: state.cart, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
