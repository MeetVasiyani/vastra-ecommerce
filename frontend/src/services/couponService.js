// Coupon Service for Vastra
import axios from 'axios';
import { getAuthHeaders, isAuthenticated } from './authService';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Validate a coupon code
export const validateCoupon = async (code, orderAmount) => {
    if (!isAuthenticated()) {
        return { success: false, error: 'Please login to apply coupons', requiresAuth: true };
    }

    if (!code || !code.trim()) {
        return { success: false, error: 'Please enter a coupon code' };
    }

    if (!orderAmount || orderAmount <= 0) {
        return { success: false, error: 'Invalid order amount' };
    }

    try {
        const response = await axios.post(
            `${API_BASE_URL}/Coupon/validate`,
            {
                code: code.trim(),
                orderAmount: orderAmount
            },
            {
                headers: getAuthHeaders()
            }
        );

        const result = response.data;

        if (result.isValid) {
            return {
                success: true,
                coupon: {
                    code: code.trim().toUpperCase(),
                    discountAmount: result.discountAmount,
                    message: result.message,
                    couponId: result.couponId
                }
            };
        } else {
            return {
                success: false,
                error: result.message || 'Invalid coupon code'
            };
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, error: 'Session expired', requiresAuth: true };
        }
        if (error.response) {
            const errorData = error.response.data || {};
            return { success: false, error: errorData.message || 'Failed to validate coupon' };
        }
        console.error('Validate coupon error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Get all active coupons (for future use)
export const getActiveCoupons = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Coupon/active`);
        const coupons = response.data;
        return { success: true, coupons };
    } catch (error) {
        if (error.response) {
            const errorData = error.response.data || {};
            return { success: false, error: errorData.message || 'Failed to fetch coupons' };
        }
        console.error('Get active coupons error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export default {
    validateCoupon,
    getActiveCoupons
};
