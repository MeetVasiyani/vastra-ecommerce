import React, { useState, useEffect } from 'react';
import { getAllReviewsAsAdmin, deleteReviewAsAdmin } from '../../services/adminService';

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);
    const [pageSize, setPageSize] = useState(20);

    const loadReviews = async (page = 1, rating = '') => {
        setLoading(true);
        try {
            const data = await getAllReviewsAsAdmin(page, pageSize, rating);
            if (data.success && data.data) {
                setReviews(data.data.items || []);
                setTotalPages(Math.ceil((data.data.totalCount || 0) / pageSize) || 1);
                setCurrentPage(page);
            } else {
                setMessage({ type: 'error', text: 'Failed to load reviews from server.' });
            }
        } catch (err) {
            console.error('Failed to load reviews:', err);
            setMessage({ type: 'error', text: 'Failed to connect to the server.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews(currentPage, ratingFilter);
    }, [currentPage, ratingFilter, pageSize]);

    const handleRatingChange = (e) => {
        setRatingFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review? This cannot be undone.")) return;

        setActionLoading(reviewId);
        setMessage(null);

        const result = await deleteReviewAsAdmin(reviewId);
        if (result.success) {
            setMessage({ type: 'success', text: 'Review deleted successfully.' });
            await loadReviews(currentPage, ratingFilter);
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to delete review.' });
        }

        setActionLoading(null);
    };

    const renderStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Review Moderation</h2>
                    <p style={{ color: '#888', marginTop: '4px' }}>Manage customer reviews across all products</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div>
                        <select
                            value={ratingFilter}
                            onChange={handleRatingChange}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '10px 15px',
                    marginBottom: '15px',
                    borderRadius: '4px',
                    backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda',
                    color: message.type === 'error' ? '#721c24' : '#155724'
                }}>
                    {message.text}
                </div>
            )}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>User Name</th>
                            <th>Rating</th>
                            <th style={{ width: '35%' }}>Comment</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(review => {
                            const isActionLoading = actionLoading === review.id;
                            const formattedDate = new Date(review.date).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric'
                            });

                            return (
                                <tr key={review.id}>
                                    <td title={review.id}>{review.id}</td>
                                    <td style={{ fontWeight: 500 }}>
                                        <a href={`/product/${review.productId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                                            {review.productName || `Product #${review.productId}`}
                                        </a>
                                    </td>
                                    <td>
                                        <span title={`User ID: ${review.userId}`}>
                                            {review.userName || 'Unknown User'}
                                        </span>
                                    </td>
                                    <td style={{ color: '#ffc107', whiteSpace: 'nowrap' }}>
                                        {renderStars(review.rating)}
                                    </td>
                                    <td>
                                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', maxHeight: '60px', overflowY: 'auto' }}>
                                            {review.comment}
                                        </p>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#666' }}>{formattedDate}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            disabled={isActionLoading}
                                            style={{
                                                padding: '4px 8px', fontSize: '12px', cursor: 'pointer',
                                                backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px'
                                            }}
                                        >
                                            {isActionLoading ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {loading && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner-border" role="status" style={{ color: 'var(--vastra-maroon)' }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && reviews.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                    No reviews found for the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '20px' }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '6px 12px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Prev
                    </button>
                    <span style={{ padding: '6px 12px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '6px 12px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminReviewsPage;
