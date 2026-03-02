## COMPONENT DESIGN

### Component Architecture Layers

```tsx
// 1. Base UI Components (atoms)
// Button.tsx - No business logic, highly reusable
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
};

// 2. Composite Components (molecules)
// ProductCard.tsx - Combines atoms
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Card>
      <Image src={product.image} alt={product.name} />
      <Heading level={3}>{product.name}</Heading>
      <Text>{formatCurrency(product.price)}</Text>
      <Button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </Button>
    </Card>
  );
};

// 3. Feature Components (organisms)
// ProductGrid.tsx - Business logic + UI
export const ProductGrid: React.FC = () => {
  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();
  
  if (isLoading) return <ProductGridSkeleton />;
  
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  );
};

// 4. Page Components (templates)
// ProductsPage.tsx - Layout + orchestration
export const ProductsPage: React.FC = () => {
  return (
    <PageLayout>
      <PageHeader title="Products" />
      <ProductFilters />
      <ProductGrid />
      <Pagination />
    </PageLayout>
  );
};
```

### Component Prop Patterns

```tsx
// 1. Discriminated Unions for variant props
type ButtonProps =
  | { variant: 'primary'; color?: never }
  | { variant: 'custom'; color: string };

// 2. Render Props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

// 3. Component as Prop
interface ModalProps {
  trigger: React.ComponentType<{ onClick: () => void }>;
  children: React.ReactNode;
}

// 4. Polymorphic Components
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
} & React.ComponentPropsWithoutRef<E>;

function Text<E extends React.ElementType = 'span'>({
  as,
  children,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || 'span';
  return <Component {...props}>{children}</Component>;
}

// Usage: <Text as="h1">Heading</Text>
```

---


