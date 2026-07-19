import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProtectedRoute, RoleRoute } from './components/guards/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/home/Home';
import ProductDetail from './pages/home/ProductDetail'; 
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Profile from './pages/customer/Profile';
import Orders from './pages/customer/Orders';
import Wishlist from './pages/customer/Wishlist';
import Checkout from './pages/customer/Checkout';
import Cart from './pages/customer/Cart';
import { Unauthorized, NotFound } from './pages/misc/Fallback';
import './index.css';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/cart" element={<Layout><Cart /></Layout>} />
              <Route path="/product/:slug" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/register" element={<Layout><Register /></Layout>} />
              <Route path="/unauthorized" element={<Layout><Unauthorized /></Layout>} />

              {/* Vendor Routes */}
              <Route element={<RoleRoute role="VENDOR" />}>
                <Route path="/vendor" element={<Layout><VendorDashboard /></Layout>} />
                <Route path="/vendor/profile" element={<Layout><VendorProfile /></Layout>} />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleRoute role="ADMIN" />}>
                <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
                <Route path="/admin/profile" element={<Layout><AdminProfile /></Layout>} />
              </Route>

              {/* Authenticated Customer Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Layout><CustomerDashboard /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/orders" element={<Layout><Orders /></Layout>} />
                <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
              </Route>

              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}