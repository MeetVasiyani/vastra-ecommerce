import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/cartService';
import { validateCoupon, getActiveCoupons } from '../services/couponService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isCouponLoading, setIsCouponLoading] = useState(false);
    const lastAutoAppliedTotal = useRef(null);

    const { isAuthenticated, user, logout } = useAuth();

    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    const discountAmount = appliedCoupon?.discountAmount ?? 0;
    const totalAmount = cart?.totalAmount ?? 0;
    const finalTotal = Math.max(0, totalAmount - discountAmount);

    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
        } else {
            setCart(null);
            setAppliedCoupon(null);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!appliedCoupon?.code || !cart?.totalAmount) return;
        applyCoupon(appliedCoupon.code, true);
    }, [totalAmount]);

    useEffect(() => {
        if (!isAuthenticated || appliedCoupon || !totalAmount || isCouponLoading) return;
        if (lastAutoAppliedTotal.current === totalAmount) return;

        lastAutoAppliedTotal.current = totalAmount;

        const autoApply = async () => {
            const couponsResult = await getActiveCoupons();
            if (!couponsResult || !couponsResult.success || !couponsResult.coupons) return;

            const sitewideCoupons = couponsResult.coupons.filter(c => Number(c.minimumOrderAmount) === 0);
            if (!sitewideCoupons.length) return;

            const bestCoupon = sitewideCoupons.reduce((best, coupon) => {
                const pct = Number(coupon.discountPercentage) || 0;
                const amt = Number(coupon.discountAmount) || 0;
                const discount = Math.min(
                    pct > 0 ? (totalAmount * pct) / 100 : amt,
                    totalAmount
                );
                return discount > (best.discount || 0) ? { coupon, discount } : best;
            }, {});

            if (bestCoupon?.coupon && bestCoupon.discount > 0) {
                await applyCoupon(bestCoupon.coupon.code, true);
            }
        };

        autoApply();
    }, [isAuthenticated, totalAmount, appliedCoupon, isCouponLoading]);

    const loadCart = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await getCart();
            if (result.success) {
                setCart(result.cart);
            } else {
                if (result.requiresAuth) {
                    logout();
                    return;
                }
                setError(result.error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message, type) => {
        if (type === undefined) type = 'success';
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const addItemToCart = async (productVariantId, quantity) => {
        if (quantity === undefined) quantity = 1;
        setIsLoading(true);
        setError(null);

        try {
            const result = await addToCart(productVariantId, quantity);

            if (result.success) {
                setCart(result.cart);
                showNotification('Item added to cart!', 'success');
                return { success: true };
            }

            if (result.requiresAuth) {
                logout();
                return { success: false, requiresAuth: true, error: result.error };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    };

    const updateItem = async (cartItemId, quantity) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await updateCartItem(cartItemId, quantity);

            if (result.success) {
                setCart(result.cart);
                return { success: true };
            }

            if (result.requiresAuth) {
                logout();
                return { success: false, requiresAuth: true, error: result.error };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await removeFromCart(itemId);

            if (result.success) {
                setCart(result.cart);
                showNotification('Item removed from cart', 'success');
                return { success: true };
            }

            if (result.requiresAuth) {
                logout();
                return { success: false, requiresAuth: true, error: result.error };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    };

    const clearCartItems = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await clearCart();

            if (result.success) {
                setCart(result.cart);
                showNotification('Cart cleared', 'success');
                return { success: true };
            }

            if (result.requiresAuth) {
                logout();
                return { success: false, requiresAuth: true, error: result.error };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    };

    const applyCoupon = async (code, silent) => {
        if (silent === undefined) silent = false;

        if (!isAuthenticated) {
            if (!silent) showNotification('Please login to apply coupons', 'error');
            return { success: false, error: 'Not authenticated' };
        }

        if (!cart || !cart.totalAmount || cart.totalAmount <= 0) {
            if (!silent) showNotification('Your cart is empty', 'error');
            return { success: false, error: 'Cart is empty' };
        }

        setIsCouponLoading(true);
        setError(null);

        try {
            const result = await validateCoupon(code, cart.totalAmount);

            if (result.success && result.coupon) {
                setAppliedCoupon(result.coupon);
                if (!silent) showNotification('Coupon applied successfully!', 'success');
                return { success: true, coupon: result.coupon };
            }

            if (result.requiresAuth) {
                logout();
                return { success: false, requiresAuth: true, error: result.error };
            }

            setAppliedCoupon(null);
            if (!silent) showNotification(result.error || 'Invalid coupon', 'error');
            return { success: false, error: result.error };
        } catch (err) {
            setAppliedCoupon(null);
            if (!silent) showNotification('Failed to apply coupon', 'error');
            return { success: false, error: 'Failed to apply coupon' };
        } finally {
            setIsCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        showNotification('Coupon removed', 'success');
    };
    const dismissNotification = () => {
        setNotification(null);
    };

    const value = {
        cart,
        items: cart ? cart.items : [],
        itemCount,
        totalAmount: cart ? cart.totalAmount : 0,
        discountAmount,
        finalTotal,
        appliedCoupon,
        isCouponLoading,
        isLoading,
        error,
        notification,
        loadCart,
        addToCart: addItemToCart,
        updateCartItem: updateItem,
        removeFromCart: removeItem,
        clearCart: clearCartItems,
        applyCoupon,
        removeCoupon,
        dismissNotification
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
