import React from 'react';
import { motion } from 'framer-motion';
import { Container } from 'react-bootstrap';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductHeader = ({ productName, categoryName }) => {
    return (
        <section
            className="product-header position-relative d-flex align-items-center"
            style={{
                minHeight: '25vh',
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
                            <Link
                                to="/shop"
                                className="text-decoration-none"
                                style={{ color: 'var(--vastra-maroon)' }}
                            >
                                Shop
                            </Link>
                        </li>
                        {categoryName && (
                            <li className="breadcrumb-item d-flex align-items-center">
                                <ChevronRight size={14} className="text-muted me-1" />
                                <span style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                    {categoryName}
                                </span>
                            </li>
                        )}
                        <li className="breadcrumb-item d-flex align-items-center">
                            <ChevronRight size={14} className="text-muted me-1" />
                            <span style={{ color: 'var(--vastra-dark)' }}>{productName}</span>
                        </li>
                    </ol>
                </motion.nav>
            </Container>
        </section>
    );
};

export default ProductHeader;
