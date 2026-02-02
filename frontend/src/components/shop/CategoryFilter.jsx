import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
    // Separate parents and children
    const { parents, children } = useMemo(() => {
        return {
            parents: categories.filter(c => !c.parentCategoryId),
            children: categories.filter(c => c.parentCategoryId)
        };
    }, [categories]);

    // Track active parent tab. 
    // If a child category is selected (from URL/props), find its parent to set active tab.
    const [activeParentId, setActiveParentId] = useState(null);

    useEffect(() => {
        if (selectedCategory) {
            const selected = categories.find(c => c.id === selectedCategory);
            if (selected) {
                if (selected.parentCategoryId) {
                    setActiveParentId(selected.parentCategoryId);
                } else {
                    setActiveParentId(selected.id);
                }
            }
        }
    }, [selectedCategory, categories]);

    const handleParentClick = (parentId) => {
        setActiveParentId(parentId);
        // Ensure we filter by the parent immediately if they switch tabs
        // Optional: If you want clicking "Men" to show All Men's products, pass parentId.
        // If you want it to just show subcats but keep "All" products until a subcat is picked, pass null or parentId.
        // Based on user request "Men: Kurtas...", usually clicking "Men" should show Men's stuff.
        onCategoryChange(parentId);
    };

    const activeChildren = children.filter(c => c.parentCategoryId === activeParentId);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className="category-filter-container mb-5">
            {/* Level 1: Parent Tabs */}
            <div className="d-flex justify-content-center gap-4 mb-4 border-bottom pb-2" style={{ borderColor: 'rgba(128, 0, 32, 0.1)' }}>
                <button
                    className={`parent-tab-btn ${selectedCategory === null && activeParentId === null ? 'active' : ''}`}
                    onClick={() => { setActiveParentId(null); onCategoryChange(null); }}
                >
                    All Collection
                </button>
                {parents.map(parent => (
                    <button
                        key={parent.id}
                        className={`parent-tab-btn ${activeParentId === parent.id ? 'active' : ''}`}
                        onClick={() => handleParentClick(parent.id)}
                    >
                        {parent.name}
                    </button>
                ))}
            </div>

            {/* Level 2: Child Pills */}
            <AnimatePresence mode="wait">
                {activeParentId && activeChildren.length > 0 && (
                    <motion.div
                        key={activeParentId} // Re-render when parent changes
                        className="d-flex flex-wrap justify-content-center gap-2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {activeChildren.map(child => (
                            <motion.button
                                key={child.id}
                                variants={itemVariants}
                                className={`category-filter-btn ${selectedCategory === child.id ? 'active' : ''}`}
                                onClick={() => onCategoryChange(child.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {child.name}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .parent-tab-btn {
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    padding: 0.5rem 1rem;
                    font-family: 'EB Garamond', serif;
                    font-size: 1.25rem;
                    color: var(--vastra-dark);
                    opacity: 0.6;
                    transition: all 0.3s ease;
                }
                .parent-tab-btn:hover {
                    opacity: 1;
                    color: var(--vastra-maroon);
                }
                .parent-tab-btn.active {
                    opacity: 1;
                    color: var(--vastra-maroon);
                    border-bottom-color: var(--vastra-maroon);
                    font-weight: 600;
                }
                /* Reuse existing pill styles but ensure they look good here */
                .category-filter-btn {
                    font-size: 0.95rem;
                    padding: 8px 20px;
                }
            `}</style>
        </div>
    );
};

export default CategoryFilter;
