import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    login as authLogin,
    register as authRegister,
    logout as authLogout,
    getStoredUser,
    isAuthenticated as checkAuth,
    fetchUserProfile
} from '../services/authService';

// Create the auth context
const AuthContext = createContext(null);

/**
 * Auth Provider component that wraps the app
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication status on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (checkAuth()) {
                    const storedUser = getStoredUser();
                    if (storedUser) {
                        setUser(storedUser);
                        // Optionally fetch fresh profile data
                        const { success, profile } = await fetchUserProfile();
                        if (success && profile) {
                            setUser(prev => ({ ...prev, ...profile }));
                        }
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    /**
     * Login handler
     */
    const login = useCallback(async (email, password, remember = true) => {
        setError(null);
        setIsLoading(true);
        try {
            const result = await authLogin(email, password, remember);
            if (result.success) {
                setUser(result.user);
                return { success: true };
            }
            setError(result.error);
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Register handler
     */
    const register = useCallback(async (userData) => {
        setError(null);
        setIsLoading(true);
        try {
            const result = await authRegister(userData);
            if (result.success) {
                setUser(result.user);
                return { success: true };
            }
            setError(result.error);
            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Logout handler
     */
    const logout = useCallback(() => {
        authLogout();
        setUser(null);
        setError(null);
    }, []);

    /**
     * Clear any auth errors
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        user,
        isAuthenticated: !!user && checkAuth(),
        isLoading,
        error,
        login,
        register,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
