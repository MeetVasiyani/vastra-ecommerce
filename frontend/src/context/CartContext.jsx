import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getCart as fetchCart,
    addToCart as apiAddToCart,
    updateCartItem as apiUpdateCartItem,
    removeFromCart as apiRemoveFromCart,
    clearCart as apiClearCart
} from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Cart Provider component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    const { isAuthenticated, user } = useAuth();

    // Calculate cart item count
    const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    // Fetch cart when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated, user]);

    // Load cart from API
    const loadCart = async () => {
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
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Add item to cart
    const addToCart = async (productVariantId, quantity = 1) => {
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
    };

    // Update cart item quantity
    const updateCartItem = async (cartItemId, quantity) => {
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
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiRemoveFromCart(itemId);

            if (result.success) {
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
    };

    // Clear entire cart
    const clearCartItems = async () => {
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
    };

    // Dismiss notification
    const dismissNotification = () => {
        setNotification(null);
    };

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

// Hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
