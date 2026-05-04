import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { submitContactForm } from '../services/contactService';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Name cannot exceed 100 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.phone && !/^[\d\s()+-]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (formData.subject.length > 200) {
            newErrors.subject = 'Subject cannot exceed 200 characters';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.length > 2000) {
            newErrors.message = 'Message cannot exceed 2000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));


        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            const result = await submitContactForm(formData);

            if (result.success) {
                setSubmitStatus({
                    type: 'success',
                    message: result.message || 'Thank you for contacting us! We\'ll get back to you soon.'
                });

                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            } else {
                setSubmitStatus({
                    type: 'danger',
                    message: result.error || 'Failed to submit the form. Please try again.'
                });
            }
        } catch (error) {
            setSubmitStatus({
                type: 'danger',
                message: 'An unexpected error occurred. Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--vastra-ivory)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div style={{ flex: 1, padding: '60px 0 80px' }}>
                <Container style={{ maxWidth: '1200px' }}>
                    {/* Page Title */}
                    <div className="text-center mb-5">
                        <h1
                            style={{
                                fontFamily: "'EB Garamond', serif",
                                color: 'var(--vastra-dark)',
                                fontSize: '3rem',
                                fontWeight: 700,
                                marginBottom: '1rem'
                            }}
                        >
                            Contact Us
                        </h1>
                        <p
                            style={{
                                color: '#666',
                                fontSize: '1.1rem',
                                maxWidth: '600px',
                                margin: '0 auto'
                            }}
                        >
                            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                        <div
                            style={{
                                width: '80px',
                                height: '3px',
                                background: 'linear-gradient(to right, var(--vastra-maroon), var(--vastra-gold))',
                                margin: '2rem auto'
                            }}
                        />
                    </div>

                    <Row className="g-4">
                        {/* Contact Information */}
                        <Col lg={4}>
                            <div
                                style={{
                                    backgroundColor: '#fff',
                                    padding: '2.5rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    border: '1px solid rgba(212, 175, 55, 0.2)',
                                    height: '100%'
                                }}
                            >
                                <h3
                                    style={{
                                        fontFamily: "'EB Garamond', serif",
                                        color: 'var(--vastra-maroon)',
                                        fontSize: '1.8rem',
                                        fontWeight: 600,
                                        marginBottom: '2rem'
                                    }}
                                >
                                    Get in Touch
                                </h3>

                                {/* Contact Info Items */}
                                <div className="mb-4">
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            marginBottom: '1.5rem'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                backgroundColor: 'var(--vastra-maroon)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Mail size={20} color="var(--vastra-ivory)" />
                                        </div>
                                        <div>
                                            <h6
                                                style={{
                                                    fontFamily: "'EB Garamond', serif",
                                                    color: 'var(--vastra-dark)',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                Email
                                            </h6>
                                            <a
                                                href="mailto:support@vastra.com"
                                                style={{
                                                    color: '#666',
                                                    textDecoration: 'none',
                                                    fontSize: '0.95rem',
                                                    transition: 'color 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = 'var(--vastra-maroon)'}
                                                onMouseLeave={(e) => e.target.style.color = '#666'}
                                            >
                                                support@vastra.com
                                            </a>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            marginBottom: '1.5rem'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                backgroundColor: 'var(--vastra-maroon)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Phone size={20} color="var(--vastra-ivory)" />
                                        </div>
                                        <div>
                                            <h6
                                                style={{
                                                    fontFamily: "'EB Garamond', serif",
                                                    color: 'var(--vastra-dark)',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                Phone
                                            </h6>
                                            <a
                                                href="tel:+911234567890"
                                                style={{
                                                    color: '#666',
                                                    textDecoration: 'none',
                                                    fontSize: '0.95rem',
                                                    transition: 'color 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = 'var(--vastra-maroon)'}
                                                onMouseLeave={(e) => e.target.style.color = '#666'}
                                            >
                                                +91 123 456 7890
                                            </a>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            marginBottom: '1.5rem'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                backgroundColor: 'var(--vastra-maroon)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <MapPin size={20} color="var(--vastra-ivory)" />
                                        </div>
                                        <div>
                                            <h6
                                                style={{
                                                    fontFamily: "'EB Garamond', serif",
                                                    color: 'var(--vastra-dark)',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                Address
                                            </h6>
                                            <p
                                                style={{
                                                    color: '#666',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.6',
                                                    margin: 0
                                                }}
                                            >
                                                123 Heritage Street,<br />
                                                Mumbai, Maharashtra 400001<br />
                                                India
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                backgroundColor: 'var(--vastra-maroon)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Clock size={20} color="var(--vastra-ivory)" />
                                        </div>
                                        <div>
                                            <h6
                                                style={{
                                                    fontFamily: "'EB Garamond', serif",
                                                    color: 'var(--vastra-dark)',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                Hours
                                            </h6>
                                            <p
                                                style={{
                                                    color: '#666',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.6',
                                                    margin: 0
                                                }}
                                            >
                                                Monday - Saturday<br />
                                                10:00 AM - 7:00 PM IST
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Contact Form */}
                        <Col lg={8}>
                            <div
                                style={{
                                    backgroundColor: '#fff',
                                    padding: '2.5rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    border: '1px solid rgba(212, 175, 55, 0.2)'
                                }}
                            >
                                <h3
                                    style={{
                                        fontFamily: "'EB Garamond', serif",
                                        color: 'var(--vastra-maroon)',
                                        fontSize: '1.8rem',
                                        fontWeight: 600,
                                        marginBottom: '2rem'
                                    }}
                                >
                                    Send us a Message
                                </h3>

                                {submitStatus.message && (
                                    <Alert
                                        variant={submitStatus.type}
                                        onClose={() => setSubmitStatus({ type: '', message: '' })}
                                        dismissible
                                        style={{ marginBottom: '1.5rem' }}
                                    >
                                        {submitStatus.message}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label
                                                    style={{
                                                        fontFamily: "'EB Garamond', serif",
                                                        color: 'var(--vastra-dark)',
                                                        fontWeight: 600,
                                                        marginBottom: '0.5rem'
                                                    }}
                                                >
                                                    Name <span style={{ color: 'red' }}>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.name}
                                                    placeholder="Your full name"
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${errors.name ? 'red' : 'rgba(128, 0, 32, 0.2)'}`,
                                                        fontFamily: "'EB Garamond', serif",
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label
                                                    style={{
                                                        fontFamily: "'EB Garamond', serif",
                                                        color: 'var(--vastra-dark)',
                                                        fontWeight: 600,
                                                        marginBottom: '0.5rem'
                                                    }}
                                                >
                                                    Email <span style={{ color: 'red' }}>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.email}
                                                    placeholder="your.email@example.com"
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${errors.email ? 'red' : 'rgba(128, 0, 32, 0.2)'}`,
                                                        fontFamily: "'EB Garamond', serif",
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label
                                                    style={{
                                                        fontFamily: "'EB Garamond', serif",
                                                        color: 'var(--vastra-dark)',
                                                        fontWeight: 600,
                                                        marginBottom: '0.5rem'
                                                    }}
                                                >
                                                    Phone (Optional)
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.phone}
                                                    placeholder="+91 123 456 7890"
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${errors.phone ? 'red' : 'rgba(128, 0, 32, 0.2)'}`,
                                                        fontFamily: "'EB Garamond', serif",
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phone}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label
                                                    style={{
                                                        fontFamily: "'EB Garamond', serif",
                                                        color: 'var(--vastra-dark)',
                                                        fontWeight: 600,
                                                        marginBottom: '0.5rem'
                                                    }}
                                                >
                                                    Subject <span style={{ color: 'red' }}>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.subject}
                                                    placeholder="How can we help?"
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${errors.subject ? 'red' : 'rgba(128, 0, 32, 0.2)'}`,
                                                        fontFamily: "'EB Garamond', serif",
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.subject}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.Label
                                                    style={{
                                                        fontFamily: "'EB Garamond', serif",
                                                        color: 'var(--vastra-dark)',
                                                        fontWeight: 600,
                                                        marginBottom: '0.5rem'
                                                    }}
                                                >
                                                    Message <span style={{ color: 'red' }}>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={5}
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.message}
                                                    placeholder="Tell us more about your inquiry..."
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${errors.message ? 'red' : 'rgba(128, 0, 32, 0.2)'}`,
                                                        fontFamily: "'EB Garamond', serif",
                                                        fontSize: '1rem',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.message}
                                                </Form.Control.Feedback>
                                                <div
                                                    style={{
                                                        fontSize: '0.85rem',
                                                        color: '#666',
                                                        marginTop: '0.5rem',
                                                        textAlign: 'right'
                                                    }}
                                                >
                                                    {formData.message.length} / 2000 characters
                                                </div>
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12}>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn-vastra-primary"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginTop: '1rem'
                                                }}
                                            >
                                                <Send size={18} />
                                                {loading ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Footer />
        </div>
    );
};

export default ContactPage;
