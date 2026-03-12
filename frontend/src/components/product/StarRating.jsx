import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, maxStars = 5, size = 18, interactive = false, onRatingChange = null, showValue = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (starIndex) => {
        if (interactive && onRatingChange) {
            onRatingChange(starIndex);
        }
    };

    const handleMouseEnter = (starIndex) => {
        if (interactive) {
            setHoverRating(starIndex);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="star-rating d-inline-flex align-items-center gap-1">
            <div
                className="stars-container d-inline-flex"
                onMouseLeave={handleMouseLeave}
                style={{ gap: '2px' }}
            >
                {[...Array(maxStars)].map((_, index) => {
                    const starIndex = index + 1;
                    const isFilled = starIndex <= Math.floor(displayRating);
                    const isHalf = !isFilled && starIndex <= Math.ceil(displayRating) && displayRating % 1 >= 0.3;

                    return (
                        <span
                            key={index}
                            onClick={() => handleClick(starIndex)}
                            onMouseEnter={() => handleMouseEnter(starIndex)}
                            style={{
                                cursor: interactive ? 'pointer' : 'default',
                                display: 'inline-flex',
                                position: 'relative',
                                transition: 'transform 0.15s ease',
                                transform: interactive && hoverRating === starIndex ? 'scale(1.2)' : 'scale(1)',
                            }}
                        >
                            {/* Background star (empty) */}
                            <Star
                                size={size}
                                style={{
                                    color: '#e0d5c7',
                                    fill: '#e0d5c7',
                                    opacity: 0.4,
                                }}
                            />
                            {/* Foreground star (filled or half) */}
                            {(isFilled || isHalf) && (
                                <Star
                                    size={size}
                                    style={{
                                        color: 'var(--vastra-gold, #D4AF37)',
                                        fill: 'var(--vastra-gold, #D4AF37)',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        clipPath: isHalf ? 'inset(0 50% 0 0)' : 'none',
                                    }}
                                />
                            )}
                        </span>
                    );
                })}
            </div>
            {showValue && rating > 0 && (
                <span
                    style={{
                        fontSize: size * 0.72 + 'px',
                        color: 'var(--vastra-dark, #1a1a1a)',
                        opacity: 0.7,
                        fontWeight: 500,
                        marginLeft: '4px',
                    }}
                >
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
