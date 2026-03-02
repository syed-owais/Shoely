## TESTING STRATEGY

### Unit Tests (Vitest + React Testing Library)

```typescript
// ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'Nike Air Max',
    price: 5000,
    image: '/test.jpg',
  };
  
  const mockAddToCart = vi.fn();
  
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText('Nike Air Max')).toBeInTheDocument();
    expect(screen.getByText('Rs. 5,000')).toBeInTheDocument();
  });
  
  it('calls onAddToCart when button clicked', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);
    
    expect(mockAddToCart).toHaveBeenCalledWith(1);
  });
});
```

### Integration Tests

```typescript
// checkout.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { CheckoutPage } from './CheckoutPage';
import { server } from '@/tests/__mocks__/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Checkout Flow', () => {
  it('completes checkout successfully', async () => {
    render(<CheckoutPage />);
    
    // Fill in shipping details
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    
    // Select payment method
    fireEvent.click(screen.getByLabelText(/cash on delivery/i));
    
    // Submit order
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/order placed successfully/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('user can complete checkout', async ({ page }) => {
  await page.goto('/');
  
  // Add product to cart
  await page.click('button:has-text("Add to Cart")').first();
  
  // Go to cart
  await page.click('[aria-label="Cart"]');
  
  // Proceed to checkout
  await page.click('button:has-text("Checkout")');
  
  // Fill shipping form
  await page.fill('[name="name"]', 'John Doe');
  await page.fill('[name="phone"]', '03001234567');
  await page.fill('[name="address"]', '123 Main St');
  await page.selectOption('[name="city"]', 'Karachi');
  
  // Select COD
  await page.click('[value="cod"]');
  
  // Place order
  await page.click('button:has-text("Place Order")');
  
  // Verify success
  await expect(page.locator('text=Order placed successfully')).toBeVisible();
});
```

---


