import React, { useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useInView } from 'framer-motion';
import { Scissors } from 'lucide-react';

import ArtisanImg from '../assets/Indian artisan at work.jpg';

const leftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const rightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const OurCraft = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section className="vastra-section bg-vastra-beige" ref={ref}>
            <Container>
                <Row className="align-items-center g-5">
                    {/* Left Column - Image */}
                    <Col lg={6}>
                        <motion.div
                            variants={leftVariants}
                            initial="hidden"
                            animate={isInView ? 'visible' : 'hidden'}
                        >
                            <div
                                className="position-relative"
                                style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 60px rgba(128, 0, 32, 0.15)'
                                }}
                            >
                                <img
                                    src={ArtisanImg}
                                    alt="Indian artisan at work"
                                    className="w-100 h-100"
                                    style={{
                                        objectFit: 'cover',
                                        minHeight: '500px'
                                    }}
                                />

                                {/* Decorative Border */}
                                <div
                                    className="position-absolute"
                                    style={{
                                        top: '20px',
                                        left: '20px',
                                        right: '20px',
                                        bottom: '20px',
                                        border: '2px solid var(--vastra-gold)',
                                        borderRadius: '8px',
                                        pointerEvents: 'none'
                                    }}
                                />
                            </div>
                        </motion.div>
                    </Col>

                    {/* Right Column - Content */}
                    <Col lg={6}>
                        <motion.div
                            variants={rightVariants}
                            initial="hidden"
                            animate={isInView ? 'visible' : 'hidden'}
                        >
                            {/* Icon */}
                            <div
                                className="d-inline-flex align-items-center justify-content-center mb-4"
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    background: 'linear-gradient(135deg, var(--vastra-maroon), var(--vastra-deep-maroon))',
                                    borderRadius: '50%',
                                    color: 'var(--vastra-ivory)'
                                }}
                            >
                                <Scissors size={32} />
                            </div>

                            <p
                                className="text-uppercase mb-3"
                                style={{
                                    letterSpacing: '3px',
                                    fontSize: '0.9rem',
                                    color: 'var(--vastra-maroon)',
                                    fontWeight: 500
                                }}
                            >
                                Our Heritage
                            </p>

                            <h2
                                className="display-5 fw-bold mb-4"
                                style={{ color: 'var(--vastra-dark)' }}
                            >
                                The Art of Indian Craftsmanship
                            </h2>

                            <div
                                className="mb-4"
                                style={{
                                    width: '80px',
                                    height: '3px',
                                    background: 'linear-gradient(to right, var(--vastra-maroon), var(--vastra-gold))'
                                }}
                            />

                            <p
                                className="mb-4"
                                style={{
                                    fontSize: '1.15rem',
                                    lineHeight: 1.8,
                                    color: 'var(--vastra-dark)',
                                    opacity: 0.9
                                }}
                            >
                                Every garment at Vastra is a testament to centuries-old traditions,
                                meticulously handwoven by skilled artisans who pour their heart and
                                soul into each thread.
                            </p>

                            <p
                                className="mb-4"
                                style={{
                                    fontSize: '1.15rem',
                                    lineHeight: 1.8,
                                    color: 'var(--vastra-dark)',
                                    opacity: 0.9
                                }}
                            >
                                From the looms of rural India to your wardrobe, we preserve ancient
                                weaving techniques while embracing contemporary aesthetics. Each piece
                                tells a story of heritage, passion, and uncompromising quality.
                            </p>

                            <p
                                className="mb-0"
                                style={{
                                    fontSize: '1.15rem',
                                    lineHeight: 1.8,
                                    color: 'var(--vastra-dark)',
                                    opacity: 0.9
                                }}
                            >
                                When you wear Vastra, you don't just wear clothing—you wear history,
                                culture, and the dreams of artisans who have dedicated their lives
                                to this timeless craft.
                            </p>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default OurCraft;
