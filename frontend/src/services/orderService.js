// Order Service for Vastra
import { getAuthHeaders, isAuthenticated } from './authService';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Create a new order from the current cart
export const createOrder = async (shippingAddress, paymentMethod = 'COD', couponId = null) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Please login to place an order', requiresAuth: true };
    }

    const payload = {
        shippingAddress,
        paymentMethod
    };

    if (couponId) {
        payload.couponId = couponId;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Order`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const order = await response.json();
            return { success: true, order };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired. Please login again.', requiresAuth: true };
        }

        if (response.status === 400) {
            const errorText = await response.text();
            return { success: false, error: errorText || 'Invalid order data' };
        }

        return { success: false, error: 'Failed to place order. Please try again.' };
    } catch (error) {
        console.error('Create order error:', error);
        return { success: false, error: 'Network error. Please check your connection.' };
    }
};

// Get all orders for current user
export const getMyOrders = async (page = 1, pageSize = 10) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Order?page=${page}&pageSize=${pageSize}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, orders: data };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        return { success: false, error: 'Failed to fetch orders' };
    } catch (error) {
        console.error('Get orders error:', error);
        return { success: false, error: 'Network error' };
    }
};

// Get a single order by ID
export const getOrderById = async (id) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Order/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const order = await response.json();
            return { success: true, order };
        }

        if (response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }

        if (response.status === 404) {
            return { success: false, error: 'Order not found' };
        }

        return { success: false, error: 'Failed to fetch order' };
    } catch (error) {
        console.error('Get order error:', error);
        return { success: false, error: 'Network error' };
    }
};

export default {
    createOrder,
    getMyOrders,
    getOrderById
};
