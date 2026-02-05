// API Service for Vastra
const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Get full image URL from relative path
export const getImageUrl = (path) => {
    if (!path) return null;

    const version = "1.0.1";

    // If already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Add backend URL to relative paths
    const url = `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    return `${url}?v=${version}`;
};

// Fetch products with filters
export const fetchProducts = async (options = {}) => {
    const {
        page = 1,
        pageSize = 12,
        categoryId = null,
        search = '',
        minPrice = null,
        maxPrice = null,
        colors = [],
        sizes = []
    } = options;

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

// Fetch single product by ID
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

// Fetch all categories
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

// Format price in Indian Rupees
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
