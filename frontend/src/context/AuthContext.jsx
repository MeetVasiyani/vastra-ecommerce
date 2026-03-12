import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    login as authLogin,
    register as authRegister,
    logout as authLogout,
    getStoredUser,
    isAuthenticated as checkAuth,
    fetchUserProfile
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // check if user is already logged in when app starts
    useEffect(() => {
        async function initAuth() {
            try {
                if (checkAuth()) {
                    const storedUser = getStoredUser();
                    if (storedUser) {
                        setUser(storedUser);
                        // get fresh profile data
                        const result = await fetchUserProfile();
                        if (result.success && result.profile) {
                            setUser({ ...storedUser, ...result.profile });
                        }
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err);
            } finally {
                setIsLoading(false);
            }
        }

        initAuth();
    }, []);

    // login
    const login = async (email, password, remember) => {
        if (remember === undefined) remember = true;
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
    };

    // register
    const register = async (userData) => {
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
    };

    // logout
    const logout = () => {
        authLogout();
        setUser(null);
        setError(null);
    };

    // clear errors
    const clearError = () => {
        setError(null);
    };

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

// hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
