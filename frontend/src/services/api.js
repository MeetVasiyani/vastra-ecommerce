// API Service for Vastra
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Get full image URL from relative path
export const getImageUrl = (path) => {
    if (!path) return null;

    const version = import.meta.env.VITE_BUILD_VERSION || new Date().toISOString().slice(0, 10);

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const url = `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    return `${url}?v=${version}`;
};

// Fetch products with filters
export const fetchProducts = async (options = {}) => {
    const {
        page = 1,
        pageSize = 12,
        categoryId = null,
        search = '',
        minPrice = null,
        maxPrice = null,
        colors = [],
        sizes = []
    } = options;

    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });

    if (categoryId) {
        params.append('categoryId', categoryId.toString());
    }

    if (search) {
        params.append('search', search);
    }

    if (minPrice !== null) {
        params.append('minPrice', minPrice.toString());
    }

    if (maxPrice !== null) {
        params.append('maxPrice', maxPrice.toString());
    }

    if (colors && colors.length > 0) {
        params.append('colors', colors.join(','));
    }

    if (sizes && sizes.length > 0) {
        params.append('sizes', sizes.join(','));
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/Product`, {
            params,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Failed to fetch products: ${error.response.statusText}`);
        }
        throw error;
    }
};

// Fetch single product by ID
export const fetchProductById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Product/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Failed to fetch product: ${error.response.statusText}`);
        }
        throw error;
    }
};

// Fetch all categories
export const fetchCategories = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Category`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Failed to fetch categories: ${error.response.statusText}`);
        }
        throw error;
    }
};

// Format price in Indian Rupees
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

import { getAuthHeaders } from './authService';

// Verify payment with Razorpay
export const verifyPayment = async (verificationData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Payment/Verify`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(verificationData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Payment verification failed');
        }

        return await response.json();
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw error;
    }
};

export default {
    fetchProducts,
    fetchProductById,
    fetchCategories,
    formatPrice,
    getImageUrl,
    verifyPayment,
};
