import React from 'react';
import GradientBackground from './GradientBackground';
import '../styles/animations.css';

const EnhancedHero = ({ content, getContentValue, onBookAppointment }) => {
  return (
    <section className="bg-transparent text-white min-h-screen flex items-center relative overflow-hidden z-0">
      {/* Gradient Background */}
      <GradientBackground />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent z-[1]"></div>

      {/* Content */}
      <div className="container mx-auto px-4 text-center py-16 relative z-20">
        <div className="max-w-4xl mx-auto fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 hero-title px-2 break-words">
            UroHealth Central Ltd
          </h1>

          <p className="text-2xl md:text-3xl mb-4 text-blue-200 hero-subtitle">
            Specialist Urological Care
          </p>

          {/* Hero description removed as requested */}

          <div className="flex flex-col sm:flex-row justify-center gap-4 hero-description fade-in">
            <button
              onClick={onBookAppointment}
              className="bg-white text-blue-900 hover:bg-gray-100 hover:scale-105 transition-all px-8 py-3 rounded-lg font-semibold text-lg shadow-lg pulse-animation"
            >
              Book Appointment
            </button>

            <a
              href="#contact"
              className="bg-blue-700 hover:bg-blue-600 hover:scale-105 transition-all text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg"
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
