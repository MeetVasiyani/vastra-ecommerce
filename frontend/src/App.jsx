import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - direct imports (simpler than lazy loading)
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
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

                        {/* Protected Routes */}
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
                        <Route path="/wishlist" element={
                            <ProtectedRoute>
                                <WishlistPage />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
