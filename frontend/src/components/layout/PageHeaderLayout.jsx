import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const PageHeaderLayout = ({
    title,
    subtitle,
    showBackLink = false,
    backLinkPath = '/',
    backLinkText = 'Back',
    children
}) => {
    return (
        <div className="page-with-header">
            <Navbar />

            {/* Page Header */}
            <section
                className="page-header py-5"
                style={{
                    background: 'linear-gradient(135deg, var(--vastra-ivory) 0%, var(--vastra-beige) 100%)',
                    marginTop: '70px',
                    borderBottom: '1px solid rgba(128, 0, 32, 0.08)'
                }}
            >
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        {showBackLink && (
                            <Link
                                to={backLinkPath}
                                className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none"
                                style={{ color: 'var(--vastra-maroon)' }}
                            >
                                <ArrowLeft size={18} />
                                {backLinkText}
                            </Link>
                        )}
                        <h1
                            style={{
                                fontFamily: 'EB Garamond, serif',
                                fontSize: 'clamp(2rem, 5vw, 3rem)',
                                color: 'var(--vastra-dark)',
                                fontWeight: 600,
                                marginBottom: '0.5rem'
                            }}
                        >
                            {title}
                        </h1>
                        {subtitle && (
                            <p style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                </Container>
            </section>

            {/* Page Content */}
            <section
                className="page-content py-5"
                style={{
                    background: 'var(--vastra-ivory)',
                    minHeight: '60vh'
                }}
            >
                {children}
            </section>

            <Footer />
        </div>
    );
};

export default PageHeaderLayout;
