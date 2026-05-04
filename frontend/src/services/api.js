import axios from 'axios';
import { getAuthHeaders } from './authService';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const version = import.meta.env.VITE_BUILD_VERSION || new Date().toISOString().slice(0, 10);
    const url = `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    return `${url}?v=${version}`;
};

const buildParams = (obj) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
            if (value.length > 0) params.append(key, value.join(','));
        } else {
            params.append(key, value.toString());
        }
    });
    return params;
};

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

    const params = buildParams({
        page, pageSize, categoryId, search, minPrice, maxPrice, colors, sizes
    });

    try {
        const response = await axios.get(`${API_BASE_URL}/Product`, { params, headers: DEFAULT_HEADERS });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch products: ${error.response?.statusText || 'Unknown error'}`);
    }
};


export const fetchProductById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Product/${id}`, { headers: DEFAULT_HEADERS });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch product: ${error.response?.statusText || 'Unknown error'}`);
    }
};

export const fetchCategories = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Category`, { headers: DEFAULT_HEADERS });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch categories: ${error.response?.statusText || 'Unknown error'}`);
    }
};

export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export const verifyPayment = async (verificationData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Payment/Verify`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(verificationData)
        });

        if (!response.ok) {
            throw new Error(await response.text() || 'Payment verification failed');
        }

        return await response.json();
    } catch (error) {
        console.error("Payment verification error:", error);
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
