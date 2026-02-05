// Cart Service for Vastra
import { getAuthHeaders, isAuthenticated } from './authService';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Get the current user's cart
export const getCart = async () => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Cart`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const cart = await response.json();
            return { success: true, cart };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired' };
        }

        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || 'Failed to fetch cart' };
    } catch (error) {
        console.error('Get cart error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Add item to cart
export const addToCart = async (productVariantId, quantity = 1) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Please login to add items to cart', requiresAuth: true };
    }

    const requestBody = { productVariantId, quantity };
    console.log('Cart API Request:', requestBody);

    try {
        const response = await fetch(`${API_BASE_URL}/Cart/items`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        console.log('Cart API Response status:', response.status);

        if (response.ok) {
            const cart = await response.json();
            return { success: true, cart };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        const errorText = await response.text();
        console.error('Cart API Error:', errorText);
        return { success: false, error: errorText || 'Failed to add item to cart' };
    } catch (error) {
        console.error('Add to cart error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Cart/items`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ cartItemId, quantity })
        });

        if (response.ok) {
            const cart = await response.json();
            return { success: true, cart };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        const errorText = await response.text();
        return { success: false, error: errorText || 'Failed to update item' };
    } catch (error) {
        console.error('Update cart item error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Cart/items/${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok || response.status === 204) {
            return { success: true };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        return { success: false, error: 'Failed to remove item' };
    } catch (error) {
        console.error('Remove from cart error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Clear all items from cart
export const clearCart = async () => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Cart`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok || response.status === 204) {
            return { success: true };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        return { success: false, error: 'Failed to clear cart' };
    } catch (error) {
        console.error('Clear cart error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export default {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
