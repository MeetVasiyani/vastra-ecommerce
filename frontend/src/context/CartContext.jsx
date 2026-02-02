import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    getCart as fetchCart,
    addToCart as apiAddToCart,
    updateCartItem as apiUpdateCartItem,
    removeFromCart as apiRemoveFromCart,
    clearCart as apiClearCart
} from '../services/cartService';
import { useAuth } from './AuthContext';

// Create the cart context
const CartContext = createContext(null);

/**
 * Cart Provider component that wraps the app
 */
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    const { isAuthenticated, user } = useAuth();

    // Calculate cart item count
    const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    // Fetch cart when user authenticates
    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
        } else {
            // Clear cart state when user logs out
            setCart(null);
        }
    }, [isAuthenticated, user]);

    /**
     * Load cart from API
     */
    const loadCart = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchCart();
            if (result.success) {
                setCart(result.cart);
            } else {
                setError(result.error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    /**
     * Show notification
     */
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        // Auto-dismiss after 3 seconds
        setTimeout(() => setNotification(null), 3000);
    }, []);

    /**
     * Add item to cart
     */
    const addToCart = useCallback(async (productVariantId, quantity = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiAddToCart(productVariantId, quantity);

            if (result.success) {
                setCart(result.cart);
                showNotification('Item added to cart!', 'success');
                return { success: true };
            }

            if (result.requiresAuth) {
                return { success: false, requiresAuth: true, error: result.error };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    /**
     * Update cart item quantity
     */
    const updateCartItem = useCallback(async (cartItemId, quantity) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiUpdateCartItem(cartItemId, quantity);

            if (result.success) {
                setCart(result.cart);
                return { success: true };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    /**
     * Remove item from cart
     */
    const removeFromCart = useCallback(async (itemId) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiRemoveFromCart(itemId);

            if (result.success) {
                // Remove item from local state
                setCart(prev => ({
                    ...prev,
                    items: prev.items.filter(item => item.id !== itemId),
                    totalAmount: prev.items
                        .filter(item => item.id !== itemId)
                        .reduce((total, item) => total + (item.price * item.quantity), 0)
                }));
                showNotification('Item removed from cart', 'success');
                return { success: true };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    /**
     * Clear entire cart
     */
    const clearCartItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiClearCart();

            if (result.success) {
                setCart(prev => ({
                    ...prev,
                    items: [],
                    totalAmount: 0
                }));
                showNotification('Cart cleared', 'success');
                return { success: true };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    /**
     * Dismiss notification
     */
    const dismissNotification = useCallback(() => {
        setNotification(null);
    }, []);

    const value = {
        cart,
        items: cart?.items || [],
        itemCount,
        totalAmount: cart?.totalAmount || 0,
        isLoading,
        error,
        notification,
        loadCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart: clearCartItems,
        dismissNotification
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

/**
 * Custom hook to use cart context
 */
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
