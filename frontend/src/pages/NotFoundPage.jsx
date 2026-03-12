import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const NotFoundPage = () => {
    return (
        <div className="not-found-page">
            <Navbar />

            {/* Main Content */}
            <section
                style={{
                    background: 'linear-gradient(135deg, var(--vastra-ivory) 0%, var(--vastra-beige) 100%)',
                    marginTop: '70px',
                    minHeight: 'calc(100vh - 70px - 200px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 0'
                }}
            >
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        {/* 404 Number */}
                        <motion.h1
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            style={{
                                fontFamily: 'EB Garamond, serif',
                                fontSize: 'clamp(6rem, 15vw, 12rem)',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, var(--vastra-maroon) 0%, var(--vastra-gold) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginBottom: '0',
                                lineHeight: 1
                            }}
                        >
                            404
                        </motion.h1>

                        {/* Decorative Line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            style={{
                                width: '80px',
                                height: '3px',
                                background: 'linear-gradient(90deg, var(--vastra-maroon), var(--vastra-gold))',
                                margin: '20px auto 30px',
                                borderRadius: '2px'
                            }}
                        />

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            style={{
                                fontFamily: 'EB Garamond, serif',
                                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                color: 'var(--vastra-dark)',
                                fontWeight: 600,
                                marginBottom: '1rem'
                            }}
                        >
                            Page Not Found
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            style={{
                                color: 'var(--vastra-dark)',
                                opacity: 0.7,
                                fontSize: '1.1rem',
                                maxWidth: '500px',
                                margin: '0 auto 2rem',
                                lineHeight: 1.6
                            }}
                        >
                            The page you're looking for doesn't exist or has been moved.
                            Let's get you back to exploring our exquisite collection.
                        </motion.p>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center"
                        >
                            <Link to="/" className="text-decoration-none">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-vastra-primary d-flex align-items-center gap-2"
                                    style={{
                                        padding: '14px 28px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <Home size={18} />
                                    Back to Home
                                </motion.button>
                            </Link>

                            <Link to="/shop" className="text-decoration-none">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn d-flex align-items-center gap-2"
                                    style={{
                                        padding: '14px 28px',
                                        fontSize: '1rem',
                                        background: 'transparent',
                                        border: '2px solid var(--vastra-maroon)',
                                        color: 'var(--vastra-maroon)',
                                        borderRadius: '8px',
                                        fontWeight: 500
                                    }}
                                >
                                    <Search size={18} />
                                    Browse Collection
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Go Back Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                            className="mt-4"
                        >
                            <button
                                onClick={() => window.history.back()}
                                className="btn btn-link d-inline-flex align-items-center gap-1"
                                style={{
                                    color: 'var(--vastra-maroon)',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <ArrowLeft size={16} />
                                Go Back
                            </button>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            <Footer />
        </div>
    );
};

export default NotFoundPage;
