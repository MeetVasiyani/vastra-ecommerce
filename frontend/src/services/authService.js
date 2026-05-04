import axios from 'axios';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

const TOKEN_KEY = 'vastra_auth_token';
const USER_KEY = 'vastra_user';
const REMEMBER_KEY = 'vastra_remember';

const handleApiError = (error, fallbackMsg = 'Something went wrong', clearOnUnauthorized = true) => {
    if (error.response?.status === 401 && clearOnUnauthorized) {
        clearAuthData();
        return 'Session expired';
    }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.status) {
        return fallbackMsg;
    }
    console.error('API error:', error);
    return 'Network error. Please try again.';
};

function storeAuthData(token, user, remember) {
    const shouldRemember = remember !== false;
    localStorage.setItem(REMEMBER_KEY, shouldRemember.toString());
    
    const storage = shouldRemember ? localStorage : sessionStorage;
    const otherStorage = shouldRemember ? sessionStorage : localStorage;
    
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
    otherStorage.removeItem(TOKEN_KEY);
    otherStorage.removeItem(USER_KEY);
}

function clearAuthData() {
    [localStorage, sessionStorage].forEach(storage => {
        storage.removeItem(TOKEN_KEY);
        storage.removeItem(USER_KEY);
        storage.removeItem(REMEMBER_KEY);
    });
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() < payload.exp * 1000;
    } catch {
        return false;
    }
}

export function getAuthHeaders() {
    const token = getToken();
    return {
        'Authorization': token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json'
    };
}

export async function login(email, password, remember = true) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/login`, { email, password, rememberMe: remember }, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.isSuccess) {
            const user = {
                id: response.data.userId,
                email: response.data.email,
                token: response.data.token
            };
            storeAuthData(response.data.token, user, remember);
            return { success: true, user };
        }

        return {
            success: false,
            error: response.data.message || 'Invalid email or password'
        };
    } catch (error) {
        return {
            success: false,
            error: handleApiError(error, 'Invalid email or password', false)
        };
    }
}

export async function register(userData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/register`, userData, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.isSuccess) {
            const user = {
                id: response.data.userId,
                email: response.data.email,
                token: response.data.token
            };
            storeAuthData(response.data.token, user, true);
            return { success: true, user };
        }

        return {
            success: false,
            error: response.data.message || 'Registration failed'
        };
    } catch (error) {
        return {
            success: false,
            error: handleApiError(error, 'Registration failed', false)
        };
    }
}

export function logout() {
    clearAuthData();
}

export async function fetchUserProfile() {
    try {
        const response = await axios.get(`${API_BASE_URL}/User/profile`, {
            headers: getAuthHeaders()
        });
        return { success: true, profile: response.data };
    } catch (error) {
        return {
            success: false,
            error: handleApiError(error, 'Failed to load profile')
        };
    }
}

export async function addUserAddress(addressData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/User/addresses`, addressData, {
            headers: getAuthHeaders()
        });
        return { success: true, address: response.data };
    } catch (error) {
        return {
            success: false,
            error: handleApiError(error, 'Failed to add address')
        };
    }
}

export async function deleteUserAddress(addressId) {
    try {
        await axios.delete(`${API_BASE_URL}/User/addresses/${addressId}`, {
            headers: getAuthHeaders()
        });

        return { success: true };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            clearAuthData();
            return { success: false, error: 'Session expired' };
        }
        if (error.response) {
            return { success: false, error: 'Failed to delete address' };
        }
        console.error('Delete address error:', error);
        return { success: false, error: 'Network error' };
    }
}

export async function updateUserAddress(addressId, addressData) {
    try {
        const response = await axios.put(`${API_BASE_URL}/User/addresses/${addressId}`, addressData, {
            headers: getAuthHeaders()
        });

        const address = response.data;
        return { success: true, address };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            clearAuthData();
            return { success: false, error: 'Session expired' };
        }
        if (error.response) {
            const errorText = typeof error.response.data === 'string' ? error.response.data : '';
            return { success: false, error: errorText || 'Failed to update address' };
        }
        console.error('Update address error:', error);
        return { success: false, error: 'Network error' };
    }
}

export async function updateUserProfile(profileData) {
    try {
        const response = await axios.put(`${API_BASE_URL}/User/profile`, profileData, {
            headers: getAuthHeaders()
        });

        const profile = response.data;
        return { success: true, profile };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            clearAuthData();
            return { success: false, error: 'Session expired' };
        }
        if (error.response) {
            const errorText = typeof error.response.data === 'string' ? error.response.data : '';
            return { success: false, error: errorText || 'Failed to update profile' };
        }
        console.error('Update profile error:', error);
        return { success: false, error: 'Network error' };
    }
}

export async function deleteAccount() {
    try {
        await axios.delete(`${API_BASE_URL}/User`, {
            headers: getAuthHeaders()
        });

        clearAuthData();
        return { success: true };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            clearAuthData();
            return { success: false, error: 'Session expired' };
        }
        if (error.response) {
            const data = error.response.data || {};
            return { success: false, error: data.message || 'Failed to delete account' };
        }
        console.error('Delete account error:', error);
        return { success: false, error: 'Network error' };
    }
}

export async function forgotPassword(email) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/forgot-password`, { email }, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            const data = error.response.data;
            const err = new Error(data.message || 'Failed to send reset email');
            err.response = { data };
            throw err;
        }
        throw error;
    }
}

export async function resetPassword(data) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/reset-password`, data, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            const responseData = error.response.data;
            const err = new Error(responseData.message || 'Failed to reset password');
            err.response = { data: responseData };
            throw err;
        }
        throw error;
    }
}

export async function changePassword(data) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/change-password`, data, {
            headers: getAuthHeaders()
        });

        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            clearAuthData();
            throw new Error('Session expired');
        }
        if (error.response) {
            const responseData = error.response.data;
            const err = new Error(responseData.message || 'Failed to change password');
            err.response = { data: responseData };
            throw err;
        }
        throw error;
    }
}

export default {
    login,
    register,
    logout,
    getToken,
    forgotPassword,
    resetPassword,
    changePassword,
    getStoredUser,
    isAuthenticated,
    getAuthHeaders,
    fetchUserProfile,
    addUserAddress,
    deleteUserAddress,
    updateUserAddress,
    updateUserProfile,
    deleteAccount
};
