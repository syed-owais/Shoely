# Shoely — Frontend API Requirements Report

> Full scan of `frontend/src/` — every feature that currently uses mock data and needs a real backend API.

## Current State

All data lives in a **Zustand store** ([useStore.ts](file:///d:/laragon/www/shoely/frontend/src/store/useStore.ts)) with **hardcoded sample data** and **mock logic**. There are no API calls anywhere. The store uses `zustand/persist` to save cart, user, and auth state to `localStorage`.

---

## 1. 🔐 Authentication (Admin Only)

**Current mock**: Hardcoded `admin@shoely.com` / `admin` credentials in store.

### Admin Auth
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/api/admin/login` | POST | [AdminLoginPage](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminLoginPage.tsx) | Admin login (email + password, must have role=admin) |
| `/api/admin/logout` | POST | `AdminLayout` sidebar | Admin logout |
| `/api/admin/user` | GET | `ProtectedRoute` in App.tsx | Get current admin user (guard admin routes) |

### Consumer Auth
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/api/register` | POST | Consumer registration | Register new consumer account |
| `/api/login` | POST | Consumer login | Consumer login (email + password) |
| `/api/logout` | POST | Consumer logout | Consumer logout |
| `/api/user` | GET | Auth guard | Get current consumer user |

> [!IMPORTANT]
> Admin and consumer are **two separate login flows** with different roles. The `users` table has a `role` column (`admin` / `customer`). Admin routes are protected by role-based middleware.

---

## 2. 👟 Products

**Current mock**: 8 hardcoded products in `sampleProducts[]` array.

| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/api/products` | GET | [ShopPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/ShopPage.tsx), [HomePage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/HomePage.tsx) | List products with filters (brand, category, condition, price range, size, search, sort) |
| `/api/products/featured` | GET | [HomePage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/HomePage.tsx) | Featured products for homepage |
| `/api/products/{id}` | GET | [ProductPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/ProductPage.tsx) | Single product detail |
| `/api/admin/products` | GET | [AdminProducts](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminProducts.tsx) | List all products (including inactive) |
| `/api/admin/products` | POST | [AdminProductEdit](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminProductEdit.tsx) | Create new product |
| `/api/admin/products/{id}` | PUT | [AdminProductEdit](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminProductEdit.tsx) | Update product |
| `/api/admin/products/{id}` | DELETE | [AdminProducts](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminProducts.tsx) | Soft-delete product (sets `isActive: false`) |

**Product fields**: `id`, `name`, `brand`, `model`, `price`, `originalPrice`, `images[]`, `sizes[]` (size + available + quantity), `condition`, `description`, `features[]`, `sku`, `category`, `tags[]`, `isActive`, timestamps.

**Filter parameters**: `brand`, `category`, `condition`, `minPrice`, `maxPrice`, `size`, `search`, `sortBy` (price-asc, price-desc, newest, popular).

---

## 3. 🛒 Cart

**Current mock**: Cart lives entirely in Zustand + localStorage. Must be moved to DB so logged-in users keep their cart across devices/browsers.

| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/api/cart` | GET | [CartPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/CartPage.tsx) | Get logged-in user's cart with items |
| `/api/cart/items` | POST | [ProductPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/ProductPage.tsx) | Add item to cart |
| `/api/cart/items/{id}` | PUT | [CartPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/CartPage.tsx) | Update item quantity |
| `/api/cart/items/{id}` | DELETE | [CartPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/CartPage.tsx) | Remove item from cart |
| `/api/cart/sync` | POST | On login | Merge localStorage cart into DB cart on login |

> [!IMPORTANT]
> When a consumer logs in, any items in their localStorage cart should be **merged** with their DB cart. This ensures no items are lost.

---

## 4. 📦 Orders

**Current mock**: Orders created in-memory via `createOrder()` in checkout, looked up via `getOrderById()`.

| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/api/checkout` | POST | [CheckoutPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/CheckoutPage.tsx) | Process checkout: validate cart, apply promo, calculate totals, create order, clear cart |
| `/api/orders` | GET | Consumer account | List consumer's own orders |
| `/api/orders/track` | POST | [OrderTrackingPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/OrderTrackingPage.tsx) | Look up order by order ID + email (guest-friendly) |
| `/api/orders/{id}` | GET | [OrderDetailPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/OrderDetailPage.tsx) | Get full order details |
| `/api/admin/orders` | GET | [AdminOrders](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminOrders.tsx) | List all orders (filter by status) |
| `/api/admin/orders/{id}` | GET | [AdminOrderDetail](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminOrderDetail.tsx) | Admin view of order detail |
| `/api/admin/orders/{id}/status` | PUT | [AdminOrderDetail](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminOrderDetail.tsx) | Update order status + tracking info |

**Order statuses**: `pending` → `confirmed` → `authenticated` → `shipped` → `delivered` (or `cancelled`)

**Order payload** (from checkout):
```json
{
  "customer": { "firstName", "lastName", "email", "phone", "address": { "street", "city", "state", "zipCode", "country" } },
  "items": [{ "productId", "name", "brand", "price", "size", "quantity", "image" }],
  "subtotal", "shipping", "tax", "discount", "total",
  "status": "pending",
  "promoCode": "WELCOME10"
}
```

---

## 5. 🏷️ Promo Codes

**Current mock**: 2 hardcoded promo codes (`WELCOME10`, `SUMMER25`).

| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/api/promo-codes/validate` | POST | [CartPage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/CartPage.tsx) | Validate promo code (send code + order total, get discount amount back) |
| `/api/admin/promo-codes` | GET | [AdminPromoCodes](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminPromoCodes.tsx) | List all promo codes |
| `/api/admin/promo-codes` | POST | [AdminPromoCodes](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminPromoCodes.tsx) | Create promo code |
| `/api/admin/promo-codes/{id}` | PUT | [AdminPromoCodes](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminPromoCodes.tsx) | Update promo code |
| `/api/admin/promo-codes/{id}` | DELETE | [AdminPromoCodes](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminPromoCodes.tsx) | Delete promo code |

**Promo code fields**: `code`, `type` (percentage/fixed), `value`, `minOrderAmount`, `maxDiscount`, `usageLimit`, `usageCount`, `startDate`, `endDate`, `isActive`, `description`.

---

## 6. 📢 Campaigns

**Current mock**: 2 hardcoded campaigns (`Jordan Week`, `New Arrivals`).

| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/api/campaigns/active` | GET | [HomePage](file:///d:/laragon/www/shoely/frontend/src/pages/customer/HomePage.tsx) | Get active campaigns (for banners/promotions) |
| `/api/admin/campaigns` | GET | [AdminCampaigns](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminCampaigns.tsx) | List all campaigns |
| `/api/admin/campaigns` | POST | [AdminCampaigns](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminCampaigns.tsx) | Create campaign |
| `/api/admin/campaigns/{id}` | PUT | [AdminCampaigns](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminCampaigns.tsx) | Update campaign |
| `/api/admin/campaigns/{id}` | DELETE | [AdminCampaigns](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminCampaigns.tsx) | Delete campaign |

**Campaign fields**: `name`, `description`, `bannerImage`, `discountType` (percentage/fixed), `discountValue`, `startDate`, `endDate`, `isActive`, `productIds[]`, `brand`, `category`, `tags[]`.

---

## 7. 📊 Admin Dashboard

**Current mock**: Computed from in-memory orders/products arrays.

| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/api/admin/dashboard` | GET | [AdminDashboard](file:///d:/laragon/www/shoely/frontend/src/pages/admin/AdminDashboard.tsx) | Stats: total orders, revenue, pending orders, low-stock count, recent orders, sales chart |

---

## Summary: Total API Endpoints Needed

| Domain | Public | Admin | Total |
|--------|--------|-------|-------|
| Auth (Consumer) | 4 | — | **4** |
| Auth (Admin) | — | 3 | **3** |
| Products | 3 | 4 | **7** |
| Cart | 5 | — | **5** |
| Orders + Checkout | 4 | 3 | **7** |
| Promo Codes | 1 | 4 | **5** |
| Campaigns | 1 | 4 | **5** |
| Dashboard | — | 1 | **1** |
| **Total** | **18** | **19** | **37** |

---

## Database Tables Required

| Table | Key Relations |
|-------|---------------|
| `users` | role column: `admin` / `customer` |
| `products` | — |
| `product_sizes` | belongs to `products` |
| `carts` | belongs to `users` |
| `cart_items` | belongs to `carts`, references `products` |
| `orders` | belongs to `users` (nullable for guest checkout) |
| `order_items` | belongs to `orders`, references `products` |
| `promo_codes` | — |
| `campaigns` | — |
