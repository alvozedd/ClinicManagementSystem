import React from 'react';
import GradientBackground from './GradientBackground';
import '../styles/animations.css';

const EnhancedHero = ({ content, getContentValue, onBookAppointment }) => {
  return (
    <section className="bg-transparent text-white min-h-[90vh] flex items-center relative overflow-hidden z-0">
      {/* Gradient Background */}
      <GradientBackground />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent z-[1]"></div>

      {/* Content */}
      <div className="container mx-auto px-4 text-center py-12 relative z-20">
        <div className="max-w-3xl mx-auto fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 hero-title px-2 break-words">
            UroHealth Central Ltd
          </h1>

          <p className="text-xl md:text-2xl mb-6 text-blue-200 hero-subtitle">
            Specialist Urological Solutions
          </p>

          {/* Hero description removed as requested */}

          <div className="flex flex-col sm:flex-row justify-center gap-3 hero-description fade-in mt-6">
            <button
              onClick={onBookAppointment}
              className="bg-white text-blue-900 hover:bg-gray-100 hover:scale-105 transition-all px-6 py-2 rounded-md font-medium text-base shadow-md pulse-animation max-w-[200px] mx-auto sm:mx-0"
            >
              Book Appointment
            </button>

            <a
              href="#contact"
              className="bg-blue-700 hover:bg-blue-600 hover:scale-105 transition-all text-white px-6 py-2 rounded-md font-medium text-base shadow-md max-w-[200px] mx-auto sm:mx-0"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Decorative elements - removed for cleaner design */}
    </section>
  );
};

export default EnhancedHero;
