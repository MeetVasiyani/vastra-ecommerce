import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategories, fetchProductById } from '../../services/api';
import { createProduct, updateProduct } from '../../services/adminService';

const emptyVariant = {
    sku: '',
    size: '',
    color: '',
    material: '',
    stockQuantity: 0,
    priceAdjustment: 0
};

const emptyForm = {
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    isActive: true,
    imageUrls: [''],
    variants: [emptyVariant]
};

const AdminProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [form, setForm] = useState(emptyForm);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load categories
                const categoriesData = await fetchCategories();
                setCategories(categoriesData || []);

                // If editing, load product details
                if (isEditMode) {
                    const product = await fetchProductById(id);

                    // Transform product data to form format
                    setForm({
                        name: product.name,
                        description: product.description || '',
                        basePrice: product.basePrice,
                        categoryId: product.categoryId,
                        isActive: product.isActive,
                        imageUrls: product.images && product.images.length > 0
                            ? product.images.map(img => img.imageUrl)
                            : [''],
                        variants: product.variants && product.variants.length > 0
                            ? product.variants.map(v => ({
                                sku: v.sku,
                                size: v.size,
                                color: v.color,
                                material: v.material || '',
                                stockQuantity: v.stockQuantity,
                                priceAdjustment: v.priceAdjustment
                            }))
                            : [emptyVariant]
                    });
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, isEditMode]);

    const handleBasicChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Image Handlers
    const handleImageChange = (index, value) => {
        const newImages = [...form.imageUrls];
        newImages[index] = value;
        setForm(prev => ({ ...prev, imageUrls: newImages }));
    };

    const addImageField = () => {
        setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
    };

    const removeImageField = (index) => {
        if (form.imageUrls.length === 1) return;
        const newImages = form.imageUrls.filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, imageUrls: newImages }));
    };

    // Variant Handlers
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...form.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setForm(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        setForm(prev => ({ ...prev, variants: [...prev.variants, emptyVariant] }));
    };

    const removeVariant = (index) => {
        if (form.variants.length === 1) return;
        const newVariants = form.variants.filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, variants: newVariants }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!form.name || !form.basePrice || !form.categoryId) {
            setError('Please fill in all required fields (Name, Price, Category)');
            window.scrollTo(0, 0);
            return;
        }

        setSaving(true);
        setError('');

        // Clean up data before sending
        const payload = {
            ...form,
            basePrice: parseFloat(form.basePrice),
            categoryId: parseInt(form.categoryId),
            imageUrls: form.imageUrls.filter(url => url.trim() !== ''),
            variants: form.variants.map(v => ({
                ...v,
                stockQuantity: parseInt(v.stockQuantity),
                priceAdjustment: parseFloat(v.priceAdjustment)
            }))
        };

        const result = isEditMode
            ? await updateProduct(id, payload)
            : await createProduct(payload);

        setSaving(false);

        if (result.success) {
            navigate('/admin/products');
        } else {
            setError(result.error);
            window.scrollTo(0, 0);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
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
                <div className="d-flex align-items-center gap-3">
                    <button
                        className="btn btn-link p-0 text-decoration-none"
                        style={{ fontSize: '1.5rem', color: 'var(--vastra-dark)' }}
                        onClick={() => navigate('/admin/products')}
                    >
                        ←
                    </button>
                    <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <form onSubmit={handleSubmit} className="admin-form-container">
                        {error && <div className="admin-alert error mb-4">{error}</div>}

                        {/* Basic Info Section */}
                        <div className="admin-card mb-4">
                            <h4 className="admin-card-title">Basic Information</h4>

                            <div className="row g-3">
                                <div className="col-md-8">
                                    <div className="admin-form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleBasicChange}
                                            className="admin-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="admin-form-group">
                                        <label>Base Price (₹) *</label>
                                        <input
                                            type="number"
                                            name="basePrice"
                                            value={form.basePrice}
                                            onChange={handleBasicChange}
                                            className="admin-input"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="admin-form-group">
                                        <label>Category *</label>
                                        <select
                                            name="categoryId"
                                            value={form.categoryId}
                                            onChange={handleBasicChange}
                                            className="admin-input"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="admin-form-group">
                                        <label className="d-block mb-2">Status</label>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                name="isActive"
                                                checked={form.isActive}
                                                onChange={handleBasicChange}
                                                id="isActiveCheck"
                                            />
                                            <label className="form-check-label" htmlFor="isActiveCheck">
                                                {form.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="admin-form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleBasicChange}
                                            className="admin-input"
                                            rows="4"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="admin-card mb-4">
                            <h4 className="admin-card-title">Product Images</h4>
                            <p className="text-muted small mb-3">Add image URLs for the product. The first image will be the main image.</p>

                            {form.imageUrls.map((url, index) => (
                                <div key={index} className="d-flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                        className="admin-input"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {form.imageUrls.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => removeImageField(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-link text-decoration-none p-0 mt-2"
                                onClick={addImageField}
                                style={{ color: 'var(--vastra-maroon)' }}
                            >
                                + Add another image
                            </button>
                        </div>

                        {/* Variants Section */}
                        <div className="admin-card mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="admin-card-title mb-0">Variants</h4>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-vastra-outline"
                                    onClick={addVariant}
                                >
                                    + Add Variant
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>SKU</th>
                                            <th>Size</th>
                                            <th>Color</th>
                                            <th>Stock</th>
                                            <th>Price Adj. (₹)</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.variants.map((variant, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={variant.sku}
                                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                                        className="form-control form-control-sm"
                                                        placeholder="SKU-001"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={variant.size}
                                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                        className="form-control form-control-sm"
                                                        placeholder="M, L, XL"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={variant.color}
                                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                        className="form-control form-control-sm"
                                                        placeholder="Red"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={variant.stockQuantity}
                                                        onChange={(e) => handleVariantChange(index, 'stockQuantity', e.target.value)}
                                                        className="form-control form-control-sm"
                                                        min="0"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={variant.priceAdjustment}
                                                        onChange={(e) => handleVariantChange(index, 'priceAdjustment', e.target.value)}
                                                        className="form-control form-control-sm"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    {form.variants.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger border-0"
                                                            onClick={() => removeVariant(index)}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-3 mb-5">
                            <button
                                type="button"
                                className="btn btn-vastra-outline"
                                onClick={() => navigate('/admin/products')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-vastra-primary"
                                disabled={saving}
                            >
                                {saving ? 'Saving Product...' : (isEditMode ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProductFormPage;
