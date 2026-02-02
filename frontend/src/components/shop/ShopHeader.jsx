import React from 'react';
import { motion } from 'framer-motion';
import { Container } from 'react-bootstrap';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShopHeader = () => {
    return (
        <section
            className="shop-header position-relative d-flex align-items-center"
            style={{
                minHeight: '45vh',
                paddingTop: '80px', // Account for fixed navbar
                background: 'linear-gradient(135deg, #FFFFF0 0%, #F5F5DC 50%, #E8D7A8 100%)',
                overflow: 'hidden',
            }}
        >
            {/* Decorative Background Pattern */}
            <div
                className="position-absolute w-100 h-100"
                aria-hidden="true"
                style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(128, 0, 32, 0.03) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)`,
                    zIndex: 0,
                }}
            />

            <Container className="position-relative" style={{ zIndex: 1 }}>
                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    aria-label="Breadcrumb"
                    className="mb-4"
                >
                    <ol className="breadcrumb mb-0" style={{ background: 'transparent' }}>
                        <li className="breadcrumb-item">
                            <Link
                                to="/"
                                className="d-flex align-items-center text-decoration-none"
                                style={{ color: 'var(--vastra-maroon)' }}
                            >
                                <Home size={16} className="me-1" />
                                Home
                            </Link>
                        </li>
                        <li className="breadcrumb-item d-flex align-items-center">
                            <ChevronRight size={14} className="text-muted me-1" />
                            <span style={{ color: 'var(--vastra-dark)' }}>Shop</span>
                        </li>
                    </ol>
                </motion.nav>

                {/* Main Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center"
                >
                    <p
                        className="text-uppercase mb-2"
                        style={{
                            letterSpacing: '4px',
                            fontSize: '0.9rem',
                            color: 'var(--vastra-maroon)',
                            fontWeight: 500,
                        }}
                    >
                        Explore Our Collection
                    </p>
                    <h1
                        className="display-2 fw-bold mb-3"
                        style={{
                            color: 'var(--vastra-dark)',
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        }}
                    >
                        Shop Vastra
                    </h1>
                    <div className="vastra-divider" />
                    <p
                        className="lead mx-auto mb-0"
                        style={{
                            maxWidth: '600px',
                            color: 'var(--vastra-dark)',
                            opacity: 0.85,
                        }}
                    >
                        Discover handcrafted Indian ethnic wear, where every thread
                        weaves a story of heritage and timeless elegance.
                    </p>
                </motion.div>
            </Container>
        </section>
    );
};

export default ShopHeader;
