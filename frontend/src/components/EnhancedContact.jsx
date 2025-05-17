import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaDirections } from 'react-icons/fa';
import './EnhancedContactStyles.css';
import '../styles/animations.css';
import '../styles/fallbackAnimations.css';
import { motion } from 'framer-motion';

const EnhancedContact = ({ content, getContentValue }) => {

  return (
    <div id="contact" className="bg-[#000830] text-white py-20 sm:py-24 md:py-28 w-full relative overflow-hidden min-h-screen flex items-center">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Diagonal line */}
        <div className="absolute top-0 bottom-0 left-[25%] w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-20 transform -rotate-12"></div>

        {/* Glowing circle */}
        <div className="absolute top-[10%] right-[5%] w-48 h-48 rounded-full bg-blue-600 opacity-10 blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iIzE4MmE4MCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSI+PHBhdGggZD0iTTMwIDYwVjBNNjAgMzBIME0wIDAgNjAgNjBNNjAgMCAwIDYwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase mb-3 inline-block">
            {getContentValue(content, 'contact', 'Main', 'Title', 'CONTACT US')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {getContentValue(content, 'contact', 'Main', 'Subtitle', 'Get in touch')}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-blue-200 text-lg">
            {getContentValue(content, 'contact', 'Main', 'Description', 'Have questions about our services or need more information? Our team will get back to you as soon as possible.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column - Contact Information */}
          <div>
            {/* Contact Card */}
            <motion.div
              className="bg-gradient-to-br from-[#001060] to-[#000830] p-8 rounded-2xl shadow-xl border border-blue-900/50 h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Contact Information</h3>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold">UH</span>
                </div>
              </div>

              {/* Phone Numbers with visual separation */}
              <div className="space-y-8 mb-8">
                <div className="group">
                  <div className="flex items-start">
                    <div className="bg-blue-900/30 p-3 rounded-lg text-blue-400 mr-4 group-hover:bg-blue-800/50 transition-colors">
                      <FaPhone className="text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-300 mb-1">Mobile</p>
                      <a
                        href="tel:0722398296"
                        className="text-white hover:text-blue-300 font-medium text-lg transition-colors flex items-center"
                      >
                        0722398296
                        <span className="ml-2 bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1 rounded-md transition-colors inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          Call
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-blue-800/50"></div>

                <div className="group">
                  <div className="flex items-start">
                    <div className="bg-blue-900/30 p-3 rounded-lg text-blue-400 mr-4 group-hover:bg-blue-800/50 transition-colors">
                      <FaPhone className="text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-300 mb-1">Office</p>
                      <a
                        href="tel:0720870154"
                        className="text-white hover:text-blue-300 font-medium text-lg transition-colors flex items-center"
                      >
                        0720870154
                        <span className="ml-2 bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1 rounded-md transition-colors inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          Call
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-blue-800/50"></div>

                <div className="group">
                  <div className="flex items-start">
                    <div className="bg-blue-900/30 p-3 rounded-lg text-blue-400 mr-4 group-hover:bg-blue-800/50 transition-colors">
                      <FaEnvelope className="text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-300 mb-1">Email</p>
                      <a
                        href="mailto:urohealth16@gmail.com"
                        className="text-white hover:text-blue-300 font-medium transition-colors flex items-center"
                      >
                        urohealth16@gmail.com
                        <span className="ml-2 bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1 rounded-md transition-colors inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          Email
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Hours with icons */}
              <div className="bg-blue-900/20 rounded-xl p-5 mt-8 border border-blue-800/30">
                <h4 className="font-bold text-white mb-4 flex items-center">
                  <FaClock className="mr-2 text-blue-400" /> Office Hours
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-blue-200 font-medium">Monday - Friday:</span>
                      <span className="text-white sm:ml-2">8:30 AM - 5:00 PM</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-blue-200 font-medium">Saturday:</span>
                      <span className="text-white sm:ml-2">By arrangement</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-blue-200 font-medium">Sunday:</span>
                      <span className="text-white sm:ml-2">Closed (and public holidays)</span>
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
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-gradient-to-br from-[#001060] to-[#000830] p-8 rounded-2xl shadow-xl border border-blue-900/50 h-full">
              <h3 className="text-2xl font-bold text-white mb-6">Our Location</h3>

              <div className="flex items-start mb-6">
                <div className="bg-blue-900/30 p-3 rounded-lg text-blue-400 mr-4">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <div>
                  <p className="text-blue-200 mb-1">{getContentValue(content, 'contact', 'Location', 'Address Line 1', '1st Floor, Gatemu House,')}</p>
                  <p className="text-blue-200 mb-1">{getContentValue(content, 'contact', 'Location', 'Address Line 2', 'Kimathi Way,')}</p>
                  <p className="text-blue-200">{getContentValue(content, 'contact', 'Location', 'Address Line 3', 'Nyeri, Kenya')}</p>
                </div>
              </div>

              {/* Map with border and enhanced styling */}
              <motion.div
                className="mt-6 mb-6 rounded-xl overflow-hidden border border-blue-800/30"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4031.2694726181694!2d36.950227399999996!3d-0.42221149999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18285f7be335efcb%3A0xe3fe6bef56106781!2sDr.%20Muchai%20Mbugua%20Clinic!5e1!3m2!1sen!2ske!4v1745775112645!5m2!1sen!2ske"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UroHealth Central Location"
                ></iframe>
              </motion.div>

              {/* Get Directions button with icon */}
              <a
                href="https://maps.google.com/?q=Gatemu+House,+Kimathi+Way,+Nyeri,+Kenya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg transition-colors shadow-md hover:shadow-blue-500/20"
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
