import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../services/adminService';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

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
                        Verifying access...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
