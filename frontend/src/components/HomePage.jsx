import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../utils/apiService';
import { loadContent, getContentValue } from '../utils/contentUtils';
import { initScrollAnimations, addVisibleClass } from '../utils/scrollAnimations';
import { FaBars, FaTimes } from 'react-icons/fa';
import EnhancedContact from './EnhancedContact';
import ThreeBackground from './ThreeBackground';
import PageLoader from './PageLoader';
import './GlassEffects.css';
import '../styles/animations.css';
import '../styles/fallbackAnimations.css';
import '../styles/textAnimations.css';
import '../styles/ThreeStyles.css'; // Import Three.js styles
import '../styles/darkRectangleFix.css'; // Import dark rectangle fix

// Three.js configuration
const threeJsConfig = {
  enabled: true,  // Enable Three.js by default
  quality: 'high' // Quality level: 'low', 'medium', 'high'
};

function HomePage() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  // Content loading state removed as animations are no longer needed
  const [content, setContent] = useState({
    header: {},
    footer: {},
    homepage: {}
  });

  // Fetch content from API with fallback to default content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Content loading state removed
        // Use the loadContent utility which handles fallbacks
        const organizedContent = await loadContent();
        setContent(organizedContent);
      } catch (err) {
        console.error('Error in content loading process:', err);
      } finally {
        // Content loading state removed
      }
    };

    fetchContent();
  }, []);

  // We no longer need the isMobile state since we're using fixed background for all devices
  // But we'll keep the resize handler for other responsive features
  useEffect(() => {
    const handleResize = () => {
      // Update any responsive UI elements if needed
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize scroll animations
  useEffect(() => {
    // Add CSS class for animation visibility
    addVisibleClass();

    // Initialize scroll animations with IntersectionObserver
    const cleanup = initScrollAnimations();

    return cleanup;
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Form data for both patient and appointment
  const [formData, setFormData] = useState({
    // Patient data
    firstName: '',
    lastName: '',
    yearOfBirth: '',
    gender: '',
    phone: '',
    email: '',

    // Appointment data
    appointmentDate: '',
    appointmentType: 'Consultation',
    appointmentReason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create a new patient with API
      const patientData = {
        name: `${formData.firstName} ${formData.lastName}`,
        gender: formData.gender,
        phone: formData.phone,
        year_of_birth: formData.yearOfBirth ? parseInt(formData.yearOfBirth) : null,
        next_of_kin_name: 'Not Provided',
        next_of_kin_relationship: 'Not Provided',
        next_of_kin_phone: '0000000000',
        createdBy: 'visitor' // Explicitly set the creator as visitor
      };

      console.log('Creating patient with year of birth:', formData.yearOfBirth);

      console.log('Creating new patient:', patientData);
      const newPatient = await apiService.createPatient(patientData);
      console.log('New patient created:', newPatient);

      // 2. Create a new appointment with API
      const appointmentData = {
        patient_id: newPatient._id,
        appointment_date: new Date(formData.appointmentDate),
        notes: `Booked online by patient. Will be added to queue when patient arrives.`,
        status: 'Scheduled',
        type: formData.appointmentType,
        reason: formData.appointmentReason || 'Not specified',
        createdBy: 'visitor' // Explicitly set the creator as visitor
      };

      console.log('Creating new appointment:', appointmentData);
      const newAppointment = await apiService.createAppointment(appointmentData);
      console.log('New appointment created:', newAppointment);

      // 3. Show success message
      setBookingSuccess(true);
      setShowBookingForm(false);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check device capabilities for Three.js
  const [threeEnabled, setThreeEnabled] = useState(threeJsConfig.enabled);

  useEffect(() => {
    // Simple performance check
    const checkPerformance = () => {
      // Safety check for window object (important for SSR/production builds)
      if (typeof window === 'undefined') {
        setThreeEnabled(false);
        return;
      }

      try {
        // Check if device is mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Check if browser supports WebGL
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const hasWebGL = !!gl;

        // Adjust Three.js settings based on device capabilities
        if (!hasWebGL) {
          console.log('WebGL not supported, disabling Three.js');
          setThreeEnabled(false);
        } else if (isMobile) {
          console.log('Mobile device detected, using medium quality');
          threeJsConfig.quality = 'medium';
          setThreeEnabled(true);
        } else {
          console.log('Desktop device detected, using high quality');
          setThreeEnabled(true);
        }

        // Check for reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          console.log('Reduced motion preference detected, disabling Three.js');
          setThreeEnabled(false);
        }
      } catch (error) {
        console.error('Error checking performance:', error);
        setThreeEnabled(false);
      }
    };

    checkPerformance();
  }, []);

  return (
    <>
      {/* Three.js Background with improved visibility */}
      {threeEnabled && (
        <div className="canvas-container" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#000830',
          zIndex: -10 // Ensure it's behind all content
        }}>
          <ThreeBackground />
        </div>
      )}

      {/* Fallback background color if Three.js is disabled */}
      {!threeEnabled && (
        <div className="fixed inset-0 z-[-10] w-full h-full" style={{
          backgroundColor: '#000830',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none' // Allow clicks to pass through
        }}></div>
      )}

      {/* Debug info - remove in production */}
      <div className="fixed bottom-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs z-50">
        Three.js: {threeEnabled ? 'Enabled' : 'Disabled'}
      </div>

      <PageLoader>
        <div className="content-overlay" style={{
          scrollBehavior: 'smooth',
          minHeight: "100vh",
          height: "100%",
          width: "100%",
          overflowX: "hidden", /* Prevent horizontal scrolling on mobile */
          position: "relative", /* For overlay positioning */
          marginBottom: 0, /* Ensure no bottom margin */
          paddingBottom: 0, /* Ensure no bottom padding */
          zIndex: 1 /* Ensure content is above background */
        }}>
      {/* Modern Header with glass effect */}
      <div className="text-white fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#000830]/70 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <header className="flex justify-between items-center py-4 relative z-10">
            <div>
              <Link
                to="/"
                className="text-xl md:text-2xl font-bold text-white cursor-pointer hover:text-blue-300 transition-colors flex items-center group tracking-tight"
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                }}
              >
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent pr-1">Uro</span>
                <span className="text-white">Health</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md bg-blue-600/20 backdrop-blur-sm"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                  setTimeout(() => {
                    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white hover:text-blue-300 transition-colors relative text-base font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-400 after:transition-all after:duration-300"
              >Services</button>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                  setTimeout(() => {
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white hover:text-blue-300 transition-colors relative text-base font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-400 after:transition-all after:duration-300"
              >Contact</button>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white p-2.5 rounded-full text-base font-medium transition duration-300 flex items-center justify-center shadow-md hover:shadow-blue-500/20 transform hover:-translate-y-0.5"
                aria-label="Staff Login"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </Link>
            </div>
          </header>

          {/* Mobile menu dropdown - modern glass effect */}
          {mobileMenuOpen && (
            <div
              ref={menuRef}
              className="md:hidden bg-[#000830]/90 backdrop-blur-md rounded-b-lg py-3 absolute left-0 right-0 z-50 transition-all duration-300 ease-in-out border-t border-blue-800/50 shadow-lg"
              style={{top: '100%'}}
            >
              <div className="flex flex-col space-y-3 px-4 py-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowBookingForm(false);
                    setBookingSuccess(false);
                    setTimeout(() => {
                      document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-white hover:text-blue-300 transition-colors text-left py-3 border-b border-blue-800/30 flex items-center"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  Services
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowBookingForm(false);
                    setBookingSuccess(false);
                    setTimeout(() => {
                      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-white hover:text-blue-300 transition-colors text-left py-3 border-b border-blue-800/30 flex items-center"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Contact
                </button>
                <Link
                  to="/login"
                  className="flex items-center justify-center text-white hover:text-blue-300 transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="bg-blue-700/50 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="pt-0">
        <main>
          {bookingSuccess ? (
            /* Success message */
            <div className="py-12 text-white relative overflow-hidden">


              <div className="max-w-2xl mx-auto glass-card rounded-xl shadow-xl p-8 text-gray-800 relative z-10 border border-gray-100 transform transition-all duration-300 fade-in-element">
              <div className="text-center px-4 sm:px-0">
                <Link
                  to="/"
                  className="text-xl md:text-2xl font-bold text-blue-700 cursor-pointer hover:text-blue-600 transition-colors flex items-center mb-4 justify-center"
                  onClick={() => {
                    setShowBookingForm(false);
                    setBookingSuccess(false);
                  }}
                >
                  UroHealth Central Ltd
                </Link>
                <div className="inline-block bg-green-100 p-3 sm:p-4 rounded-full mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4">Booking Confirmed!</h2>
                <div className="bg-blue-50 p-3 sm:p-5 rounded-xl mb-5 shadow-sm">
                  <p className="mb-3 text-sm sm:text-base">Thank you for your booking. Your appointment has been scheduled for <strong>{formData.appointmentDate}</strong>.</p>
                </div>
                <button
                  onClick={() => {
                    setBookingSuccess(false);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      yearOfBirth: '',
                      gender: '',
                      phone: '',
                      email: '',
                      appointmentDate: '',
                      appointmentType: 'Consultation',
                      appointmentReason: '',
                    });
                  }}
                  className="bg-white hover:bg-gray-100 px-5 sm:px-6 py-2 rounded-md font-medium text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 w-full md:w-auto transform hover:translate-y-[-2px] book-now-button"
                >
                  <svg className="w-4 h-4 mr-1 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-7m-6 0a1 1 0 00-1 1v3"></path>
                  </svg>
                  Return to Home
                </button>
              </div>
              </div>
            </div>
          ) : showBookingForm ? (
            /* Booking form */
            <div className="py-12 text-white relative overflow-hidden">


              <div className="max-w-2xl mx-auto glass-card rounded-xl shadow-xl p-5 sm:p-6 md:p-8 text-gray-800 relative z-10 border border-gray-100 fade-in-element">
              <div className="flex flex-col items-center mb-4">
                <Link
                  to="/"
                  className="text-lg md:text-xl font-bold text-blue-700 cursor-pointer hover:text-blue-600 transition-colors flex items-center mb-3"
                  onClick={() => {
                    setShowBookingForm(false);
                    setBookingSuccess(false);
                  }}
                >
                  UroHealth Central Ltd
                </Link>
                <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Book Your Appointment</h2>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 p-4 rounded-md border-l-4 border-red-400 text-red-700 text-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-card-blue p-3 sm:p-5 rounded-xl mb-5 shadow-sm border border-blue-100">
                  <h3 className="font-semibold text-blue-700 mb-3 text-base sm:text-lg border-b border-blue-200 pb-2">Your Information</h3>

                  <div className="mb-4">
                    <label className="block text-sm md:text-base font-medium mb-2" htmlFor="firstName">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200 shadow-sm"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm md:text-base font-medium mb-2" htmlFor="lastName">
                      Other Names*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm md:text-base font-medium mb-2" htmlFor="yearOfBirth">
                        Year of Birth
                      </label>
                      <input
                        type="number"
                        id="yearOfBirth"
                        name="yearOfBirth"
                        value={formData.yearOfBirth}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="YYYY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm md:text-base font-medium mb-2" htmlFor="gender">
                        Gender*
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm md:text-base font-medium mb-2" htmlFor="phone">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm md:text-base font-medium mb-2" htmlFor="email">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="glass-card-blue p-3 sm:p-5 rounded-xl shadow-sm border border-blue-100">
                  <h3 className="font-semibold text-blue-700 mb-3 text-base sm:text-lg border-b border-blue-200 pb-2">Appointment Details</h3>

                  <div className="mb-4">
                    <label className="block text-sm md:text-base font-medium mb-2" htmlFor="appointmentDate">
                      Preferred Date*
                    </label>
                    <input
                      type="date"
                      id="appointmentDate"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      required
                    />
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 italic">Our clinic hours are 8:00 AM to 5:00 PM</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm md:text-base font-medium mb-2" htmlFor="appointmentType">
                      Appointment Type*
                    </label>
                    <select
                      id="appointmentType"
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      required
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Check-up">Check-up</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Procedure">Procedure</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm md:text-base font-medium mb-2" htmlFor="appointmentReason">
                      Reason for Visit (Optional)
                    </label>
                    <textarea
                      id="appointmentReason"
                      name="appointmentReason"
                      value={formData.appointmentReason}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Please briefly describe your symptoms or reason for the appointment"
                    ></textarea>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between pt-4 mt-6 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base font-medium px-4 py-2 border border-transparent rounded-md transition-all duration-200 order-2 sm:order-1 shadow-sm hover:shadow"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-white hover:bg-gray-100 px-5 sm:px-6 py-2 rounded-md font-medium text-sm sm:text-base order-1 sm:order-2 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 transform hover:translate-y-[-2px] book-now-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Book Appointment
                      </>
                    )}
                  </button>
                </div>
              </form>
              </div>
            </div>
          ) : (
            <div>
              {/* Home content */}
              <div className="text-center text-white relative overflow-hidden" style={{ height: "100vh" }}>

                {/* No background overlay needed - Three.js provides the background */}

                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Glowing orb in top right */}
                  <div className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>

                  {/* Horizontal light strip */}
                  <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70"></div>

                  {/* Vertical light strip */}
                  <div className="absolute top-0 bottom-0 right-[25%] w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-50"></div>
                </div>

                {/* Hero Section - Dark Background with Modern Elements */}
                <div className="max-w-5xl mx-auto text-center relative px-4 sm:px-6 h-screen flex flex-col justify-center items-center z-10">
                  <div className="transform translate-y-[-8vh]">
                    <div className="mb-6 inline-block">
                      <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-6"></div>
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-white hero-title tracking-tight">
                        {getContentValue(content, 'homepage', 'Hero', 'Hero Title', 'UroHealth Central Ltd')}
                      </h1>
                      <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mt-6"></div>
                    </div>

                    <p className="text-xl sm:text-2xl md:text-3xl mb-3 text-blue-200 font-light hero-subtitle">
                      {getContentValue(content, 'homepage', 'Hero', 'Hero Subtitle', 'Specialist Urological Care')}
                    </p>

                    <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 leading-relaxed text-gray-300 max-w-2xl mx-auto hero-description">
                      {getContentValue(content, 'homepage', 'Hero', 'Hero Description', '20+ years of specialized medical excellence')}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8 sm:mt-10">
                      <button
                        onClick={() => {
                          setShowBookingForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white hover:bg-gray-100 px-8 sm:px-10 py-3 rounded-lg font-semibold transition duration-200 text-base sm:text-lg flex items-center justify-center gap-3 book-now-button"
                      >
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Book Appointment
                      </button>

                      <button
                        onClick={() => window.location.href = 'tel:+254722396296'}
                        className="bg-blue-900/40 hover:bg-blue-900/60 text-white px-8 sm:px-10 py-3 rounded-lg font-semibold transition duration-200 text-base sm:text-lg flex items-center justify-center gap-3 call-us-button"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        Call Us Now
                      </button>
                    </div>

                    {/* Scroll indicator removed */}
                  </div>
                </div>
              </div>
              {/* End of blue background section */}

              {/* White background sections with Three.js effects */}
              <div className="bg-white">
                {/* Services Section */}
                <div id="services" className="bg-gradient-to-br from-blue-50 to-white text-[#000830] py-20 sm:py-24 md:py-28 w-full relative overflow-hidden">
                  {/* Background elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Diagonal lines */}
                    <div className="absolute top-0 bottom-0 left-[15%] w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-30 transform rotate-12"></div>
                    <div className="absolute top-0 bottom-0 right-[25%] w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-30 transform -rotate-12"></div>

                    {/* Horizontal lines */}
                    <div className="absolute top-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"></div>
                    <div className="absolute bottom-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"></div>

                    {/* Glowing circles */}
                    <div className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full bg-blue-600 opacity-5 blur-3xl"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-48 h-48 rounded-full bg-blue-600 opacity-5 blur-3xl"></div>
                    <div className="absolute top-[40%] left-[30%] w-32 h-32 rounded-full bg-green-500 opacity-5 blur-3xl"></div>
                  </div>

                  <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 relative">
                      <span className="text-blue-600 text-sm font-semibold tracking-wider uppercase mb-3 inline-block">What We Offer</span>
                      <h2 className="text-4xl md:text-5xl font-bold text-[#000830] mb-6 text-center relative inline-block">
                        Our Services
                      </h2>
                      <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-6"></div>
                      <p className="text-xl text-[#001060] max-w-3xl mx-auto services-subtitle">
                        {getContentValue(content, 'homepage', 'About', 'About Text', 'We provide comprehensive urological care with state-of-the-art technology and personalized treatment plans.')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 relative z-10">
                      {/* Service Card 1 */}
                      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-blue-200 hover:border-blue-400 group relative overflow-hidden glass-card-service">
                        {/* Card highlight effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 via-blue-600/0 to-blue-600/0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>

                        {/* Icon container */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-110">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-[#000830] group-hover:text-blue-600 transition-colors duration-300">
                          {getContentValue(content, 'services', 'Consultations', 'Title', 'Consultations')}
                        </h3>

                        <p className="text-gray-700 text-lg leading-relaxed mb-8 flex-grow">
                          {getContentValue(content, 'services', 'Consultations', 'Description', 'Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.')}
                        </p>

                        <div className="flex items-center text-blue-600 mt-auto">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>{getContentValue(content, 'services', 'Consultations', 'Feature', '30-60 minutes')}</span>
                        </div>
                      </div>

                      {/* Service Card 2 */}
                      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-blue-200 hover:border-blue-400 group relative overflow-hidden glass-card-service">
                        {/* Card highlight effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 via-blue-600/0 to-blue-600/0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>

                        {/* Icon container */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-110">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-[#000830] group-hover:text-blue-600 transition-colors duration-300">
                          {getContentValue(content, 'services', 'Diagnostics', 'Title', 'Diagnostics')}
                        </h3>

                        <p className="text-gray-700 text-lg leading-relaxed mb-8 flex-grow">
                          {getContentValue(content, 'services', 'Diagnostics', 'Description', 'Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.')}
                        </p>

                        <div className="flex items-center text-blue-600 mt-auto">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                          </svg>
                          <span>{getContentValue(content, 'services', 'Diagnostics', 'Feature', 'Accurate Results')}</span>
                        </div>
                      </div>

                      {/* Service Card 3 */}
                      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-blue-200 hover:border-blue-400 group relative overflow-hidden glass-card-service">
                        {/* Card highlight effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 via-blue-600/0 to-blue-600/0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>

                        {/* Icon container */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-110">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                          </svg>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-[#000830] group-hover:text-blue-600 transition-colors duration-300">
                          {getContentValue(content, 'services', 'Treatments', 'Title', 'Treatments')}
                        </h3>

                        <p className="text-gray-700 text-lg leading-relaxed mb-8 flex-grow">
                          {getContentValue(content, 'services', 'Treatments', 'Description', 'Comprehensive treatment options for various urological conditions, from medication to surgical interventions.')}
                        </p>

                        <div className="flex items-center text-blue-600 mt-auto">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                          <span>{getContentValue(content, 'services', 'Treatments', 'Feature', 'Personalized Care')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Contact Section */}
                <EnhancedContact content={content} getContentValue={getContentValue} />
              </div>

              {/* Location section removed and integrated into contact section */}
            </div>
          )}
        </main>

        {/* Modern Footer with Dark Theme */}
        <footer className="py-16 bg-gradient-to-b from-[#000830] to-[#000620] text-white relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Diagonal line */}
            <div className="absolute top-0 bottom-0 right-[15%] w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-20 transform -rotate-12"></div>

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iIzE4MmE4MCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSI+PHBhdGggZD0iTTMwIDYwVjBNNjAgMzBIME0wIDAgNjAgNjBNNjAgMCAwIDYwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
          </div>

          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
              {/* Logo and About */}
              <div className="md:col-span-5">
                <div className="flex items-center mb-6">
                  <h3 className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent pr-1">Uro</span>
                    <span className="text-white">Health</span>
                  </h3>
                </div>

                <p className="text-blue-200 mb-6 text-lg leading-relaxed">
                  {content.footer?.['UroHealth Central Ltd']?.find(item => item.label === 'About Text')?.value ||
                   'Providing specialized urological care with a patient-centered approach since 2010.'}
                </p>

                <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mb-6"></div>
              </div>

              {/* Contact Information */}
              <div className="md:col-span-7">
                <h4 className="text-xl font-bold mb-6 text-white">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Contact Items */}
                  <ul className="space-y-5">
                    {content.footer?.['Contact']?.filter(item => item.visible)?.map(contactItem => (
                      <li key={contactItem.id} className="flex items-start group">
                        {contactItem.label === 'Address' && (
                          <>
                            <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400 mr-4 group-hover:bg-blue-800/50 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-blue-300 mb-1">Our Location</p>
                              <p className="text-white">{contactItem.value}</p>
                            </div>
                          </>
                        )}
                        {contactItem.label === 'Phone' && (
                          <>
                            <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400 mr-4 group-hover:bg-blue-800/50 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-blue-300 mb-1">Phone Number</p>
                              <a href={`tel:${contactItem.value.replace(/\s+/g, '')}`} className="text-white hover:text-blue-300 transition-colors flex items-center">
                                {contactItem.value}
                                <span className="ml-2 bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1 rounded-md transition-colors inline-flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                  </svg>
                                  Call
                                </span>
                              </a>
                            </div>
                          </>
                        )}
                        {contactItem.label === 'Email' && (
                          <>
                            <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400 mr-4 group-hover:bg-blue-800/50 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-blue-300 mb-1">Email Address</p>
                              <a href={`mailto:${contactItem.value}`} className="text-white hover:text-blue-300 transition-colors flex items-center">
                                {contactItem.value}
                                <span className="ml-2 bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1 rounded-md transition-colors inline-flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                  </svg>
                                  Email
                                </span>
                              </a>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom section with copyright and links */}
            <div className="pt-8 border-t border-blue-900/50">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-blue-300 mb-4 md:mb-0">
                  {content.footer?.['Legal']?.find(item => item.label === 'Copyright')?.value ||
                   `© ${new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.`}
                </p>
                <div className="flex space-x-6">
                  {content.footer?.['Legal']?.filter(item => item.type === 'link' && item.visible)?.map(link => (
                    <a key={link.id} href={link.url} className="text-blue-300 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </PageLoader>
    </>
  );
}

export default HomePage;
