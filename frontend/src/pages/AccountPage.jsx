import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    MapPin,
    Package,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    ShoppingBag,
    Calendar,
    CreditCard,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../services/api';
import { fetchUserProfile, addUserAddress, deleteUserAddress } from '../services/authService';
import { getMyOrders } from '../services/orderService';

// Address Card Component
const AddressCard = ({ address, onDelete, isDeleting }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="p-3 mb-2"
        style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(128, 0, 32, 0.1)',
        }}
    >
        <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex gap-3">
                <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)'
                    }}
                >
                    <MapPin size={18} style={{ color: 'var(--vastra-maroon)' }} />
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
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn btn-link p-2"
                onClick={() => onDelete(address.id)}
                disabled={isDeleting}
                style={{ color: '#dc3545' }}
                title="Delete address"
            >
                {isDeleting ? (
                    <div className="spinner-border spinner-border-sm" role="status" />
                ) : (
                    <Trash2 size={18} />
                )}
            </motion.button>
        </div>
    </motion.div>
);

// New Address Form Component
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
                background: 'var(--vastra-beige)',
                borderRadius: '12px',
                border: '1px solid rgba(128, 0, 32, 0.1)'
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
                        style={{ padding: '10px 24px' }}
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
                            color: 'var(--vastra-dark)',
                            padding: '10px 24px'
                        }}
                    >
                        Cancel
                    </motion.button>
                </div>
            </Form>
        </motion.div>
    );
};

// Order Card Component
const OrderCard = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={18} />
            </motion.button>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                    pageNum = i + 1;
                } else if (currentPage <= 3) {
                    pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                } else {
                    pageNum = currentPage - 2 + i;
                }

                return (
                    <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => onPageChange(pageNum)}
                    >
                        {pageNum}
                    </motion.button>
                );
            })}

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight size={18} />
            </motion.button>
        </div>
    );
};

// Main Account Page Component
const AccountPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    // Profile state
    const [profile, setProfile] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [deletingAddressId, setDeletingAddressId] = useState(null);

    // Orders state
    const [orders, setOrders] = useState([]);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersTotalPages, setOrdersTotalPages] = useState(1);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // Error state
    const [error, setError] = useState('');

    // Fetch profile data
    const loadProfile = useCallback(async () => {
        setIsLoadingProfile(true);
        const result = await fetchUserProfile();
        if (result.success && result.profile) {
            setProfile(result.profile);
        } else {
            setError(result.error || 'Failed to load profile');
        }
        setIsLoadingProfile(false);
    }, []);

    // Fetch orders
    const loadOrders = useCallback(async (page = 1) => {
        setIsLoadingOrders(true);
        const result = await getMyOrders(page, 5);
        if (result.success && result.orders) {
            setOrders(result.orders.items || []);
            setOrdersTotalPages(Math.ceil((result.orders.totalCount || 0) / (result.orders.pageSize || 5)));
            setOrdersPage(result.orders.page || 1);
        } else {
            setError(result.error || 'Failed to load orders');
        }
        setIsLoadingOrders(false);
    }, []);

    // Initial data load
    useEffect(() => {
        if (isAuthenticated) {
            loadProfile();
            loadOrders(1);
        }
    }, [isAuthenticated, loadProfile, loadOrders]);

    // Handle adding new address
    const handleAddAddress = async (addressData) => {
        setIsAddingAddress(true);
        setError('');

        const result = await addUserAddress(addressData);

        if (result.success && result.address) {
            setProfile(prev => ({
                ...prev,
                addresses: [...(prev?.addresses || []), result.address]
            }));
            setShowAddressForm(false);
        } else {
            setError(result.error || 'Failed to add address');
        }

        setIsAddingAddress(false);
    };

    // Handle deleting address
    const handleDeleteAddress = async (addressId) => {
        setDeletingAddressId(addressId);
        setError('');

        const result = await deleteUserAddress(addressId);

        if (result.success) {
            setProfile(prev => ({
                ...prev,
                addresses: prev?.addresses?.filter(a => a.id !== addressId) || []
            }));
        } else {
            setError(result.error || 'Failed to delete address');
        }

        setDeletingAddressId(null);
    };

    // Handle page change for orders
    const handleOrdersPageChange = (page) => {
        loadOrders(page);
    };

    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
        navigate('/login', { state: { from: '/account' } });
        return null;
    }

    // Loading state
    if (authLoading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '100vh', background: 'var(--vastra-ivory)' }}
            >
                <div className="text-center">
                    <div
                        className="spinner-border"
                        role="status"
                        style={{ color: 'var(--vastra-maroon)', width: '3rem', height: '3rem' }}
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3" style={{ color: 'var(--vastra-dark)', fontStyle: 'italic' }}>
                        Loading your account...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="account-page">
            <Navbar />

            {/* Page Header */}
            <section
                className="account-header py-5"
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
                            to="/"
                            className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none"
                            style={{ color: 'var(--vastra-maroon)' }}
                        >
                            <ArrowLeft size={18} />
                            Back to Home
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
                            My Account
                        </h1>
                    </motion.div>
                </Container>
            </section>

            {/* Main Content */}
            <section
                className="account-content py-5"
                style={{
                    background: 'var(--vastra-ivory)',
                    minHeight: '60vh'
                }}
            >
                <Container>
                    {/* Error Alert */}
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
                                <button
                                    className="btn-close ms-auto"
                                    onClick={() => setError('')}
                                    style={{ fontSize: '0.8rem' }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Row className="g-4">
                        {/* Profile Section */}
                        <Col lg={5}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4"
                                style={{
                                    background: '#fff',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(128, 0, 32, 0.06)',
                                    border: '1px solid rgba(128, 0, 32, 0.08)'
                                }}
                            >
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <User size={22} style={{ color: 'var(--vastra-maroon)' }} />
                                    <h4
                                        className="mb-0"
                                        style={{
                                            fontFamily: 'EB Garamond, serif',
                                            color: 'var(--vastra-dark)',
                                            fontSize: '1.3rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        Profile
                                    </h4>
                                </div>

                                {isLoadingProfile ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm" style={{ color: 'var(--vastra-maroon)' }} />
                                        <p className="mt-2 mb-0" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                            Loading profile...
                                        </p>
                                    </div>
                                ) : profile ? (
                                    <>
                                        {/* User Info */}
                                        <div className="mb-4 p-3" style={{ background: 'var(--vastra-beige)', borderRadius: '12px' }}>
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <div
                                                    className="d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--vastra-maroon), var(--vastra-deep-maroon))',
                                                        color: '#fff',
                                                        fontSize: '1.5rem',
                                                        fontFamily: 'EB Garamond, serif',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {profile.firstName?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <h5 className="mb-1" style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}>
                                                        {profile.firstName} {profile.lastName}
                                                    </h5>
                                                    <p className="mb-0 d-flex align-items-center gap-1" style={{ color: 'var(--vastra-dark)', opacity: 0.7, fontSize: '0.9rem' }}>
                                                        <Mail size={14} />
                                                        {profile.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Addresses Section */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0" style={{ color: 'var(--vastra-dark)', fontWeight: 600, fontSize: '1rem' }}>
                                                <MapPin size={16} className="me-2" style={{ color: 'var(--vastra-maroon)' }} />
                                                Saved Addresses
                                            </h5>
                                        </div>

                                        <AnimatePresence>
                                            {profile.addresses?.length > 0 ? (
                                                profile.addresses.map((address) => (
                                                    <AddressCard
                                                        key={address.id}
                                                        address={address}
                                                        onDelete={handleDeleteAddress}
                                                        isDeleting={deletingAddressId === address.id}
                                                    />
                                                ))
                                            ) : (
                                                <p className="text-center py-3" style={{ color: 'var(--vastra-dark)', opacity: 0.6 }}>
                                                    No addresses saved yet
                                                </p>
                                            )}
                                        </AnimatePresence>

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
                                ) : (
                                    <p className="text-center py-4" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                        Unable to load profile
                                    </p>
                                )}
                            </motion.div>
                        </Col>

                        {/* Order History Section */}
                        <Col lg={7}>
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
                                        Order History
                                    </h4>
                                </div>

                                {isLoadingOrders ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border" style={{ color: 'var(--vastra-maroon)' }} />
                                        <p className="mt-3 mb-0" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                            Loading orders...
                                        </p>
                                    </div>
                                ) : orders.length > 0 ? (
                                    <>
                                        {orders.map((order) => (
                                            <OrderCard key={order.id} order={order} />
                                        ))}
                                        <Pagination
                                            currentPage={ordersPage}
                                            totalPages={ordersTotalPages}
                                            onPageChange={handleOrdersPageChange}
                                        />
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-5"
                                    >
                                        <div
                                            className="d-inline-flex align-items-center justify-content-center mb-4"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)'
                                            }}
                                        >
                                            <Package size={36} style={{ color: 'var(--vastra-maroon)' }} />
                                        </div>
                                        <h5 className="mb-2" style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}>
                                            No Orders Yet
                                        </h5>
                                        <p className="mb-4" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                            Start shopping to see your order history here
                                        </p>
                                        <Link to="/shop" className="btn btn-vastra-primary">
                                            Start Shopping
                                        </Link>
                                    </motion.div>
                                )}
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AccountPage;
