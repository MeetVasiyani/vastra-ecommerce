import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, AlertCircle } from 'lucide-react';

const ChangePasswordModal = ({ onChangePassword, onClose, isLoading }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (formError) {
            setFormError('');
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
        if (!formData.newPassword) newErrors.newPassword = 'New password is required';
        else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';

        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm new password';
        else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (validate()) {
            try {
                const result = await onChangePassword({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                });

                if (result.success) {
                    onClose();
                } else {
                    setFormError(result.error || 'Failed to change password');
                }
            } catch (err) {
                setFormError(err.message || 'An unexpected error occurred');
            }
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
                        <KeyRound size={20} className="me-2" style={{ color: 'var(--vastra-maroon)' }} />
                        Change Password
                    </h5>
                    <button
                        className="btn-close"
                        onClick={onClose}
                        disabled={isLoading}
                    />
                </div>

                <AnimatePresence>
                    {formError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="alert d-flex align-items-center gap-2 mb-4 py-2"
                            style={{
                                background: 'rgba(220, 53, 69, 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#dc3545',
                                fontSize: '0.9rem'
                            }}
                        >
                            <AlertCircle size={16} />
                            {formError}
                        </motion.div>
                    )}
                </AnimatePresence>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>Current Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="currentPassword"
                            placeholder="Enter current password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.currentPassword}
                            disabled={isLoading}
                        />
                        <Form.Control.Feedback type="invalid">{errors.currentPassword}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="newPassword"
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.newPassword}
                            disabled={isLoading}
                        />
                        <Form.Control.Feedback type="invalid">{errors.newPassword}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: 500, color: 'var(--vastra-dark)' }}>Confirm New Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.confirmPassword}
                            disabled={isLoading}
                        />
                        <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-vastra-primary flex-grow-1"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Changing...' : 'Change Password'}
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

export default ChangePasswordModal;
