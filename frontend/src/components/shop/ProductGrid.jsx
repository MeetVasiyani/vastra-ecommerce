import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const ProductGrid = ({ products }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Row className="g-4">
                {products.map((product) => (
                    <Col key={product.id} xs={12} sm={6} lg={4} xl={3}>
                        <motion.div variants={itemVariants}>
                            <ProductCard product={product} />
                        </motion.div>
                    </Col>
                ))}
            </Row>
        </motion.div>
    );
};

export default ProductGrid;
