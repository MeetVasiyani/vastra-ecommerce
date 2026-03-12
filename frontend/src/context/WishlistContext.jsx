import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    const { isAuthenticated, user } = useAuth();

    const itemCount = wishlist.length;

    // fetch wishlist when user logs in or out
    useEffect(() => {
        if (isAuthenticated) {
            loadWishlist();
        } else {
            setWishlist([]);
        }
    }, [isAuthenticated, user]);

    // load wishlist from API
    const loadWishlist = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await getWishlist();
            if (result.success) {
                setWishlist(result.wishlist || []);
            } else {
                setError(result.error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // show a toast notification
    const showNotification = (message, type) => {
        if (type === undefined) type = 'success';
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // check if a product variant is already in wishlist
    const isInWishlist = (productVariantId) => {
        let found = null;
        for (let i = 0; i < wishlist.length; i++) {
            if (wishlist[i].productVariantId === productVariantId) {
                found = wishlist[i];
                break;
            }
        }
        return {
            inWishlist: found !== null,
            wishlistItemId: found ? found.id : null
        };
    };

    // add item to wishlist
    const addItem = async (productVariantId) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await addToWishlist(productVariantId);

            if (result.success) {
                setWishlist([...wishlist, result.item]);
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

    // remove item from wishlist
    const removeItem = async (wishlistItemId) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await removeFromWishlist(wishlistItemId);

            if (result.success) {
                const newList = wishlist.filter(item => item.id !== wishlistItemId);
                setWishlist(newList);
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

    // toggle wishlist for a product variant
    const toggleWishlist = async (productVariantId) => {
        const { inWishlist, wishlistItemId } = isInWishlist(productVariantId);

        if (inWishlist && wishlistItemId) {
            const result = await removeItem(wishlistItemId);
            return { ...result, added: false };
        } else {
            const result = await addItem(productVariantId);
            return { ...result, added: true };
        }
    };

    // clear entire wishlist
    const clearWishlistItems = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await clearWishlist();

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

    // dismiss notification
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
        addToWishlist: addItem,
        removeFromWishlist: removeItem,
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

// hook to use wishlist context
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export default WishlistContext;
