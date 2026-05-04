import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ShopHeader from '../components/shop/ShopHeader';
import ProductGrid from '../components/shop/ProductGrid';
import ProductSkeleton from '../components/shop/ProductSkeleton';
import CategoryFilter from '../components/shop/CategoryFilter';
import EmptyState from '../components/shop/EmptyState';
import Pagination from '../components/shop/Pagination';
import FilterSidebar from '../components/shop/FilterSidebar';
import SearchInput from '../components/shop/SearchInput';
import { fetchProducts, fetchCategories } from '../services/api';

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        minPrice: null,
        maxPrice: null,
        colors: [],
        sizes: []
    });

    const pageSize = 12;

    const resetPaginationAndLoad = () => setCurrentPage(1);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [currentPage, selectedCategory, filters, searchQuery]);

    const loadProducts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchProducts({
                page: currentPage,
                pageSize,
                categoryId: selectedCategory,
                search: searchQuery,
                ...filters
            });

            setProducts(data.items || []);
            setTotalPages(Math.ceil((data.totalCount || 0) / pageSize));
        } catch (err) {
            console.error('Failed to load products:', err);
            setError('Failed to load products. Please try again.');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        resetPaginationAndLoad();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setFilters({ minPrice: null, maxPrice: null, colors: [], sizes: [] });
        resetPaginationAndLoad();
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        resetPaginationAndLoad();
    };

    const handleSearchClear = () => {
        setSearchQuery('');
        resetPaginationAndLoad();
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        resetPaginationAndLoad();
    };

    return (
        <div className="shop-page">
            <Navbar />

            <ShopHeader />

            <section
                className="shop-content vastra-section bg-vastra-ivory position-relative"
                style={{
                    backgroundImage: `radial-gradient(circle at 10% 20%, rgba(128, 0, 32, 0.02) 0%, transparent 40%),
                                      radial-gradient(circle at 90% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 40%)`
                }}
            >
                <Container>
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                    />

                    <div className="row">
                        <div className="col-lg-3 d-none d-lg-block">
                            <FilterSidebar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>

                        <div className="col-lg-9">
                            <SearchInput
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onClear={handleSearchClear}
                                placeholder="Search for sarees, kurtas, lehengas..."
                            />

                            {error && (
                                <motion.div
                                    className="alert text-center mb-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        background: 'rgba(128, 0, 32, 0.1)',
                                        color: 'var(--vastra-maroon)',
                                        border: '1px solid var(--vastra-maroon)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {error}
                                    <button
                                        className="btn btn-link ms-2"
                                        onClick={loadProducts}
                                        style={{ color: 'var(--vastra-maroon)' }}
                                    >
                                        Retry
                                    </button>
                                </motion.div>
                            )}

                            {isLoading && <ProductSkeleton count={pageSize} />}

                            {!isLoading && !error && products.length > 0 && (
                                <>
                                    <ProductGrid products={products} />
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}

                            {!isLoading && !error && products.length === 0 && (
                                <EmptyState
                                    hasFilters={searchQuery !== '' || filters.minPrice !== null || filters.maxPrice !== null || filters.colors.length > 0 || filters.sizes.length > 0}
                                    onClearFilters={handleClearFilters}
                                />
                            )}
                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </div>
    );
};

export default ShopPage;