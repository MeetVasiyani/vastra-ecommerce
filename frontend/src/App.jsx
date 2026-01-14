import React from 'react';
import Hero from './components/Hero';
import FeaturedCollections from './components/FeaturedCollections';
import OurCraft from './components/OurCraft';
import WhyVastra from './components/WhyVastra';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import FloatingActionButton from './components/FloatingActionButton';

function App() {
  return (
    <div className="App">
      <Hero />
      <FeaturedCollections />
      <OurCraft />
      <WhyVastra />
      <Testimonials />
      <CallToAction />
      <Footer />
      <FloatingActionButton />
    </div>
  );
}

export default App;
