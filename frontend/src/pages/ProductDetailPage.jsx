import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ProductHeader from '../components/product/ProductHeader';
import ProductImageGallery from '../components/product/ProductImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import RelatedProducts from '../components/product/RelatedProducts';
import { fetchProductById } from '../services/api';

// Loading Skeleton
const ProductDetailSkeleton = () => (
    <div className="product-detail-skeleton">
        <Container className="py-5">
            <Row className="g-5">
                <Col lg={6}>
                    <div
                        className="skeleton-shimmer"
                        style={{
                            height: '600px',
                            background: 'var(--vastra-beige)',
                            borderRadius: '16px',
                        }}
                    />
                    <div className="d-flex gap-2 mt-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="skeleton-shimmer"
                                style={{
                                    width: '80px',
                                    height: '100px',
                                    background: 'var(--vastra-beige)',
                                    borderRadius: '10px',
                                }}
                            />
                        ))}
                    </div>
                </Col>
                <Col lg={6}>
                    <div
                        className="skeleton-shimmer mb-3"
                        style={{
                            height: '40px',
                            width: '70%',
                            background: 'var(--vastra-beige)',
                            borderRadius: '8px',
                        }}
                    />
                    <div
                        className="skeleton-shimmer mb-4"
                        style={{
                            height: '20px',
                            width: '30%',
                            background: 'var(--vastra-beige)',
                            borderRadius: '8px',
                        }}
                    />
                    <div
                        className="skeleton-shimmer mb-4"
                        style={{
                            height: '35px',
                            width: '25%',
                            background: 'var(--vastra-beige)',
                            borderRadius: '8px',
                        }}
                    />
                    <div
                        className="skeleton-shimmer mb-4"
                        style={{
                            height: '100px',
                            width: '100%',
                            background: 'var(--vastra-beige)',
                            borderRadius: '8px',
                        }}
                    />
                    <div className="d-flex gap-2 mb-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="skeleton-shimmer"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--vastra-beige)',
                                    borderRadius: '50%',
                                }}
                            />
                        ))}
                    </div>
                    <div className="d-flex gap-2 mb-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="skeleton-shimmer"
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'var(--vastra-beige)',
                                    borderRadius: '8px',
                                }}
                            />
                        ))}
                    </div>
                    <div
                        className="skeleton-shimmer"
                        style={{
                            height: '55px',
                            width: '100%',
                            background: 'var(--vastra-beige)',
                            borderRadius: '8px',
                        }}
                    />
                </Col>
            </Row>
        </Container>
    </div>
);

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await fetchProductById(id);
                setProduct(data);
            } catch (err) {
                console.error('Failed to load product:', err);
                setError('Failed to load product. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            loadProduct();
            // Scroll to top when product changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [id]);

    // Error state
    if (error) {
        return (
            <div className="product-detail-error">
                <Container className="py-5 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-5"
                    >
                        <h2
                            className="mb-3"
                            style={{ color: 'var(--vastra-dark)' }}
                        >
                            Oops! Something went wrong
                        </h2>
                        <p
                            className="mb-4"
                            style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}
                        >
                            {error}
                        </p>
                        <button
                            className="btn btn-vastra-primary"
                            onClick={() => navigate('/shop')}
                        >
                            <ArrowLeft size={18} className="me-2" />
                            Back to Shop
                        </button>
                    </motion.div>
                </Container>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            {/* Navigation */}
            <Navbar />

            {/* Header with Breadcrumb */}
            <ProductHeader
                productName={product?.name || 'Loading...'}
                categoryName={product?.category?.name}
            />

            {/* Main Content */}
            <section
                className="product-detail-content vastra-section bg-vastra-ivory"
                style={{
                    backgroundImage: `radial-gradient(circle at 10% 20%, rgba(128, 0, 32, 0.02) 0%, transparent 40%),
                                      radial-gradient(circle at 90% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 40%)`,
                }}
            >
                {isLoading ? (
                    <ProductDetailSkeleton />
                ) : (
                    <Container>
                        <Row className="g-5">
                            {/* Image Gallery */}
                            <Col lg={6}>
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <ProductImageGallery images={product?.images || []} />
                                </motion.div>
                            </Col>

                            {/* Product Info */}
                            <Col lg={6}>
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    <ProductInfo product={product} />
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                )}
            </section>

            {/* Related Products */}
            {!isLoading && product && (
                <RelatedProducts
                    categoryId={product?.category?.id}
                    currentProductId={product?.id}
                />
            )}
        </div>
    );
};

export default ProductDetailPage;
