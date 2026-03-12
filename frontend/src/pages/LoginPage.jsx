import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');

    const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect destination from location state, default to home
    const from = location.state?.from?.pathname || '/';

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        clearError();

        // Basic validation
        if (!email.trim()) {
            setFormError('Please enter your email address');
            return;
        }
        if (!password) {
            setFormError('Please enter your password');
            return;
        }

        const result = await login(email, password, rememberMe);
        if (result.success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <AuthLayout subtitle="Welcome back to elegance">
            {/* Login Card */}
            <div
                className="p-4 p-md-5"
                style={{
                    background: 'rgba(255, 255, 240, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(128, 0, 32, 0.1)',
                    border: '1px solid rgba(128, 0, 32, 0.08)'
                }}
            >
                <h2
                    className="text-center mb-1"
                    style={{
                        fontFamily: "'EB Garamond', serif",
                        fontSize: '1.8rem',
                        color: 'var(--vastra-dark)'
                    }}
                >
                    Sign In
                </h2>
                <div className="vastra-divider mx-auto mb-4" style={{ width: '50px' }} />

                {/* Error Alert */}
                {(error || formError) && (
                    <div
                        className="alert mb-4 text-center"
                        style={{
                            background: 'rgba(128, 0, 32, 0.1)',
                            border: '1px solid rgba(128, 0, 32, 0.2)',
                            color: 'var(--vastra-maroon)',
                            borderRadius: '8px'
                        }}
                    >
                        {error || formError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="form-label"
                            style={{
                                fontWeight: 500,
                                color: 'var(--vastra-dark)',
                                fontSize: '0.95rem',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            autoComplete="email"
                            style={{
                                padding: '14px 16px',
                                border: '1px solid rgba(128, 0, 32, 0.15)',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                background: 'var(--vastra-ivory)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="form-label d-flex justify-content-between"
                            style={{
                                fontWeight: 500,
                                color: 'var(--vastra-dark)',
                                fontSize: '0.95rem',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Password
                            <Link
                                to="/forgot-password"
                                className="text-decoration-none"
                                style={{
                                    color: 'var(--vastra-maroon)',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Forgot password?
                            </Link>
                        </label>
                        <div className="position-relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                style={{
                                    padding: '14px 48px 14px 16px',
                                    border: '1px solid rgba(128, 0, 32, 0.15)',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    background: 'var(--vastra-ivory)',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="position-absolute bg-transparent border-0"
                                style={{
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--vastra-maroon)',
                                    opacity: 0.7,
                                    cursor: 'pointer'
                                }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                                        <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="mb-4 d-flex align-items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="form-check-input me-2"
                            style={{
                                width: '18px',
                                height: '18px',
                                borderColor: 'var(--vastra-maroon)',
                                cursor: 'pointer'
                            }}
                        />
                        <label
                            htmlFor="rememberMe"
                            className="form-check-label"
                            style={{
                                color: 'var(--vastra-dark)',
                                cursor: 'pointer'
                            }}
                        >
                            Remember me
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-vastra-primary w-100"
                        disabled={isLoading}
                        style={{
                            padding: '14px',
                            fontSize: '1.1rem',
                            borderRadius: '10px'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                    {/* Forgot Password Link below form */}
                    <div className="d-flex align-items-center justify-content-center mt-3">
                        <Link
                            to="/forgot-password"
                            className="text-decoration-none"
                            style={{
                                color: 'var(--vastra-maroon)',
                                fontSize: '0.95rem',
                                fontWeight: 500
                            }}
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </form>

                {/* Divider */}
                <div className="d-flex align-items-center my-4">
                    <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(128, 0, 32, 0.15)' }} />
                    <span className="px-3" style={{ color: 'var(--vastra-dark)', opacity: 0.5, fontSize: '0.9rem' }}>
                        New to Vastra?
                    </span>
                    <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(128, 0, 32, 0.15)' }} />
                </div>

                {/* Register Link */}
                <Link
                    to="/signup"
                    className="btn btn-vastra-outline w-100"
                    style={{
                        padding: '14px',
                        fontSize: '1.1rem',
                        borderRadius: '10px'
                    }}
                >
                    Create an Account
                </Link>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;
