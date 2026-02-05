import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getWishlist as fetchWishlist,
    addToWishlist as apiAddToWishlist,
    removeFromWishlist as apiRemoveFromWishlist,
    clearWishlist as apiClearWishlist
} from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

// Wishlist Provider component
export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    const { isAuthenticated, user } = useAuth();

    // Calculate wishlist item count
    const itemCount = wishlist?.length || 0;

    // Fetch wishlist when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            loadWishlist();
        } else {
            setWishlist([]);
        }
    }, [isAuthenticated, user]);

    // Load wishlist from API
    const loadWishlist = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchWishlist();
            if (result.success) {
                setWishlist(result.wishlist || []);
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

    // Check if a product variant is in the wishlist
    const isInWishlist = (productVariantId) => {
        const item = wishlist.find(w => w.productVariantId === productVariantId);
        return {
            inWishlist: !!item,
            wishlistItemId: item?.id || null
        };
    };

    // Add item to wishlist
    const addToWishlist = async (productVariantId) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiAddToWishlist(productVariantId);

            if (result.success) {
                setWishlist(prev => [...prev, result.item]);
                showNotification('Added to wishlist!', 'success');
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

    // Remove item from wishlist
    const removeFromWishlist = async (wishlistItemId) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiRemoveFromWishlist(wishlistItemId);

            if (result.success) {
                setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
                showNotification('Removed from wishlist', 'success');
                return { success: true };
            }

            setError(result.error);
            showNotification(result.error, 'error');
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle wishlist status for a product variant
    const toggleWishlist = async (productVariantId) => {
        const { inWishlist, wishlistItemId } = isInWishlist(productVariantId);

        if (inWishlist && wishlistItemId) {
            const result = await removeFromWishlist(wishlistItemId);
            return { ...result, added: false };
        } else {
            const result = await addToWishlist(productVariantId);
            return { ...result, added: true };
        }
    };

    // Clear entire wishlist
    const clearWishlistItems = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiClearWishlist();

            if (result.success) {
                setWishlist([]);
                showNotification('Wishlist cleared', 'success');
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
        wishlist,
        items: wishlist,
        itemCount,
        isLoading,
        error,
        notification,
        loadWishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist: clearWishlistItems,
        dismissNotification
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

// Hook to use wishlist context
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export default WishlistContext;
