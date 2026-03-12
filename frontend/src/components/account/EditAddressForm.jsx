import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';

const EditAddressForm = ({ address, onUpdateAddress, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'India'
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
        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onUpdateAddress(address.id, formData);
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
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 mb-3"
            style={{
                background: 'var(--vastra-beige)',
                borderRadius: '12px',
                border: '1px solid rgba(128, 0, 32, 0.1)'
            }}
        >
            <h6 className="mb-3" style={{ color: 'var(--vastra-dark)', fontWeight: 600 }}>
                Edit Address
            </h6>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        name="street"
                        placeholder="Street Address"
                        value={formData.street}
                        onChange={handleChange}
                        style={inputStyle}
                        isInvalid={!!errors.street}
                    />
                    <Form.Control.Feedback type="invalid">{errors.street}</Form.Control.Feedback>
                </Form.Group>

                <Row className="g-3 mb-3">
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.city}
                        />
                        <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.state}
                        />
                        <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                    </Col>
                </Row>

                <Row className="g-3 mb-3">
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            name="zipCode"
                            placeholder="ZIP Code"
                            value={formData.zipCode}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.zipCode}
                        />
                        <Form.Control.Feedback type="invalid">{errors.zipCode}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={formData.country}
                            onChange={handleChange}
                            style={inputStyle}
                            isInvalid={!!errors.country}
                        />
                        <Form.Control.Feedback type="invalid">{errors.country}</Form.Control.Feedback>
                    </Col>
                </Row>

                <div className="d-flex gap-2">
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-vastra-primary"
                        disabled={isLoading}
                        style={{ padding: '10px 24px' }}
                    >
                        {isLoading ? 'Updating...' : 'Update Address'}
                    </motion.button>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn"
                        onClick={onCancel}
                        style={{
                            border: '1px solid rgba(128, 0, 32, 0.3)',
                            color: 'var(--vastra-dark)',
                            padding: '10px 24px'
                        }}
                    >
                        Cancel
                    </motion.button>
                </div>
            </Form>
        </motion.div>
    );
};

export default EditAddressForm;
