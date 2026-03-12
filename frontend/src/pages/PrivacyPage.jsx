import React, { useEffect } from 'react';
import LegalPageLayout from '../components/layout/LegalPageLayout';

const PrivacyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <LegalPageLayout title="Privacy Policy">
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
                    1. Information We Collect
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    We collect information you provide directly to us, such as when you create an account, make a purchase, sign up for our newsletter, or contact us for support. This information may include your name, email address, postal address, phone number, and payment information.
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
                    2. How We Use Your Information
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    We use the information we collect to operate, maintain, and improve our services, such as to process transactions, send you order confirmations, provide customer service, and communicate with you about new products, services, offers, and events.
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
                    3. Sharing of Information
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    We do not share your personal information with third parties except as described in this privacy policy. We may share your information with third-party service providers who perform services on our behalf, such as payment processing and shipping.
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
                    4. Security
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
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
                    5. Your Choices
                </h3>
                <p style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
                    You may update, correct or delete information about you at any time by logging into your online account or emailing us. You may also opt out of receiving promotional communications from us by following the instructions in those communications.
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
                    If you have any questions about this Privacy Policy, please contact us at privacy@vastra.com.
                </p>
            </section>
        </LegalPageLayout>
    );
};

export default PrivacyPage;
