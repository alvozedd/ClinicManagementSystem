import React from 'react';
import { FaStethoscope, FaMicroscope, FaProcedures } from 'react-icons/fa';
import './GlassEffects.css';
import '../styles/animations.css';
import '../styles/glassEffects.css';

const EnhancedServices = ({ content, getContentValue }) => {
  return (
    <section id="services" className="min-h-screen flex items-center bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Enhanced Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle grid pattern with higher contrast */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIwLjgiIG9wYWNpdHk9IjAuMSI+PHBhdGggZD0iTTMwIDYwVjBNNjAgMzBIME0wIDAgNjAgNjBNNjAgMCAwIDYwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-70"></div>

        {/* Enhanced decorative elements */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-blue-300 opacity-30 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-400 opacity-30 blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-blue-50/30 to-white/10 opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 py-16 w-full max-w-6xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-blue-600 text-sm font-semibold tracking-wider uppercase mb-3 inline-block">
            {getContentValue(content, 'services', 'Main', 'Subtitle', 'What We Offer')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
            {getContentValue(content, 'services', 'Main', 'Title', 'Our Services')}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            {getContentValue(content, 'services', 'Main', 'Description', 'We provide comprehensive urological care with a focus on patient comfort and the latest medical technologies.')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
          {/* Service Card 1 */}
          <div className="glass-card-service rounded-xl p-6 relative service-card group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaStethoscope className="text-2xl" />
            </div>

            <h3 className="text-xl font-bold mb-4 text-blue-900">
              {getContentValue(content, 'services', 'Consultations', 'Title', 'Consultations')}
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {getContentValue(content, 'services', 'Consultations', 'Description', 'Comprehensive evaluation and diagnosis of urological conditions by our experienced consultants.')}
            </p>

            <div className="border-t border-blue-100 pt-4 text-blue-600 font-medium flex items-center">
              <span className="mr-2">
                {getContentValue(content, 'services', 'Consultations', 'Feature', '')}
              </span>
            </div>
          </div>

          {/* Service Card 2 */}
          <div className="glass-card-service rounded-xl p-6 relative service-card group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaMicroscope className="text-2xl" />
            </div>

            <h3 className="text-xl font-bold mb-4 text-blue-900">
              {getContentValue(content, 'services', 'Diagnostics', 'Title', 'Diagnostics')}
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {getContentValue(content, 'services', 'Diagnostics', 'Description', 'Advanced diagnostic procedures.')}
            </p>

            <div className="border-t border-blue-100 pt-4 text-blue-600 font-medium flex items-center">
              <span className="mr-2">
                {getContentValue(content, 'services', 'Diagnostics', 'Feature', 'Accurate Results')}
              </span>
            </div>
          </div>

          {/* Service Card 3 */}
          <div className="glass-card-service rounded-xl p-6 relative service-card group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaProcedures className="text-2xl" />
            </div>

            <h3 className="text-xl font-bold mb-4 text-blue-900">
              {getContentValue(content, 'services', 'Treatments', 'Title', 'Treatments')}
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {getContentValue(content, 'services', 'Treatments', 'Description', 'Comprehensive treatment options for various urological conditions, from medication to surgical interventions.')}
            </p>

            <div className="border-t border-blue-100 pt-4 text-blue-600 font-medium flex items-center">
              <span className="mr-2">
                {getContentValue(content, 'services', 'Treatments', 'Feature', 'Personalized Care')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedServices;
