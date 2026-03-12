import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/adminService';
import { formatPrice } from '../../services/api';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingParams, setUpdatingParams] = useState(null); // {id, status}

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getAllOrders(page, 10, statusFilter);
            if (data.success) {
                setOrders(data.data.items || []);
                const total = data.data.totalCount || 0;
                setTotalPages(Math.ceil(total / 10));
            }
        } catch (err) {
            console.error('Failed to load orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [page, statusFilter]);

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingParams({ id, status: newStatus });
        const result = await updateOrderStatus(id, newStatus);

        if (result.success) {
            // Optimistic update or reload
            loadOrders();
        } else {
            alert(result.error);
        }
        setUpdatingParams(null);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'var(--vastra-gold)';
            case 'shipped': return '#17a2b8';
            case 'delivered': return '#28a745';
            case 'cancelled': return '#dc3545';
            default: return '#666';
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h2>Orders</h2>
                        <p style={{ color: '#888', marginTop: '4px' }}>Manage customer orders</p>
                    </div>
                    <select
                        className="admin-input"
                        style={{ width: 'auto' }}
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Items</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td style={{ fontWeight: 600 }}>{formatPrice(order.totalAmount)}</td>
                                <td>
                                    {order.items.length} items
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                        {order.items[0]?.productName}
                                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                    </div>
                                </td>
                                <td>
                                    <span className={`admin-badge ${order.paymentStatus === 'Completed' ? 'active' : 'inactive'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className="admin-badge"
                                        style={{
                                            backgroundColor: getStatusColor(order.status),
                                            color: '#fff'
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    {order.status !== 'Same' && (
                                        <div className="d-flex gap-2">
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-info text-white"
                                                        onClick={() => handleStatusUpdate(order.id, 'Shipped')}
                                                        disabled={updatingParams?.id === order.id}
                                                    >
                                                        Ship
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                                                        disabled={updatingParams?.id === order.id}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                                                    disabled={updatingParams?.id === order.id}
                                                >
                                                    Deliver
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                                    No orders found.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner-border" role="status" style={{ color: 'var(--vastra-maroon)' }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="admin-pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="btn btn-vastra-outline"
                        style={{ padding: '6px 16px', fontSize: '0.9rem' }}
                    >
                        Previous
                    </button>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="btn btn-vastra-outline"
                        style={{ padding: '6px 16px', fontSize: '0.9rem' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
