import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice, getImageUrl } from '../../services/api';
import { getColorHex } from '../../utils/constants';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    // Get default variant
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const wishlistStatus = defaultVariant ? isInWishlist(defaultVariant.id) : { inWishlist: false };
    const inWishlist = wishlistStatus.inWishlist;

    // View product details
    const handleViewProduct = (e) => {
        e.stopPropagation();
        navigate(`/product/${product.id}`);
    };

    // Add to cart or go to product page
    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (product.variants?.length === 1) {
            await addToCart(product.variants[0].id, 1);
        } else {
            navigate(`/product/${product.id}`);
        }
    };

    // Toggle wishlist
    const handleWishlistClick = async (e) => {
        e.stopPropagation();
        if (defaultVariant) {
            await toggleWishlist(defaultVariant.id);
        }
    };

    // Go to product page
    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    // Get main image
    const rawImageUrl = product.images?.find((img) => img.isMainImage)?.imageUrl
        || product.images?.[0]?.imageUrl;
    const mainImage = getImageUrl(rawImageUrl) || 'https://via.placeholder.com/400x500?text=Vastra';

    // Get unique colors from variants
    const uniqueColors = [];
    if (product.variants) {
        product.variants.forEach(v => {
            if (!uniqueColors.includes(v.color)) {
                uniqueColors.push(v.color);
            }
        });
    }

    return (
        <motion.article
            className="product-card h-100 position-relative"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            role="article"
            aria-label={`Product: ${product.name}`}
            tabIndex={0}
            style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
        >
            {/* Image Container */}
            <div className="product-card-image-wrapper position-relative overflow-hidden">
                {/* Wishlist Button */}
                <motion.button
                    className="btn position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center p-0"
                    onClick={handleWishlistClick}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isHovered || inWishlist ? 1 : 0, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        zIndex: 10,
                        color: inWishlist ? 'var(--vastra-maroon)' : '#666',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                </motion.button>

                <motion.img
                    src={mainImage}
                    alt={product.name}
                    className="product-card-image w-100"
                    loading="lazy"
                    animate={{ scale: isHovered ? 1.08 : 1 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                        height: '380px',
                        objectFit: 'cover',
                    }}
                />

                {/* Hover Overlay */}
                <motion.div
                    className="product-card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 50%)',
                    }}
                >
                    <div className="d-flex gap-2 justify-content-center mb-2">
                        {/* View Details */}
                        <motion.button
                            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                            onClick={handleViewProduct}
                            whileHover={{ scale: 1.1, backgroundColor: 'var(--vastra-gold)', color: '#fff' }}
                            whileTap={{ scale: 0.9 }}
                            title="View Details"
                            style={{ width: '45px', height: '45px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                        >
                            <Eye size={20} />
                        </motion.button>

                        {/* Add to Cart */}
                        <motion.button
                            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                            onClick={handleAddToCart}
                            whileHover={{ scale: 1.1, backgroundColor: 'var(--vastra-maroon)', color: '#fff' }}
                            whileTap={{ scale: 0.9 }}
                            title="Add to Cart"
                            style={{ width: '45px', height: '45px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                        >
                            <ShoppingBag size={20} />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Status Badge */}
                {!product.isActive && (
                    <span
                        className="position-absolute top-0 start-0 m-3 badge"
                        style={{
                            background: 'var(--vastra-maroon)',
                            color: 'var(--vastra-ivory)',
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            zIndex: 5
                        }}
                    >
                        Coming Soon
                    </span>
                )}
            </div>

            {/* Product Info */}
            <div className="product-card-body p-3 text-center">
                <h3
                    className="product-card-title mb-1"
                    style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--vastra-dark)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    {product.name}
                </h3>

                {/* Color Swatches */}
                {uniqueColors.length > 0 && (
                    <div className="d-flex justify-content-center gap-1 mb-2" style={{ height: '16px' }}>
                        {uniqueColors.slice(0, 4).map(colorName => {
                            const hex = getColorHex(colorName);
                            return (
                                <div
                                    key={colorName}
                                    title={colorName}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: hex,
                                        border: colorName.toLowerCase() === 'white' ? '1px solid #ddd' : 'none',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                />
                            );
                        })}
                        {uniqueColors.length > 4 && (
                            <span style={{ fontSize: '0.7rem', color: '#888' }}>+</span>
                        )}
                    </div>
                )}

                <p
                    className="product-card-price mb-0"
                    style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--vastra-maroon)',
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    {formatPrice(product.basePrice)}
                </p>
            </div>
        </motion.article>
    );
};

export default ProductCard;
