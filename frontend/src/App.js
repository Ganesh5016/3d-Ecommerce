import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/shop/CartDrawer';
import LoadingSpinner from './components/layout/LoadingSpinner';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const Layout = ({ children, noFooter }) => (
  <>
    <Navbar />
    <CartDrawer />
    <main>{children}</main>
    {!noFooter && <Footer />}
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: { background: '#12122a', color: '#f0ede8', border: '1px solid rgba(201,169,110,0.3)', borderRadius: '12px', fontFamily: "'DM Sans', sans-serif" },
              success: { iconTheme: { primary: '#c9a96e', secondary: '#12122a' } },
            }}
          />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/products" element={<Layout><Products /></Layout>} />
              <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />

              {/* Auth */}
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
              <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

              {/* Protected — buyer */}
              <Route path="/cart" element={<ProtectedRoute><Layout><Cart /></Layout></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Layout noFooter><Checkout /></Layout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Layout><Wishlist /></Layout></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute roles={['admin', 'seller']}><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />

              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
