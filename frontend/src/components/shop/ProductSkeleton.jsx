import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-image skeleton-shimmer" />
        <div className="skeleton-body p-3">
            <div className="skeleton-title skeleton-shimmer mx-auto" />
            <div className="skeleton-price skeleton-shimmer mx-auto" />
        </div>
    </div>
);

const ProductSkeleton = ({ count = 8 }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Row className="g-4">
                {Array.from({ length: count }).map((_, index) => (
                    <Col key={index} xs={12} sm={6} lg={4} xl={3}>
                        <SkeletonCard />
                    </Col>
                ))}
            </Row>
        </motion.div>
    );
};

export default ProductSkeleton;
