import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sidebarLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/orders', label: 'Orders', icon: '📦' },
    { to: '/admin/products', label: 'Products', icon: '👗' },
    { to: '/admin/categories', label: 'Categories', icon: '📂' },
    { to: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
];

const AdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-logo">
                        {!sidebarCollapsed && (
                            <h4 style={{ margin: 0, fontFamily: "'EB Garamond', serif", color: 'var(--vastra-ivory)' }}>
                                Vastra <span style={{ color: 'var(--vastra-gold)' }}>Admin</span>
                            </h4>
                        )}
                        <button
                            className="admin-sidebar-toggle"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {sidebarCollapsed ? '☰' : '✕'}
                        </button>
                    </div>
                </div>

                <nav className="admin-nav">
                    {sidebarLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `admin-nav-link ${isActive ? 'active' : ''}`
                            }
                            title={link.label}
                        >
                            <span className="admin-nav-icon">{link.icon}</span>
                            {!sidebarCollapsed && <span className="admin-nav-label">{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <NavLink
                        to="/shop"
                        className="admin-nav-link"
                        title="View Store"
                    >
                        <span className="admin-nav-icon">🏪</span>
                        {!sidebarCollapsed && <span className="admin-nav-label">View Store</span>}
                    </NavLink>
                    <button
                        className="admin-nav-link admin-logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <span className="admin-nav-icon">🚪</span>
                        {!sidebarCollapsed && <span className="admin-nav-label">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`admin-main ${sidebarCollapsed ? 'expanded' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
