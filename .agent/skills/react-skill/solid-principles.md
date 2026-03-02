## SOLID PRINCIPLES IN REACT

### 1. Single Responsibility Principle (SRP)

**BAD Example:**
```tsx
// ❌ Component doing too many things
const ProductCard = ({ product }: { product: Product }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const addToCart = async () => {
    setIsLoading(true);
    await fetch('/api/cart', { method: 'POST', body: JSON.stringify(product) });
    setCart([...cart, product]);
    setIsLoading(false);
  };
  
  const addToWishlist = () => {
    setWishlist([...wishlist, product]);
  };
  
  return (
    <div>
      <img src={product.image} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={addToCart}>Add to Cart</button>
      <button onClick={addToWishlist}>Add to Wishlist</button>
    </div>
  );
};
```

**GOOD Example:**
```tsx
// ✅ Separated concerns

// Component only handles UI
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onAddToWishlist }) => {
  return (
    <div className="product-card">
      <ProductImage src={product.image} alt={product.name} />
      <ProductInfo name={product.name} price={product.price} />
      <ProductActions
        onAddToCart={() => onAddToCart(product.id)}
        onAddToWishlist={() => onAddToWishlist(product.id)}
      />
    </div>
  );
};

// Custom hook handles business logic
const useProductActions = () => {
  const dispatch = useDispatch();
  
  const addToCart = async (productId: number) => {
    await dispatch(addToCartAsync(productId));
  };
  
  const addToWishlist = async (productId: number) => {
    await dispatch(addToWishlistAsync(productId));
  };
  
  return { addToCart, addToWishlist };
};

// Usage
const ProductList = () => {
  const { products } = useProducts();
  const { addToCart, addToWishlist } = useProductActions();
  
  return products.map(product => (
    <ProductCard
      key={product.id}
      product={product}
      onAddToCart={addToCart}
      onAddToWishlist={addToWishlist}
    />
  ));
};
```

### 2. Open/Closed Principle (OCP)

**BAD Example:**
```tsx
// ❌ Hard to extend
const Button = ({ type, onClick }: { type: string; onClick: () => void }) => {
  if (type === 'primary') {
    return <button className="btn-primary" onClick={onClick}>Click</button>;
  } else if (type === 'secondary') {
    return <button className="btn-secondary" onClick={onClick}>Click</button>;
  } else if (type === 'danger') {
    return <button className="btn-danger" onClick={onClick}>Click</button>;
  }
  return <button onClick={onClick}>Click</button>;
};
```

**GOOD Example:**
```tsx
// ✅ Open for extension, closed for modification

// Base button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}) => {
  const classes = classNames(
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    { 'btn-loading': isLoading },
    className
  );
  
  return (
    <button className={classes} {...props}>
      {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>
  );
};

// Extend with specialized buttons
const AddToCartButton: React.FC<{ productId: number }> = ({ productId }) => {
  const { addToCart, isLoading } = useCart();
  
  return (
    <Button
      variant="primary"
      isLoading={isLoading}
      leftIcon={<ShoppingCartIcon />}
      onClick={() => addToCart(productId)}
    >
      Add to Cart
    </Button>
  );
};
```

### 3. Liskov Substitution Principle (LSP)

```tsx
// Base component contract
interface ProductDisplayProps {
  product: Product;
  onView: (id: number) => void;
}

// All implementations must honor the contract
const ProductCard: React.FC<ProductDisplayProps> = ({ product, onView }) => {
  return (
    <div onClick={() => onView(product.id)}>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </div>
  );
};

const ProductListItem: React.FC<ProductDisplayProps> = ({ product, onView }) => {
  return (
    <li onClick={() => onView(product.id)}>
      <span>{product.name}</span> - <span>{product.price}</span>
    </li>
  );
};

// Can be used interchangeably
const ProductDisplay = ({ layout, product, onView }: {
  layout: 'card' | 'list';
  product: Product;
  onView: (id: number) => void;
}) => {
  const Component = layout === 'card' ? ProductCard : ProductListItem;
  return <Component product={product} onView={onView} />;
};
```

### 4. Interface Segregation Principle (ISP)

**BAD Example:**
```tsx
// ❌ Fat interface
interface ProductProps {
  product: Product;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  onCompare: () => void;
  onShare: () => void;
  showPrice: boolean;
  showRating: boolean;
  showStock: boolean;
  showDescription: boolean;
}

// Components forced to accept props they don't use
const SimpleProductCard: React.FC<ProductProps> = ({
  product,
  onAddToCart, // Doesn't use these
  onCompare,   // Doesn't use these
  onShare,     // Doesn't use these
  showPrice,
}) => {
  return <div>{product.name}</div>;
};
```

**GOOD Example:**
```tsx
// ✅ Segregated interfaces

interface BaseProductProps {
  product: Product;
}

interface PriceProps {
  showPrice?: boolean;
}

interface RatingProps {
  showRating?: boolean;
}

interface ActionsProps {
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

// Components only accept what they need
const ProductName: React.FC<BaseProductProps> = ({ product }) => (
  <h3>{product.name}</h3>
);

const ProductPrice: React.FC<BaseProductProps & PriceProps> = ({ product, showPrice = true }) => (
  showPrice ? <span>{product.price}</span> : null
);

const ProductActions: React.FC<ActionsProps> = ({ onAddToCart, onAddToWishlist }) => (
  <div>
    {onAddToCart && <button onClick={onAddToCart}>Add to Cart</button>}
    {onAddToWishlist && <button onClick={onAddToWishlist}>Wishlist</button>}
  </div>
);

// Compose as needed
const ProductCard: React.FC<BaseProductProps & PriceProps & ActionsProps> = ({
  product,
  showPrice,
  onAddToCart,
  onAddToWishlist,
}) => (
  <div>
    <ProductName product={product} />
    <ProductPrice product={product} showPrice={showPrice} />
    <ProductActions onAddToCart={onAddToCart} onAddToWishlist={onAddToWishlist} />
  </div>
);
```

### 5. Dependency Inversion Principle (DIP)

**BAD Example:**
```tsx
// ❌ Direct dependency on concrete implementation
const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    // Directly using fetch - tightly coupled
    fetch('https://api.example.com/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);
  
  return <div>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
};
```

**GOOD Example:**
```tsx
// ✅ Depend on abstractions

// Abstract service interface
interface ProductService {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product>;
}

// Concrete implementation
class ApiProductService implements ProductService {
  constructor(private apiClient: AxiosInstance) {}
  
  async getProducts(): Promise<Product[]> {
    const { data } = await this.apiClient.get('/products');
    return data;
  }
  
  async getProduct(id: number): Promise<Product> {
    const { data } = await this.apiClient.get(`/products/${id}`);
    return data;
  }
}

// Custom hook using the abstraction
const useProducts = (productService: ProductService) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [productService]);
  
  return { products, isLoading, error };
};

// Component depends on abstraction
const ProductList = () => {
  const productService = useProductService(); // Injected
  const { products, isLoading, error } = useProducts(productService);
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
};
```

---


