import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootProviders from './providers/RootProviders';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ContactPage from './pages/ContactPage';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

const App = () => {
    return (
        <RootProviders>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/cart" element={<CartPage />} />

                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/contact" element={<ContactPage />} />

                <Route
                    path="/checkout"
                    element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
                />
                <Route
                    path="/account"
                    element={<ProtectedRoute><AccountPage /></ProtectedRoute>}
                />
                <Route
                    path="/wishlist"
                    element={<ProtectedRoute><WishlistPage /></ProtectedRoute>}
                />

                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="products/new" element={<AdminProductFormPage />} />
                    <Route path="products/edit/:id" element={<AdminProductFormPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </RootProviders>
    );
};

export default App;