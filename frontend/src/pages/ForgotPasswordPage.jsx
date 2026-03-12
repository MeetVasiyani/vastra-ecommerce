import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import AuthLayout from '../components/layout/AuthLayout';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            setMessage(response.message);
        } catch (err) {
            console.error("Forgot Password Error:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout subtitle="We'll help you get back">

            {/* Forgot Password Card */}
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
                    Forgot Password?
                </h2>
                <div className="vastra-divider mx-auto mb-3" style={{ width: '50px' }} />

                <p
                    className="text-center mb-4"
                    style={{
                        color: 'var(--vastra-dark)',
                        opacity: 0.7,
                        fontStyle: 'italic',
                        fontSize: '0.95rem'
                    }}
                >
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {/* Success Alert */}
                {message && (
                    <div
                        className="alert mb-4 text-center"
                        style={{
                            background: 'rgba(40, 167, 69, 0.1)',
                            border: '1px solid rgba(40, 167, 69, 0.2)',
                            color: '#28a745',
                            borderRadius: '8px'
                        }}
                    >
                        {message}
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div
                        className="alert mb-4 text-center"
                        style={{
                            background: 'rgba(128, 0, 32, 0.1)',
                            border: '1px solid rgba(128, 0, 32, 0.2)',
                            color: 'var(--vastra-maroon)',
                            borderRadius: '8px'
                        }}
                    >
                        {error}
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
                            required
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
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                {/* Back to Login Link */}
                <div className="text-center mt-4">
                    <Link
                        to="/login"
                        className="text-decoration-none"
                        style={{
                            color: 'var(--vastra-maroon)',
                            fontSize: '0.95rem'
                        }}
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>

        </AuthLayout>
    );
};

export default ForgotPasswordPage;
