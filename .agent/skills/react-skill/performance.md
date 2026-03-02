## PERFORMANCE OPTIMIZATION

### 1. Memoization

```tsx
// React.memo for components
export const ProductCard = React.memo<ProductCardProps>(
  ({ product, onAddToCart }) => {
    return (
      <div>
        <h3>{product.name}</h3>
        <button onClick={() => onAddToCart(product.id)}>Add</button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.product.id === nextProps.product.id;
  }
);

// useMemo for expensive calculations
const ProductList = ({ products }: { products: Product[] }) => {
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => b.price - a.price);
  }, [products]);
  
  return <div>{sortedProducts.map(renderProduct)}</div>;
};

// useCallback for stable function references
const ProductPage = () => {
  const { addToCart } = useCart();
  
  const handleAddToCart = useCallback((productId: number) => {
    addToCart(productId);
  }, [addToCart]);
  
  return <ProductCard onAddToCart={handleAddToCart} />;
};
```

### 2. Code Splitting & Lazy Loading

```tsx
// Route-based code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>
  </Suspense>
);

// Component-based lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

const MyPage = () => (
  <div>
    <h1>My Page</h1>
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  </div>
);
```

### 3. Virtual Scrolling

```tsx
// Using react-window for large lists
import { FixedSizeList } from 'react-window';

const ProductList = ({ products }: { products: Product[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 4. Image Optimization

```tsx
// Lazy load images
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  return (
    <img
      ref={imgRef}
      src={imageSrc || '/placeholder.jpg'}
      alt={alt}
      loading="lazy"
    />
  );
};
```

### 5. Debouncing & Throttling

```tsx
// Custom debounce hook
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage in search
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery) {
      // Make API call
      searchProducts(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
};
```

---


