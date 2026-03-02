## PROJECT ARCHITECTURE

### Feature-Based Architecture (Recommended)

```
┌──────────────────────────────────────┐
│      Presentation Layer              │
│   (Components, Pages, UI)            │
├──────────────────────────────────────┤
│      Business Logic Layer            │
│   (Hooks, Services, Utilities)       │
├──────────────────────────────────────┤
│      State Management Layer          │
│   (Context, Redux, Zustand)          │
├──────────────────────────────────────┤
│      Data Layer                      │
│   (API Clients, Cache)               │
└──────────────────────────────────────┘
```

### Core Principles

1. **Component Composition** - Build complex UIs from simple components
2. **Single Responsibility** - Each component does one thing well
3. **DRY (Don't Repeat Yourself)** - Reuse components and logic
4. **Separation of Concerns** - Separate UI, logic, and data
5. **Prop Drilling Avoidance** - Use Context or state management
6. **Type Safety** - Use TypeScript for all code

---


## DIRECTORY STRUCTURE

### Recommended React Ecommerce Structure

```
src/
├── api/                              # API layer
│   ├── client.ts                     # Axios instance configuration
│   ├── endpoints/
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── auth.ts
│   └── interceptors/
│       ├── authInterceptor.ts
│       └── errorInterceptor.ts
│
├── assets/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/                       # Reusable components
│   ├── ui/                          # Base UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── Button.module.css
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── index.ts
│   │
│   ├── layout/                      # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   └── Container/
│   │
│   └── common/                      # Shared components
│       ├── Loading/
│       ├── ErrorBoundary/
│       ├── NotFound/
│       └── ProtectedRoute/
│
├── features/                         # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── utils/
│   │       └── tokenStorage.ts
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductCard.test.tsx
│   │   │   │   └── ProductCard.module.css
│   │   │   ├── ProductGrid/
│   │   │   ├── ProductFilter/
│   │   │   └── ProductDetails/
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   ├── useProductDetails.ts
│   │   │   └── useProductFilters.ts
│   │   ├── services/
│   │   │   └── productService.ts
│   │   ├── store/
│   │   │   └── productsSlice.ts
│   │   └── types/
│   │       └── product.types.ts
│   │
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartItem/
│   │   │   ├── CartSummary/
│   │   │   ├── CartDrawer/
│   │   │   └── EmptyCart/
│   │   ├── hooks/
│   │   │   ├── useCart.ts
│   │   │   └── useCartMutations.ts
│   │   ├── services/
│   │   │   └── cartService.ts
│   │   ├── store/
│   │   │   └── cartSlice.ts
│   │   └── types/
│   │       └── cart.types.ts
│   │
│   ├── checkout/
│   │   ├── components/
│   │   │   ├── ShippingForm/
│   │   │   ├── PaymentForm/
│   │   │   ├── OrderSummary/
│   │   │   └── CheckoutSteps/
│   │   ├── hooks/
│   │   │   ├── useCheckout.ts
│   │   │   └── usePayment.ts
│   │   ├── services/
│   │   │   ├── checkoutService.ts
│   │   │   └── paymentService.ts
│   │   ├── store/
│   │   │   └── checkoutSlice.ts
│   │   └── types/
│   │       └── checkout.types.ts
│   │
│   └── orders/
│       ├── components/
│       │   ├── OrderList/
│       │   ├── OrderDetails/
│       │   └── OrderTracking/
│       ├── hooks/
│       │   ├── useOrders.ts
│       │   └── useOrderDetails.ts
│       ├── services/
│       │   └── orderService.ts
│       ├── store/
│       │   └── ordersSlice.ts
│       └── types/
│           └── order.types.ts
│
├── hooks/                            # Shared custom hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useIntersectionObserver.ts
│   └── index.ts
│
├── pages/                            # Page components (routing)
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   ├── HomePage.test.tsx
│   │   └── sections/
│   │       ├── HeroSection.tsx
│   │       ├── FeaturedProducts.tsx
│   │       └── TrustBadges.tsx
│   ├── ProductsPage/
│   ├── ProductDetailPage/
│   ├── CartPage/
│   ├── CheckoutPage/
│   ├── OrdersPage/
│   ├── AccountPage/
│   └── NotFoundPage/
│
├── routes/                           # Routing configuration
│   ├── AppRoutes.tsx
│   ├── ProtectedRoute.tsx
│   └── routes.config.ts
│
├── store/                            # Global state management
│   ├── index.ts                      # Store configuration
│   ├── rootReducer.ts
│   ├── hooks.ts                      # Typed useDispatch & useSelector
│   └── slices/
│       ├── authSlice.ts
│       ├── cartSlice.ts
│       └── uiSlice.ts
│
├── styles/                           # Global styles
│   ├── globals.css
│   ├── variables.css
│   ├── reset.css
│   └── themes/
│       ├── light.css
│       └── dark.css
│
├── types/                            # Shared TypeScript types
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/                            # Utility functions
│   ├── formatters/
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   └── phone.ts
│   ├── validators/
│   │   ├── email.ts
│   │   ├── phone.ts
│   │   └── password.ts
│   └── helpers/
│       ├── storage.ts
│       ├── debounce.ts
│       └── classNames.ts
│
├── config/                           # Configuration files
│   ├── constants.ts
│   ├── api.config.ts
│   └── app.config.ts
│
├── contexts/                         # React Context providers
│   ├── ThemeContext.tsx
│   ├── AuthContext.tsx
│   └── CartContext.tsx
│
├── App.tsx                           # Root component
├── main.tsx                          # Entry point
└── vite-env.d.ts                     # Vite types

tests/
├── e2e/                              # End-to-end tests
│   ├── checkout.spec.ts
│   └── auth.spec.ts
├── integration/                      # Integration tests
│   └── cart.test.tsx
└── __mocks__/                        # Test mocks
    ├── api/
    └── handlers.ts

public/
├── index.html
├── robots.txt
└── sitemap.xml

.husky/                               # Git hooks
├── pre-commit
└── pre-push

├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```