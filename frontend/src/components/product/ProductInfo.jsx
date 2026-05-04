import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Check, Truck, Shield, RotateCcw, Loader2, Tag } from 'lucide-react';
import { formatPrice } from '../../services/api';
import { getColorHex } from '../../utils/constants';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSale } from '../../context/SaleContext';

const ProductInfo = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, isLoading: isCartLoading } = useCart();
    const { isAuthenticated } = useAuth();
    const { isInWishlist, toggleWishlist, isLoading: isWishlistLoading } = useWishlist();
    const { getBestSaleForPrice } = useSale();

    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartFeedback, setCartFeedback] = useState(null);

    const { colors, sizes, selectedVariant } = useMemo(() => {
        if (!product?.variants) return { colors: [], sizes: [], selectedVariant: null };

        const uniqueColors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
        const uniqueSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];

        let variant = null;
        if (selectedColor && selectedSize) {
            variant = product.variants.find(
                v => v.color === selectedColor && v.size === selectedSize
            );
        }

        return { colors: uniqueColors, sizes: uniqueSizes, selectedVariant: variant };
    }, [product?.variants, selectedColor, selectedSize]);

    React.useEffect(() => {
        if (colors.length > 0 && !selectedColor) {
            setSelectedColor(colors[0]);
        }
        if (sizes.length > 0 && !selectedSize) {
            setSelectedSize(sizes[0]);
        }
    }, [colors, sizes, selectedColor, selectedSize]);

    const displayPrice = useMemo(() => {
        const basePrice = product?.basePrice || 0;
        const adjustment = selectedVariant?.priceAdjustment || 0;
        return basePrice + adjustment;
    }, [product?.basePrice, selectedVariant]);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
        }
    };

    return (
        <motion.div
            className="product-info"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            {/* Product Name */}
            <motion.h1
                variants={itemVariants}
                className="mb-2"
                style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 600,
                    color: 'var(--vastra-dark)',
                    fontFamily: 'EB Garamond, serif',
                }}
            >
                {product?.name}
            </motion.h1>

            {/* Category */}
            <motion.p
                variants={itemVariants}
                className="text-uppercase mb-3"
                style={{
                    letterSpacing: '3px',
                    fontSize: '0.85rem',
                    color: 'var(--vastra-maroon)',
                    fontWeight: 500,
                }}
            >
                {product?.category?.name}
            </motion.p>

            {/* Price */}
            <motion.div variants={itemVariants} className="mb-4">
                {(() => {
                    const sale = getBestSaleForPrice(displayPrice);
                    if (sale) {
                        return (
                            <>
                                <div className="d-flex align-items-baseline gap-3 flex-wrap">
                                    <span
                                        style={{
                                            fontSize: '1.75rem',
                                            fontWeight: 600,
                                            color: 'var(--vastra-maroon)',
                                            fontFamily: 'EB Garamond, serif',
                                        }}
                                    >
                                        {formatPrice(sale.discountedPrice)}
                                    </span>
                                    <span className="price-original" style={{ fontSize: '1.2rem' }}>
                                        {formatPrice(displayPrice)}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
                                    <span className="savings-pill">
                                        You save {formatPrice(sale.saving)}{sale.pct ? ` (${sale.pct}% off)` : ''}
                                    </span>
                                    <span className="coupon-hint">
                                        <Tag size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                        Coupon <strong>{sale.label}</strong>  auto-applied
                                    </span>
                                </div>
                                {selectedVariant?.stockQuantity > 0 && selectedVariant?.stockQuantity <= 5 && (
                                    <span
                                        className="ms-0 mt-2 d-inline-block px-2 py-1"
                                        style={{
                                            fontSize: '0.8rem',
                                            background: 'rgba(128, 0, 32, 0.1)',
                                            color: 'var(--vastra-maroon)',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        Only {selectedVariant.stockQuantity} left
                                    </span>
                                )}
                            </>
                        );
                    }
                    return (
                        <>
                            <span
                                style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 600,
                                    color: 'var(--vastra-maroon)',
                                    fontFamily: 'EB Garamond, serif',
                                }}
                            >
                                {formatPrice(displayPrice)}
                            </span>
                            {selectedVariant?.stockQuantity > 0 && selectedVariant?.stockQuantity <= 5 && (
                                <span
                                    className="ms-3 px-2 py-1"
                                    style={{
                                        fontSize: '0.8rem',
                                        background: 'rgba(128, 0, 32, 0.1)',
                                        color: 'var(--vastra-maroon)',
                                        borderRadius: '4px',
                                    }}
                                >
                                    Only {selectedVariant.stockQuantity} left
                                </span>
                            )}
                        </>
                    );
                })()}
            </motion.div>

            {/* Description */}
            <motion.p
                variants={itemVariants}
                className="mb-4"
                style={{
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    color: 'var(--vastra-dark)',
                    opacity: 0.85,
                }}
            >
                {product?.description}
            </motion.p>

            <div className="vastra-divider-sm" style={{ margin: '1.5rem 0' }} />

            {/* Color Selection */}
            {colors.length > 0 && (
                <motion.div variants={itemVariants} className="mb-4">
                    <label
                        className="d-block mb-3"
                        style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--vastra-dark)',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                        }}
                    >
                        Color: <span style={{ color: 'var(--vastra-maroon)' }}>{selectedColor}</span>
                    </label>
                    <div className="d-flex gap-2 flex-wrap">
                        {colors.map((colorName) => {
                            const hex = getColorHex(colorName);
                            const isGradient = hex.includes('gradient');
                            const isSelected = selectedColor === colorName;

                            return (
                                <motion.button
                                    key={colorName}
                                    className="color-option-btn border-0 p-0 position-relative"
                                    onClick={() => setSelectedColor(colorName)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={colorName}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: isGradient ? hex : hex,
                                        backgroundColor: !isGradient ? hex : undefined,
                                        cursor: 'pointer',
                                        outline: isSelected ? '3px solid var(--vastra-maroon)' : '2px solid rgba(0,0,0,0.1)',
                                        outlineOffset: '3px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    }}
                                >
                                    {isSelected && (
                                        <Check
                                            size={18}
                                            color={colorName.toLowerCase().includes('white') || colorName.toLowerCase().includes('cream') ? '#000' : '#fff'}
                                            className="position-absolute top-50 start-50 translate-middle"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
                <motion.div variants={itemVariants} className="mb-4">
                    <label
                        className="d-block mb-3"
                        style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--vastra-dark)',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                        }}
                    >
                        Size: <span style={{ color: 'var(--vastra-maroon)' }}>{selectedSize}</span>
                    </label>
                    <div className="d-flex gap-2 flex-wrap">
                        {sizes.map((size) => {
                            const isSelected = selectedSize === size;
                            return (
                                <motion.button
                                    key={size}
                                    className="size-option-btn border-0"
                                    onClick={() => setSelectedSize(size)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        minWidth: '50px',
                                        height: '50px',
                                        padding: '0 16px',
                                        borderRadius: '8px',
                                        background: isSelected ? 'var(--vastra-maroon)' : '#fff',
                                        color: isSelected ? 'var(--vastra-ivory)' : 'var(--vastra-dark)',
                                        border: isSelected ? 'none' : '1px solid rgba(128, 0, 32, 0.2)',
                                        fontFamily: 'EB Garamond, serif',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {size}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Quantity */}
            <motion.div variants={itemVariants} className="mb-4">
                <label
                    className="d-block mb-3"
                    style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--vastra-dark)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                    }}
                >
                    Quantity
                </label>
                <div className="d-flex align-items-center gap-0">
                    <button
                        className="quantity-btn border-0"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        style={{
                            width: '45px',
                            height: '45px',
                            background: 'var(--vastra-beige)',
                            borderRadius: '8px 0 0 8px',
                            fontSize: '1.25rem',
                            color: 'var(--vastra-dark)',
                            cursor: 'pointer',
                        }}
                    >
                        −
                    </button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center border-0"
                        style={{
                            width: '60px',
                            height: '45px',
                            background: 'var(--vastra-beige)',
                            fontFamily: 'EB Garamond, serif',
                            fontSize: '1.1rem',
                            color: 'var(--vastra-dark)',
                        }}
                    />
                    <button
                        className="quantity-btn border-0"
                        onClick={() => setQuantity(quantity + 1)}
                        style={{
                            width: '45px',
                            height: '45px',
                            background: 'var(--vastra-beige)',
                            borderRadius: '0 8px 8px 0',
                            fontSize: '1.25rem',
                            color: 'var(--vastra-dark)',
                            cursor: 'pointer',
                        }}
                    >
                        +
                    </button>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="d-flex gap-3 mb-4 flex-wrap">
                <motion.button
                    className="btn btn-vastra-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    whileHover={{ scale: isAddingToCart ? 1 : 1.02 }}
                    whileTap={{ scale: isAddingToCart ? 1 : 0.98 }}
                    style={{ minWidth: '200px' }}
                    disabled={isAddingToCart || !selectedVariant}
                    onClick={async () => {
                        if (!isAuthenticated) {
                            // Redirect to login with return URL
                            navigate('/login', { state: { from: window.location.pathname } });
                            return;
                        }

                        if (!selectedVariant) {
                            setCartFeedback({ type: 'error', message: 'Please select color and size' });
                            setTimeout(() => setCartFeedback(null), 3000);
                            return;
                        }

                        setIsAddingToCart(true);
                        setCartFeedback(null);

                        try {
                            console.log('Adding to cart:', {
                                variantId: selectedVariant.id,
                                quantity,
                                variant: selectedVariant
                            });
                            const result = await addToCart(selectedVariant.id, quantity);

                            if (result.success) {
                                setCartFeedback({ type: 'success', message: 'Added to cart!' });
                                // Reset quantity after successful add
                                setQuantity(1);
                            } else if (result.requiresAuth) {
                                navigate('/login', { state: { from: window.location.pathname } });
                            } else {
                                setCartFeedback({ type: 'error', message: result.error || 'Failed to add to cart' });
                            }
                        } catch (error) {
                            setCartFeedback({ type: 'error', message: 'Something went wrong' });
                        } finally {
                            setIsAddingToCart(false);
                            setTimeout(() => setCartFeedback(null), 3000);
                        }
                    }}
                >
                    {isAddingToCart ? (
                        <>
                            <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                            Adding...
                        </>
                    ) : (
                        <>
                            <ShoppingBag size={20} />
                            Add to Cart
                        </>
                    )}
                </motion.button>
                <motion.button
                    className={`btn ${selectedVariant && isInWishlist(selectedVariant.id).inWishlist ? 'btn-vastra-primary' : 'btn-vastra-outline'} d-flex align-items-center justify-content-center`}
                    onClick={async () => {
                        if (!isAuthenticated) {
                            navigate('/login', { state: { from: window.location.pathname } });
                            return;
                        }
                        if (!selectedVariant) {
                            setCartFeedback({ type: 'error', message: 'Please select color and size' });
                            setTimeout(() => setCartFeedback(null), 3000);
                            return;
                        }
                        setIsTogglingWishlist(true);
                        const result = await toggleWishlist(selectedVariant.id);
                        setIsTogglingWishlist(false);
                        if (result.requiresAuth) {
                            navigate('/login', { state: { from: window.location.pathname } });
                        }
                    }}
                    whileHover={{ scale: isTogglingWishlist ? 1 : 1.05 }}
                    whileTap={{ scale: isTogglingWishlist ? 1 : 0.95 }}
                    style={{ width: '55px', height: '55px', padding: 0 }}
                    disabled={isTogglingWishlist || !selectedVariant}
                >
                    {isTogglingWishlist ? (
                        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <Heart size={22} fill={selectedVariant && isInWishlist(selectedVariant.id).inWishlist ? 'currentColor' : 'none'} />
                    )}
                </motion.button>
            </motion.div>

            {/* Cart Feedback */}
            {cartFeedback && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3 rounded-3"
                    style={{
                        background: cartFeedback.type === 'success'
                            ? 'rgba(40, 167, 69, 0.1)'
                            : 'rgba(220, 53, 69, 0.1)',
                        color: cartFeedback.type === 'success' ? '#28a745' : '#dc3545',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                >
                    {cartFeedback.type === 'success' ? '✓ ' : '✗ '}
                    {cartFeedback.message}
                </motion.div>
            )}

            {/* Trust Badges */}
            <motion.div
                variants={itemVariants}
                className="trust-badges d-flex gap-4 flex-wrap pt-3"
                style={{ borderTop: '1px solid rgba(128, 0, 32, 0.1)' }}
            >
                <div className="d-flex align-items-center gap-2">
                    <Truck size={18} style={{ color: 'var(--vastra-maroon)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--vastra-dark)' }}>
                        Free Shipping
                    </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <Shield size={18} style={{ color: 'var(--vastra-maroon)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--vastra-dark)' }}>
                        Secure Payment
                    </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <RotateCcw size={18} style={{ color: 'var(--vastra-maroon)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--vastra-dark)' }}>
                        Easy Returns
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductInfo;
