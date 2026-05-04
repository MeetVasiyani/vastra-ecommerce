import axios from 'axios';
import { getAuthHeaders, isAuthenticated } from './authService';
import { API_BASE_URL } from './config';

export async function getCart() {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/Cart`, {
            headers: getAuthHeaders()
        });

        const cart = response.data;
        return { success: true, cart };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            const errorData = error.response.data || {};
            return { success: false, error: errorData.message || 'Failed to fetch cart' };
        }
        console.error('Get cart error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function addToCart(productVariantId, quantity) {
    if (quantity === undefined) quantity = 1;

    if (!isAuthenticated()) {
        return { success: false, error: 'Please login to add items to cart', requiresAuth: true };
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/Cart/items`, { productVariantId, quantity }, {
            headers: getAuthHeaders()
        });

        const cart = response.data;
        return { success: true, cart };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            const errorText = typeof error.response.data === 'string' ? error.response.data : '';
            return { success: false, error: errorText || 'Failed to add item to cart' };
        }
        console.error('Add to cart error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function updateCartItem(cartItemId, quantity) {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await axios.put(`${API_BASE_URL}/Cart/items`, { cartItemId, quantity }, {
            headers: getAuthHeaders()
        });

        const cart = response.data;
        return { success: true, cart };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            const errorText = typeof error.response.data === 'string' ? error.response.data : '';
            return { success: false, error: errorText || 'Failed to update item' };
        }
        console.error('Update cart item error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function removeFromCart(itemId) {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        await axios.delete(`${API_BASE_URL}/Cart/items/${itemId}`, {
            headers: getAuthHeaders()
        });

        return { success: true };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            return { success: false, error: 'Failed to remove item' };
        }
        console.error('Remove from cart error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function clearCart() {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        await axios.delete(`${API_BASE_URL}/Cart`, {
            headers: getAuthHeaders()
        });

        return { success: true };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            return { success: false, error: 'Failed to clear cart' };
        }
        console.error('Clear cart error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export default {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
