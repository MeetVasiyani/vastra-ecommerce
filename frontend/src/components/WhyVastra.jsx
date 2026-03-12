import React, { useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useInView } from 'framer-motion';
import { Award, Leaf, Users, Shield } from 'lucide-react';

const features = [
    {
        id: 1,
        icon: Award,
        title: 'Premium Quality',
        description: 'Handpicked fabrics and meticulous quality control ensure every piece meets the highest standards of excellence.'
    },
    {
        id: 2,
        icon: Leaf,
        title: 'Sustainable Practice',
        description: 'We embrace eco-friendly processes and natural materials, honoring both tradition and our planet.'
    },
    {
        id: 3,
        icon: Users,
        title: 'Artisan Support',
        description: 'Direct partnerships with artisan communities, ensuring fair wages and preserving traditional crafts.'
    },
    {
        id: 4,
        icon: Shield,
        title: 'Heritage Preservation',
        description: 'Committed to keeping ancient weaving techniques alive for generations to come.'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const WhyVastra = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section className="vastra-section bg-vastra-ivory" ref={ref}>
            <Container>
                {/* Section Header */}
                <motion.div
                    className="text-center mb-5"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <p
                        className="text-uppercase mb-2"
                        style={{
                            letterSpacing: '3px',
                            fontSize: '0.9rem',
                            color: 'var(--vastra-maroon)',
                            fontWeight: 500
                        }}
                    >
                        Our Values
                    </p>
                    <h2
                        className="display-4 fw-bold mb-3"
                        style={{ color: 'var(--vastra-dark)' }}
                    >
                        Why Choose Vastra
                    </h2>
                    <div className="vastra-divider" />
                    <p
                        className="lead mx-auto"
                        style={{ maxWidth: '700px', color: 'var(--vastra-dark)', opacity: 0.8 }}
                    >
                        More than clothing, Vastra represents a commitment to quality,
                        sustainability, and the preservation of Indian heritage.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    <Row className="g-4">
                        {features.map((feature) => {
                            const IconComponent = feature.icon;
                            return (
                                <Col key={feature.id} xs={12} md={6} lg={3}>
                                    <motion.div
                                        variants={cardVariants}
                                        className="h-100"
                                    >
                                        <div
                                            className="text-center p-4 h-100"
                                            style={{
                                                background: 'linear-gradient(135deg, var(--vastra-beige) 0%, var(--vastra-ivory) 100%)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(128, 0, 32, 0.1)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-10px)';
                                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(128, 0, 32, 0.15)';
                                                e.currentTarget.style.borderColor = 'var(--vastra-gold)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = 'rgba(128, 0, 32, 0.1)';
                                            }}
                                        >
                                            {/* Icon */}
                                            <div
                                                className="feature-icon mb-4"
                                            >
                                                <IconComponent size={36} />
                                            </div>

                                            {/* Title */}
                                            <h4
                                                className="fw-bold mb-3"
                                                style={{
                                                    color: 'var(--vastra-dark)',
                                                    fontSize: '1.4rem'
                                                }}
                                            >
                                                {feature.title}
                                            </h4>

                                            {/* Description */}
                                            <p
                                                className="mb-0"
                                                style={{
                                                    color: 'var(--vastra-dark)',
                                                    opacity: 0.8,
                                                    fontSize: '1.05rem',
                                                    lineHeight: 1.7
                                                }}
                                            >
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </Col>
                            );
                        })}
                    </Row>
                </motion.div>
            </Container>
        </section>
    );
};

export default WhyVastra;
