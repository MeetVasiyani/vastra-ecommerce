import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoadingFallback = () => {
    const containerStyle = { minHeight: '100vh', background: 'var(--vastra-ivory)' };
    const spinnerStyle = { color: 'var(--vastra-maroon)', width: '3rem', height: '3rem' };
    const messageStyle = { color: 'var(--vastra-dark)', fontStyle: 'italic' };

    return (
        <div className="d-flex justify-content-center align-items-center" style={containerStyle}>
            <div className="text-center">
                <div className="spinner-border" role="status" style={spinnerStyle}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3" style={messageStyle}>Verifying authentication...</p>
            </div>
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <LoadingFallback />;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

    return children;
};

export default ProtectedRoute;
