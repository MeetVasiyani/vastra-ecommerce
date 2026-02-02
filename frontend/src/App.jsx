import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const CartPage = lazy(() => import('./pages/CartPage'));

// Loading fallback component
const PageLoader = () => (
    <div
        className="d-flex justify-content-center align-items-center"
        style={{
            minHeight: '100vh',
            background: 'var(--vastra-ivory)',
        }}
    >
        <div className="text-center">
            <div
                className="spinner-border"
                role="status"
                style={{ color: 'var(--vastra-maroon)', width: '3rem', height: '3rem' }}
            >
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: 'var(--vastra-dark)', fontStyle: 'italic' }}>
                Loading Vastra...
            </p>
        </div>
    </div>
);

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/product/:id" element={<ProductDetailPage />} />

                        {/* Auth Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* Cart Route */}
                        <Route path="/cart" element={<CartPage />} />

                        {/* Protected Routes (for future checkout) */}
                        {/* 
                        <Route path="/checkout" element={
                            <ProtectedRoute>
                                <CheckoutPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/account" element={
                            <ProtectedRoute>
                                <AccountPage />
                            </ProtectedRoute>
                        } />
                        */}
                    </Routes>
                </Suspense>
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
