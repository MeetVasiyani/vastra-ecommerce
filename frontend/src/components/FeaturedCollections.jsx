import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Card, CardBody } from './ui/Card';

import SareeImg from '../assets/Saree.jpg';
import KurtaImg from '../assets/Kurta.png';
import LehengaImg from '../assets/Lehenga.png';
import HandloomImg from '../assets/Handloom.jpg';

import SareeIcon from '../assets/icons/saree-icon.png';
import KurtaIcon from '../assets/icons/kurta-icon.png';
import LehengaIcon from '../assets/icons/lehenga-icon.png';
import HandloomIcon from '../assets/icons/handloom-icon.png';

const collections = [
    {
        id: 1,
        title: 'Sarees',
        description: 'Elegant drapes that embody grace and tradition',
        icon: SareeIcon,
        image: SareeImg
    },
    {
        id: 2,
        title: 'Kurtas',
        description: 'Contemporary comfort meets classic design',
        icon: KurtaIcon,
        image: KurtaImg
    },
    {
        id: 3,
        title: 'Lehengas',
        description: 'Regal attire for unforgettable moments',
        icon: LehengaIcon,
        image: LehengaImg
    },
    {
        id: 4,
        title: 'Handloom',
        description: 'Artisan crafted, heritage preserved',
        icon: HandloomIcon,
        image: HandloomImg
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const FeaturedCollections = () => {
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
                        Our Collections
                    </p>
                    <h2
                        className="display-4 fw-bold mb-3"
                        style={{ color: 'var(--vastra-dark)' }}
                    >
                        Timeless Treasures
                    </h2>
                    <div className="vastra-divider" />
                    <p
                        className="lead mx-auto"
                        style={{ maxWidth: '600px', color: 'var(--vastra-dark)', opacity: 0.8 }}
                    >
                        Explore our curated collection of authentic Indian ethnic wear,
                        each piece a masterpiece of tradition and craftsmanship.
                    </p>
                </motion.div>

                {/* Collection Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    <Row className="g-4">
                        {collections.map((collection) => {
                            return (
                                <Col key={collection.id} xs={12} md={6} lg={3}>
                                    <motion.div variants={cardVariants}>
                                        <Card
                                            className="border-0 h-100 position-relative overflow-hidden"
                                            role="article"
                                            aria-label={`${collection.title} collection`}
                                            tabIndex="0"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {/* Image Container */}
                                            <div
                                                className="position-relative"
                                                style={{
                                                    height: '350px',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <img
                                                    src={collection.image}
                                                    alt={`Beautiful ${collection.title.toLowerCase()} from our collection`}
                                                    className="w-100 h-100"
                                                    loading="lazy"
                                                    style={{
                                                        objectFit: 'cover',
                                                        transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                                    }}
                                                />

                                                {/* Overlay */}
                                                <div
                                                    className="vastra-card-overlay"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'linear-gradient(to top, rgba(128, 0, 32, 0.95), transparent)',
                                                        opacity: 0,
                                                        transition: 'opacity 0.4s ease',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'flex-end',
                                                        padding: '2rem'
                                                    }}
                                                >
                                                    <h4 className="fw-bold mb-2" style={{ color: 'var(--vastra-ivory)' }}>
                                                        {collection.title}
                                                    </h4>
                                                    <p className="mb-0" style={{ color: 'var(--vastra-beige)', fontSize: '0.95rem' }}>
                                                        {collection.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <CardBody className="text-center p-4" style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <div className="mb-3">
                                                    <img
                                                        src={collection.icon}
                                                        alt={`${collection.title} icon`}
                                                        style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                </div>
                                                <h4 className="fw-bold mb-2" style={{ color: 'var(--vastra-dark)' }}>
                                                    {collection.title}
                                                </h4>
                                                <p
                                                    className="mb-0"
                                                    style={{
                                                        color: 'var(--vastra-dark)',
                                                        opacity: 0.7,
                                                        fontSize: '1rem',
                                                        minHeight: '3em'
                                                    }}
                                                >
                                                    {collection.description}
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </motion.div>
                                </Col>
                            );
                        })}
                    </Row>
                </motion.div>
            </Container>
        </section >
    );
};

export default FeaturedCollections;