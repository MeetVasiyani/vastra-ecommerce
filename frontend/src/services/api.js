// API Service Layer for Vastra E-commerce
const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Get full image URL from relative path
 * @param {string} relativePath - Relative image path from API (e.g., /images/products/...)
 * @returns {string} Full URL to the image
 */
export const getImageUrl = (relativePath) => {
    if (!relativePath) return null;

    // Use a version token to bust cache (useful when replacement images have same filename)
    // In a real app, this could be a build hash or a specific version from config
    const version = "1.0.1";

    // If it's already a full URL, return as-is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    // Prepend backend URL to relative paths and add cache buster
    const url = `${BACKEND_URL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
    return `${url}?v=${version}`;
};

/**
 * Fetch products with pagination, search, and category filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.pageSize - Items per page (default: 12)
 * @param {number|null} options.categoryId - Category filter (optional)
 * @param {string} options.search - Search query (optional)
 * @returns {Promise<{items: Array, totalCount: number, page: number, pageSize: number}>}
 */
export const fetchProducts = async ({
    page = 1,
    pageSize = 12,
    categoryId = null,
    search = '',
    minPrice = null,
    maxPrice = null,
    colors = [],
    sizes = []
} = {}) => {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });

    if (categoryId) {
        params.append('categoryId', categoryId.toString());
    }

    if (search) {
        params.append('search', search);
    }

    if (minPrice !== null) {
        params.append('minPrice', minPrice.toString());
    }

    if (maxPrice !== null) {
        params.append('maxPrice', maxPrice.toString());
    }

    if (colors && colors.length > 0) {
        params.append('colors', colors.join(','));
    }

    if (sizes && sizes.length > 0) {
        params.append('sizes', sizes.join(','));
    }

    const response = await fetch(`${API_BASE_URL}/Product?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Fetch a single product by ID with images and variants
 * @param {number} id - Product ID
 * @returns {Promise<Object>}
 */
export const fetchProductById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/Product/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Fetch all categories
 * @returns {Promise<Array<{id: number, name: string, description: string, imageUrl: string}>>}
 */
export const fetchCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/Category`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Format price in Indian Rupees
 * @param {number} price - Price value
 * @returns {string} Formatted price with ₹ symbol
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export default {
    fetchProducts,
    fetchProductById,
    fetchCategories,
    formatPrice,
    getImageUrl,
};
