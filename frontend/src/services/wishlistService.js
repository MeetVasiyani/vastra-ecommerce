// Wishlist Service for Vastra
import axios from 'axios';
import { getAuthHeaders, isAuthenticated } from './authService';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Get the current user's wishlist
export const getWishlist = async () => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/Wishlist`, {
            headers: getAuthHeaders()
        });

        const wishlist = response.data;
        return { success: true, wishlist };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            const errorData = error.response.data || {};
            return { success: false, error: errorData.message || 'Failed to fetch wishlist' };
        }
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
        const response = await axios.post(`${API_BASE_URL}/Wishlist`, { productVariantId }, {
            headers: getAuthHeaders()
        });

        const item = response.data;
        return { success: true, item };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            const errorText = typeof error.response.data === 'string' ? error.response.data : '';
            return { success: false, error: errorText || 'Failed to add item to wishlist' };
        }
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
        await axios.delete(`${API_BASE_URL}/Wishlist/${wishlistItemId}`, {
            headers: getAuthHeaders()
        });

        return { success: true };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            return { success: false, error: 'Failed to remove item from wishlist' };
        }
        console.error('Remove from wishlist error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export const clearWishlist = async () => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        await axios.delete(`${API_BASE_URL}/Wishlist`, {
            headers: getAuthHeaders()
        });

        return { success: true };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            return { success: false, error: 'Failed to clear wishlist' };
        }
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
