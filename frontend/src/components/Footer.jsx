import React, { useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useInView } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

const Footer = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const socialLinks = [
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Mail, href: '#', label: 'Email' }
    ];

    return (
        <footer
            className="py-5"
            ref={ref}
            style={{
                background: 'linear-gradient(to bottom, var(--vastra-beige), var(--vastra-ivory))',
                borderTop: '1px solid rgba(128, 0, 32, 0.1)'
            }}
        >
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <Row className="align-items-center">
                        {/* Brand Section */}
                        <Col lg={6} className="text-center text-lg-start mb-4 mb-lg-0">
                            <motion.h3
                                className="fw-bold mb-2"
                                style={{
                                    fontSize: '2rem',
                                    color: 'var(--vastra-maroon)',
                                    fontFamily: "'EB Garamond', serif"
                                }}
                            >
                                Vastra
                            </motion.h3>
                            <motion.p
                                className="mb-0"
                                style={{
                                    color: 'var(--vastra-dark)',
                                    opacity: 0.7,
                                    fontSize: '1rem',
                                    fontStyle: 'italic'
                                }}
                            >
                                Where tradition meets timeless style
                            </motion.p>
                        </Col>

                        {/* Social Links */}
                        <Col lg={6} className="text-center text-lg-end">
                            <motion.div
                                className="d-flex gap-3 justify-content-center justify-content-lg-end"
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : {}}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                {socialLinks.map((social, index) => {
                                    const IconComponent = social.icon;
                                    return (
                                        <motion.a
                                            key={social.label}
                                            href={social.href}
                                            aria-label={social.label}
                                            className="d-inline-flex align-items-center justify-content-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                                            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                borderRadius: '50%',
                                                border: '2px solid var(--vastra-maroon)',
                                                color: 'var(--vastra-maroon)',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--vastra-maroon)';
                                                e.currentTarget.style.color = 'var(--vastra-ivory)';
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--vastra-maroon)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <IconComponent size={20} />
                                        </motion.a>
                                    );
                                })}
                            </motion.div>
                        </Col>
                    </Row>

                    {/* Divider */}
                    <motion.hr
                        className="my-4"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        style={{
                            borderColor: 'rgba(128, 0, 32, 0.2)',
                            opacity: 0.3
                        }}
                    />

                    {/* Copyright */}
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.7, duration: 0.8 }}
                    >
                        <p
                            className="mb-0"
                            style={{
                                color: 'var(--vastra-dark)',
                                opacity: 0.6,
                                fontSize: '0.95rem'
                            }}
                        >
                            © {new Date().getFullYear()} Vastra. Crafted with heritage and passion.
                        </p>
                    </motion.div>
                </motion.div>
            </Container>
        </footer>
    );
};

export default Footer;
