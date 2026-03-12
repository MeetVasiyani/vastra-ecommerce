import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StarRating from './StarRating';
import { createReview, updateReview } from '../../services/reviewService';

const ReviewForm = ({ productId, onReviewSubmitted, existingReview = null }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isEditing = !!existingReview;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (isEditing) {
                await updateReview(existingReview.id, { rating, comment });
                setSuccess('Review updated successfully!');
            } else {
                await createReview({ productId, rating, comment });
                setSuccess('Review submitted successfully!');
                setRating(0);
                setComment('');
            }

            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (err) {
            const msg = err.message || 'Something went wrong';
            if (msg.includes('already reviewed')) {
                setError('You have already reviewed this product.');
            } else {
                setError(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Not logged in
    if (!user) {
        return (
            <div className="review-form-login-prompt">
                <div
                    className="text-center p-4"
                    style={{
                        background: 'rgba(128, 0, 32, 0.04)',
                        borderRadius: '12px',
                        border: '1px dashed rgba(128, 0, 32, 0.15)',
                    }}
                >
                    <LogIn size={28} style={{ color: 'var(--vastra-maroon)', marginBottom: '12px' }} />
                    <p className="mb-3" style={{ color: 'var(--vastra-dark)', fontWeight: 500 }}>
                        Sign in to write a review
                    </p>
                    <button
                        className="btn btn-vastra-primary btn-sm"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="review-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h5 className="mb-3" style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}>
                {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h5>

            <form onSubmit={handleSubmit}>
                {/* Star Rating Selector */}
                <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--vastra-dark)', fontWeight: 500, fontSize: '0.95rem' }}>
                        Your Rating
                    </label>
                    <div>
                        <StarRating
                            rating={rating}
                            interactive={true}
                            onRatingChange={setRating}
                            size={28}
                        />
                    </div>
                </div>

                {/* Comment */}
                <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--vastra-dark)', fontWeight: 500, fontSize: '0.95rem' }}>
                        Your Review <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                    </label>
                    <textarea
                        className="form-control"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        maxLength={1000}
                        style={{
                            borderRadius: '10px',
                            border: '1px solid rgba(128, 0, 32, 0.15)',
                            resize: 'vertical',
                            fontSize: '0.95rem',
                        }}
                    />
                    <small style={{ color: 'var(--vastra-dark)', opacity: 0.5 }}>
                        {comment.length}/1000 characters
                    </small>
                </div>

                {/* Error */}
                {error && (
                    <div className="d-flex align-items-center gap-2 mb-3" style={{ color: '#dc3545', fontSize: '0.9rem' }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="d-flex align-items-center gap-2 mb-3" style={{ color: '#198754', fontSize: '0.9rem' }}>
                        ✓ {success}
                    </div>
                )}

                {/* Submit */}
                <motion.button
                    type="submit"
                    className="btn btn-vastra-primary"
                    disabled={isSubmitting || rating === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        borderRadius: '10px',
                        padding: '10px 24px',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={18} className="spinner" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            {isEditing ? 'Update Review' : 'Submit Review'}
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default ReviewForm;
