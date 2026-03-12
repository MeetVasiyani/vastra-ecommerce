// Order Service for Vastra
import axios from 'axios';
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
        const response = await axios.post(`${API_BASE_URL}/Order`, payload, {
            headers: getAuthHeaders()
        });

        const data = response.data;
        // The backend returns { order: {...}, razorpayOrderId: "..." }
        const order = data.order || data;
        const razorpayOrderId = data.razorpayOrderId;
        
        return { success: true, order, razorpayOrderId };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired. Please login again.', requiresAuth: true };
        }
        if (error.response && error.response.status === 400) {
            const errorText = typeof error.response.data === 'string' ? error.response.data : '';
            return { success: false, error: errorText || 'Invalid order data' };
        }
        if (error.response) {
            return { success: false, error: 'Failed to place order. Please try again.' };
        }
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
        const response = await axios.get(`${API_BASE_URL}/Order`, {
            headers: getAuthHeaders(),
            params: { page, pageSize }
        });

        const data = response.data;
        return { success: true, orders: data };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            return { success: false, error: 'Failed to fetch orders' };
        }
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
        const response = await axios.get(`${API_BASE_URL}/Order/${id}`, {
            headers: getAuthHeaders()
        });

        const order = response.data;
        return { success: true, order };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response && error.response.status === 404) {
            return { success: false, error: 'Order not found' };
        }
        if (error.response) {
            return { success: false, error: 'Failed to fetch order' };
        }
        console.error('Get order error:', error);
        return { success: false, error: 'Network error' };
    }
};

// Cancel an order
export const cancelOrder = async (orderId) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated', requiresAuth: true };
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/Order/${orderId}/cancel`, null, {
            headers: getAuthHeaders()
        });

        const order = response.data;
        return { success: true, order };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response && error.response.status === 404) {
            return { success: false, error: 'Order not found' };
        }
        if (error.response && error.response.status === 400) {
            const errorText = typeof error.response.data === 'string' ? error.response.data : '';
            return { success: false, error: errorText || 'Cannot cancel this order' };
        }
        if (error.response) {
            return { success: false, error: 'Failed to cancel order' };
        }
        console.error('Cancel order error:', error);
        return { success: false, error: 'Network error' };
    }
};

export default {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder
};
