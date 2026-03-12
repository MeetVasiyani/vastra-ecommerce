import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import AuthLayout from '../components/layout/AuthLayout';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid password reset link.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.resetPassword({
                email,
                token,
                newPassword
            });
            setMessage(response.message);
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const PasswordToggleButton = ({ show, onToggle }) => (
        <button
            type="button"
            onClick={onToggle}
            className="position-absolute bg-transparent border-0"
            style={{
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--vastra-maroon)',
                opacity: 0.7,
                cursor: 'pointer'
            }}
            aria-label={show ? 'Hide password' : 'Show password'}
        >
            {show ? (
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
    );

    if (!token || !email) {
        return (
            <AuthLayout>

                {/* Error Card */}
                <div
                    className="p-4 p-md-5 text-center"
                    style={{
                        background: 'rgba(255, 255, 240, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(128, 0, 32, 0.1)',
                        border: '1px solid rgba(128, 0, 32, 0.08)'
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "'EB Garamond', serif",
                            fontSize: '1.8rem',
                            color: 'var(--vastra-maroon)',
                            marginBottom: '1rem'
                        }}
                    >
                        Invalid Link
                    </h2>
                    <p style={{ color: 'var(--vastra-dark)', opacity: 0.7, marginBottom: '1.5rem' }}>
                        The password reset link is invalid or missing required parameters.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="btn btn-vastra-primary"
                        style={{
                            padding: '14px 24px',
                            fontSize: '1rem',
                            borderRadius: '10px'
                        }}
                    >
                        Request a New Link
                    </Link>
                </div>

            </AuthLayout>
        );
    }

    return (
        <AuthLayout subtitle="Set your new password">

            {/* Reset Password Card */}
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
                    Reset Password
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
                    Enter your new password below.
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

                {!isSuccess && (
                    <form onSubmit={handleSubmit}>
                        {/* New Password Field */}
                        <div className="mb-4">
                            <label
                                htmlFor="newPassword"
                                className="form-label"
                                style={{
                                    fontWeight: 500,
                                    color: 'var(--vastra-dark)',
                                    fontSize: '0.95rem',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                New Password
                            </label>
                            <div className="position-relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Create a new password"
                                    autoComplete="new-password"
                                    required
                                    style={{
                                        padding: '14px 48px 14px 16px',
                                        border: '1px solid rgba(128, 0, 32, 0.15)',
                                        borderRadius: '10px',
                                        fontSize: '1rem',
                                        background: 'var(--vastra-ivory)',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                                <PasswordToggleButton
                                    show={showPassword}
                                    onToggle={() => setShowPassword(!showPassword)}
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="mb-4">
                            <label
                                htmlFor="confirmPassword"
                                className="form-label"
                                style={{
                                    fontWeight: 500,
                                    color: 'var(--vastra-dark)',
                                    fontSize: '0.95rem',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                Confirm Password
                            </label>
                            <div className="position-relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    className="form-control"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                    autoComplete="new-password"
                                    required
                                    style={{
                                        padding: '14px 48px 14px 16px',
                                        border: '1px solid rgba(128, 0, 32, 0.15)',
                                        borderRadius: '10px',
                                        fontSize: '1rem',
                                        background: 'var(--vastra-ivory)',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                                <PasswordToggleButton
                                    show={showConfirmPassword}
                                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <small className="d-block mt-1" style={{ color: '#dc3545' }}>
                                    Passwords do not match
                                </small>
                            )}
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
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                )}

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

export default ResetPasswordPage;
