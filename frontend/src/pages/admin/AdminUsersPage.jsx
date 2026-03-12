import React, { useState, useEffect } from 'react';
import { getAllUsers, promoteUserToAdmin, toggleUserStatus, resetUserPassword } from '../../services/adminService';
// import './AdminUsersPage.css'; // Add a little css if needed or just inline it, assuming standard styles

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);
    const [resetPrompt, setResetPrompt] = useState({ show: false, userId: null, newPassword: '' });

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            if (data.success) {
                setUsers(data.users || []);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handlePromote = async (userId) => {
        if (!window.confirm("Are you sure you want to promote this user to Admin?")) return;
        setActionLoading(userId);
        setMessage(null);
        const result = await promoteUserToAdmin(userId);
        if (result.success) {
            setMessage({ type: 'success', text: result.data?.message || 'User promoted successfully.' });
            await loadUsers();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to promote user.' });
        }
        setActionLoading(null);
    };

    const handleToggleStatus = async (userId, isDeactivated) => {
        const action = isDeactivated ? "activate" : "deactivate (ban)";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setActionLoading(userId);
        setMessage(null);
        const result = await toggleUserStatus(userId);
        if (result.success) {
            setMessage({ type: 'success', text: result.data?.message || `User ${action}d successfully.` });
            await loadUsers();
        } else {
            setMessage({ type: 'error', text: result.error || `Failed to ${action} user.` });
        }
        setActionLoading(null);
    };

    const submitPasswordReset = async (e) => {
        e.preventDefault();
        setActionLoading(resetPrompt.userId);
        setMessage(null);
        const result = await resetUserPassword(resetPrompt.userId, resetPrompt.newPassword);
        if (result.success) {
            setMessage({ type: 'success', text: result.data?.message || 'Password reset successfully.' });
            setResetPrompt({ show: false, userId: null, newPassword: '' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to reset password.' });
        }
        setActionLoading(null);
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2>Users</h2>
                    <p style={{ color: '#888', marginTop: '4px' }}>Registered customers</p>
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
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const isAdmin = user.roles && user.roles.includes('Admin');
                            const isActionLoading = actionLoading === user.id;

                            return (
                                <tr key={user.id}>
                                    <td title={user.id}>{user.id.substring(0, 8)}...</td>
                                    <td style={{ fontWeight: 500 }}>
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        {user.roles && user.roles.map(role => (
                                            <span
                                                key={role}
                                                className={`admin-badge ${role === 'Admin' ? 'active' : 'inactive'}`}
                                                style={{ marginRight: '5px' }}
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </td>
                                    <td>
                                        {user.isDeactivated ? (
                                            <span className="admin-badge inactive" style={{ backgroundColor: '#dc3545', color: '#fff' }}>Banned</span>
                                        ) : (
                                            <span className="admin-badge active" style={{ backgroundColor: '#28a745', color: '#fff' }}>Active</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {!isAdmin && (
                                                <button
                                                    onClick={() => handlePromote(user.id)}
                                                    disabled={isActionLoading}
                                                    style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '3px' }}
                                                >
                                                    {isActionLoading ? '...' : 'Promote'}
                                                </button>
                                            )}

                                            {!isAdmin && (
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.isDeactivated)}
                                                    disabled={isActionLoading}
                                                    style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: user.isDeactivated ? '#28a745' : '#dc3545', color: '#fff', border: 'none', borderRadius: '3px' }}
                                                >
                                                    {isActionLoading ? '...' : (user.isDeactivated ? 'Unban' : 'Ban')}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setResetPrompt({ show: true, userId: user.id, newPassword: '' })}
                                                disabled={isActionLoading}
                                                style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '3px' }}
                                            >
                                                Reset Pwd
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {loading && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner-border" role="status" style={{ color: 'var(--vastra-maroon)' }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && users.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Password Reset Modal / Prompt */}
            {resetPrompt.show && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h4 style={{ marginTop: 0 }}>Reset Password</h4>
                        <form onSubmit={submitPasswordReset}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>New Password</label>
                                <input
                                    type="password"
                                    value={resetPrompt.newPassword}
                                    onChange={(e) => setResetPrompt({ ...resetPrompt, newPassword: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setResetPrompt({ show: false, userId: null, newPassword: '' })}
                                    style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === resetPrompt.userId}
                                    style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: 'var(--vastra-maroon)', color: '#fff', border: 'none', borderRadius: '4px' }}
                                >
                                    {actionLoading === resetPrompt.userId ? 'Saving...' : 'Reset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
