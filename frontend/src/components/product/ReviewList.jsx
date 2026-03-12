import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, Loader2, User } from 'lucide-react';
import StarRating from './StarRating';
import { useAuth } from '../../context/AuthContext';
import { deleteReview } from '../../services/reviewService';

const ReviewList = ({ reviews, totalCount, onLoadMore, hasMore, isLoading, onReviewDeleted, onEditReview }) => {
    const { user } = useAuth();
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        setDeletingId(reviewId);
        try {
            await deleteReview(reviewId);
            if (onReviewDeleted) onReviewDeleted();
        } catch (err) {
            console.error('Failed to delete review:', err);
            alert('Failed to delete review. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div className="review-list-empty text-center py-4">
                <p style={{ color: 'var(--vastra-dark)', opacity: 0.6, fontSize: '1rem' }}>
                    No reviews yet. Be the first to share your experience!
                </p>
            </div>
        );
    }

    return (
        <div className="review-list">
            <AnimatePresence>
                {reviews.map((review, index) => {
                    const isOwner = user && review.userId === user.id;

                    return (
                        <motion.div
                            key={review.id}
                            className="review-card"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            style={{
                                padding: '20px',
                                borderRadius: '12px',
                                background: 'rgba(128, 0, 32, 0.02)',
                                border: '1px solid rgba(128, 0, 32, 0.08)',
                                marginBottom: '16px',
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="d-flex gap-3 align-items-start">
                                    {/* Avatar */}
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--vastra-maroon), var(--vastra-gold))',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {getInitials(review.userName)}
                                    </div>

                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <span style={{ fontWeight: 600, color: 'var(--vastra-dark)', fontSize: '0.95rem' }}>
                                                {review.userName || 'Anonymous'}
                                            </span>
                                            {isOwner && (
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: 'rgba(128, 0, 32, 0.1)',
                                                        color: 'var(--vastra-maroon)',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <StarRating rating={review.rating} size={14} />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.5 }}>
                                                {formatDate(review.date)}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="mb-0" style={{
                                                color: 'var(--vastra-dark)',
                                                opacity: 0.85,
                                                fontSize: '0.95rem',
                                                lineHeight: 1.6,
                                            }}>
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Owner actions */}
                                {isOwner && (
                                    <div className="d-flex gap-1">
                                        <button
                                            className="btn btn-sm p-1"
                                            onClick={() => onEditReview && onEditReview(review)}
                                            title="Edit review"
                                            style={{ color: 'var(--vastra-dark)', opacity: 0.5 }}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm p-1"
                                            onClick={() => handleDelete(review.id)}
                                            disabled={deletingId === review.id}
                                            title="Delete review"
                                            style={{ color: '#dc3545', opacity: 0.6 }}
                                        >
                                            {deletingId === review.id ? (
                                                <Loader2 size={16} className="spinner" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
                <div className="text-center mt-3">
                    <motion.button
                        className="btn"
                        onClick={onLoadMore}
                        disabled={isLoading}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            borderRadius: '10px',
                            padding: '10px 32px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            border: '1px solid var(--vastra-maroon)',
                            color: 'var(--vastra-maroon)',
                            background: 'transparent',
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="spinner me-2" />
                                Loading...
                            </>
                        ) : (
                            `Show More Reviews (${reviews.length} of ${totalCount})`
                        )}
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
