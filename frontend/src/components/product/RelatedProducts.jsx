import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col } from 'react-bootstrap';
import ProductCard from '../shop/ProductCard';
import { fetchProducts } from '../../services/api';

const RelatedProducts = ({ categoryId, currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRelatedProducts = async () => {
            if (!categoryId) return;

            setIsLoading(true);
            try {
                const data = await fetchProducts({
                    categoryId,
                    pageSize: 4,
                    page: 1,
                });

                // Filter out current product
                const filtered = (data.items || []).filter(
                    (p) => p.id !== currentProductId
                ).slice(0, 4);

                setProducts(filtered);
            } catch (err) {
                console.error('Failed to load related products:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadRelatedProducts();
    }, [categoryId, currentProductId]);

    if (isLoading || products.length === 0) return null;

    return (
        <section
            className="related-products vastra-section"
            style={{
                background: 'var(--vastra-beige)',
            }}
        >
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-5"
                >
                    <p
                        className="text-uppercase mb-2"
                        style={{
                            letterSpacing: '4px',
                            fontSize: '0.9rem',
                            color: 'var(--vastra-maroon)',
                            fontWeight: 500,
                        }}
                    >
                        You May Also Like
                    </p>
                    <h2
                        className="mb-3"
                        style={{
                            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                            fontWeight: 600,
                            color: 'var(--vastra-dark)',
                        }}
                    >
                        Related Products
                    </h2>
                    <div className="vastra-divider" />
                </motion.div>

                <Row className="g-4">
                    {products.map((product, index) => (
                        <Col key={product.id} xs={12} sm={6} lg={3}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default RelatedProducts;
