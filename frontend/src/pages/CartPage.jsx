import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import PageHeaderLayout from '../components/layout/PageHeaderLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../services/api';

const EmptyCart = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-5"
    >
        <div
            className="d-inline-flex align-items-center justify-content-center mb-4"
            style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
            }}
        >
            <ShoppingBag size={48} style={{ color: 'var(--vastra-maroon)' }} />
        </div>
        <h2
            className="mb-3"
            style={{
                fontFamily: 'EB Garamond, serif',
                color: 'var(--vastra-dark)',
                fontSize: '2rem'
            }}
        >
            Your Cart is Empty
        </h2>
        <p
            className="mb-4"
            style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}
        >
            Discover our exquisite collection of traditional Indian wear
        </p>
        <Link to="/shop" className="btn btn-vastra-primary">
            <ArrowLeft size={18} className="me-2" />
            Continue Shopping
        </Link>
    </motion.div>
);

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove, isUpdating }) => {
    const imageUrl = getImageUrl(item.imageUrl);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="cart-item d-flex gap-4 p-4 mb-3 position-relative"
            style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(128, 0, 32, 0.06)',
                border: '1px solid rgba(128, 0, 32, 0.08)'
            }}
        >
            {/* Remove Button - Top Right */}
            <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(220, 53, 69, 0.15)' }}
                whileTap={{ scale: 0.95 }}
                className="border-0 d-flex align-items-center justify-content-center position-absolute"
                onClick={() => onRemove(item.id)}
                disabled={isUpdating}
                style={{
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    background: 'rgba(220, 53, 69, 0.08)',
                    color: '#dc3545',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 1
                }}
                title="Remove item"
            >
                <Trash2 size={16} />
            </motion.button>

            {/* Product Image */}
            <Link to={`/product/${item.productId}`}>
                <div
                    className="cart-item-image"
                    style={{
                        width: '120px',
                        height: '150px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={item.productName}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        }}
                    />
                </div>
            </Link>

            {/* Product Details */}
            <div className="flex-grow-1 d-flex flex-column justify-content-between" style={{ paddingRight: '30px' }}>
                <div>
                    <Link
                        to={`/product/${item.productId}`}
                        className="text-decoration-none"
                    >
                        <h5
                            className="mb-1"
                            style={{
                                fontFamily: 'EB Garamond, serif',
                                color: 'var(--vastra-dark)',
                                fontSize: '1.2rem',
                                transition: 'color 0.3s ease'
                            }}
                        >
                            {item.productName}
                        </h5>
                    </Link>
                    <p
                        className="mb-0"
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--vastra-dark)',
                            opacity: 0.7
                        }}
                    >
                        {item.color} • Size: {item.size}
                    </p>
                    <p
                        className="mb-0 mt-2"
                        style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: 'var(--vastra-maroon)',
                            fontFamily: 'EB Garamond, serif'
                        }}
                    >
                        {formatPrice(item.price)}
                    </p>
                </div>

                {/* Quantity Controls */}
                <div className="d-flex align-items-center mt-3">
                    <div className="d-flex align-items-center gap-0">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-0 d-flex align-items-center justify-content-center"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            style={{
                                width: '36px',
                                height: '36px',
                                background: 'var(--vastra-beige)',
                                borderRadius: '8px 0 0 8px',
                                cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                opacity: item.quantity <= 1 ? 0.5 : 1
                            }}
                        >
                            <Minus size={16} />
                        </motion.button>
                        <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                                width: '45px',
                                height: '36px',
                                background: 'var(--vastra-beige)',
                                fontFamily: 'EB Garamond, serif',
                                fontSize: '1rem',
                                fontWeight: 500
                            }}
                        >
                            {item.quantity}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-0 d-flex align-items-center justify-content-center"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                            style={{
                                width: '36px',
                                height: '36px',
                                background: 'var(--vastra-beige)',
                                borderRadius: '0 8px 8px 0',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={16} />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Item Total (Desktop) */}
            <div
                className="d-none d-md-flex flex-column align-items-end justify-content-center"
                style={{ minWidth: '120px' }}
            >
                <span
                    style={{
                        fontSize: '0.8rem',
                        color: 'var(--vastra-dark)',
                        opacity: 0.7,
                        marginBottom: '4px'
                    }}
                >
                    Item Total
                </span>
                <span
                    style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: 'var(--vastra-maroon)',
                        fontFamily: 'EB Garamond, serif'
                    }}
                >
                    {formatPrice(item.price * item.quantity)}
                </span>
            </div>
        </motion.div>
    );
};

const CartSummary = ({ totalAmount, itemCount, onProceedToCheckout }) => {
    const { applyCoupon, removeCoupon, appliedCoupon, discountAmount, finalTotal, isCouponLoading } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setCouponError('');
        const result = await applyCoupon(couponCode.trim());

        if (!result.success) {
            setCouponError(result.error || 'Invalid coupon code');
        } else {
            setCouponCode('');
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponCode('');
        setCouponError('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cart-summary p-4"
            style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(128, 0, 32, 0.06)',
                border: '1px solid rgba(128, 0, 32, 0.08)',
                position: 'sticky',
                top: '100px'
            }}
        >
            <h4
                className="mb-4"
                style={{
                    fontFamily: 'EB Garamond, serif',
                    color: 'var(--vastra-dark)',
                    fontSize: '1.5rem',
                    fontWeight: 600
                }}
            >
                Order Summary
            </h4>

            {/* Coupon Section */}
            <div className="mb-4">
                <label
                    className="mb-2 d-block"
                    style={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: 'var(--vastra-dark)'
                    }}
                >
                    Have a coupon?
                </label>

                {!appliedCoupon ? (
                    <>
                        <div className="d-flex gap-2 mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => {
                                    setCouponCode(e.target.value.toUpperCase());
                                    setCouponError('');
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                disabled={isCouponLoading}
                                style={{
                                    borderRadius: '10px',
                                    border: `1px solid ${couponError ? '#dc3545' : 'rgba(128, 0, 32, 0.2)'}`,
                                    padding: '10px 14px',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn"
                                onClick={handleApplyCoupon}
                                disabled={isCouponLoading || !couponCode.trim()}
                                style={{
                                    background: 'var(--vastra-maroon)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px 20px',
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {isCouponLoading ? 'Applying...' : 'Apply'}
                            </motion.button>
                        </div>
                        {couponError && (
                            <p className="mb-0" style={{ fontSize: '0.8rem', color: '#dc3545' }}>
                                {couponError}
                            </p>
                        )}
                    </>
                ) : (
                    <div
                        className="d-flex align-items-center justify-content-between p-3"
                        style={{
                            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.08) 0%, rgba(40, 167, 69, 0.03) 100%)',
                            borderRadius: '10px',
                            border: '1px solid rgba(40, 167, 69, 0.2)'
                        }}
                    >
                        <div>
                            <p className="mb-0" style={{ fontSize: '0.85rem', color: '#28a745', fontWeight: 600 }}>
                                ✓ {appliedCoupon.code}
                            </p>
                            <p className="mb-0" style={{ fontSize: '0.75rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                Coupon applied
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-sm"
                            onClick={handleRemoveCoupon}
                            style={{
                                background: 'rgba(220, 53, 69, 0.1)',
                                color: '#dc3545',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '0.8rem'
                            }}
                        >
                            Remove
                        </motion.button>
                    </div>
                )}
            </div>

            <hr style={{ borderColor: 'rgba(128, 0, 32, 0.1)' }} />

            <div className="d-flex justify-content-between mb-3">
                <span style={{ color: 'var(--vastra-dark)', opacity: 0.8 }}>
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
                <span style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>
                    {formatPrice(totalAmount)}
                </span>
            </div>

            {discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-3">
                    <span style={{ color: '#28a745', fontWeight: 500 }}>
                        Discount ({appliedCoupon?.code})
                    </span>
                    <span style={{ fontWeight: 500, color: '#28a745' }}>
                        -{formatPrice(discountAmount)}
                    </span>
                </div>
            )}

            <div className="d-flex justify-content-between mb-3">
                <span style={{ color: 'var(--vastra-dark)', opacity: 0.8 }}>
                    Shipping
                </span>
                <span style={{ fontWeight: 500, color: 'var(--vastra-maroon)' }}>
                    FREE
                </span>
            </div>

            <hr style={{ borderColor: 'rgba(128, 0, 32, 0.1)' }} />

            <div className="d-flex justify-content-between mb-4">
                <span
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--vastra-dark)'
                    }}
                >
                    Total
                </span>
                <span
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: 'var(--vastra-maroon)',
                        fontFamily: 'EB Garamond, serif'
                    }}
                >
                    {formatPrice(discountAmount > 0 ? finalTotal : totalAmount)}
                </span>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-vastra-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={onProceedToCheckout}
                style={{ height: '55px' }}
            >
                Proceed to Checkout
                <ArrowRight size={18} />
            </motion.button>

            <Link
                to="/shop"
                className="d-block text-center mt-3 text-decoration-none"
                style={{
                    color: 'var(--vastra-maroon)',
                    fontSize: '0.95rem'
                }}
            >
                <ArrowLeft size={16} className="me-1" />
                Continue Shopping
            </Link>

            {/* Trust Indicators */}
            <div
                className="mt-4 pt-4 text-center"
                style={{ borderTop: '1px solid rgba(128, 0, 32, 0.1)' }}
            >
                <p
                    className="mb-2"
                    style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.7 }}
                >
                    ✓ Free shipping on all orders
                </p>
                <p
                    className="mb-2"
                    style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.7 }}
                >
                    ✓ Secure payment
                </p>
                <p
                    className="mb-0"
                    style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.7 }}
                >
                    ✓ Easy returns within 30 days
                </p>
            </div>
        </motion.div>
    );
};

const CartPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const {
        items,
        itemCount,
        totalAmount,
        isLoading,
        updateCartItem,
        removeFromCart
    } = useCart();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/cart' } });
        }
    }, [isAuthenticated, navigate]);

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        await updateCartItem(cartItemId, newQuantity);
    };

    const handleRemoveItem = async (itemId) => {
        await removeFromCart(itemId);
    };

    const handleProceedToCheckout = () => {
        navigate('/checkout');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <PageHeaderLayout
            title="Shopping Cart"
            subtitle={`${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`}
        >
            <Container>
                {isLoading && items.length === 0 ? (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border"
                            role="status"
                            style={{ color: 'var(--vastra-maroon)' }}
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <Row className="g-4">
                        {/* Cart Items */}
                        <Col lg={8}>
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                        isUpdating={isLoading}
                                    />
                                ))}
                            </AnimatePresence>
                        </Col>

                        {/* Cart Summary */}
                        <Col lg={4}>
                            <CartSummary
                                totalAmount={totalAmount}
                                itemCount={itemCount}
                                onProceedToCheckout={handleProceedToCheckout}
                            />
                        </Col>
                    </Row>
                )}
            </Container>
        </PageHeaderLayout>
    );
};

export default CartPage;
