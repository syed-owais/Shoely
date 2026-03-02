## DESIGN PATTERNS

### 1. Container/Presentational Pattern

```tsx
// Presentational Component (Dumb/UI Component)
interface ProductCardProps {
  product: Product;
  isInCart: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInCart,
  onAddToCart,
  onRemoveFromCart,
}) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{formatCurrency(product.price)}</p>
      {isInCart ? (
        <button onClick={onRemoveFromCart}>Remove from Cart</button>
      ) : (
        <button onClick={onAddToCart}>Add to Cart</button>
      )}
    </div>
  );
};

// Container Component (Smart Component)
export const ProductCardContainer: React.FC<{ productId: number }> = ({ productId }) => {
  const product = useSelector((state) => selectProductById(state, productId));
  const isInCart = useSelector((state) => selectIsProductInCart(state, productId));
  const dispatch = useDispatch();
  
  const handleAddToCart = () => {
    dispatch(addToCart(productId));
  };
  
  const handleRemoveFromCart = () => {
    dispatch(removeFromCart(productId));
  };
  
  if (!product) return null;
  
  return (
    <ProductCard
      product={product}
      isInCart={isInCart}
      onAddToCart={handleAddToCart}
      onRemoveFromCart={handleRemoveFromCart}
    />
  );
};
```

### 2. Compound Component Pattern

```tsx
// Flexible, composable cart component
interface CartContextValue {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('Cart compound components must be wrapped in Cart');
  return context;
};

// Root component
export const Cart: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  const addItem = (item: CartItem) => {
    setItems([...items, item]);
  };
  
  const removeItem = (itemId: number) => {
    setItems(items.filter(i => i.id !== itemId));
  };
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return (
    <CartContext.Provider value={{ items, total, addItem, removeItem }}>
      <div className="cart">{children}</div>
    </CartContext.Provider>
  );
};

// Sub-components
Cart.Header = function CartHeader() {
  const { items } = useCartContext();
  return <h2>Cart ({items.length} items)</h2>;
};

Cart.Items = function CartItems() {
  const { items } = useCartContext();
  return (
    <div>
      {items.map(item => (
        <Cart.Item key={item.id} item={item} />
      ))}
    </div>
  );
};

Cart.Item = function CartItem({ item }: { item: CartItem }) {
  const { removeItem } = useCartContext();
  return (
    <div>
      <span>{item.name}</span>
      <span>{item.price}</span>
      <button onClick={() => removeItem(item.id)}>Remove</button>
    </div>
  );
};

Cart.Summary = function CartSummary() {
  const { total } = useCartContext();
  return <div>Total: {formatCurrency(total)}</div>;
};

// Usage - very flexible composition
const CartPage = () => (
  <Cart>
    <Cart.Header />
    <Cart.Items />
    <Cart.Summary />
  </Cart>
);
```

### 3. Render Props Pattern

```tsx
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, isLoading: boolean, error: Error | null) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [url]);
  
  return <>{children(data, isLoading, error)}</>;
}

// Usage
const ProductsPage = () => (
  <DataFetcher<Product[]> url="/api/products">
    {(products, isLoading, error) => {
      if (isLoading) return <Loading />;
      if (error) return <Error message={error.message} />;
      if (!products) return null;
      
      return (
        <div>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      );
    }}
  </DataFetcher>
);
```

### 4. Higher-Order Component (HOC) Pattern

```tsx
// HOC for adding authentication check
function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
      if (!isLoading && !user) {
        navigate('/login');
      }
    }, [user, isLoading, navigate]);
    
    if (isLoading) return <Loading />;
    if (!user) return null;
    
    return <Component {...props} />;
  };
}

// Usage
const AccountPage: React.FC = () => {
  return <div>My Account</div>;
};

export default withAuth(AccountPage);

// HOC for data fetching
function withProducts<P extends { products: Product[] }>(
  Component: React.ComponentType<P>
) {
  return (props: Omit<P, 'products'>) => {
    const { products, isLoading, error } = useProducts();
    
    if (isLoading) return <Loading />;
    if (error) return <Error message={error.message} />;
    
    return <Component {...(props as P)} products={products} />;
  };
}
```

### 5. Custom Hooks Pattern

```tsx
// Hook for cart management
export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const [isLoading, setIsLoading] = useState(false);
  
  const addToCart = async (productId: number, quantity: number = 1) => {
    setIsLoading(true);
    try {
      await dispatch(addToCartAsync({ productId, quantity })).unwrap();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFromCart = async (itemId: number) => {
    setIsLoading(true);
    try {
      await dispatch(removeFromCartAsync(itemId)).unwrap();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateQuantity = async (itemId: number, quantity: number) => {
    setIsLoading(true);
    try {
      await dispatch(updateCartItemAsync({ itemId, quantity })).unwrap();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearCart = async () => {
    setIsLoading(true);
    try {
      await dispatch(clearCartAsync()).unwrap();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount: cart.items.length,
    total: cart.total,
  };
};

// Usage in component
const AddToCartButton: React.FC<{ productId: number }> = ({ productId }) => {
  const { addToCart, isLoading } = useCart();
  
  return (
    <button
      onClick={() => addToCart(productId)}
      disabled={isLoading}
    >
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
};
```

### 6. Observer Pattern (PubSub)

```tsx
// Event emitter service
class EventEmitter {
  private events: Map<string, Function[]> = new Map();
  
  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventEmitter();

// Hook to use event bus
export const useEventListener = (event: string, callback: Function) => {
  useEffect(() => {
    const unsubscribe = eventBus.on(event, callback);
    return unsubscribe;
  }, [event, callback]);
};

// Usage
const CartNotification = () => {
  const [message, setMessage] = useState('');
  
  useEventListener('cart:item-added', (product: Product) => {
    setMessage(`${product.name} added to cart!`);
    setTimeout(() => setMessage(''), 3000);
  });
  
  if (!message) return null;
  return <div className="notification">{message}</div>;
};

// Emit events
const addToCart = (product: Product) => {
  // ... add to cart logic
  eventBus.emit('cart:item-added', product);
};
```

---


