import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaDirections, FaArrowRight, FaUserMd } from 'react-icons/fa';
import './EnhancedContactStyles.css';

const EnhancedContact = ({ content, getContentValue }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setShowContactForm(false);
  };

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showContactForm && !e.target.closest('.floating-form') && !e.target.closest('.get-in-touch-btn')) {
        setShowContactForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContactForm]);

  // Prevent body scrolling when form is open
  useEffect(() => {
    if (showContactForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showContactForm]);

  return (
    <div id="contact" className="bg-white text-gray-800 py-16 sm:py-20 md:py-24 w-full relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 subtle-pattern"></div>
      <div className="absolute inset-0 gradient-bg"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 h-1 w-24 mx-auto mb-4"></div>
          <div className="text-blue-600 text-sm font-semibold mb-3 uppercase tracking-wider text-center">
            {getContentValue(content, 'contact', 'Main', 'Title', 'CONTACT US')}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-blue-800 relative inline-block uh-logo">
            {getContentValue(content, 'contact', 'Main', 'Subtitle', 'Get in touch')}
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            {getContentValue(content, 'contact', 'Main', 'Description', 'Have questions about our services or need more information? Our team will get back to you as soon as possible.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Contact Information */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="contact-card rounded-xl p-6 animate-fade-in-delay-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-800">Contact Information</h3>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                  <span className="font-bold">UH</span>
                </div>
              </div>

              {/* Phone Numbers with visual separation */}
              <div className="space-y-4 mb-6">
                <div className="group">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Mobile</p>
                      <a 
                        href={`tel:+${getContentValue(content, 'contact', 'Contact Information', 'Mobile', '0722 396 296').replace(/\s+/g, '')}`} 
                        className="text-blue-700 hover:text-blue-500 font-semibold text-lg transition-colors flex items-center"
                      >
                        {getContentValue(content, 'contact', 'Contact Information', 'Mobile', '0722 396 296')}
                        <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Call Now
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-divider"></div>

                <div className="group">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Office</p>
                      <a 
                        href={`tel:+${getContentValue(content, 'contact', 'Contact Information', 'Office', '0733 398 296').replace(/\s+/g, '')}`} 
                        className="text-blue-700 hover:text-blue-500 font-semibold text-lg transition-colors flex items-center"
                      >
                        {getContentValue(content, 'contact', 'Contact Information', 'Office', '0733 398 296')}
                        <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Call Now
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-divider"></div>

                <div className="group">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <a 
                        href={`mailto:${getContentValue(content, 'contact', 'Contact Information', 'Email', 'info@urohealthcentral.com')}`} 
                        className="text-blue-700 hover:text-blue-500 font-semibold transition-colors flex items-center"
                      >
                        {getContentValue(content, 'contact', 'Contact Information', 'Email', 'info@urohealthcentral.com')}
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Email Us
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Hours with icons */}
              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <FaClock className="mr-2" /> Office Hours
                </h4>
                <div className="space-y-2">
                  <div className="office-hours">
                    <div className="office-hours-icon">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="office-hours-text">
                      <span className="office-hours-day">Monday - Friday:</span>
                      <span className="office-hours-time ml-2">8:00 AM - 5:00 PM</span>
                    </div>
                  </div>
                  <div className="office-hours">
                    <div className="office-hours-icon">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                    <div className="office-hours-text">
                      <span className="office-hours-day">Saturday:</span>
                      <span className="office-hours-time ml-2">9:00 AM - 1:00 PM</span>
                    </div>
                  </div>
                  <div className="office-hours">
                    <div className="office-hours-icon">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="office-hours-text">
                      <span className="office-hours-day">Sunday:</span>
                      <span className="office-hours-time ml-2">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={() => setShowContactForm(true)}
                className="get-in-touch-btn w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center contact-btn transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Get in Touch
                <FaArrowRight className="ml-2" />
              </button>
            </div>

            {/* Doctor on Call Card */}
            <div className="contact-card rounded-xl p-6 animate-fade-in-delay-2">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                  <FaUserMd />
                </div>
                <h3 className="text-lg font-bold text-blue-800">Doctor on Call</h3>
              </div>
              <p className="text-gray-600 mb-4">
                For urgent medical inquiries, our specialists are available for consultation.
              </p>
              <a 
                href="tel:+254722396296" 
                className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium contact-btn transition-all duration-300"
              >
                <FaPhone className="inline mr-2" /> Call Specialist
              </a>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="animate-fade-in-delay-3">
            <div className="contact-card contact-card-elevated rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">Our Location</h3>
              
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3 mt-1">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">{getContentValue(content, 'contact', 'Location', 'Address Line 1', '1st Floor, Gatemu House,')}</p>
                  <p className="text-gray-600 text-sm mb-1">{getContentValue(content, 'contact', 'Location', 'Address Line 2', 'Kimathi Way,')}</p>
                  <p className="text-gray-600 text-sm">{getContentValue(content, 'contact', 'Location', 'Address Line 3', 'Nyeri, Kenya')}</p>
                </div>
              </div>
              
              {/* Map with border and enhanced styling */}
              <div className="map-container mt-4 mb-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7575147797847!2d36.95!3d-0.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMjUnMTIuMCJTIDM2wrA1NycwMC4wIkU!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UroHealth Central Location"
                  className="rounded-lg"
                ></iframe>
              </div>
              
              {/* Get Directions button with icon */}
              <a
                href="https://maps.google.com/?q=Gatemu+House,+Kimathi+Way,+Nyeri,+Kenya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-lg mt-2 contact-btn w-full justify-center"
              >
                <FaDirections className="mr-2 text-lg" /> Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contact Form */}
      <div className={`floating-form-overlay ${showContactForm ? 'active' : ''}`}></div>
      <div className={`floating-form ${showContactForm ? 'active' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-800">Send us a message</h3>
          <button 
            onClick={() => setShowContactForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium contact-btn transition-all duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnhancedContact;
