import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag } from 'lucide-react';
import { formatPrice, getImageUrl } from '../../services/api';
import { getColorHex } from '../../utils/constants';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleViewProduct = (e) => {
        e.stopPropagation();
        navigate(`/product/${product.id}`);
    };

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    // Get the main image or first image, fallback to placeholder
    const rawImageUrl = product.images?.find((img) => img.isMainImage)?.imageUrl
        || product.images?.[0]?.imageUrl;
    const mainImage = getImageUrl(rawImageUrl) || 'https://via.placeholder.com/400x500?text=Vastra';

    return (
        <motion.article
            className="product-card h-100"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            role="article"
            aria-label={`Product: ${product.name}`}
            tabIndex={0}
            style={{ cursor: 'pointer' }}
        >
            {/* Image Container */}
            <div className="product-card-image-wrapper position-relative overflow-hidden">
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
                    className="product-card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background: 'linear-gradient(to top, rgba(128, 0, 32, 0.95), transparent 70%)',
                    }}
                >
                    <div className="d-flex gap-2 justify-content-center">
                        <motion.button
                            className="btn btn-light d-flex align-items-center gap-2"
                            onClick={handleViewProduct}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                borderRadius: '30px',
                                padding: '10px 20px',
                                fontSize: '0.9rem',
                                fontFamily: 'EB Garamond, serif',
                            }}
                        >
                            <Eye size={18} />
                            View
                        </motion.button>
                        <motion.button
                            className="btn d-flex align-items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                borderRadius: '30px',
                                padding: '10px 20px',
                                fontSize: '0.9rem',
                                fontFamily: 'EB Garamond, serif',
                                background: 'var(--vastra-gold)',
                                color: 'var(--vastra-dark)',
                                border: 'none',
                            }}
                        >
                            <ShoppingBag size={18} />
                            Add
                        </motion.button>
                    </div>
                </motion.div>

                {/* Status Badge */}
                {!product.isActive && (
                    <span
                        className="position-absolute top-0 end-0 m-3 badge"
                        style={{
                            background: 'var(--vastra-maroon)',
                            color: 'var(--vastra-ivory)',
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                        }}
                    >
                        Coming Soon
                    </span>
                )}
            </div>

            {/* Product Info */}
            <div className="product-card-body p-3 text-center">
                <h3
                    className="product-card-title mb-2"
                    style={{
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: 'var(--vastra-dark)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {product.name}
                </h3>

                {/* Color Swatches */}
                {product.variants && product.variants.length > 0 && (
                    <div className="d-flex justify-content-center gap-1 mb-2">
                        {[...new Set(product.variants.map(v => v.color))].map(colorName => {
                            const hex = getColorHex(colorName);
                            return (
                                <div
                                    key={colorName}
                                    title={colorName}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: hex,
                                        border: colorName.toLowerCase() === 'white' ? '1px solid #ddd' : 'none',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}
                                />
                            );
                        })}
                    </div>
                )}

                <p
                    className="product-card-price mb-0"
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: 'var(--vastra-maroon)',
                    }}
                >
                    {formatPrice(product.basePrice)}
                </p>
            </div>
        </motion.article>
    );
};

export default ProductCard;
