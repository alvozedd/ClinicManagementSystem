import React from 'react';
import { FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const ContentPreview = ({ activeSection, groupedContent }) => {
  console.log('ContentPreview rendered with section:', activeSection);
  console.log('ContentPreview groupedContent:', groupedContent);
  // Helper function to get content value from a specific category and label
  const getContentValue = (category, label, defaultValue = '') => {
    const items = groupedContent[category] || [];
    console.log(`Looking for ${category}/${label} in:`, items);
    const item = items.find(item => item.label === label && item.visible);
    console.log(`Found item:`, item);
    return item ? item.value : defaultValue;
  };

  // Render homepage preview
  const renderHomepagePreview = () => {
    return (
      <div className="preview-container bg-gray-100 rounded-lg p-6 shadow-inner">
        <div className="preview-header text-center mb-8 p-6 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-2">
            {getContentValue('Hero', 'Hero Title', 'UroHealth Central Ltd')}
          </h2>
          <p className="text-xl text-blue-200 mb-2">
            {getContentValue('Hero', 'Hero Subtitle', 'Specialist Urological Care')}
          </p>
          <p className="text-gray-300">
            {getContentValue('Hero', 'Hero Description', '20+ years of specialized medical excellence')}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button className="bg-white text-black px-4 py-2 rounded-lg">Book Appointment</button>
            <button className="border border-blue-400 text-white px-4 py-2 rounded-lg">Call Us</button>
          </div>
        </div>

        <div className="preview-services mb-8">
          <h3 className="text-xl font-bold text-center mb-4 text-blue-800">Our Services</h3>
          <p className="text-center mb-6 text-gray-600">
            {getContentValue('About', 'About Text', 'We provide comprehensive urological care with state-of-the-art technology and personalized treatment plans.')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-bold text-blue-700">{getContentValue('Services', 'Consultations Title', 'Consultations')}</h4>
              <p className="text-sm text-gray-600">{getContentValue('Services', 'Consultations Description', 'Comprehensive evaluation and diagnosis of urological conditions.')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-bold text-blue-700">{getContentValue('Services', 'Diagnostics Title', 'Diagnostics')}</h4>
              <p className="text-sm text-gray-600">{getContentValue('Services', 'Diagnostics Description', 'Advanced diagnostic procedures including ultrasound and cystoscopy.')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-bold text-blue-700">{getContentValue('Services', 'Treatments Title', 'Treatments')}</h4>
              <p className="text-sm text-gray-600">{getContentValue('Services', 'Treatments Description', 'Comprehensive treatment options for various urological conditions.')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render services preview
  const renderServicesPreview = () => {
    return (
      <div className="preview-container bg-gray-100 rounded-lg p-6 shadow-inner">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Our Services</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Consultations', 'Diagnostics', 'Treatments'].map((service) => (
            <div key={service} className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 text-white">
                <FaCalendarAlt size={20} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-700">
                {getContentValue(service, 'Title', service)}
              </h3>
              <p className="text-gray-600 mb-4">
                {getContentValue(service, 'Description', 'Service description goes here.')}
              </p>
              <div className="flex items-center text-blue-600">
                <span className="text-sm">{getContentValue(service, 'Feature', 'Feature')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render contact preview
  const renderContactPreview = () => {
    return (
      <div className="preview-container bg-gray-100 rounded-lg p-6 shadow-inner">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Contact Us</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Get In Touch</h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
                  <FaPhone size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-700">{getContentValue('Contact', 'Phone', '+254 722 396296')}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
                  <FaEnvelope size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">{getContentValue('Contact', 'Email', 'info@urohealth.com')}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
                  <FaMapMarkerAlt size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-700">{getContentValue('Contact', 'Address', 'Nairobi, Kenya')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 p-2 rounded-lg shadow-inner flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FaMapMarkerAlt size={32} className="mx-auto mb-2" />
              <p>Map Preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render footer preview
  const renderFooterPreview = () => {
    return (
      <div className="preview-container bg-gray-900 text-white rounded-lg p-6 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-blue-400">Uro</span>Health
            </h3>
            <p className="text-gray-400 mb-4">
              {getContentValue('UroHealth Central Ltd', 'About Text', 'Providing specialized urological care with a patient-centered approach since 2010.')}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-blue-400 mr-2" />
                <span className="text-gray-300">{getContentValue('Contact', 'Address', 'Nairobi, Kenya')}</span>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-blue-400 mr-2" />
                <span className="text-gray-300">{getContentValue('Contact', 'Phone', '+254 722 396296')}</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-blue-400 mr-2" />
                <span className="text-gray-300">{getContentValue('Contact', 'Email', 'info@urohealth.com')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            {getContentValue('Legal', 'Copyright', `© ${new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.`)}
          </p>
        </div>
      </div>
    );
  };

  // Render header preview
  const renderHeaderPreview = () => {
    return (
      <div className="preview-container bg-gray-900 text-white rounded-lg p-4 shadow-inner">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-xl font-bold">
              <span className="text-blue-400">Uro</span>
              <span className="text-white">Health</span>
              <span className="text-white"> Central Ltd</span>
            </h3>
          </div>

          <div className="flex space-x-6">
            <span className="text-gray-300 hover:text-white cursor-pointer">Services</span>
            <span className="text-gray-300 hover:text-white cursor-pointer">Contact</span>
            <span className="text-gray-300 hover:text-white cursor-pointer">Location</span>
            <span className="text-gray-300 hover:text-white cursor-pointer">Login</span>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate preview based on active section
  const renderPreview = () => {
    switch (activeSection) {
      case 'homepage':
        return renderHomepagePreview();
      case 'services':
        return renderServicesPreview();
      case 'contact':
        return renderContactPreview();
      case 'footer':
        return renderFooterPreview();
      case 'header':
        return renderHeaderPreview();
      default:
        return <div className="text-center py-8 text-gray-500">Select a section to preview</div>;
    }
  };

  return (
    <div className="content-preview mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Preview</h2>
      {renderPreview()}
    </div>
  );
};

export default ContentPreview;
