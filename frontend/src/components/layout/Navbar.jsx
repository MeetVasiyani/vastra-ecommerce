import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ShoppingBag, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { isAdmin } from '../../services/adminService';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const { isAuthenticated, user, logout } = useAuth();
    const { itemCount } = useCart();
    const { itemCount: wishlistCount } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation(); // Initialize useLocation
    const userIsAdmin = isAdmin(); // Check admin status

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const navbarStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1050,
        transition: 'all 0.3s ease',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        background: isScrolled
            ? 'rgba(255, 255, 240, 0.95)'
            : 'transparent',
        boxShadow: isScrolled
            ? '0 4px 20px rgba(128, 0, 32, 0.08)'
            : 'none',
        borderBottom: isScrolled
            ? '1px solid rgba(128, 0, 32, 0.08)'
            : 'none'
    };

    return (
        <nav style={navbarStyle}>
            <div
                className="container d-flex align-items-center justify-content-between py-3"
                style={{ maxWidth: '1400px' }}
            >
                {/* Logo */}
                <Link
                    to="/"
                    className="text-decoration-none"
                    style={{
                        fontFamily: "'EB Garamond', serif",
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: 'var(--vastra-maroon)',
                        letterSpacing: '2px'
                    }}
                >
                    VASTRA
                </Link>

                {/* Desktop Navigation */}
                <div className="d-none d-md-flex align-items-center gap-4">
                    <Link
                        to="/"
                        className="text-decoration-none nav-link-vastra"
                        style={{
                            color: 'var(--vastra-dark)',
                            fontWeight: 500,
                            transition: 'color 0.3s ease'
                        }}
                    >
                        Home
                    </Link>
                    <Link
                        to="/shop"
                        className="text-decoration-none nav-link-vastra"
                        style={{
                            color: 'var(--vastra-dark)',
                            fontWeight: 500,
                            transition: 'color 0.3s ease'
                        }}
                    >
                        Shop
                    </Link>

                    {/* Cart Icon */}
                    <Link
                        to="/cart"
                        className="position-relative d-flex align-items-center text-decoration-none nav-link-vastra"
                        style={{
                            color: 'var(--vastra-dark)',
                            transition: 'color 0.3s ease'
                        }}
                    >
                        <ShoppingBag size={22} />
                        <AnimatePresence>
                            {itemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="position-absolute d-flex align-items-center justify-content-center"
                                    style={{
                                        top: '-8px',
                                        right: '-10px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: 'var(--vastra-maroon)',
                                        color: '#fff',
                                        fontSize: '0.7rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {itemCount > 99 ? '99+' : itemCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Wishlist Icon */}
                    <Link
                        to="/wishlist"
                        className="position-relative d-flex align-items-center text-decoration-none nav-link-vastra"
                        style={{
                            color: 'var(--vastra-dark)',
                            transition: 'color 0.3s ease'
                        }}
                    >
                        <Heart size={22} />
                        <AnimatePresence>
                            {wishlistCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="position-absolute d-flex align-items-center justify-content-center"
                                    style={{
                                        top: '-8px',
                                        right: '-10px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: 'var(--vastra-maroon)',
                                        color: '#fff',
                                        fontSize: '0.7rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {wishlistCount > 99 ? '99+' : wishlistCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Auth Section */}
                    {isAuthenticated ? (
                        <div className="position-relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="d-flex align-items-center gap-2 bg-transparent border-0"
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s ease',
                                    color: 'var(--vastra-dark)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(128, 0, 32, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isUserMenuOpen) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'var(--vastra-maroon)',
                                        color: 'var(--vastra-ivory)'
                                    }}
                                >
                                    <User size={16} />
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                    {user?.email?.split('@')[0] || 'Account'}
                                </span>
                            </button>

                            {/* User Dropdown */}
                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="position-absolute end-0 mt-2"
                                        style={{
                                            minWidth: '200px',
                                            background: 'var(--vastra-ivory)',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(128, 0, 32, 0.15)',
                                            border: '1px solid rgba(128, 0, 32, 0.1)',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            className="px-4 py-3"
                                            style={{
                                                borderBottom: '1px solid rgba(128, 0, 32, 0.1)',
                                                background: 'rgba(128, 0, 32, 0.03)'
                                            }}
                                        >
                                            <p
                                                className="mb-0 text-truncate"
                                                style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--vastra-dark)',
                                                    opacity: 0.7
                                                }}
                                            >
                                                {user?.email}
                                            </p>
                                        </div>
                                        <div className="py-2">
                                            {userIsAdmin && (
                                                <Link
                                                    to="/admin"
                                                    className="d-flex align-items-center gap-2 w-100 px-4 py-2 text-decoration-none"
                                                    style={{
                                                        color: 'var(--vastra-gold)',
                                                        fontWeight: 600,
                                                        transition: 'background 0.2s ease'
                                                    }}
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(128, 0, 32, 0.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    <span>👑 Admin Panel</span>
                                                </Link>
                                            )}
                                            <Link
                                                to="/account"
                                                className="d-flex align-items-center gap-2 w-100 px-4 py-2 text-decoration-none"
                                                style={{
                                                    color: 'var(--vastra-dark)',
                                                    transition: 'background 0.2s ease'
                                                }}
                                                onClick={() => setIsUserMenuOpen(false)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(128, 0, 32, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <User size={16} />
                                                <span>My Account</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="d-flex align-items-center gap-2 w-100 px-4 py-2 bg-transparent border-0 text-start"
                                                style={{
                                                    color: 'var(--vastra-maroon)',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(128, 0, 32, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <LogOut size={16} />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center gap-3">
                            <Link
                                to="/login"
                                state={{ from: location }} // Pass location state
                                className="text-decoration-none"
                                style={{
                                    color: 'var(--vastra-maroon)',
                                    fontWeight: 500,
                                    transition: 'opacity 0.3s ease'
                                }}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="btn btn-vastra-primary"
                                style={{
                                    padding: '8px 20px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="d-md-none bg-transparent border-0"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ color: 'var(--vastra-maroon)', cursor: 'pointer' }}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="d-md-none"
                        style={{
                            background: 'var(--vastra-ivory)',
                            borderTop: '1px solid rgba(128, 0, 32, 0.1)'
                        }}
                    >
                        <div className="container py-4">
                            <div className="d-flex flex-column gap-3">
                                <Link
                                    to="/"
                                    className="text-decoration-none py-2"
                                    style={{ color: 'var(--vastra-dark)', fontWeight: 500 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/shop"
                                    className="text-decoration-none py-2"
                                    style={{ color: 'var(--vastra-dark)', fontWeight: 500 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Shop
                                </Link>
                                <Link
                                    to="/cart"
                                    className="text-decoration-none py-2 d-flex align-items-center gap-2"
                                    style={{ color: 'var(--vastra-dark)', fontWeight: 500 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <ShoppingBag size={18} />
                                    Cart
                                    {itemCount > 0 && (
                                        <span
                                            style={{
                                                background: 'var(--vastra-maroon)',
                                                color: '#fff',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                padding: '2px 8px',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            {itemCount}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to="/wishlist"
                                    className="text-decoration-none py-2 d-flex align-items-center gap-2"
                                    style={{ color: 'var(--vastra-dark)', fontWeight: 500 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Heart size={18} />
                                    Wishlist
                                    {wishlistCount > 0 && (
                                        <span
                                            style={{
                                                background: 'var(--vastra-maroon)',
                                                color: '#fff',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                padding: '2px 8px',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                <hr style={{ borderColor: 'rgba(128, 0, 32, 0.1)' }} />

                                {isAuthenticated ? (
                                    <>
                                        <div
                                            className="py-2"
                                            style={{
                                                color: 'var(--vastra-dark)',
                                                opacity: 0.7,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Signed in as {user?.email}
                                        </div>
                                        {userIsAdmin && (
                                            <Link
                                                to="/admin"
                                                className="d-flex align-items-center gap-2 text-decoration-none py-2"
                                                style={{
                                                    color: 'var(--vastra-gold)',
                                                    fontWeight: 600
                                                }}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <span>👑 Admin Panel</span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/account"
                                            className="d-flex align-items-center gap-2 text-decoration-none py-2"
                                            style={{
                                                color: 'var(--vastra-dark)',
                                                fontWeight: 500
                                            }}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <User size={18} />
                                            My Account
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="d-flex align-items-center gap-2 bg-transparent border-0 py-2"
                                            style={{
                                                color: 'var(--vastra-maroon)',
                                                fontWeight: 500,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <div className="d-flex flex-column gap-2 pt-2">
                                        <Link
                                            to="/login"
                                            state={{ from: location }} // Pass location state
                                            className="btn btn-vastra-outline w-100"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="btn btn-vastra-primary w-100"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Styles */}
            <style>{`
                .nav-link-vastra:hover {
                    color: var(--vastra-maroon) !important;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
