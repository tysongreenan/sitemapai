import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import FeatureSection from './landing/FeatureSection';
import TestimonialSection from './landing/TestimonialSection';
import PricingSection from './landing/PricingSection';
import FooterSection from './landing/FooterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <TestimonialSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  );
}