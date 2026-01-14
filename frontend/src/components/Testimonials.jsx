import React, { useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: 'Priya Sharma',
        location: 'Mumbai',
        text: 'The saree I purchased from Vastra is absolutely stunning. The craftsmanship is impeccable, and I received countless compliments at my friend\'s wedding.',
        rating: 5
    },
    {
        id: 2,
        name: 'Anjali Mehta',
        location: 'Delhi',
        text: 'Vastra has become my go-to for authentic Indian wear. The quality is unmatched, and knowing that I\'m supporting artisans makes every purchase meaningful.',
        rating: 5
    },
    {
        id: 3,
        name: 'Kavita Reddy',
        location: 'Bangalore',
        text: 'I love how Vastra blends traditional designs with modern elegance. Their collection is timeless, and the fabrics feel luxurious against the skin.',
        rating: 5
    }
];

const Testimonials = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

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
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <section className="vastra-section bg-vastra-beige" ref={ref}>
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
                        Testimonials
                    </p>
                    <h2
                        className="display-4 fw-bold mb-3"
                        style={{ color: 'var(--vastra-dark)' }}
                    >
                        Loved by Our Community
                    </h2>
                    <div className="vastra-divider" />
                    <p
                        className="lead mx-auto"
                        style={{ maxWidth: '600px', color: 'var(--vastra-dark)', opacity: 0.8 }}
                    >
                        Hear what our customers have to say about their Vastra experience.
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    <Row className="g-4">
                        {testimonials.map((testimonial) => (
                            <Col key={testimonial.id} xs={12} lg={4}>
                                <motion.div variants={cardVariants} className="h-100">
                                    <div className="testimonial-card h-100">
                                        {/* Quote Icon */}
                                        <div className="mb-3">
                                            <Quote
                                                size={40}
                                                style={{ color: 'var(--vastra-gold)', opacity: 0.6 }}
                                            />
                                        </div>

                                        {/* Rating */}
                                        <div className="mb-3">
                                            {[...Array(testimonial.rating)].map((_, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        color: 'var(--vastra-gold)',
                                                        fontSize: '1.2rem',
                                                        marginRight: '2px'
                                                    }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>

                                        {/* Testimonial Text */}
                                        <p
                                            className="mb-4"
                                            style={{
                                                fontSize: '1.1rem',
                                                fontStyle: 'italic',
                                                lineHeight: 1.8,
                                                color: 'var(--vastra-dark)',
                                                opacity: 0.9
                                            }}
                                        >
                                            "{testimonial.text}"
                                        </p>

                                        {/* Author Info */}
                                        <div className="mt-auto">
                                            <p
                                                className="fw-bold mb-1"
                                                style={{
                                                    color: 'var(--vastra-maroon)',
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                {testimonial.name}
                                            </p>
                                            <p
                                                className="mb-0"
                                                style={{
                                                    color: 'var(--vastra-dark)',
                                                    opacity: 0.7,
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {testimonial.location}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </motion.div>
            </Container>
        </section>
    );
};

export default Testimonials;
