import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { validateToken } from '@/lib/axios';

// Customer Layout & Pages
import CustomerLayout from '@/layouts/CustomerLayout';
import HomePage from '@/pages/customer/HomePage';
import ShopPage from '@/pages/customer/ShopPage';
import ProductPage from '@/pages/customer/ProductPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrderTrackingPage from '@/pages/customer/OrderTrackingPage';
import OrderDetailPage from '@/pages/customer/OrderDetailPage';
import OrdersPage from '@/pages/customer/OrdersPage';
import LoginPage from '@/pages/customer/LoginPage';
import RegisterPage from '@/pages/customer/RegisterPage';
import ForgotPasswordPage from '@/pages/customer/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/customer/ResetPasswordPage';

// Admin Layout & Pages
import AdminLayout from '@/layouts/AdminLayout';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductEdit from '@/pages/admin/AdminProductEdit';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail';
import AdminPromoCodes from '@/pages/admin/AdminPromoCodes';
import AdminCampaigns from '@/pages/admin/AdminCampaigns';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminProfile from '@/pages/admin/AdminProfile';

// Customer Protected Route - requires user to be logged in
function CustomerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }
  return <>{children}</>;
}

// Admin Protected Route - requires admin role
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, adminUser } = useStore();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Double-check role
  if (adminUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  const setCurrency = useStore(state => state.setCurrency);

  // Validate token and fetch global settings on app startup
  useEffect(() => {
    validateToken();

    // Fetch public settings (like currency)
    import('@/lib/axios').then(({ default: api }) => {
      api.get('/api/settings/public').then(res => {
        const settings = res.data.body || res.data;
        if (settings.store_currency) {
          // Assuming the backend sends PKR, we map it to ₨ or use it as is
          const code = settings.store_currency;
          const symbol = code === 'PKR' ? '₨' : code;
          setCurrency(symbol, code);
        }
      }).catch(err => console.error('Failed to fetch public settings:', err));
    });
  }, [setCurrency]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="track-order" element={<OrderTrackingPage />} />
          <Route path="order/:id" element={<OrderDetailPage />} />
          <Route path="orders" element={
            <CustomerProtectedRoute>
              <OrdersPage />
            </CustomerProtectedRoute>
          } />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductEdit />} />
          <Route path="products/edit/:id" element={<AdminProductEdit />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="promo-codes" element={<AdminPromoCodes />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
