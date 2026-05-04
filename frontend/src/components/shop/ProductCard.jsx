import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useSale } from '../../context/SaleContext';
import { formatPrice, getImageUrl } from '../../services/api';
import { getColorHex } from '../../utils/constants';
import StarRating from '../product/StarRating';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { getBestSaleForPrice } = useSale();

    const sale = getBestSaleForPrice(product.basePrice);

    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const wishlistStatus = defaultVariant ? isInWishlist(defaultVariant.id) : { inWishlist: false };
    const inWishlist = wishlistStatus.inWishlist;

    const handleViewProduct = (e) => {
        e.stopPropagation();
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (product.variants?.length === 1) {
            await addToCart(product.variants[0].id, 1);
        } else {
            navigate(`/product/${product.id}`);
        }
    };

    const handleWishlistClick = async (e) => {
        e.stopPropagation();
        if (defaultVariant) {
            await toggleWishlist(defaultVariant.id);
        }
    };

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    const rawImageUrl = product.images?.find((img) => img.isMainImage)?.imageUrl
        || product.images?.[0]?.imageUrl;
    const mainImage = getImageUrl(rawImageUrl) || 'https://via.placeholder.com/400x500?text=Vastra';

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
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            role="article"
            aria-label={`Product: ${product.name}`}
            tabIndex={0}
            style={{
                cursor: 'pointer',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#fff',
                border: '1px solid rgba(128, 0, 32, 0.08)',
                boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.3s ease'
            }}
        >
            {/* Image Container */}
            <div className="position-relative overflow-hidden" style={{ background: 'var(--vastra-beige)' }}>
                {/* Wishlist Button */}
                <motion.button
                    className="btn position-absolute d-flex align-items-center justify-content-center p-0"
                    onClick={handleWishlistClick}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isHovered || inWishlist ? 1 : 0, scale: 1 }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        top: '16px',
                        right: '16px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: 'none',
                        zIndex: 10,
                        color: inWishlist ? 'var(--vastra-maroon)' : '#666',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    <Heart size={18} fill={inWishlist ? "currentColor" : "none"} strokeWidth={2.5} />
                </motion.button>

                {/* Status Badge (Coming Soon) */}
                {!product.isActive && (
                    <span
                        className="position-absolute badge"
                        style={{
                            top: '16px',
                            left: '16px',
                            background: 'var(--vastra-maroon)',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '6px 14px',
                            borderRadius: '20px',
                            zIndex: 5,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Coming Soon
                    </span>
                )}

                <motion.img
                    src={mainImage}
                    alt={product.name}
                    className="w-100"
                    loading="lazy"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                        height: '360px',
                        objectFit: 'cover',
                    }}
                />

                {/* Quick Action Buttons - Show on Hover */}
                <motion.div
                    className="position-absolute bottom-0 start-0 w-100 d-flex gap-2 p-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.button
                        className="btn flex-fill d-flex align-items-center justify-content-center gap-2"
                        onClick={handleViewProduct}
                        whileHover={{ backgroundColor: 'var(--vastra-gold)' }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            background: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: 'var(--vastra-dark)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                        }}
                    >
                        <Eye size={18} />
                        <span>View</span>
                    </motion.button>

                    <motion.button
                        className="btn flex-fill d-flex align-items-center justify-content-center gap-2"
                        onClick={handleAddToCart}
                        whileHover={{ backgroundColor: 'var(--vastra-deep-maroon)' }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            background: 'var(--vastra-maroon)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: '#fff',
                            boxShadow: '0 4px 16px rgba(128, 0, 32, 0.3)'
                        }}
                    >
                        <ShoppingBag size={18} />
                        <span>Add</span>
                    </motion.button>
                </motion.div>
            </div>

            {/* Product Info */}
            <div className="p-4" style={{ background: '#fff' }}>
                {/* Product Name */}
                <h3
                    className="mb-2"
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--vastra-dark)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.5',
                        minHeight: '3.3rem',
                        fontFamily: "'EB Garamond', serif"
                    }}
                >
                    {product.name}
                </h3>

                {/* Rating & Reviews */}
                <div className="d-flex align-items-center gap-2 mb-3" style={{ minHeight: '22px' }}>
                    {product.reviewCount > 0 ? (
                        <>
                            <StarRating rating={product.averageRating} size={15} />
                            <span style={{
                                fontSize: '0.85rem',
                                color: '#666',
                                fontWeight: 500
                            }}>
                                ({product.reviewCount})
                            </span>
                        </>
                    ) : (
                        <span style={{
                            fontSize: '0.85rem',
                            color: '#999',
                            fontStyle: 'italic'
                        }}>
                            No reviews yet
                        </span>
                    )}
                </div>

                {/* Color Options */}
                {uniqueColors.length > 0 && (
                    <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#666',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Colors:
                            </span>
                            <div className="d-flex gap-1">
                                {uniqueColors.slice(0, 4).map(colorName => {
                                    const hex = getColorHex(colorName);
                                    return (
                                        <div
                                            key={colorName}
                                            title={colorName}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '4px',
                                                backgroundColor: hex,
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                            }}
                                        />
                                    );
                                })}
                                {uniqueColors.length > 4 && (
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: '#888',
                                        fontWeight: 600,
                                        marginLeft: '4px'
                                    }}>
                                        +{uniqueColors.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Price */}
                <div className="d-flex align-items-center justify-content-between">
                    {sale ? (
                        <div className="d-flex flex-column">
                            <span className="price-original">
                                {formatPrice(product.basePrice)}
                            </span>
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        color: 'var(--vastra-maroon)',
                                        fontFamily: "'EB Garamond', serif"
                                    }}
                                >
                                    {formatPrice(sale.discountedPrice)}
                                </span>
                                <span className="sale-badge-inline">
                                    {sale.pct ? `-${sale.pct}%` : 'SALE'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p
                            className="mb-0"
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: 'var(--vastra-maroon)',
                                fontFamily: "'EB Garamond', serif"
                            }}
                        >
                            {formatPrice(product.basePrice)}
                        </p>
                    )}
                </div>
            </div>
        </motion.article>
    );
};

export default ProductCard;
