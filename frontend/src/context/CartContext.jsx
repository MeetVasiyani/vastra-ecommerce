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

    // how many items are in the cart
    let itemCount = 0;
    if (cart && cart.items) {
        for (let i = 0; i < cart.items.length; i++) {
            itemCount += cart.items[i].quantity;
        }
    }

    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const totalAmount = cart ? cart.totalAmount : 0;
    const finalTotal = Math.max(0, totalAmount - discountAmount);

    // fetch cart when user logs in or out
    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
        } else {
            setCart(null);
            setAppliedCoupon(null);
        }
    }, [isAuthenticated, user]);

    // re-validate coupon when cart total changes
    useEffect(() => {
        if (appliedCoupon && cart && cart.totalAmount) {
            applyCoupon(appliedCoupon.code, true);
        }
    }, [cart && cart.totalAmount]);

    // auto-apply best sitewide coupon (minimum order amount = 0) when no coupon is applied
    useEffect(() => {
        const autoApplySitewideCoupon = async () => {
            if (!isAuthenticated) return;
            if (appliedCoupon) return;
            if (!cart || !cart.totalAmount || cart.totalAmount <= 0) return;
            if (isCouponLoading) return;
            if (lastAutoAppliedTotal.current === cart.totalAmount) return;

            lastAutoAppliedTotal.current = cart.totalAmount;

            const couponsResult = await getActiveCoupons();
            if (!couponsResult.success || !couponsResult.coupons) return;

            const sitewideCoupons = couponsResult.coupons.filter(
                (c) => Number(c.minimumOrderAmount) === 0
            );

            if (sitewideCoupons.length === 0) return;

            const orderTotal = Number(cart.totalAmount);
            let bestCoupon = null;
            let bestDiscount = 0;

            for (let i = 0; i < sitewideCoupons.length; i++) {
                const coupon = sitewideCoupons[i];
                const pct = Number(coupon.discountPercentage) || 0;
                const amt = Number(coupon.discountAmount) || 0;
                let discount = 0;

                if (pct > 0) {
                    discount = (orderTotal * pct) / 100;
                } else if (amt > 0) {
                    discount = amt;
                }

                discount = Math.min(discount, orderTotal);

                if (discount > bestDiscount) {
                    bestDiscount = discount;
                    bestCoupon = coupon;
                }
            }

            if (!bestCoupon || bestDiscount <= 0) return;

            await applyCoupon(bestCoupon.code, true);
        };

        autoApplySitewideCoupon();
    }, [isAuthenticated, cart && cart.totalAmount, appliedCoupon, isCouponLoading]);

    // load cart from API
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

    // show a toast notification for a few seconds
    const showNotification = (message, type) => {
        if (type === undefined) type = 'success';
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // add item to cart
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

    // update quantity of an item already in cart
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

    // remove a single item from cart
    const removeItem = async (itemId) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await removeFromCart(itemId);

            if (result.success) {
                // rebuild cart items without the removed item
                const newItems = cart.items.filter(item => item.id !== itemId);
                let newTotal = 0;
                for (let i = 0; i < newItems.length; i++) {
                    newTotal += newItems[i].price * newItems[i].quantity;
                }
                setCart({ ...cart, items: newItems, totalAmount: newTotal });
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

    // clear all items from cart
    const clearCartItems = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await clearCart();

            if (result.success) {
                setCart({ ...cart, items: [], totalAmount: 0 });
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

    // apply a coupon code
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

    // remove coupon
    const removeCoupon = () => {
        setAppliedCoupon(null);
        showNotification('Coupon removed', 'success');
    };

    // dismiss the notification banner
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

// hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
