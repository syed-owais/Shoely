import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, User } from '@/types';

interface StoreState {
  // Consumer Auth
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User) => void;

  // Admin Auth
  adminUser: User | null;
  isAdminAuthenticated: boolean;
  adminLogout: () => void;
  setAdminUser: (user: User) => void;

  // Cart (local state for guests, synced for logged-in users)
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: number) => void;
  updateCartQuantity: (productId: string, size: number, quantity: number) => void;
  clearCart: () => void;
  setCart: (cart: CartItem[]) => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Global Settings
  currencySymbol: string;
  currencyCode: string;
  setCurrency: (symbol: string, code: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Consumer Auth
      user: null,
      isAuthenticated: false,

      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      // Admin Auth
      adminUser: null,
      isAdminAuthenticated: false,

      adminLogout: () => {
        localStorage.removeItem('admin_auth_token');
        set({ adminUser: null, isAdminAuthenticated: false });
      },

      setAdminUser: (user: User) => {
        set({ adminUser: user, isAdminAuthenticated: true });
      },

      // Cart (kept locally — synced on login via cart API)
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

      setCart: (cart: CartItem[]) => {
        set({ cart });
      },

      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Global Settings
      currencySymbol: '₨',
      currencyCode: 'PKR',
      setCurrency: (symbol, code) => set({ currencySymbol: symbol, currencyCode: code }),
    }),
    {
      name: 'shoely-storage',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        adminUser: state.adminUser,
        isAdminAuthenticated: state.isAdminAuthenticated,
        currencySymbol: state.currencySymbol,
        currencyCode: state.currencyCode,
      }),
    }
  )
);
