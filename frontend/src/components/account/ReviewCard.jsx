import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Edit, Trash2, AlertCircle } from 'lucide-react';
import { StarDisplay, StarSelector } from './StarComponents';

const ReviewCard = ({ review, onEdit, onDelete, isDeleting, isSaving, isEditing, onSave, onCancelEdit }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editRating, setEditRating] = useState(review.rating || 0);
    const [editComment, setEditComment] = useState(review.comment || '');

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-3"
            style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid rgba(128, 0, 32, 0.08)',
                boxShadow: '0 4px 15px rgba(128, 0, 32, 0.04)',
                overflow: 'hidden'
            }}
        >
            {/* Card Header */}
            <div className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 me-3">
                        <p
                            className="mb-1"
                            style={{
                                fontWeight: 600,
                                color: 'var(--vastra-dark)',
                                fontFamily: 'EB Garamond, serif',
                                fontSize: '1.05rem'
                            }}
                        >
                            {review.productName || 'Product'}
                        </p>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <StarDisplay rating={review.rating} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.6 }}>
                                <Calendar size={12} className="me-1" />
                                {formatDate(review.createdAt)}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex gap-1 flex-shrink-0">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="btn btn-link p-2"
                            onClick={() => { onEdit(review); setEditRating(review.rating); setEditComment(review.comment || ''); }}
                            title="Edit review"
                            style={{ color: 'var(--vastra-maroon)' }}
                            disabled={isSaving || isDeleting}
                        >
                            <Edit size={16} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="btn btn-link p-2"
                            onClick={() => setShowDeleteConfirm(true)}
                            title="Delete review"
                            style={{ color: '#dc3545' }}
                            disabled={isSaving || isDeleting}
                        >
                            {isDeleting ? (
                                <div className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                        </motion.button>
                    </div>
                </div>

                {review.comment && !isEditing && (
                    <p
                        className="mb-0 mt-2"
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--vastra-dark)',
                            opacity: 0.75,
                            fontStyle: 'italic',
                            lineHeight: 1.6
                        }}
                    >
                        "{review.comment}"
                    </p>
                )}
            </div>

            {/* Inline Edit Form */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                        style={{ borderTop: '1px solid rgba(128, 0, 32, 0.08)' }}
                    >
                        <p className="mb-2 mt-3" style={{ fontWeight: 600, color: 'var(--vastra-dark)', fontSize: '0.9rem' }}>
                            Edit Your Review
                        </p>
                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>Rating</label>
                            <StarSelector rating={editRating} onRatingChange={setEditRating} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>Comment <span style={{ fontWeight: 400 }}>(optional)</span></label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                placeholder="Share your experience..."
                                maxLength={1000}
                                style={{
                                    borderRadius: '10px',
                                    border: '1px solid rgba(128, 0, 32, 0.15)',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                            <small style={{ color: 'var(--vastra-dark)', opacity: 0.5 }}>{editComment.length}/1000</small>
                        </div>
                        <div className="d-flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-vastra-primary"
                                onClick={() => onSave(review.id, { rating: editRating, comment: editComment })}
                                disabled={isSaving || editRating === 0}
                                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn"
                                onClick={onCancelEdit}
                                disabled={isSaving}
                                style={{
                                    border: '1px solid rgba(128, 0, 32, 0.3)',
                                    color: 'var(--vastra-dark)',
                                    padding: '8px 20px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-4"
                            style={{
                                background: '#fff',
                                borderRadius: '16px',
                                maxWidth: '380px',
                                width: '90%',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <AlertCircle size={22} style={{ color: '#dc3545' }} />
                                <h5 className="mb-0" style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}>Delete Review?</h5>
                            </div>
                            <p style={{ color: 'var(--vastra-dark)', opacity: 0.8, fontSize: '0.9rem' }}>
                                Are you sure you want to delete your review for <strong>{review.productName}</strong>? This cannot be undone.
                            </p>
                            <div className="d-flex gap-2 mt-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn flex-grow-1"
                                    onClick={() => { setShowDeleteConfirm(false); onDelete(review.id); }}
                                    style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 500 }}
                                >
                                    Yes, Delete
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn flex-grow-1"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    style={{ border: '1px solid rgba(128,0,32,0.3)', color: 'var(--vastra-dark)', borderRadius: '10px', fontWeight: 500 }}
                                >
                                    Keep It
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ReviewCard;
