import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formError, setFormError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

    const { register, isLoading, error, isAuthenticated, clearError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const { password } = formData;
        if (!password) {
            setPasswordStrength({ score: 0, label: '', color: '' });
            return;
        }

        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        const strengths = [
            { label: 'Very Weak', color: '#dc3545' },
            { label: 'Weak', color: '#fd7e14' },
            { label: 'Fair', color: '#ffc107' },
            { label: 'Good', color: '#20c997' },
            { label: 'Strong', color: '#198754' }
        ];

        const index = Math.min(score, 5) - 1;
        if (index >= 0) {
            setPasswordStrength({
                score,
                label: strengths[index].label,
                color: strengths[index].color
            });
        } else {
            setPasswordStrength({ score: 0, label: '', color: '' });
        }
    }, [formData.password]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        clearError();

        if (!formData.firstName.trim()) {
            setFormError('Please enter your first name');
            return;
        }
        if (!formData.lastName.trim()) {
            setFormError('Please enter your last name');
            return;
        }
        if (!formData.email.trim()) {
            setFormError('Please enter your email address');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setFormError('Please enter a valid email address');
            return;
        }
        if (!formData.password) {
            setFormError('Please enter a password');
            return;
        }
        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }
        if (!acceptTerms) {
            setFormError('Please accept the terms and conditions');
            return;
        }

        const result = await register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password
        });

        if (result.success) {
            navigate('/', { replace: true });
        }
    };



    return (
        <AuthLayout subtitle="Begin your journey with us">

            {/* Signup Card */}
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
                    Create Account
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
                    {/* Name Fields */}
                    <div className="row mb-4">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <label
                                htmlFor="firstName"
                                className="form-label"
                                style={{
                                    fontWeight: 500,
                                    color: 'var(--vastra-dark)',
                                    fontSize: '0.95rem'
                                }}
                            >
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="form-control"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First name"
                                autoComplete="given-name"
                                style={{
                                    padding: '12px 16px',
                                    border: '1px solid rgba(128, 0, 32, 0.15)',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    background: 'var(--vastra-ivory)'
                                }}
                            />
                        </div>
                        <div className="col-md-6">
                            <label
                                htmlFor="lastName"
                                className="form-label"
                                style={{
                                    fontWeight: 500,
                                    color: 'var(--vastra-dark)',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className="form-control"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last name"
                                autoComplete="family-name"
                                style={{
                                    padding: '12px 16px',
                                    border: '1px solid rgba(128, 0, 32, 0.15)',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    background: 'var(--vastra-ivory)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="form-label"
                            style={{
                                fontWeight: 500,
                                color: 'var(--vastra-dark)',
                                fontSize: '0.95rem'
                            }}
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            style={{
                                padding: '12px 16px',
                                border: '1px solid rgba(128, 0, 32, 0.15)',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                background: 'var(--vastra-ivory)'
                            }}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-3">
                        <label
                            htmlFor="password"
                            className="form-label"
                            style={{
                                fontWeight: 500,
                                color: 'var(--vastra-dark)',
                                fontSize: '0.95rem'
                            }}
                        >
                            Password
                        </label>
                        <div className="position-relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                style={{
                                    padding: '12px 48px 12px 16px',
                                    border: '1px solid rgba(128, 0, 32, 0.15)',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    background: 'var(--vastra-ivory)'
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

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="d-flex gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <div
                                            key={level}
                                            style={{
                                                flex: 1,
                                                height: '4px',
                                                borderRadius: '2px',
                                                background: passwordStrength.score >= level
                                                    ? passwordStrength.color
                                                    : 'rgba(128, 0, 32, 0.1)'
                                            }}
                                        />
                                    ))}
                                </div>
                                <small style={{ color: passwordStrength.color, fontWeight: 500 }}>
                                    {passwordStrength.label}
                                </small>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="confirmPassword"
                            className="form-label"
                            style={{
                                fontWeight: 500,
                                color: 'var(--vastra-dark)',
                                fontSize: '0.95rem'
                            }}
                        >
                            Confirm Password
                        </label>
                        <div className="position-relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-control"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                style={{
                                    padding: '12px 48px 12px 16px',
                                    border: '1px solid rgba(128, 0, 32, 0.15)',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    background: 'var(--vastra-ivory)'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="position-absolute bg-transparent border-0"
                                style={{
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--vastra-maroon)',
                                    opacity: 0.7,
                                    cursor: 'pointer'
                                }}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? (
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
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <small className="text-danger mt-1 d-block">
                                Passwords do not match
                            </small>
                        )}
                    </div>

                    {/* Terms & Conditions */}
                    <div className="mb-4 d-flex align-items-start">
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="form-check-input me-2 mt-1"
                            style={{
                                width: '18px',
                                height: '18px',
                                borderColor: 'var(--vastra-maroon)',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        />
                        <label
                            htmlFor="acceptTerms"
                            className="form-check-label"
                            style={{
                                color: 'var(--vastra-dark)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                            }}
                        >
                            I agree to the{' '}
                            <Link
                                to="/terms"
                                className="text-decoration-none"
                                style={{ color: 'var(--vastra-maroon)' }}
                            >
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link
                                to="/privacy"
                                className="text-decoration-none"
                                style={{ color: 'var(--vastra-maroon)' }}
                            >
                                Privacy Policy
                            </Link>
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
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="d-flex align-items-center my-4">
                    <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(128, 0, 32, 0.15)' }} />
                    <span className="px-3" style={{ color: 'var(--vastra-dark)', opacity: 0.5, fontSize: '0.9rem' }}>
                        Already have an account?
                    </span>
                    <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(128, 0, 32, 0.15)' }} />
                </div>

                {/* Login Link */}
                <Link
                    to="/login"
                    className="btn btn-vastra-outline w-100"
                    style={{
                        padding: '14px',
                        fontSize: '1.1rem',
                        borderRadius: '10px'
                    }}
                >
                    Sign In Instead
                </Link>
            </div>

        </AuthLayout>
    );
};

export default SignupPage;
