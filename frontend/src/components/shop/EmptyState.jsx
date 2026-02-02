import React from 'react';
import { motion } from 'framer-motion';
import { Package, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

const EmptyState = ({ onClearFilters, hasFilters = false }) => {
    return (
        <motion.div
            className="empty-state text-center py-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div
                className="empty-state-icon mb-4 mx-auto d-flex align-items-center justify-content-center"
                style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--vastra-beige), var(--vastra-ivory))',
                    boxShadow: '0 10px 30px rgba(128, 0, 32, 0.1)',
                }}
            >
                <Package
                    size={48}
                    style={{ color: 'var(--vastra-maroon)', opacity: 0.7 }}
                />
            </div>
            <h3
                className="mb-3"
                style={{
                    color: 'var(--vastra-dark)',
                    fontWeight: 600,
                }}
            >
                No Products Found
            </h3>
            <p
                className="mb-4 mx-auto"
                style={{
                    maxWidth: '400px',
                    color: 'var(--vastra-dark)',
                    opacity: 0.7,
                }}
            >
                {hasFilters
                    ? 'We couldn\'t find any products matching your selected filters. Try adjusting your criteria.'
                    : 'Our collection is being curated with the finest pieces. Please check back soon.'}
            </p>
            {hasFilters && (
                <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="d-inline-flex align-items-center gap-2"
                >
                    <RefreshCw size={18} />
                    Clear Filters
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyState;
