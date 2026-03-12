import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Edit, Trash2 } from 'lucide-react';

const AddressCard = ({ address, onEdit, onDelete, isDeleting }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="p-3 mb-2"
        style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(128, 0, 32, 0.1)',
        }}
    >
        <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex gap-3">
                <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)'
                    }}
                >
                    <MapPin size={18} style={{ color: 'var(--vastra-maroon)' }} />
                </div>
                <div>
                    <p className="mb-1" style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>
                        {address.street}
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>
                        {address.city}, {address.state} - {address.zipCode}
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--vastra-dark)', opacity: 0.7 }}>
                        {address.country}
                    </p>
                </div>
            </div>
            <div className="d-flex gap-2">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-link p-2"
                    onClick={() => onEdit(address)}
                    disabled={isDeleting}
                    style={{ color: 'var(--vastra-maroon)' }}
                    title="Edit address"
                >
                    <Edit size={18} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-link p-2"
                    onClick={() => onDelete(address.id)}
                    disabled={isDeleting}
                    style={{ color: '#dc3545' }}
                    title="Delete address"
                >
                    {isDeleting ? (
                        <div className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                        <Trash2 size={18} />
                    )}
                </motion.button>
            </div>
        </div>
    </motion.div>
);

export default AddressCard;
