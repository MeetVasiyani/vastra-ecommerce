// Auth Service for Vastra
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// keys used in storage
const TOKEN_KEY = 'vastra_auth_token';
const USER_KEY = 'vastra_user';
const REMEMBER_KEY = 'vastra_remember';

// save token and user to storage
function storeAuthData(token, user, remember) {
    if (remember === undefined) remember = true;
    localStorage.setItem(REMEMBER_KEY, remember.toString());
    if (remember) {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

// remove token and user from storage
function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}

// get stored token
export function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

// get stored user object
export function getStoredUser() {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
}

// check if user is logged in and token is not expired
export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expTime = payload.exp * 1000;
        return Date.now() < expTime;
    } catch {
        return false;
    }
}

// get auth headers for API requests
export function getAuthHeaders() {
    const token = getToken();
    if (token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
    return {
        'Content-Type': 'application/json'
    };
}

// login
export async function login(email, password, remember) {
    if (remember === undefined) remember = true;
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/login`, { email, password, rememberMe: remember }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const data = response.data;

        if (data.isSuccess) {
            const user = {
                id: data.userId,
                email: data.email,
                token: data.token
            };
            storeAuthData(data.token, user, remember);
            return { success: true, user };
        }

        return {
            success: false,
            error: data.message || 'Invalid email or password'
        };
    } catch (error) {
        if (error.response) {
            const data = error.response.data;
            return {
                success: false,
                error: data.message || 'Invalid email or password'
            };
        }
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.'
        };
    }
}

// register
export async function register(userData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/Auth/register`, userData, {
            headers: { 'Content-Type': 'application/json' }
        });

        const data = response.data;

        if (data.isSuccess) {
            const user = {
                id: data.userId,
                email: data.email,
                token: data.token
            };
            storeAuthData(data.token, user, true);
            return { success: true, user };
        }

        return {
            success: false,
            error: data.message || 'Registration failed. Please try again.'
        };
    } catch (error) {
        if (error.response) {
            const data = error.response.data;
            return {
                success: false,
                error: data.message || 'Registration failed. Please try again.'
            };
        }
        console.error('Registration error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.'
        };
    }
}

// logout
export function logout() {
    clearAuthData();
}

// get user profile from API
export async function fetchUserProfile() {
    try {
        const response = await axios.get(`${API_BASE_URL}/User/profile`, {
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
            return { success: false, error: 'Failed to fetch profile' };
        }
        console.error('Profile fetch error:', error);
        return { success: false, error: 'Network error' };
    }
}

// add a new address for the user
export async function addUserAddress(addressData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/User/addresses`, addressData, {
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
            return { success: false, error: errorText || 'Failed to add address' };
        }
        console.error('Add address error:', error);
        return { success: false, error: 'Network error' };
    }
}

// delete a user address by id
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

// update a user address
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

// update user profile
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

// delete user account
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

// send forgot password email
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

// reset password with token
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

// change password for authenticated user
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
