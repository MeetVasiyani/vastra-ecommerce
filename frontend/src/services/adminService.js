import axios from 'axios';
import { getAuthHeaders, getToken, isAuthenticated } from './authService';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

export function isAdmin() {
    if (!isAuthenticated()) return false;

    try {
        const token = getToken();
        if (!token) return false;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRoles = payload.role;

        if (!userRoles) return false;

        if (Array.isArray(userRoles)) {
            return userRoles.includes('Admin');
        }
        return userRoles === 'Admin';
    } catch {
        return false;
    }
}

function getErrorMessage(data, fallback) {
    if (typeof data === 'string' && data) return data;
    if (data && data.error) return data.error;
    if (data && data.message) return data.message;
    
    if (data && data.errors) {
        const errorKeys = Object.keys(data.errors);
        if (errorKeys.length > 0) {
            const firstError = data.errors[errorKeys[0]];
            if (Array.isArray(firstError) && firstError.length > 0) {
                return firstError[0];
            }
            return firstError;
        }
    }
    
    return fallback;
}

export async function createProduct(productData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Product`, productData, {
            headers: getAuthHeaders()
        });
        return { success: true, product: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to create product') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function updateProduct(id, productData) {
    try {
        await axios.put(`${API_BASE_URL}/Product/${id}`, productData, {
            headers: getAuthHeaders()
        });
        return { success: true };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to update product') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function deleteProduct(id) {
    try {
        await axios.delete(`${API_BASE_URL}/Product/${id}`, {
            headers: getAuthHeaders()
        });
        return { success: true };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to delete product' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function createCategory(categoryData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Category`, categoryData, {
            headers: getAuthHeaders()
        });
        return { success: true, category: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to create category') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function updateCategory(id, categoryData) {
    try {
        await axios.put(`${API_BASE_URL}/Category/${id}`, categoryData, {
            headers: getAuthHeaders()
        });
        return { success: true };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to update category') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function deleteCategory(id) {
    try {
        await axios.delete(`${API_BASE_URL}/Category/${id}`, {
            headers: getAuthHeaders()
        });
        return { success: true };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to delete category' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function getAllCoupons() {
    try {
        const response = await axios.get(`${API_BASE_URL}/Coupon`, {
            headers: getAuthHeaders()
        });
        return { success: true, coupons: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to fetch coupons' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function getCouponById(id) {
    try {
        const response = await axios.get(`${API_BASE_URL}/Coupon/${id}`, {
            headers: getAuthHeaders()
        });
        return { success: true, coupon: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to fetch coupon' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function createCoupon(couponData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Coupon`, couponData, {
            headers: getAuthHeaders()
        });
        return { success: true, coupon: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to create coupon') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function updateCoupon(id, couponData) {
    try {
        await axios.put(`${API_BASE_URL}/Coupon/${id}`, couponData, {
            headers: getAuthHeaders()
        });
        return { success: true };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to update coupon') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function deleteCoupon(id) {
    try {
        await axios.delete(`${API_BASE_URL}/Coupon/${id}`, {
            headers: getAuthHeaders()
        });
        return { success: true };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to delete coupon' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function getOrderStats() {
    try {
        const response = await axios.get(`${API_BASE_URL}/Order/Admin/Stats`, {
            headers: getAuthHeaders()
        });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to fetch order stats' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function getAllOrders(page, pageSize, status) {
    if (page === undefined) page = 1;
    if (pageSize === undefined) pageSize = 10;
    if (status === undefined) status = '';

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString()
        });
        if (status) params.append('status', status);

        const response = await axios.get(`${API_BASE_URL}/Order/Admin/All`, {
            params,
            headers: getAuthHeaders()
        });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to fetch orders' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function updateOrderStatus(id, status) {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Order/Admin/${id}/Status`,
            { status },
            { headers: getAuthHeaders() }
        );
        return { success: true, order: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to update order status' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function getAllUsers() {
    try {
        const response = await axios.get(`${API_BASE_URL}/Auth/Users`, {
            headers: getAuthHeaders()
        });
        return { success: true, users: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to fetch users' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function promoteUserToAdmin(id) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/Users/${id}/promote`, {}, {
            headers: getAuthHeaders()
        });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to promote user') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function toggleUserStatus(id) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/Users/${id}/toggle-status`, {}, {
            headers: getAuthHeaders()
        });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to toggle user status') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function resetUserPassword(id, newPassword) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/Users/${id}/reset-password`, { newPassword }, {
            headers: getAuthHeaders()
        });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: getErrorMessage(error.response.data, 'Failed to reset password') };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function getAllReviewsAsAdmin(page, pageSize, rating) {
    if (page === undefined) page = 1;
    if (pageSize === undefined) pageSize = 10;
    if (rating === undefined) rating = null;

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString()
        });
        if (rating) params.append('rating', rating.toString());

        const response = await axios.get(`${API_BASE_URL}/Review/admin/all`, {
            params,
            headers: getAuthHeaders()
        });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to fetch reviews' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export async function deleteReviewAsAdmin(id) {
    try {
        await axios.delete(`${API_BASE_URL}/Review/admin/${id}`, {
            headers: getAuthHeaders()
        });
        return { success: true };
    } catch (error) {
        if (error.response) {
            return { success: false, error: 'Failed to delete review' };
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export default {
    isAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    promoteUserToAdmin,
    toggleUserStatus,
    resetUserPassword,
    getAllReviewsAsAdmin,
    deleteReviewAsAdmin
};
