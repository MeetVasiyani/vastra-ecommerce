import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../../services/api';
import { createCategory, updateCategory, deleteCategory } from '../../services/adminService';

const emptyForm = { name: '', description: '', imageUrl: '' };

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data || []);
        } catch (err) {
            console.error('Failed to load categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const openCreateModal = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setForm({
            name: category.name,
            description: category.description || '',
            imageUrl: category.imageUrl || ''
        });
        setEditingId(category.id);
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
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Category name is required');
            return;
        }

        setSaving(true);
        setError('');

        const result = editingId
            ? await updateCategory(editingId, form)
            : await createCategory(form);

        setSaving(false);

        if (result.success) {
            closeModal();
            loadCategories();
        } else {
            setError(result.error);
        }
    };

    const handleDelete = async (id) => {
        const result = await deleteCategory(id);
        setDeleteConfirm(null);
        if (result.success) {
            loadCategories();
        } else {
            alert(result.error);
        }
    };

    const getParentName = (parentId) => {
        if (!parentId) return '—';
        const parent = categories.find(c => c.id === parentId);
        return parent ? parent.name : '—';
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-header"><h2>Categories</h2></div>
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
                        <h2>Categories</h2>
                        <p style={{ color: '#888', marginTop: '4px' }}>{categories.length} categories</p>
                    </div>
                    <button className="btn btn-vastra-primary" style={{ padding: '10px 24px', fontSize: '0.95rem' }} onClick={openCreateModal}>
                        + Add Category
                    </button>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Parent</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                                <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {cat.description || '—'}
                                </td>
                                <td>{getParentName(cat.parentCategoryId)}</td>
                                <td>
                                    {cat.imageUrl ? (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--vastra-maroon)' }}>✓ Set</span>
                                    ) : '—'}
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <button className="admin-action-btn edit" onClick={() => openEditModal(cat)} title="Edit">
                                            ✏️
                                        </button>
                                        <button className="admin-action-btn delete" onClick={() => setDeleteConfirm(cat.id)} title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                    No categories found. Create one to get started.
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
                            <h4>{editingId ? 'Edit Category' : 'Add Category'}</h4>
                            <button className="admin-modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body">
                                {error && <div className="admin-alert error">{error}</div>}

                                <div className="admin-form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="admin-input"
                                        placeholder="e.g. Men's Kurtas"
                                        autoFocus
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        className="admin-input"
                                        rows="3"
                                        placeholder="Brief description of the category"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={form.imageUrl}
                                        onChange={handleChange}
                                        className="admin-input"
                                        placeholder="/images/products/category.png"
                                    />
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
                            <h5>Delete Category?</h5>
                            <p style={{ color: '#888' }}>This action cannot be undone. Products in this category may be affected.</p>
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
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoriesPage;
