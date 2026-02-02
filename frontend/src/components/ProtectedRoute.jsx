import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route component
 * Redirects to login if user is not authenticated
 * Preserves the intended destination for post-login redirect
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: '100vh',
                    background: 'var(--vastra-ivory)'
                }}
            >
                <div className="text-center">
                    <div
                        className="spinner-border"
                        role="status"
                        style={{ color: 'var(--vastra-maroon)', width: '3rem', height: '3rem' }}
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p
                        className="mt-3"
                        style={{ color: 'var(--vastra-dark)', fontStyle: 'italic' }}
                    >
                        Verifying authentication...
                    </p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    // Pass the current location in state for post-login redirect
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
