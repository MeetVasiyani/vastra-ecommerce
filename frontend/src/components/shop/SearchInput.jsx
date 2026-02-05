import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

const SearchInput = ({ value, onChange, onClear, placeholder = 'Search products...' }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && value) {
            onClear();
        }
    };

    const handleChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <motion.div
            className="search-input-wrapper position-relative mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Search Icon */}
            <span
                className="search-icon position-absolute"
                style={{
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--vastra-maroon)',
                    opacity: 0.7,
                    pointerEvents: 'none',
                }}
            >
                <Search size={20} strokeWidth={1.5} />
            </span>

            {/* Search Input */}
            <input
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="vastra-search-input"
                style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    background: 'var(--vastra-ivory)',
                    border: '2px solid rgba(128, 0, 32, 0.12)',
                    borderRadius: '12px',
                    fontFamily: "'EB Garamond', serif",
                    fontSize: '1.05rem',
                    color: 'var(--vastra-dark)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                }}
                aria-label="Search products"
            />

            {/* Clear Button */}
            <AnimatePresence>
                {value && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClear}
                        className="clear-search-btn position-absolute"
                        style={{
                            right: '12px',
                            top: '0',
                            bottom: '0',
                            margin: 'auto 0',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(128, 0, 32, 0.08)',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            color: 'var(--vastra-maroon)',
                            transition: 'background 0.2s ease',
                        }}
                        aria-label="Clear search"
                        type="button"
                    >
                        <X size={16} strokeWidth={2} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Inline Styles for Focus States */}
            <style>{`
                .vastra-search-input:focus {
                    border-color: var(--vastra-maroon);
                    background: #fff;
                    box-shadow: 0 4px 20px rgba(128, 0, 32, 0.08);
                }
                .vastra-search-input::placeholder {
                    color: var(--vastra-dark);
                    opacity: 0.45;
                }
                .clear-search-btn:hover {
                    background: rgba(128, 0, 32, 0.15) !important;
                }
                .clear-search-btn:active {
                    transform: scale(0.95) !important;
                }
            `}</style>
        </motion.div>
    );
};

export default SearchInput;
