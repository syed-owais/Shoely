import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

// Customer Layout & Pages
import CustomerLayout from '@/layouts/CustomerLayout';
import HomePage from '@/pages/customer/HomePage';
import ShopPage from '@/pages/customer/ShopPage';
import ProductPage from '@/pages/customer/ProductPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrderTrackingPage from '@/pages/customer/OrderTrackingPage';
import OrderDetailPage from '@/pages/customer/OrderDetailPage';

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

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
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
        </Route>

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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
