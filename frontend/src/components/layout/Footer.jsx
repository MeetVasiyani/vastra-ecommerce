import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="vastra-footer"
            style={{
                background: 'linear-gradient(135deg, var(--vastra-dark) 0%, #1a0f0a 100%)',
                color: 'var(--vastra-beige)',
                paddingTop: '60px',
                paddingBottom: '30px',
            }}
        >
            <Container style={{ maxWidth: '1400px' }}>
                {/* Main Footer Content */}
                <div className="row g-4 g-lg-5 mb-5">
                    {/* Brand Section */}
                    <div className="col-lg-4 col-md-6">
                        <Link
                            to="/"
                            className="text-decoration-none d-inline-block mb-3"
                            style={{
                                fontFamily: "'EB Garamond', serif",
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: 'var(--vastra-ivory)',
                                letterSpacing: '3px',
                            }}
                        >
                            VASTRA
                        </Link>
                        <p
                            style={{
                                color: 'var(--vastra-beige)',
                                opacity: 0.8,
                                lineHeight: 1.8,
                                fontSize: '1rem',
                                maxWidth: '300px',
                            }}
                        >
                            Experience the poetry of Indian textiles. Every thread tells a story of tradition and timeless elegance.
                        </p>
                        <div
                            style={{
                                width: '60px',
                                height: '2px',
                                background: 'linear-gradient(to right, var(--vastra-gold), transparent)',
                                marginTop: '1.5rem',
                            }}
                        />
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-2 col-md-6 col-6">
                        <h6
                            className="text-uppercase mb-4"
                            style={{
                                color: 'var(--vastra-gold)',
                                letterSpacing: '2px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                            }}
                        >
                            Quick Links
                        </h6>
                        <nav aria-label="Quick links">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">
                                    <Link to="/" className="footer-link">
                                        Home
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/shop" className="footer-link">
                                        Shop
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/cart" className="footer-link">
                                        Cart
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Account */}
                    <div className="col-lg-2 col-md-6 col-6">
                        <h6
                            className="text-uppercase mb-4"
                            style={{
                                color: 'var(--vastra-gold)',
                                letterSpacing: '2px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                            }}
                        >
                            Account
                        </h6>
                        <nav aria-label="Account links">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">
                                    <Link to="/login" className="footer-link">
                                        Sign In
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/signup" className="footer-link">
                                        Create Account
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/account" className="footer-link">
                                        My Account
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Legal */}
                    <div className="col-lg-2 col-md-6 col-6">
                        <h6
                            className="text-uppercase mb-4"
                            style={{
                                color: 'var(--vastra-gold)',
                                letterSpacing: '2px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                            }}
                        >
                            Legal
                        </h6>
                        <nav aria-label="Legal links">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">
                                    <Link to="/terms" className="footer-link">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/privacy" className="footer-link">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/contact" className="footer-link">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Newsletter / Future Social Section Placeholder */}
                    <div className="col-lg-2 col-md-6 col-6">
                        <h6
                            className="text-uppercase mb-4"
                            style={{
                                color: 'var(--vastra-gold)',
                                letterSpacing: '2px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                            }}
                        >
                            Stay Connected
                        </h6>
                        <p
                            style={{
                                color: 'var(--vastra-beige)',
                                opacity: 0.7,
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                            }}
                        >
                            Follow our journey and discover new collections.
                        </p>
                        {/* Social links can be added here when available */}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className="pt-4"
                    style={{
                        borderTop: '1px solid rgba(255, 255, 240, 0.1)',
                    }}
                >
                    <div className="row align-items-center">
                        <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                            <p
                                className="mb-0"
                                style={{
                                    color: 'var(--vastra-beige)',
                                    opacity: 0.6,
                                    fontSize: '0.9rem',
                                }}
                            >
                                © {currentYear} Vastra. All rights reserved.
                            </p>
                        </div>
                        <div className="col-md-6 text-center text-md-end">
                            <p
                                className="mb-0"
                                style={{
                                    color: 'var(--vastra-beige)',
                                    opacity: 0.5,
                                    fontSize: '0.85rem',
                                    fontStyle: 'italic',
                                }}
                            >
                                Crafted with tradition & love
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
