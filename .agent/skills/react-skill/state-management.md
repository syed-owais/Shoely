## STATE MANAGEMENT

### Redux Toolkit (Recommended)

```typescript
// store/slices/cartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '@/features/cart/services/cartService';

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const addToCartAsync = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity }: { productId: number; quantity: number }) => {
    const response = await cartService.addItem(productId, quantity);
    return response.data;
  }
);

export const fetchCartAsync = createAsyncThunk(
  'cart/fetchCart',
  async () => {
    const response = await cartService.getCart();
    return response.data;
  }
);

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.isLoading = false;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add item';
      })
      .addCase(fetchCartAsync.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCart = (state: RootState) => state.cart;
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) => state.cart.total;
export const selectCartItemCount = (state: RootState) => state.cart.items.length;
```

### Zustand (Lightweight Alternative)

```typescript
// store/cartStore.ts
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        total: 0,
        
        addItem: (item) => {
          set((state) => {
            const existingItem = state.items.find((i) => i.id === item.id);
            
            if (existingItem) {
              return {
                items: state.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                ),
              };
            }
            
            return { items: [...state.items, { ...item, quantity: 1 }] };
          });
          get().calculateTotal();
        },
        
        removeItem: (itemId) => {
          set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
          }));
          get().calculateTotal();
        },
        
        updateQuantity: (itemId, quantity) => {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          }));
          get().calculateTotal();
        },
        
        clearCart: () => {
          set({ items: [], total: 0 });
        },
        
        calculateTotal: () => {
          const items = get().items;
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          set({ total });
        },
      }),
      { name: 'cart-storage' }
    )
  )
);
```

### Context API (For Simple State)

```tsx
// contexts/ThemeContext.tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

---


