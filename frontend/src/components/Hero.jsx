import React from 'react';
import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';

const Hero = () => {
    const navigate = useNavigate();
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <section
            className="d-flex align-items-center justify-content-center position-relative"
            aria-label="Hero section"
            role="banner"
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFFFF0 0%, #F5F5DC 50%, #E8D7A8 100%)',
                overflow: 'hidden'
            }}
        >
            {/* Decorative Background Pattern */}
            <div
                className="position-absolute w-100 h-100"
                aria-hidden="true"
                style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(128, 0, 32, 0.03) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)`,
                    zIndex: 0
                }}
            />

            <Container className="text-center position-relative" style={{ zIndex: 1 }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Subtitle */}
                    <motion.p
                        variants={itemVariants}
                        className="text-uppercase mb-3"
                        style={{
                            letterSpacing: '4px',
                            fontSize: '0.95rem',
                            color: 'var(--vastra-maroon)',
                            fontWeight: 500
                        }}
                    >
                        Crafted with Heritage
                    </motion.p>

                    {/* Main Heading */}
                    <motion.h1
                        variants={itemVariants}
                        className="display-1 fw-bold mb-4"
                        style={{
                            fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
                            lineHeight: 1.2,
                            color: 'var(--vastra-dark)'
                        }}
                    >
                        Vastra
                    </motion.h1>

                    {/* Tagline */}
                    <motion.h2
                        variants={itemVariants}
                        className="h3 mb-4"
                        style={{
                            fontWeight: 400,
                            fontStyle: 'italic',
                            color: 'var(--vastra-maroon)',
                            fontSize: 'clamp(1.3rem, 3vw, 2rem)'
                        }}
                    >
                        Where Tradition Meets Timeless Style
                    </motion.h2>

                    {/* Divider */}
                    <motion.div
                        variants={itemVariants}
                        className="vastra-divider"
                    />

                    {/* Description */}
                    <motion.p
                        variants={itemVariants}
                        className="lead mx-auto mb-5"
                        style={{
                            maxWidth: '700px',
                            fontSize: '1.25rem',
                            color: 'var(--vastra-dark)',
                            opacity: 0.9
                        }}
                    >
                        Discover the artistry of Indian craftsmanship. Each piece tells a story
                        of heritage, woven with passion and timeless elegance.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="d-flex gap-3 justify-content-center flex-wrap"
                    >
                        <Button variant="primary" size="lg" onClick={() => navigate('/shop')}>
                            Explore Collection
                        </Button>
                        <Button variant="outline" size="lg">
                            Our Story
                        </Button>
                    </motion.div>
                </motion.div>
            </Container>

            {/* Scroll Indicator */}
            <motion.div
                className="position-absolute bottom-0 start-50 translate-middle-x mb-5"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            >
                <div
                    style={{
                        width: '2px',
                        height: '40px',
                        background: 'var(--vastra-maroon)',
                        margin: '0 auto'
                    }}
                />
            </motion.div>
        </section>
    );
};

export default Hero;
