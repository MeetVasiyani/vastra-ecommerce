import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/Hero';
import FeaturedCollections from '../components/FeaturedCollections';
import WhyVastra from '../components/WhyVastra';
import OurCraft from '../components/OurCraft';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';
import FloatingActionButton from '../components/FloatingActionButton';

const LandingPage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <FeaturedCollections />
            <WhyVastra />
            <OurCraft />
            <Testimonials />
            <CallToAction />
            <Footer />
            <FloatingActionButton />
        </>
    );
};

export default LandingPage;

