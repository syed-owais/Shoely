// Product Types
export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: SizeAvailability[];
  condition: 'Like New' | 'Excellent' | 'Very Good' | 'Good';
  description: string;
  features: string[];
  sku: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SizeAvailability {
  size: number;
  available: boolean;
  quantity: number;
}

// Cart Types
export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  size: number;
  quantity: number;
  sku: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'authenticated' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  promoCode?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  size: number;
  quantity: number;
  image: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  description: string;
  bannerImage?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds?: string[];
  brand?: string;
  category?: string;
  tags?: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  orders: string[];
  createdAt: string;
}

// Admin Types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Order[];
  salesChart: ChartDataPoint[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

// Filter Types
export interface ProductFilters {
  brand?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: number;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
}
