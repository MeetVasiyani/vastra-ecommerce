import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

// Star display helper
export const StarDisplay = ({ rating, size = 16 }) => (
    <div className="d-flex gap-1 align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={size}
                fill={star <= rating ? 'var(--vastra-maroon)' : 'none'}
                style={{ color: star <= rating ? 'var(--vastra-maroon)' : '#ccc', flexShrink: 0 }}
            />
        ))}
    </div>
);

// Interactive star selector for editing
export const StarSelector = ({ rating, onRatingChange }) => (
    <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="btn p-0 border-0"
                onClick={() => onRatingChange(star)}
                style={{ background: 'none', lineHeight: 1 }}
            >
                <Star
                    size={22}
                    fill={star <= rating ? 'var(--vastra-maroon)' : 'none'}
                    style={{ color: star <= rating ? 'var(--vastra-maroon)' : '#ccc' }}
                />
            </motion.button>
        ))}
    </div>
);
