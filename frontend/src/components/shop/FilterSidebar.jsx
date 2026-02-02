import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { VASTRA_COLORS, VASTRA_SIZES } from '../../utils/constants';

const FilterSidebar = ({
    onFilterChange,
    filters,
    onClearFilters,
    colors = VASTRA_COLORS,
    sizes = VASTRA_SIZES
}) => {
    // Local state for price inputs to prevent rapid API calls/focus loss
    const [localPrices, setLocalPrices] = React.useState({
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || ''
    });

    // Collapsible state for color palette
    const [isColorOpen, setIsColorOpen] = React.useState(false);

    // Sync local state when filters prop changes (e.g. clear filters)
    React.useEffect(() => {
        setLocalPrices({
            minPrice: filters.minPrice || '',
            maxPrice: filters.maxPrice || ''
        });
    }, [filters.minPrice, filters.maxPrice]);

    const handleLocalPriceChange = (e) => {
        const { name, value } = e.target;
        setLocalPrices(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriceCommit = (name) => {
        const value = localPrices[name];
        const numValue = value === '' ? null : Number(value);
        if (numValue !== filters[name]) {
            onFilterChange(name, numValue);
        }
    };

    const handleKeyDown = (e, name) => {
        if (e.key === 'Enter') {
            handlePriceCommit(name);
        }
    };

    const handleCheckboxChange = (type, value) => {
        const currentValues = filters[type] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(type, newValues);
    };

    const containerVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const selectedColorCount = filters.colors?.length || 0;

    return (
        <motion.div
            className="vastra-filter-sidebar"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="filter-header d-flex justify-content-between align-items-center mb-4">
                <h4 className="m-0 d-flex align-items-center gap-2">
                    <Filter size={20} strokeWidth={1.5} className="text-vastra-maroon" />
                    Refine Collection
                </h4>
                <motion.button
                    className="clear-btn d-flex align-items-center gap-1"
                    onClick={onClearFilters}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <RotateCcw size={14} />
                    Reset
                </motion.button>
            </div>

            {/* Price Range */}
            <motion.div className="filter-section mb-5" variants={itemVariants}>
                <h6 className="filter-title">Price Range</h6>
                <div className="price-inputs d-flex align-items-center gap-3">
                    <div className="price-input-wrapper">
                        <span>₹</span>
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Min"
                            className="vastra-input"
                            value={localPrices.minPrice}
                            onChange={handleLocalPriceChange}
                            onBlur={() => handlePriceCommit('minPrice')}
                            onKeyDown={(e) => handleKeyDown(e, 'minPrice')}
                        />
                    </div>
                    <div className="price-divider"></div>
                    <div className="price-input-wrapper">
                        <span>₹</span>
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max"
                            className="vastra-input"
                            value={localPrices.maxPrice}
                            onChange={handleLocalPriceChange}
                            onBlur={() => handlePriceCommit('maxPrice')}
                            onKeyDown={(e) => handleKeyDown(e, 'maxPrice')}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Colors - Collapsible */}
            <motion.div className="filter-section" style={{ marginBottom: '2rem' }} variants={itemVariants}>
                <button
                    className="filter-title-btn"
                    onClick={() => setIsColorOpen(!isColorOpen)}
                    aria-expanded={isColorOpen}
                >
                    <h6 className="filter-title" style={{ marginBottom: 0 }}>
                        Color Palette
                        {selectedColorCount > 0 && (
                            <span className="filter-badge">{selectedColorCount}</span>
                        )}
                    </h6>
                    <motion.span
                        animate={{ rotate: isColorOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="filter-chevron"
                    >
                        <ChevronDown size={18} />
                    </motion.span>
                </button>

                <AnimatePresence>
                    {isColorOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="color-grid" style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                                {colors.map(color => (
                                    <motion.button
                                        key={color.name}
                                        className={`color-swatch-btn ${filters.colors?.includes(color.name) ? 'active' : ''}`}
                                        onClick={() => handleCheckboxChange('colors', color.name)}
                                        title={color.name}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <span
                                            className="color-circle"
                                            style={{
                                                background: color.hex,
                                                border: color.hex === '#FFFFFF' || color.hex === '#FAF9F6' || color.hex === '#FFFDD0' ? '1px solid #ddd' : 'none'
                                            }}
                                        />
                                        <span className="color-name">{color.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Sizes */}
            <motion.div className="filter-section mb-4" variants={itemVariants}>
                <h6 className="filter-title">Size Options</h6>
                <div className="size-grid">
                    {sizes.map(size => (
                        <motion.button
                            key={size}
                            className={`size-tag-btn ${filters.sizes?.includes(size) ? 'active' : ''}`}
                            onClick={() => handleCheckboxChange('sizes', size)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {size}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <div className="sidebar-footer mt-5 p-4 text-center">
                <p className="text-muted small italic">Handcrafted with Heritage</p>
                <div className="vastra-divider-sm"></div>
            </div>
        </motion.div>
    );
};

export default FilterSidebar;

