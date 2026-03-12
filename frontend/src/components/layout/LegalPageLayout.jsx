import React from 'react';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';
import Footer from './Footer';

const LegalPageLayout = ({ title, children }) => {
    return (
        <div style={{ backgroundColor: 'var(--vastra-ivory)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div style={{ flex: 1, padding: '40px 0 80px' }}>
                <Container style={{ maxWidth: '900px' }}>
                    <h1
                        className="text-center mb-5"
                        style={{
                            fontFamily: "'EB Garamond', serif",
                            color: 'var(--vastra-dark)',
                            fontSize: '2.5rem',
                            fontWeight: 700
                        }}
                    >
                        {title}
                    </h1>

                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '40px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(212, 175, 55, 0.2)'
                        }}
                    >
                        {children}
                    </div>
                </Container>
            </div>

            <Footer />
        </div>
    );
};

export default LegalPageLayout;
