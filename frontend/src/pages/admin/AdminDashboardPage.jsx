import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../../services/api';
import { getAllCoupons, getOrderStats, getAllUsers } from '../../services/adminService';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        coupons: 0,
        orders: 0,
        users: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [productsData, categoriesData, couponsResult, orderStatsResult, usersResult] = await Promise.all([
                    fetchProducts({ page: 1, pageSize: 1 }),
                    fetchCategories(),
                    getAllCoupons(),
                    getOrderStats(),
                    getAllUsers()
                ]);

                setStats({
                    products: productsData.totalCount || 0,
                    categories: categoriesData?.length || 0,
                    coupons: couponsResult.success ? couponsResult.coupons.length : 0,
                    orders: orderStatsResult.success ? orderStatsResult.data.totalOrders : 0,
                    users: usersResult.success ? usersResult.users.length : 0,
                    revenue: orderStatsResult.success ? orderStatsResult.data.totalRevenue : 0
                });
            } catch (error) {
                console.error('Failed to load dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const statCards = [
        {
            label: 'Total Revenue',
            value: formatCurrency(stats.revenue),
            icon: '💰',
            color: '#28a745',
            action: () => navigate('/admin/orders')
        },
        {
            label: 'Total Orders',
            value: stats.orders,
            icon: '📦',
            color: '#17a2b8',
            action: () => navigate('/admin/orders')
        },
        {
            label: 'Total Products',
            value: stats.products,
            icon: '👗',
            color: 'var(--vastra-maroon)',
            action: () => navigate('/admin/products')
        },
        {
            label: 'Total Users',
            value: stats.users,
            icon: '👥',
            color: '#6610f2',
            action: () => navigate('/admin/users')
        },
        {
            label: 'Categories',
            value: stats.categories,
            icon: '📂',
            color: 'var(--vastra-gold)',
            action: () => navigate('/admin/categories')
        },
        {
            label: 'Coupons',
            value: stats.coupons,
            icon: '🎟️',
            color: 'var(--vastra-deep-maroon)',
            action: () => navigate('/admin/coupons')
        }
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h2>Dashboard</h2>
                <p style={{ color: '#888', marginTop: '4px' }}>Overview of your store</p>
            </div>

            <div className="admin-stats-grid">
                {statCards.map(card => (
                    <div
                        key={card.label}
                        className="admin-stat-card"
                        onClick={card.action}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="admin-stat-icon" style={{ background: card.color }}>
                            <span>{card.icon}</span>
                        </div>
                        <div className="admin-stat-info">
                            <span className="admin-stat-value">
                                {loading ? '...' : card.value}
                            </span>
                            <span className="admin-stat-label">{card.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-quick-actions">
                <h4 style={{ marginBottom: '1rem', color: 'var(--vastra-dark)' }}>Quick Actions</h4>
                <div className="d-flex gap-3 flex-wrap">
                    <button
                        className="btn btn-vastra-primary"
                        style={{ padding: '10px 24px', fontSize: '0.95rem' }}
                        onClick={() => navigate('/admin/products/new')}
                    >
                        + Add Product
                    </button>
                    <button
                        className="btn btn-vastra-outline"
                        style={{ padding: '10px 24px', fontSize: '0.95rem' }}
                        onClick={() => navigate('/admin/categories')}
                    >
                        Manage Categories
                    </button>
                    <button
                        className="btn btn-vastra-outline"
                        style={{ padding: '10px 24px', fontSize: '0.95rem' }}
                        onClick={() => navigate('/admin/coupons')}
                    >
                        Manage Coupons
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
