import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaDirections } from 'react-icons/fa';
import './EnhancedContactStyles.css';
import '../styles/animations.css';
import '../styles/fallbackAnimations.css';
import { motion } from 'framer-motion';

const EnhancedContact = ({ content, getContentValue }) => {

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
            <motion.div
              className="contact-card rounded-xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
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

            </motion.div>
          </div>

          {/* Right Column - Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
              <motion.div
                className="map-container mt-4 mb-4"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
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
              </motion.div>

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
          </motion.div>
        </div>
      </div>


    </div>
  );
};

export default EnhancedContact;
