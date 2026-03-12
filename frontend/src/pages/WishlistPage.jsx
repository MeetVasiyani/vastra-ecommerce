import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../services/api';
import { getColorHex } from '../utils/constants';

const WishlistPage = () => {
    const navigate = useNavigate();
    const { wishlist, itemCount, isLoading, error, removeFromWishlist, loadWishlist } = useWishlist();
    const { addToCart, isLoading: isCartLoading } = useCart();
    const { isAuthenticated } = useAuth();

    const [removingId, setRemovingId] = useState(null);
    const [addingToCartId, setAddingToCartId] = useState(null);

    const handleRemoveItem = async (wishlistItemId) => {
        setRemovingId(wishlistItemId);
        await removeFromWishlist(wishlistItemId);
        setRemovingId(null);
    };

    const handleAddToCart = async (item) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/wishlist' } });
            return;
        }

        setAddingToCartId(item.id);
        const result = await addToCart(item.productVariantId, 1);
        setAddingToCartId(null);

        if (result.success) {
            // Remove from wishlist after adding to cart
            await removeFromWishlist(item.id);
        }
    };

    const handleNavigateToProduct = (productId) => {
        navigate(`/product/${productId}`);
    };

    // Loading state
    if (isLoading && wishlist.length === 0) {
        return (
            <>
                <Navbar />
                <main style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)', background: 'var(--vastra-ivory)' }}>
                    <div className="container py-5">
                        <div className="text-center py-5">
                            <div
                                className="spinner-border"
                                role="status"
                                style={{ color: 'var(--vastra-maroon)', width: '3rem', height: '3rem' }}
                            >
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3" style={{ color: 'var(--vastra-dark)', fontStyle: 'italic' }}>
                                Loading your wishlist...
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Error state
    if (error && wishlist.length === 0) {
        return (
            <>
                <Navbar />
                <main style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)', background: 'var(--vastra-ivory)' }}>
                    <div className="container py-5">
                        <motion.div
                            className="text-center py-5"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div
                                className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05))',
                                    boxShadow: '0 10px 30px rgba(220, 53, 69, 0.1)',
                                }}
                            >
                                <Heart
                                    size={48}
                                    style={{ color: '#dc3545', opacity: 0.7 }}
                                />
                            </div>
                            <h3
                                className="mb-3"
                                style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}
                            >
                                Unable to Load Wishlist
                            </h3>
                            <p
                                className="mb-4 mx-auto"
                                style={{ maxWidth: '400px', color: 'var(--vastra-dark)', opacity: 0.7 }}
                            >
                                {error}
                            </p>
                            <motion.button
                                className="btn btn-vastra-primary d-inline-flex align-items-center gap-2"
                                onClick={loadWishlist}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </motion.button>
                        </motion.div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Empty state
    if (wishlist.length === 0) {
        return (
            <>
                <Navbar />
                <main style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)', background: 'var(--vastra-ivory)' }}>
                    <div className="container py-5">
                        <motion.div
                            className="text-center py-5"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div
                                className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--vastra-beige), var(--vastra-ivory))',
                                    boxShadow: '0 10px 30px rgba(128, 0, 32, 0.1)',
                                }}
                            >
                                <Heart
                                    size={48}
                                    style={{ color: 'var(--vastra-maroon)', opacity: 0.7 }}
                                />
                            </div>
                            <h3
                                className="mb-3"
                                style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}
                            >
                                Your Wishlist is Empty
                            </h3>
                            <p
                                className="mb-4 mx-auto"
                                style={{ maxWidth: '400px', color: 'var(--vastra-dark)', opacity: 0.7 }}
                            >
                                Start adding your favorite pieces to your wishlist. Explore our collection and save items you love.
                            </p>
                            <Link
                                to="/shop"
                                className="btn btn-vastra-primary d-inline-flex align-items-center gap-2"
                            >
                                <ShoppingBag size={18} />
                                Explore Collection
                            </Link>
                        </motion.div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)', background: 'var(--vastra-ivory)' }}>
                {/* Header Section */}
                <div
                    className="py-5"
                    style={{
                        background: 'linear-gradient(135deg, var(--vastra-beige) 0%, var(--vastra-ivory) 100%)',
                        borderBottom: '1px solid rgba(128, 0, 32, 0.08)'
                    }}
                >
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Breadcrumb */}
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <Link
                                    to="/"
                                    className="text-decoration-none d-flex align-items-center gap-1"
                                    style={{ color: 'var(--vastra-dark)', opacity: 0.7, fontSize: '0.9rem' }}
                                >
                                    <ArrowLeft size={14} />
                                    Home
                                </Link>
                                <span style={{ color: 'var(--vastra-maroon)', opacity: 0.5 }}>/</span>
                                <span style={{ color: 'var(--vastra-maroon)', fontSize: '0.9rem' }}>My Wishlist</span>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                <Heart size={32} style={{ color: 'var(--vastra-maroon)' }} fill="var(--vastra-maroon)" />
                                <div>
                                    <h1
                                        className="mb-0"
                                        style={{
                                            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                                            fontWeight: 600,
                                            color: 'var(--vastra-dark)',
                                            fontFamily: 'EB Garamond, serif',
                                        }}
                                    >
                                        My Wishlist
                                    </h1>
                                    <p className="mb-0" style={{ color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                        {itemCount} {itemCount === 1 ? 'item' : 'items'} saved
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Wishlist Items Grid */}
                <div className="container py-5">
                    <div className="row g-4">
                        <AnimatePresence>
                            {wishlist.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="col-12 col-sm-6 col-lg-4 col-xl-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <div
                                        className="h-100"
                                        style={{
                                            background: 'var(--vastra-ivory)',
                                            border: '1px solid rgba(128, 0, 32, 0.08)',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {/* Image */}
                                        <div
                                            className="position-relative"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleNavigateToProduct(item.productId)}
                                        >
                                            <img
                                                src={getImageUrl(item.imageUrl) || 'https://via.placeholder.com/400x500?text=Vastra'}
                                                alt={item.productName}
                                                className="w-100"
                                                style={{
                                                    height: '280px',
                                                    objectFit: 'cover',
                                                }}
                                            />

                                            {/* Remove Button */}
                                            <motion.button
                                                className="position-absolute border-0 d-flex align-items-center justify-content-center"
                                                style={{
                                                    top: '12px',
                                                    right: '12px',
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(255, 255, 255, 0.95)',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveItem(item.id);
                                                }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                disabled={removingId === item.id}
                                            >
                                                {removingId === item.id ? (
                                                    <Loader2
                                                        size={18}
                                                        style={{ color: 'var(--vastra-maroon)', animation: 'spin 1s linear infinite' }}
                                                    />
                                                ) : (
                                                    <Trash2 size={18} style={{ color: 'var(--vastra-maroon)' }} />
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-3">
                                            <h3
                                                className="mb-2"
                                                style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    color: 'var(--vastra-dark)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => handleNavigateToProduct(item.productId)}
                                            >
                                                {item.productName}
                                            </h3>

                                            {/* Variant Info */}
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                {item.color && (
                                                    <div className="d-flex align-items-center gap-1">
                                                        <div
                                                            style={{
                                                                width: '14px',
                                                                height: '14px',
                                                                borderRadius: '50%',
                                                                backgroundColor: getColorHex(item.color),
                                                                border: item.color.toLowerCase() === 'white' ? '1px solid #ddd' : 'none',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                            }}
                                                            title={item.color}
                                                        />
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                                            {item.color}
                                                        </span>
                                                    </div>
                                                )}
                                                {item.size && (
                                                    <>
                                                        <span style={{ color: 'var(--vastra-dark)', opacity: 0.3 }}>|</span>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>
                                                            Size: {item.size}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <p
                                                className="mb-3"
                                                style={{
                                                    fontSize: '1.15rem',
                                                    fontWeight: 600,
                                                    color: 'var(--vastra-maroon)',
                                                    fontFamily: 'EB Garamond, serif',
                                                }}
                                            >
                                                {formatPrice(item.price)}
                                            </p>

                                            {/* Add to Cart Button */}
                                            <motion.button
                                                className="btn btn-vastra-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                                                onClick={() => handleAddToCart(item)}
                                                disabled={addingToCartId === item.id || isCartLoading}
                                                whileHover={{ scale: addingToCartId === item.id ? 1 : 1.02 }}
                                                whileTap={{ scale: addingToCartId === item.id ? 1 : 0.98 }}
                                            >
                                                {addingToCartId === item.id ? (
                                                    <>
                                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingBag size={16} />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Spin animation keyframes */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default WishlistPage;
