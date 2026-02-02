import React from 'react';
import Navbar from '../components/layout/Navbar';
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
            <FloatingActionButton />
        </>
    );
};

export default LandingPage;
