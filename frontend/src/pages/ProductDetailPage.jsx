import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductHeader from '../components/product/ProductHeader';
import ProductImageGallery from '../components/product/ProductImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import RelatedProducts from '../components/product/RelatedProducts';
import ReviewSection from '../components/product/ReviewSection';
import { fetchProductById } from '../services/api';

const SkeletonBox = ({ width = '100%', height = '40px', borderRadius = '8px', className = '' }) => (
    <div
        className={`skeleton-shimmer ${className}`}
        style={{
            width,
            height,
            background: 'var(--vastra-beige)',
            borderRadius
        }}
    />
);

const ProductDetailSkeleton = () => (
    <div className="product-detail-skeleton">
        <Container className="py-5">
            <Row className="g-5">
                <Col lg={6}>
                    <SkeletonBox height="600px" borderRadius="16px" />
                    <div className="d-flex gap-2 mt-3">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonBox key={i} width="80px" height="100px" borderRadius="10px" />
                        ))}
                    </div>
                </Col>
                <Col lg={6}>
                    <SkeletonBox width="70%" height="40px" className="mb-3" />
                    <SkeletonBox width="30%" height="20px" className="mb-4" />
                    <SkeletonBox width="25%" height="35px" className="mb-4" />
                    <SkeletonBox width="100%" height="100px" className="mb-4" />
                    <div className="d-flex gap-2 mb-4">
                        {[1, 2, 3].map((i) => (
                            <SkeletonBox key={i} width="40px" height="40px" borderRadius="50%" />
                        ))}
                    </div>
                    <div className="d-flex gap-2 mb-4">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonBox key={i} width="50px" height="50px" borderRadius="8px" />
                        ))}
                    </div>
                    <SkeletonBox width="100%" height="55px" borderRadius="8px" />
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [id]);

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
            <Navbar />

            <ProductHeader
                productName={product?.name || 'Loading...'}
                categoryName={product?.category?.name}
            />

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
                            <Col lg={6}>
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <ProductImageGallery images={product?.images || []} />
                                </motion.div>
                            </Col>

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

            {!isLoading && product && (
                <RelatedProducts
                    categoryId={product?.category?.id}
                    currentProductId={product?.id}
                />
            )}

            {!isLoading && product && (
                <ReviewSection productId={product.id} />
            )}

            <Footer />
        </div>
    );
};

export default ProductDetailPage;
