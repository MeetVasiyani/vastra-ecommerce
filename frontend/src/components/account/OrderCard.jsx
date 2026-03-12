import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, ChevronDown, X, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../services/api';

const OrderCard = ({ order, onCancel, isCancelling }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return '#28a745';
            case 'shipped': return '#17a2b8';
            case 'processing': return '#ffc107';
            case 'cancelled': return '#dc3545';
            default: return 'var(--vastra-maroon)';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return '#28a745';
            case 'pending': return '#ffc107';
            case 'failed': return '#dc3545';
            case 'cancelled': return '#dc3545';
            default: return 'var(--vastra-dark)';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isPending = order.status?.toLowerCase() === 'pending';

    const handleCancelClick = (e) => {
        e.stopPropagation();
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = async () => {
        setShowCancelConfirm(false);
        if (onCancel) {
            await onCancel(order.id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
            style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid rgba(128, 0, 32, 0.08)',
                boxShadow: '0 4px 15px rgba(128, 0, 32, 0.04)',
                overflow: 'hidden'
            }}
        >
            {/* Order Header */}
            <div
                className="p-4"
                style={{
                    background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.03) 0%, rgba(212, 175, 55, 0.02) 100%)',
                    cursor: 'pointer'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <Package size={18} style={{ color: 'var(--vastra-maroon)' }} />
                            <span style={{ fontWeight: 600, color: 'var(--vastra-dark)', fontFamily: 'EB Garamond, serif' }}>
                                Order #{order.id}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                <Calendar size={14} />
                                {formatDate(order.orderDate)}
                            </span>
                            <span
                                className="px-2 py-1"
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: getStatusColor(order.status),
                                    background: `${getStatusColor(order.status)}15`,
                                    borderRadius: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {order.status}
                            </span>
                            <span
                                className="px-2 py-1"
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: getPaymentStatusColor(order.paymentStatus),
                                    background: `${getPaymentStatusColor(order.paymentStatus)}15`,
                                    borderRadius: '6px'
                                }}
                            >
                                {order.paymentStatus}
                            </span>
                        </div>
                    </div>
                    <div className="text-end">
                        <p
                            className="mb-1"
                            style={{
                                fontWeight: 600,
                                color: 'var(--vastra-maroon)',
                                fontSize: '1.2rem',
                                fontFamily: 'EB Garamond, serif'
                            }}
                        >
                            {formatPrice(order.totalAmount)}
                        </p>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={20} style={{ color: 'var(--vastra-maroon)' }} />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Order Items (Expandable) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                    >
                        <div style={{ borderTop: '1px solid rgba(128, 0, 32, 0.08)', paddingTop: '1rem' }}>
                            <h6 className="mb-3" style={{ color: 'var(--vastra-dark)', fontWeight: 600, fontSize: '0.9rem' }}>
                                Order Items ({order.items?.length || 0})
                            </h6>
                            {order.items?.map((item, index) => (
                                <div
                                    key={item.id || index}
                                    className="d-flex justify-content-between align-items-center py-2"
                                    style={{
                                        borderBottom: index < order.items.length - 1 ? '1px solid rgba(128, 0, 32, 0.05)' : 'none'
                                    }}
                                >
                                    <div>
                                        <p className="mb-0" style={{ fontWeight: 500, color: 'var(--vastra-dark)', fontSize: '0.95rem' }}>
                                            {item.productName}
                                        </p>
                                        <p className="mb-0" style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.6 }}>
                                            {item.variantSku && `SKU: ${item.variantSku} • `}Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <span style={{ fontWeight: 500, color: 'var(--vastra-maroon)', fontFamily: 'EB Garamond, serif' }}>
                                        {formatPrice(item.unitPrice * item.quantity)}
                                    </span>
                                </div>
                            ))}

                            {/* Cancel Order Button - Only for Pending Orders */}
                            {isPending && (
                                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(128, 0, 32, 0.08)' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleCancelClick}
                                        disabled={isCancelling}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #dc3545',
                                            color: '#dc3545',
                                            borderRadius: '10px',
                                            padding: '10px 20px',
                                            fontWeight: 500,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {isCancelling ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm" role="status" />
                                                <span>Cancelling...</span>
                                            </>
                                        ) : (
                                            <>
                                                <X size={18} />
                                                <span>Cancel Order</span>
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9999
                        }}
                        onClick={() => setShowCancelConfirm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-4"
                            style={{
                                background: '#fff',
                                borderRadius: '16px',
                                maxWidth: '400px',
                                width: '90%',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <AlertCircle size={24} style={{ color: '#dc3545' }} />
                                <h5 className="mb-0" style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}>
                                    Cancel Order?
                                </h5>
                            </div>
                            <p style={{ color: 'var(--vastra-dark)', opacity: 0.8 }}>
                                Are you sure you want to cancel Order #{order.id}? This action cannot be undone.
                            </p>
                            <div className="d-flex gap-2 mt-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn flex-grow-1"
                                    onClick={handleConfirmCancel}
                                    style={{
                                        background: '#dc3545',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '10px 20px',
                                        fontWeight: 500
                                    }}
                                >
                                    Yes, Cancel Order
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn flex-grow-1"
                                    onClick={() => setShowCancelConfirm(false)}
                                    style={{
                                        background: 'transparent',
                                        color: 'var(--vastra-dark)',
                                        border: '1px solid rgba(128, 0, 32, 0.3)',
                                        borderRadius: '10px',
                                        padding: '10px 20px',
                                        fontWeight: 500
                                    }}
                                >
                                    Keep Order
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OrderCard;
