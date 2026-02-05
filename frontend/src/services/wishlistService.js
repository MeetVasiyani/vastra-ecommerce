// Wishlist Service for Vastra
import { getAuthHeaders, isAuthenticated } from './authService';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Get the current user's wishlist
export const getWishlist = async () => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Wishlist`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const wishlist = await response.json();
            return { success: true, wishlist };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || 'Failed to fetch wishlist' };
    } catch (error) {
        console.error('Get wishlist error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Add item to wishlist
export const addToWishlist = async (productVariantId) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Please login to add items to wishlist', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Wishlist`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productVariantId })
        });

        if (response.ok || response.status === 201) {
            const item = await response.json();
            return { success: true, item };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        const errorText = await response.text();
        return { success: false, error: errorText || 'Failed to add item to wishlist' };
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Remove item from wishlist
export const removeFromWishlist = async (wishlistItemId) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Wishlist/${wishlistItemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok || response.status === 204) {
            return { success: true };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        return { success: false, error: 'Failed to remove item from wishlist' };
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Clear all items from wishlist
export const clearWishlist = async () => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Wishlist`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok || response.status === 204) {
            return { success: true };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        return { success: false, error: 'Failed to clear wishlist' };
    } catch (error) {
        console.error('Clear wishlist error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export default {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
};
