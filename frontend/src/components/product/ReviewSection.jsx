import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { fetchProductReviews } from '../../services/reviewService';
import './ReviewSection.css';

const ReviewSection = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    const pageSize = 5;

    const loadReviews = async (pageNum = 1, append = false) => {
        setIsLoading(true);
        try {
            const data = await fetchProductReviews(productId, pageNum, pageSize);
            if (append) {
                setReviews(prev => [...prev, ...data.items]);
            } else {
                setReviews(data.items);
            }
            setTotalCount(data.totalCount);
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRatingDistribution = async () => {
        try {
            const data = await fetchProductReviews(productId, 1, 100);
            const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            data.items.forEach(r => {
                if (dist[r.rating] !== undefined) dist[r.rating]++;
            });
            setRatingDistribution(dist);
        } catch (err) {
            console.error('Failed to load rating distribution:', err);
        }
    };

    useEffect(() => {
        if (productId) {
            loadReviews(1);
            loadRatingDistribution();
        }
    }, [productId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadReviews(nextPage, true);
    };

    const handleReviewSubmitted = () => {
        setPage(1);
        loadReviews(1);
        loadRatingDistribution();
        setEditingReview(null);
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        const formEl = document.querySelector('.review-form');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
    };

    const averageRating = totalCount > 0
        ? Object.entries(ratingDistribution).reduce((sum, [star, count]) => sum + star * count, 0) / Math.max(Object.values(ratingDistribution).reduce((a, b) => a + b, 0), 1)
        : 0;

    const hasMore = reviews.length < totalCount;
    const maxBarCount = Math.max(...Object.values(ratingDistribution), 1);

    return (
        <section className="review-section vastra-section" style={{ background: 'var(--vastra-ivory, #FFFEF7)' }}>
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-5"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p
                        className="text-uppercase mb-2"
                        style={{
                            letterSpacing: '3px',
                            fontSize: '0.9rem',
                            color: 'var(--vastra-maroon)',
                            fontWeight: 500,
                        }}
                    >
                        Customer Reviews
                    </p>
                    <h2
                        className="display-5 fw-bold mb-3"
                        style={{ color: 'var(--vastra-dark)' }}
                    >
                        What Our Customers Say
                    </h2>
                    <div className="vastra-divider" />
                </motion.div>

                {/* Ratings Summary + Form */}
                <div className="row g-4 mb-5">
                    {/* Left: Rating Summary */}
                    <div className="col-lg-5">
                        <motion.div
                            className="ratings-summary-card"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-center mb-4">
                                <div
                                    className="display-3 fw-bold"
                                    style={{ color: 'var(--vastra-dark)', lineHeight: 1 }}
                                >
                                    {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                                </div>
                                <div className="my-2">
                                    <StarRating rating={averageRating} size={22} />
                                </div>
                                <p style={{ color: 'var(--vastra-dark)', opacity: 0.6, fontSize: '0.9rem' }}>
                                    Based on {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
                                </p>
                            </div>

                            {/* Rating Bars */}
                            <div className="rating-bars">
                                {[5, 4, 3, 2, 1].map(star => (
                                    <div key={star} className="d-flex align-items-center gap-2 mb-2">
                                        <span style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: 'var(--vastra-dark)',
                                            width: '20px',
                                            textAlign: 'right',
                                        }}>
                                            {star}
                                        </span>
                                        <span style={{ color: 'var(--vastra-gold)', fontSize: '0.9rem' }}>★</span>
                                        <div
                                            className="rating-bar-track"
                                            style={{
                                                flex: 1,
                                                height: '8px',
                                                borderRadius: '4px',
                                                background: 'rgba(128, 0, 32, 0.06)',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <motion.div
                                                className="rating-bar-fill"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${(ratingDistribution[star] / maxBarCount) * 100}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                                                style={{
                                                    height: '100%',
                                                    borderRadius: '4px',
                                                    background: 'linear-gradient(90deg, var(--vastra-maroon), var(--vastra-gold))',
                                                }}
                                            />
                                        </div>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--vastra-dark)',
                                            opacity: 0.5,
                                            width: '28px',
                                            textAlign: 'right',
                                        }}>
                                            {ratingDistribution[star]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Review Form */}
                    <div className="col-lg-7">
                        <motion.div
                            className="review-form-card"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <ReviewForm
                                productId={productId}
                                onReviewSubmitted={handleReviewSubmitted}
                                existingReview={editingReview}
                            />
                            {editingReview && (
                                <button
                                    className="btn btn-sm mt-2"
                                    onClick={handleCancelEdit}
                                    style={{ color: 'var(--vastra-dark)', opacity: 0.6 }}
                                >
                                    Cancel Editing
                                </button>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Reviews List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <MessageSquare size={20} style={{ color: 'var(--vastra-maroon)' }} />
                        <h4 className="mb-0" style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}>
                            All Reviews
                        </h4>
                        {totalCount > 0 && (
                            <span
                                className="badge"
                                style={{
                                    background: 'var(--vastra-maroon)',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                }}
                            >
                                {totalCount}
                            </span>
                        )}
                    </div>

                    <ReviewList
                        reviews={reviews}
                        totalCount={totalCount}
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        onReviewDeleted={handleReviewSubmitted}
                        onEditReview={handleEditReview}
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default ReviewSection;
