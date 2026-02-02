import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../services/api';

const ProductImageGallery = ({ images = [], autoPlayInterval = 4000 }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    // Get main image or fallback
    const mainImageIndex = images.findIndex(img => img.isMainImage);

    // Use initialIndex only on first render
    useEffect(() => {
        if (mainImageIndex >= 0) {
            setSelectedIndex(mainImageIndex);
        }
    }, [mainImageIndex]);

    // Auto-advance to next image
    const nextImage = useCallback(() => {
        if (images.length > 1) {
            setSelectedIndex(prev => (prev + 1) % images.length);
            setProgress(0);
        }
    }, [images.length]);

    // Auto-slideshow effect
    useEffect(() => {
        if (images.length <= 1 || isPaused || isZoomed) {
            return;
        }

        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 0;
                return prev + (100 / (autoPlayInterval / 50));
            });
        }, 50);

        // Image transition
        const slideInterval = setInterval(() => {
            nextImage();
        }, autoPlayInterval);

        return () => {
            clearInterval(progressInterval);
            clearInterval(slideInterval);
        };
    }, [images.length, isPaused, isZoomed, autoPlayInterval, nextImage]);

    // Reset progress when manually selecting image
    const handleSelectImage = (index) => {
        setSelectedIndex(index);
        setProgress(0);
    };

    const currentImage = images[selectedIndex] || images[0];
    const imageUrl = getImageUrl(currentImage?.imageUrl) || 'https://via.placeholder.com/600x800?text=Vastra';

    return (
        <div
            className="product-gallery"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Main Image */}
            <motion.div
                className="product-gallery-main position-relative overflow-hidden mb-3"
                style={{
                    borderRadius: '16px',
                    background: 'var(--vastra-beige)',
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                }}
                onClick={() => setIsZoomed(!isZoomed)}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedIndex}
                        src={imageUrl}
                        alt={currentImage?.altText || 'Product image'}
                        className="w-100"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{
                            opacity: 1,
                            scale: isZoomed ? 1.5 : 1,
                        }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{
                            height: '600px',
                            objectFit: 'cover',
                            transformOrigin: 'center center',
                        }}
                    />
                </AnimatePresence>

                {/* Progress Bar (shows when auto-playing) */}
                {images.length > 1 && !isPaused && !isZoomed && (
                    <div
                        className="position-absolute bottom-0 start-0 w-100"
                        style={{
                            height: '3px',
                            background: 'rgba(255, 255, 255, 0.3)',
                        }}
                    >
                        <motion.div
                            style={{
                                height: '100%',
                                background: 'var(--vastra-gold)',
                                width: `${progress}%`,
                            }}
                            transition={{ duration: 0.05 }}
                        />
                    </div>
                )}

                {/* Image Counter Badge */}
                {images.length > 1 && (
                    <div
                        className="position-absolute bottom-0 end-0 m-3 px-3 py-1 d-flex align-items-center gap-2"
                        style={{
                            background: 'rgba(44, 24, 16, 0.8)',
                            color: 'var(--vastra-ivory)',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontFamily: 'EB Garamond, serif',
                        }}
                    >
                        {isPaused && (
                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>PAUSED</span>
                        )}
                        {selectedIndex + 1} / {images.length}
                    </div>
                )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="product-gallery-thumbnails d-flex gap-2 flex-wrap">
                    {images.map((image, index) => (
                        <motion.button
                            key={image.id || index}
                            className="product-thumbnail border-0 p-0 overflow-hidden"
                            onClick={() => handleSelectImage(index)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '80px',
                                height: '100px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                outline: selectedIndex === index
                                    ? '3px solid var(--vastra-maroon)'
                                    : '2px solid transparent',
                                outlineOffset: '2px',
                                transition: 'outline 0.3s ease',
                            }}
                        >
                            <img
                                src={getImageUrl(image.imageUrl)}
                                alt={image.altText || `Product view ${index + 1}`}
                                className="w-100 h-100"
                                style={{ objectFit: 'cover' }}
                            />
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;

