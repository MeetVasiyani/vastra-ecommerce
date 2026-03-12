import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../services/api';
import { deleteProduct, updateProduct } from '../../services/adminService';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await fetchProducts({
                page,
                pageSize: 10,
                search: searchTerm
            });
            setProducts(data.items || []);
            const total = data.totalCount || 0;
            setTotalPages(Math.ceil(total / 10));
        } catch (err) {
            console.error('Failed to load products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [page, searchTerm]);

    const handleDelete = async (id) => {
        const result = await deleteProduct(id);
        setDeleteConfirm(null);
        if (result.success) {
            loadProducts();
        } else {
            alert(result.error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadProducts();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h2>Products</h2>
                        <p style={{ color: '#888', marginTop: '4px' }}>Manage your catalog</p>
                    </div>
                    <button
                        className="btn btn-vastra-primary"
                        style={{ padding: '10px 24px', fontSize: '0.95rem' }}
                        onClick={() => navigate('/admin/products/new')}
                    >
                        + Add Product
                    </button>
                </div>
            </div>

            <div className="admin-toolbar">
                <form onSubmit={handleSearch} className="d-flex gap-2">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="admin-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                    <button type="submit" className="btn btn-vastra-outline" style={{ padding: '8px 20px' }}>
                        Search
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            className="btn btn-vastra-outline"
                            onClick={() => setSearchTerm('')}
                            style={{ padding: '8px 20px', border: 'none' }}
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>SKU (Variants)</th>
                            <th>Total Stock</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>
                                    <div className="admin-product-thumb">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images.find(img => img.isMainImage)?.imageUrl || product.images[0].imageUrl}
                                                alt={product.name}
                                                onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=No+Img'; }}
                                            />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '4px' }}></div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 500 }}>{product.name}</td>
                                <td>{product.category?.name || '—'}</td>
                                <td>
                                    {product.variants && product.variants.length > 0 ? (
                                        <div style={{ fontSize: '0.85rem' }}>
                                            {product.variants.length === 1
                                                ? product.variants[0].sku
                                                : `${product.variants.length} variants`}
                                        </div>
                                    ) : '—'}
                                </td>
                                <td>
                                    {product.variants
                                        ? product.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
                                        : 0}
                                </td>
                                <td>{formatPrice(product.basePrice)}</td>
                                <td>
                                    {product.isActive ? (
                                        <span className="admin-badge active">Active</span>
                                    ) : (
                                        <span className="admin-badge inactive">Inactive</span>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="admin-action-btn edit"
                                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="admin-action-btn delete"
                                            onClick={() => setDeleteConfirm(product.id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && products.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                                    No products found matching your criteria.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner-border" style={{ color: 'var(--vastra-maroon)' }} role="status">
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

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</p>
                            <h5>Delete Product?</h5>
                            <p style={{ color: '#888' }}>This action cannot be undone.</p>
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

export default AdminProductsPage;
