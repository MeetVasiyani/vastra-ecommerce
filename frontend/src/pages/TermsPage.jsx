import React, { useEffect } from 'react';
import LegalPageLayout from '../components/layout/LegalPageLayout';

const TermsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <LegalPageLayout title="Terms of Service">
            <section className="mb-4">
                <h3
                    style={{
                        fontFamily: "'EB Garamond', serif",
                        color: 'var(--vastra-maroon)',
                        marginBottom: '1rem',
                        borderBottom: '1px solid var(--vastra-gold)',
                        paddingBottom: '0.5rem',
                        display: 'inline-block'
                    }}
                >
                    1. Introduction
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    Welcome to Vastra. These Terms of Service govern your use of our website and services. By accessing or using our website, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our services.
                </p>
            </section>

            <section className="mb-4">
                <h3
                    style={{
                        fontFamily: "'EB Garamond', serif",
                        color: 'var(--vastra-maroon)',
                        marginBottom: '1rem',
                        borderBottom: '1px solid var(--vastra-gold)',
                        paddingBottom: '0.5rem',
                        display: 'inline-block'
                    }}
                >
                    2. Use of Our Service
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    You must be at least 18 years old to use our services. You agree to use our website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the website.
                </p>
            </section>

            <section className="mb-4">
                <h3
                    style={{
                        fontFamily: "'EB Garamond', serif",
                        color: 'var(--vastra-maroon)',
                        marginBottom: '1rem',
                        borderBottom: '1px solid var(--vastra-gold)',
                        paddingBottom: '0.5rem',
                        display: 'inline-block'
                    }}
                >
                    3. Product Information
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    We strive to display our products as accurately as possible. However, the colors you see will depend on your monitor, and we cannot guarantee that your monitor's display of any color will be accurate. All our products are handcrafted, and minor variations are natural and part of their charm.
                </p>
            </section>

            <section className="mb-4">
                <h3
                    style={{
                        fontFamily: "'EB Garamond', serif",
                        color: 'var(--vastra-maroon)',
                        marginBottom: '1rem',
                        borderBottom: '1px solid var(--vastra-gold)',
                        paddingBottom: '0.5rem',
                        display: 'inline-block'
                    }}
                >
                    4. Pricing and Payment
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.
                </p>
            </section>

            <section className="mb-4">
                <h3
                    style={{
                        fontFamily: "'EB Garamond', serif",
                        color: 'var(--vastra-maroon)',
                        marginBottom: '1rem',
                        borderBottom: '1px solid var(--vastra-gold)',
                        paddingBottom: '0.5rem',
                        display: 'inline-block'
                    }}
                >
                    5. Intellectual Property
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    All content included on this site, such as text, graphics, logos, images, and software, is the property of Vastra or its content suppliers and protected by international copyright laws.
                </p>
            </section>

            <section>
                <h3
                    style={{
                        fontFamily: "'EB Garamond', serif",
                        color: 'var(--vastra-maroon)',
                        marginBottom: '1rem',
                        borderBottom: '1px solid var(--vastra-gold)',
                        paddingBottom: '0.5rem',
                        display: 'inline-block'
                    }}
                >
                    6. Contact Us
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    If you have any questions about these Terms, please contact us at support@vastra.com.
                </p>
            </section>
        </LegalPageLayout>
    );
};

export default TermsPage;
