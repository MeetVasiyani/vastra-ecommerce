// Auth Service for Vastra
const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Storage keys
const TOKEN_KEY = 'vastra_auth_token';
const USER_KEY = 'vastra_user';
const REMEMBER_KEY = 'vastra_remember';

// Get storage based on remember preference
const getStorage = () => {
    const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
    return remember ? localStorage : sessionStorage;
};

// Store auth data
const storeAuthData = (token, user, remember = true) => {
    localStorage.setItem(REMEMBER_KEY, remember.toString());
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
};

// Clear auth data
const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
};

// Get stored token
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

// Get stored user
export const getStoredUser = () => {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    // Check JWT expiry
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        return Date.now() < exp;
    } catch {
        return false;
    }
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
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
};

// Login
export const login = async (email, password, remember = true) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.isSuccess) {
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
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.'
        };
    }
};

// Register
export const register = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok && data.isSuccess) {
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
        console.error('Registration error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.'
        };
    }
};

// Logout
export const logout = () => {
    clearAuthData();
};

// Fetch user profile
export const fetchUserProfile = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/User/profile`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const profile = await response.json();
            return { success: true, profile };
        }

        if (response.status === 401) {
            clearAuthData();
            return { success: false, error: 'Session expired' };
        }

        return { success: false, error: 'Failed to fetch profile' };
    } catch (error) {
        console.error('Profile fetch error:', error);
        return { success: false, error: 'Network error' };
    }
};

// Add user address
export const addUserAddress = async (addressData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/User/addresses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(addressData)
        });

        if (response.ok) {
            const address = await response.json();
            return { success: true, address };
        }

        if (response.status === 401) {
            clearAuthData();
            return { success: false, error: 'Session expired' };
        }

        const errorText = await response.text();
        return { success: false, error: errorText || 'Failed to add address' };
    } catch (error) {
        console.error('Add address error:', error);
        return { success: false, error: 'Network error' };
    }
};

// Delete user address
export const deleteUserAddress = async (addressId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/User/addresses/${addressId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok || response.status === 204) {
            return { success: true };
        }

        if (response.status === 401) {
            clearAuthData();
            return { success: false, error: 'Session expired' };
        }

        return { success: false, error: 'Failed to delete address' };
    } catch (error) {
        console.error('Delete address error:', error);
        return { success: false, error: 'Network error' };
    }
};

export default {
    login,
    register,
    logout,
    getToken,
    getStoredUser,
    isAuthenticated,
    getAuthHeaders,
    fetchUserProfile,
    addUserAddress,
    deleteUserAddress
};
