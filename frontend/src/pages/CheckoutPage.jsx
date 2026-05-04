import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle2, AlertCircle, Plus, ShoppingBag } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl, verifyPayment } from '../services/api';
import { fetchUserProfile, addUserAddress } from '../services/authService';
import { createOrder } from '../services/orderService';

const PAYMENT_METHODS = [
    { id: 'COD', label: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive your order' },
    { id: 'Credit Card', label: 'Credit Card', icon: '💳', description: 'Visa, Mastercard, American Express' },
    { id: 'Debit Card', label: 'Debit Card', icon: '💳', description: 'All major debit cards accepted' },
    { id: 'UPI', label: 'UPI', icon: '📱', description: 'Google Pay, PhonePe, Paytm' }
];

const EmptyCartMessage = () => (
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
        <p className="mb-4" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
            Add some items to your cart before checkout
        </p>
        <Link to="/shop" className="btn btn-vastra-primary">
            <ArrowLeft size={18} className="me-2" />
            Continue Shopping
        </Link>
    </motion.div>
);

const AddressCard = ({ address, isSelected, onSelect }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(address)}
        className="p-3 mb-2"
        style={{
            background: isSelected ? 'linear-gradient(135deg, rgba(128, 0, 32, 0.08) 0%, rgba(212, 175, 55, 0.05) 100%)' : '#fff',
            borderRadius: '12px',
            border: isSelected ? '2px solid var(--vastra-maroon)' : '1px solid rgba(128, 0, 32, 0.15)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        }}
    >
        <div className="d-flex align-items-start gap-3">
            <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid var(--vastra-maroon)' : '2px solid rgba(128, 0, 32, 0.3)',
                    background: isSelected ? 'var(--vastra-maroon)' : 'transparent'
                }}
            >
                {isSelected && <CheckCircle2 size={14} color="#fff" />}
            </div>
            <div>
                <p className="mb-1" style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>
                    {address.street}
                </p>
                <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>
                    {address.city}, {address.state} - {address.zipCode}
                </p>
                <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>
                    {address.country}
                </p>
            </div>
        </div>
    </motion.div>
);

const NewAddressForm = ({ onAddAddress, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onAddAddress(formData);
        }
    };

    const inputStyle = {
        borderRadius: '10px',
        border: '1px solid rgba(128, 0, 32, 0.2)',
        padding: '12px 16px',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease'
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 mb-3"
            style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid rgba(128, 0, 32, 0.15)'
            }}
        >
            <h6 className="mb-3" style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}>
                Add New Address
            </h6>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        name="street"
                        placeholder="Street Address"
                        value={formData.street}
                        onChange={handleChange}
                        style={inputStyle}
                        isInvalid={!!errors.street}
                    />
                    <Form.Control.Feedback type="invalid">{errors.street}</Form.Control.Feedback>
                </Form.Group>

                <Row className="g-3 mb-3">
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.city}
                        />
                        <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.state}
                        />
                        <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                    </Col>
                </Row>

                <Row className="g-3 mb-3">
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            name="zipCode"
                            placeholder="ZIP Code"
                            value={formData.zipCode}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.zipCode}
                        />
                        <Form.Control.Feedback type="invalid">{errors.zipCode}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={formData.country}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.country}
                        />
                        <Form.Control.Feedback type="invalid">{errors.country}</Form.Control.Feedback>
                    </Col>
                </Row>

                <div className="d-flex gap-2">
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-vastra-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Adding...' : 'Add Address'}
                    </motion.button>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn"
                        onClick={onCancel}
                        style={{
                            border: '1px solid rgba(128, 0, 32, 0.3)',
                            color: 'var(--vastra-dark)'
                        }}
                    >
                        Cancel
                    </motion.button>
                </div>
            </Form>
        </motion.div>
    );
};

const PaymentMethodCard = ({ method, isSelected, onSelect }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(method.id)}
        className="p-3 mb-2"
        style={{
            background: isSelected ? 'linear-gradient(135deg, rgba(128, 0, 32, 0.08) 0%, rgba(212, 175, 55, 0.05) 100%)' : '#fff',
            borderRadius: '12px',
            border: isSelected ? '2px solid var(--vastra-maroon)' : '1px solid rgba(128, 0, 32, 0.15)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        }}
    >
        <div className="d-flex align-items-center gap-3">
            <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid var(--vastra-maroon)' : '2px solid rgba(128, 0, 32, 0.3)',
                    background: isSelected ? 'var(--vastra-maroon)' : 'transparent'
                }}
            >
                {isSelected && <CheckCircle2 size={14} color="#fff" />}
            </div>
            <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
            <div>
                <p className="mb-0" style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>
                    {method.label}
                </p>
                <p className="mb-0" style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.6 }}>
                    {method.description}
                </p>
            </div>
        </div>
    </motion.div>
);

// Order Item Summary Component
const OrderItemSummary = ({ item }) => {
    const imageUrl = getImageUrl(item.imageUrl);

    return (
        <div className="d-flex gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(128, 0, 32, 0.08)' }}>
            <div
                style={{
                    width: '60px',
                    height: '75px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0
                }}
            >
                <img
                    src={imageUrl}
                    alt={item.productName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div className="flex-grow-1">
                <p className="mb-1" style={{ fontWeight: 500, color: 'var(--vastra-dark)', fontSize: '0.9rem' }}>
                    {item.productName}
                </p>
                <p className="mb-0" style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.6 }}>
                    {item.color} • Size: {item.size} • Qty: {item.quantity}
                </p>
            </div>
            <div className="text-end">
                <p className="mb-0" style={{ fontWeight: 600, color: 'var(--vastra-maroon)', fontFamily: 'EB Garamond, serif' }}>
                    {formatPrice(item.price * item.quantity)}
                </p>
            </div>
        </div>
    );
};

// Order Success Component
const OrderSuccess = ({ order }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-5"
    >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="d-inline-flex align-items-center justify-content-center mb-4"
            style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(40, 167, 69, 0.05) 100%)'
            }}
        >
            <CheckCircle2 size={48} color="#28a745" />
        </motion.div>

        <h2
            className="mb-3"
            style={{
                fontFamily: 'EB Garamond, serif',
                color: 'var(--vastra-dark)',
                fontSize: '2rem'
            }}
        >
            Order Placed Successfully!
        </h2>

        <p className="mb-2" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
            Thank you for your order. Your order ID is:
        </p>
        <p
            className="mb-4"
            style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--vastra-maroon)',
                fontFamily: 'EB Garamond, serif'
            }}
        >
            #{order.id}
        </p>

        <div
            className="p-4 mb-4 mx-auto"
            style={{
                maxWidth: '400px',
                background: 'rgba(128, 0, 32, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(128, 0, 32, 0.1)'
            }}
        >
            <div className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>Total Amount</span>
                <span style={{ fontWeight: 600, color: 'var(--vastra-maroon)' }}>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>Payment Status</span>
                <span style={{ fontWeight: 500, color: '#28a745' }}>{order.paymentStatus}</span>
            </div>
            <div className="d-flex justify-content-between">
                <span style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>Order Status</span>
                <span style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>{order.status}</span>
            </div>
        </div>

        <div className="d-flex gap-3 justify-content-center">
            <Link to="/shop" className="btn btn-vastra-primary">
                Continue Shopping
            </Link>
        </div>
    </motion.div>
);

// Main Checkout Page Component
const CheckoutPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { items, itemCount, totalAmount, appliedCoupon, discountAmount, finalTotal, loadCart } = useCart();

    // State - grouped by functionality
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(null);

    // Fetch user profile and addresses
    useEffect(() => {
        if (!isAuthenticated) return;

        const loadProfile = async () => {
            setIsLoadingProfile(true);
            const result = await fetchUserProfile();
            if (result.success && result.profile?.addresses) {
                setAddresses(result.profile.addresses);
                setSelectedAddress(result.profile.addresses[0]);
            } else if (!result.success) {
                setError(result.error || 'Failed to load addresses');
            }
            setIsLoadingProfile(false);
        };

        loadProfile();
    }, [isAuthenticated]);

    // Handle adding new address
    const handleAddAddress = async (addressData) => {
        setIsAddingAddress(true);
        setError('');
        const result = await addUserAddress(addressData);
        if (result.success && result.address) {
            setAddresses(prev => [...prev, result.address]);
            setSelectedAddress(result.address);
            setShowAddressForm(false);
        } else {
            setError(result.error || 'Failed to add address');
        }
        setIsAddingAddress(false);
    };

    const formatAddress = (addr) =>
        `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}, ${addr.country}`;

    const validateCheckout = () => {
        if (!selectedAddress) return 'Please select or add a delivery address';
        if (!selectedPaymentMethod) return 'Please select a payment method';
        if (items.length === 0) return 'Your cart is empty';
        return null;
    };


    const handlePaymentSuccess = async (response) => {
        try {
            const verifyResult = await verifyPayment({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
            });

            if (verifyResult.success) {
                setOrderSuccess({ ...orderSuccess, paymentStatus: 'Completed' });
                loadCart();
            } else {
                setError('Payment verification failed.');
            }
        } catch (err) {
            setError('Payment verification failed. Please contact support.');
            console.error(err);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const initRazorpay = (order, razorpayOrderId) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY,
            amount: Math.round(order.totalAmount * 100),
            currency: 'INR',
            name: 'Vastra',
            description: 'Order Payment',
            order_id: razorpayOrderId,
            handler: handlePaymentSuccess,
            prefill: {
                name: 'Customer Name',
                email: 'customer@example.com',
                contact: '9999999999'
            },
            theme: { color: '#800020' },
            modal: { ondismiss: () => setIsPlacingOrder(false) }
        };

        try {
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', (response) => {
                setError(`Payment Failed: ${response.error.description}`);
                setIsPlacingOrder(false);
            });
            rzp1.open();
        } catch (err) {
            setError('Failed to load payment gateway. Please check your internet connection.');
            setIsPlacingOrder(false);
        }
    };

    const handlePlaceOrder = async () => {
        const validationError = validateCheckout();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsPlacingOrder(true);

        try {
            const shippingAddress = formatAddress(selectedAddress);
            const couponId = appliedCoupon?.couponId || null;
            const result = await createOrder(shippingAddress, selectedPaymentMethod, couponId);

            if (!result.success || !result.order) {
                setError(result.error || 'Failed to place order. Please try again.');
                setIsPlacingOrder(false);
                return;
            }

            if (selectedPaymentMethod === 'COD' || !result.razorpayOrderId) {
                setOrderSuccess(result.order);
                loadCart();
            } else {
                initRazorpay(result.order, result.razorpayOrderId);
            }
        } finally {
            if (selectedPaymentMethod === 'COD') {
                setIsPlacingOrder(false);
            }
        }
    };

    if (!isAuthenticated) {
        navigate('/login', { state: { from: '/checkout' } });
        return null;
    }

    if (orderSuccess) {
        return (
            <div className="checkout-page">
                <Navbar />
                <section
                    className="py-5"
                    style={{
                        background: 'var(--vastra-ivory)',
                        minHeight: '100vh',
                        marginTop: '70px'
                    }}
                >
                    <Container style={{ maxWidth: '600px' }}>
                        <OrderSuccess order={orderSuccess} />
                    </Container>
                </section>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <Navbar />

            <section
                className="checkout-header py-5"
                style={{
                    background: 'linear-gradient(135deg, var(--vastra-ivory) 0%, var(--vastra-beige) 100%)',
                    marginTop: '70px',
                    borderBottom: '1px solid rgba(128, 0, 32, 0.08)'
                }}
            >
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Link
                            to="/cart"
                            className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none"
                            style={{ color: 'var(--vastra-maroon)' }}
                        >
                            <ArrowLeft size={18} />
                            Back to Cart
                        </Link>
                        <h1
                            className="mb-0"
                            style={{
                                fontFamily: 'EB Garamond, serif',
                                fontSize: 'clamp(2rem, 5vw, 3rem)',
                                color: 'var(--vastra-dark)',
                                fontWeight: 600
                            }}
                        >
                            Checkout
                        </h1>
                    </motion.div>
                </Container>
            </section>

            <section
                className="checkout-content py-5"
                style={{
                    background: 'var(--vastra-ivory)',
                    minHeight: '60vh'
                }}
            >
                <Container>
                    {items.length === 0 && !isLoadingProfile ? (
                        <EmptyCartMessage />
                    ) : (
                        <Row className="g-4">
                            <Col lg={7}>
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="alert d-flex align-items-center gap-2 mb-4"
                                            style={{
                                                background: 'rgba(220, 53, 69, 0.1)',
                                                border: '1px solid rgba(220, 53, 69, 0.2)',
                                                borderRadius: '12px',
                                                color: '#dc3545'
                                            }}
                                        >
                                            <AlertCircle size={20} />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 mb-4"
                                    style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        boxShadow: '0 4px 20px rgba(128, 0, 32, 0.06)',
                                        border: '1px solid rgba(128, 0, 32, 0.08)'
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-2 mb-4">
                                        <MapPin size={22} style={{ color: 'var(--vastra-maroon)' }} />
                                        <h4
                                            className="mb-0"
                                            style={{
                                                fontFamily: 'EB Garamond, serif',
                                                color: 'var(--vastra-dark)',
                                                fontSize: '1.3rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            Delivery Address
                                        </h4>
                                    </div>

                                    {isLoadingProfile ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border spinner-border-sm" style={{ color: 'var(--vastra-maroon)' }} />
                                            <p className="mt-2 mb-0" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                                Loading addresses...
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {addresses.length > 0 ? (
                                                addresses.map((address) => (
                                                    <AddressCard
                                                        key={address.id}
                                                        address={address}
                                                        isSelected={selectedAddress?.id === address.id}
                                                        onSelect={setSelectedAddress}
                                                    />
                                                ))
                                            ) : (
                                                <p className="mb-3" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                                    No saved addresses. Please add a new address.
                                                </p>
                                            )}

                                            <AnimatePresence>
                                                {showAddressForm && (
                                                    <NewAddressForm
                                                        onAddAddress={handleAddAddress}
                                                        onCancel={() => setShowAddressForm(false)}
                                                        isLoading={isAddingAddress}
                                                    />
                                                )}
                                            </AnimatePresence>

                                            {!showAddressForm && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="btn w-100 d-flex align-items-center justify-content-center gap-2 mt-3"
                                                    onClick={() => setShowAddressForm(true)}
                                                    style={{
                                                        border: '2px dashed rgba(128, 0, 32, 0.3)',
                                                        color: 'var(--vastra-maroon)',
                                                        borderRadius: '12px',
                                                        padding: '12px'
                                                    }}
                                                >
                                                    <Plus size={18} />
                                                    Add New Address
                                                </motion.button>
                                            )}
                                        </>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-4"
                                    style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        boxShadow: '0 4px 20px rgba(128, 0, 32, 0.06)',
                                        border: '1px solid rgba(128, 0, 32, 0.08)'
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-2 mb-4">
                                        <CreditCard size={22} style={{ color: 'var(--vastra-maroon)' }} />
                                        <h4
                                            className="mb-0"
                                            style={{
                                                fontFamily: 'EB Garamond, serif',
                                                color: 'var(--vastra-dark)',
                                                fontSize: '1.3rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            Payment Method
                                        </h4>
                                    </div>

                                    {PAYMENT_METHODS.map((method) => (
                                        <PaymentMethodCard
                                            key={method.id}
                                            method={method}
                                            isSelected={selectedPaymentMethod === method.id}
                                            onSelect={setSelectedPaymentMethod}
                                        />
                                    ))}
                                </motion.div>
                            </Col>

                            <Col lg={5}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-4"
                                    style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        boxShadow: '0 4px 20px rgba(128, 0, 32, 0.06)',
                                        border: '1px solid rgba(128, 0, 32, 0.08)',
                                        position: 'sticky',
                                        top: '100px'
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-2 mb-4">
                                        <ShoppingBag size={22} style={{ color: 'var(--vastra-maroon)' }} />
                                        <h4
                                            className="mb-0"
                                            style={{
                                                fontFamily: 'EB Garamond, serif',
                                                color: 'var(--vastra-dark)',
                                                fontSize: '1.3rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            Order Summary
                                        </h4>
                                    </div>

                                    <div className="mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {items.map((item) => (
                                            <OrderItemSummary key={item.id} item={item} />
                                        ))}
                                    </div>

                                    <div className="pt-3" style={{ borderTop: '1px solid rgba(128, 0, 32, 0.1)' }}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span style={{ color: 'var(--vastra-dark)', opacity: 0.8 }}>
                                                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                                            </span>
                                            <span style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>
                                                {formatPrice(totalAmount)}
                                            </span>
                                        </div>

                                        {discountAmount > 0 && appliedCoupon && (
                                            <div className="d-flex justify-content-between mb-2">
                                                <span style={{ color: '#28a745', fontWeight: 500 }}>
                                                    Discount ({appliedCoupon.code})
                                                </span>
                                                <span style={{ fontWeight: 500, color: '#28a745' }}>
                                                    -{formatPrice(discountAmount)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-between mb-2">
                                            <span style={{ color: 'var(--vastra-dark)', opacity: 0.8 }}>
                                                <Truck size={16} className="me-1" />
                                                Shipping
                                            </span>
                                            <span style={{ fontWeight: 500, color: '#28a745' }}>
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
                                            onClick={handlePlaceOrder}
                                            disabled={isPlacingOrder || !selectedAddress || items.length === 0}
                                            style={{ height: '55px' }}
                                        >
                                            {isPlacingOrder ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm" role="status" />
                                                    Placing Order...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} />
                                                    Place Order
                                                </>
                                            )}
                                        </motion.button>

                                        <div
                                            className="mt-4 pt-4 text-center"
                                            style={{ borderTop: '1px solid rgba(128, 0, 32, 0.1)' }}
                                        >
                                            <p
                                                className="mb-2"
                                                style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.7 }}
                                            >
                                                ✓ Secure checkout
                                            </p>
                                            <p
                                                className="mb-2"
                                                style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.7 }}
                                            >
                                                ✓ Free shipping on all orders
                                            </p>
                                            <p
                                                className="mb-0"
                                                style={{ fontSize: '0.8rem', color: 'var(--vastra-dark)', opacity: 0.7 }}
                                            >
                                                ✓ Easy returns within 30 days
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Col>
                        </Row>
                    )}
                </Container>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default CheckoutPage;
