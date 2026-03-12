import React, { useRef } from 'react';
import { Container } from 'react-bootstrap';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from './ui/Button';

const CallToAction = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section
            className="vastra-section position-relative overflow-hidden"
            ref={ref}
            style={{
                background: 'linear-gradient(135deg, #800020 0%, #5C0011 100%)',
                color: 'var(--vastra-ivory)'
            }}
        >
            {/* Decorative Background Pattern */}
            <div
                className="position-absolute w-100 h-100"
                style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255, 255, 240, 0.05) 0%, transparent 50%)`,
                    zIndex: 0
                }}
            />

            <Container className="text-center position-relative" style={{ zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Subtitle */}
                    <motion.p
                        className="text-uppercase mb-3"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        style={{
                            letterSpacing: '3px',
                            fontSize: '0.9rem',
                            color: 'var(--vastra-gold)',
                            fontWeight: 500
                        }}
                    >
                        Begin Your Journey
                    </motion.p>

                    {/* Main Heading */}
                    <motion.h2
                        className="display-3 fw-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        style={{
                            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                            lineHeight: 1.3,
                            color: 'var(--vastra-ivory)'
                        }}
                    >
                        Experience the Poetry of Indian Textiles
                    </motion.h2>

                    {/* Divider */}
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        style={{
                            width: '80px',
                            height: '3px',
                            background: 'var(--vastra-gold)',
                            margin: '2rem auto'
                        }}
                    />

                    {/* Description */}
                    <motion.p
                        className="lead mx-auto mb-5"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        style={{
                            maxWidth: '700px',
                            fontSize: '1.3rem',
                            color: 'var(--vastra-beige)',
                            lineHeight: 1.8
                        }}
                    >
                        Let every thread tell your story. Discover collections that honor tradition,
                        celebrate craftsmanship, and embrace timeless elegance.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <Button
                            variant="outline"
                            size="lg"
                            className="d-inline-flex align-items-center gap-2"
                            style={{
                                backgroundColor: 'var(--vastra-ivory)',
                                color: 'var(--vastra-maroon)',
                                borderColor: 'var(--vastra-ivory)',
                                fontSize: '1.2rem',
                                padding: '16px 50px'
                            }}
                        >
                            Shop Now
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight size={24} />
                            </motion.span>
                        </Button>
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
};

export default CallToAction;
