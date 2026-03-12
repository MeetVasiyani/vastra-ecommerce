import React, { useState, useEffect } from 'react';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, getCouponById } from '../../services/adminService';

const emptyForm = {
    code: '',
    discountAmount: 0,
    discountPercentage: 0,
    expirationDate: '',
    minimumOrderAmount: 0
};

const AdminCouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadCoupons = async () => {
        try {
            const result = await getAllCoupons();
            if (result.success) {
                setCoupons(result.coupons);
            }
        } catch (err) {
            console.error('Failed to load coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    const getStatusBadge = (coupon) => {
        if (!coupon.isActive) {
            return <span className="admin-badge inactive">Inactive</span>;
        }
        if (new Date(coupon.expirationDate) <= new Date()) {
            return <span className="admin-badge expired">Expired</span>;
        }
        return <span className="admin-badge active">Active</span>;
    };

    const openCreateModal = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
        setShowModal(true);
    };

    const openEditModal = async (coupon) => {
        setForm({
            code: coupon.code,
            discountAmount: coupon.discountAmount,
            discountPercentage: coupon.discountPercentage,
            expirationDate: formatDateForInput(coupon.expirationDate),
            minimumOrderAmount: coupon.minimumOrderAmount
        });
        setEditingId(coupon.id);
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm(emptyForm);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.code.trim()) {
            setError('Coupon code is required');
            return;
        }
        if (!form.expirationDate) {
            setError('Expiration date is required');
            return;
        }

        setSaving(true);
        setError('');

        const payload = {
            ...form,
            expirationDate: new Date(form.expirationDate).toISOString()
        };

        const result = editingId
            ? await updateCoupon(editingId, payload)
            : await createCoupon(payload);

        setSaving(false);

        if (result.success) {
            closeModal();
            loadCoupons();
        } else {
            setError(result.error);
        }
    };

    const handleDelete = async (id) => {
        const result = await deleteCoupon(id);
        setDeleteConfirm(null);
        if (result.success) {
            loadCoupons();
        } else {
            alert(result.error);
        }
    };

    const formatPrice = (amount) => {
        if (!amount || amount === 0) return '—';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-header"><h2>Coupons</h2></div>
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border" style={{ color: 'var(--vastra-maroon)' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h2>Coupons</h2>
                        <p style={{ color: '#888', marginTop: '4px' }}>{coupons.length} coupons</p>
                    </div>
                    <button className="btn btn-vastra-primary" style={{ padding: '10px 24px', fontSize: '0.95rem' }} onClick={openCreateModal}>
                        + Add Coupon
                    </button>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Min. Order</th>
                            <th>Expires</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.id}>
                                <td>
                                    <span className="admin-coupon-code">{coupon.code}</span>
                                </td>
                                <td>
                                    {coupon.discountPercentage > 0
                                        ? `${coupon.discountPercentage}%`
                                        : formatPrice(coupon.discountAmount)
                                    }
                                </td>
                                <td>{formatPrice(coupon.minimumOrderAmount)}</td>
                                <td>{formatDate(coupon.expirationDate)}</td>
                                <td>{getStatusBadge(coupon)}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <button className="admin-action-btn edit" onClick={() => openEditModal(coupon)} title="Edit">
                                            ✏️
                                        </button>
                                        <button className="admin-action-btn delete" onClick={() => setDeleteConfirm(coupon.id)} title="Deactivate">
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                    No coupons found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h4>{editingId ? 'Edit Coupon' : 'Add Coupon'}</h4>
                            <button className="admin-modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body">
                                {error && <div className="admin-alert error">{error}</div>}

                                <div className="admin-form-group">
                                    <label>Coupon Code *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={form.code}
                                        onChange={handleChange}
                                        className="admin-input"
                                        placeholder="e.g. WELCOME10"
                                        style={{ textTransform: 'uppercase' }}
                                        autoFocus
                                    />
                                </div>

                                <div className="d-flex gap-3">
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Discount Amount (₹)</label>
                                        <input
                                            type="number"
                                            name="discountAmount"
                                            value={form.discountAmount}
                                            onChange={handleChange}
                                            className="admin-input"
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Discount Percentage (%)</label>
                                        <input
                                            type="number"
                                            name="discountPercentage"
                                            value={form.discountPercentage}
                                            onChange={handleChange}
                                            className="admin-input"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>

                                <div className="d-flex gap-3">
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Expiration Date *</label>
                                        <input
                                            type="date"
                                            name="expirationDate"
                                            value={form.expirationDate}
                                            onChange={handleChange}
                                            className="admin-input"
                                        />
                                    </div>
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Minimum Order (₹)</label>
                                        <input
                                            type="number"
                                            name="minimumOrderAmount"
                                            value={form.minimumOrderAmount}
                                            onChange={handleChange}
                                            className="admin-input"
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button type="button" className="btn btn-vastra-outline" style={{ padding: '8px 20px', fontSize: '0.9rem' }} onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-vastra-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }} disabled={saving}>
                                    {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</p>
                            <h5>Deactivate Coupon?</h5>
                            <p style={{ color: '#888' }}>This will deactivate the coupon. It can't be used by customers.</p>
                        </div>
                        <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                            <button className="btn btn-vastra-outline" style={{ padding: '8px 20px', fontSize: '0.9rem' }} onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{ padding: '8px 20px', fontSize: '0.9rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px' }}
                                onClick={() => handleDelete(deleteConfirm)}
                            >
                                Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCouponsPage;
