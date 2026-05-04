import axios from 'axios';
import { getAuthHeaders } from './authService';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

export const fetchProductReviews = async (productId, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });

    try {
        const response = await axios.get(`${API_BASE_URL}/Review/product/${productId}`, {
            params,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Failed to fetch reviews: ${error.response.statusText}`);
        }
        throw error;
    }
};

export const createReview = async (reviewData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/Review`, reviewData, {
            headers: getAuthHeaders(),
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            const errorData = typeof error.response.data === 'string' ? error.response.data : '';
            throw new Error(errorData || 'Failed to create review');
        }
        throw error;
    }
};

export const updateReview = async (id, reviewData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/Review/${id}`, reviewData, {
            headers: getAuthHeaders(),
        });

        return response;
    } catch (error) {
        if (error.response) {
            const errorData = typeof error.response.data === 'string' ? error.response.data : '';
            throw new Error(errorData || 'Failed to update review');
        }
        throw error;
    }
};

export const fetchMyReviews = async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });

    try {
        const response = await axios.get(`${API_BASE_URL}/Review/my-reviews`, {
            params,
            headers: getAuthHeaders(),
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Failed to fetch your reviews: ${error.response.statusText}`);
        }
        throw error;
    }
};

export const deleteReview = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/Review/${id}`, {
            headers: getAuthHeaders(),
        });

        return response;
    } catch (error) {
        if (error.response) {
            throw new Error('Failed to delete review');
        }
        throw error;
    }
};

export default {
    fetchProductReviews,
    fetchMyReviews,
    createReview,
    updateReview,
    deleteReview,
};
