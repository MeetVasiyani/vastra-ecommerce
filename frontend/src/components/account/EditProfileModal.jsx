import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Edit } from 'lucide-react';

const EditProfileModal = ({ profile, onUpdate, onClose, isLoading }) => {
    const [formData, setFormData] = useState({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        phoneNumber: profile?.phoneNumber || ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (formData.phoneNumber && !/^[0-9+\-\s()]*$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Invalid phone number format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onUpdate(formData);
        }
    };

    const inputStyle = {
        borderRadius: '10px',
        border: '1px solid rgba(128, 0, 32, 0.2)',
        padding: '12px 16px',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease'
    };

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9999,
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-4"
                style={{
                    background: '#fff',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(128, 0, 32, 0.15)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="mb-0" style={{ color: 'var(--vastra-dark)', fontWeight: 600, fontFamily: 'EB Garamond, serif' }}>
                        <Edit size={20} className="me-2" style={{ color: 'var(--vastra-maroon)' }} />
                        Edit Profile
                    </h5>
                    <button
                        className="btn-close"
                        onClick={onClose}
                        disabled={isLoading}
                    />
                </div>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="firstName"
                            placeholder="Enter first name"
                            value={formData.firstName}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.firstName}
                        />
                        <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="lastName"
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.lastName}
                        />
                        <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>Phone Number</Form.Label>
                        <Form.Control
                            type="tel"
                            name="phoneNumber"
                            placeholder="Enter phone number (optional)"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.phoneNumber}
                        />
                        <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-vastra-primary flex-grow-1"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Update Profile'}
                        </motion.button>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn"
                            onClick={onClose}
                            disabled={isLoading}
                            style={{
                                border: '1px solid rgba(128, 0, 32, 0.3)',
                                color: 'var(--vastra-dark)'
                            }}
                        >
                            Cancel
                        </motion.button>
                    </div>
                </Form>
            </motion.div>
        </div>
    );
};

export default EditProfileModal;
