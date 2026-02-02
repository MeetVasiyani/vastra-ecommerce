// Authentication Service for Vastra E-commerce
const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Storage keys
const TOKEN_KEY = 'vastra_auth_token';
const USER_KEY = 'vastra_user';
const REMEMBER_KEY = 'vastra_remember';

/**
 * Get the appropriate storage based on remember preference
 */
const getStorage = () => {
    const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
    return remember ? localStorage : sessionStorage;
};

/**
 * Store authentication data
 */
const storeAuthData = (token, user, remember = true) => {
    localStorage.setItem(REMEMBER_KEY, remember.toString());
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear authentication data from both storages
 */
const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
};

/**
 * Get stored authentication token
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored user data
 */
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

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    // Basic JWT expiry check
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < exp;
    } catch {
        return false;
    }
};

/**
 * Get authorization headers for API requests
 */
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

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} remember - Whether to persist session
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
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

/**
 * Register new user
 * @param {object} userData - { firstName, lastName, email, password }
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
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

/**
 * Logout user
 */
export const logout = () => {
    clearAuthData();
};

/**
 * Fetch user profile from API
 * @returns {Promise<{success: boolean, profile?: object, error?: string}>}
 */
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

export default {
    login,
    register,
    logout,
    getToken,
    getStoredUser,
    isAuthenticated,
    getAuthHeaders,
    fetchUserProfile
};
