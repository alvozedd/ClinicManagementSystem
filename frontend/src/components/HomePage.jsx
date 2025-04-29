import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../utils/apiService';
import { loadContent, getContentValue } from '../utils/contentUtils';
import { initScrollAnimations, addVisibleClass } from '../utils/scrollAnimations';
import { FaBars, FaTimes } from 'react-icons/fa';
import EnhancedContact from './EnhancedContact';
import './GlassEffects.css';
import '../styles/animations.css';
import '../styles/fallbackAnimations.css';
import '../styles/textAnimations.css';
import PageLoader from './PageLoader';
// Removed framer-motion import as animations are no longer needed

// Add custom CSS for responsive background image
const responsiveBackgroundStyles = `
  @media (max-width: 768px) {
    .responsive-bg {
      background-position: center center !important;
      background-size: cover !important;
    }
  }

  @media (max-width: 480px) {
    .responsive-bg {
      background-position: center center !important;
    }
  }

  /* Remove any background from navbar */
  header, nav, .navbar {
    background: transparent !important;
    background-color: transparent !important;
  }
`;

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

  return (
    <>
      {/* Add style tag for responsive background */}
      <style dangerouslySetInnerHTML={{ __html: responsiveBackgroundStyles }} />

      <PageLoader backgroundImage="/backgroundimg/Theone.jpeg">
        <div className="text-gray-800 responsive-bg bg-image" style={{
          scrollBehavior: 'smooth',
          backgroundImage: "url('/backgroundimg/Theone.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center center", /* Center position for all screen sizes */
          backgroundAttachment: "fixed", /* Use fixed for both mobile and desktop for consistent appearance */
          minHeight: "100vh",
          overflowX: "hidden", /* Prevent horizontal scrolling on mobile */
          position: "relative" /* For overlay positioning */
        }}>
      {/* Header with background image */}
      <div className="text-white fixed top-0 left-0 right-0 z-50 backdrop-blur-[1px]">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <header className="flex justify-between items-center py-3 relative z-10">
            <div>
              <Link
                to="/"
                className="text-lg md:text-xl font-bold text-white cursor-pointer hover:text-blue-200 transition-colors flex items-center group tracking-wide"
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                }}
              >
                <span className="text-blue-300">Uro</span>Health
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-md bg-gray-800/20 backdrop-blur-sm"
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
                className="text-white hover:text-blue-200 transition-colors relative text-sm after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-200 after:transition-all after:duration-300"
              >Services</button>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                  setTimeout(() => {
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white hover:text-blue-200 transition-colors relative text-sm after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-200 after:transition-all after:duration-300"
              >Contact</button>
              <Link
                to="/login"
                className="bg-white text-blue-800 hover:bg-blue-100 p-2 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center transform hover:scale-105"
                aria-label="Staff Login"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </Link>
            </div>
          </header>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div
              ref={menuRef}
              className="md:hidden bg-gray-800/70 backdrop-blur-sm rounded-b-lg py-2 absolute left-0 right-0 z-50 transition-all duration-300 ease-in-out border-t border-gray-700/50"
              style={{top: '100%'}}
            >
              <div className="flex flex-col space-y-2 px-4 py-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowBookingForm(false);
                    setBookingSuccess(false);
                    setTimeout(() => {
                      document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-white hover:text-gray-300 transition-colors text-left py-2 border-b border-gray-700/30"
                >Services</button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowBookingForm(false);
                    setBookingSuccess(false);
                    setTimeout(() => {
                      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-white hover:text-gray-300 transition-colors text-left py-2 border-b border-gray-700/30"
                >Contact</button>
                <Link
                  to="/login"
                  className="flex items-center text-white hover:text-gray-300 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Staff Login
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2 rounded-md font-medium text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 w-full md:w-auto transform hover:translate-y-[-2px]"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2 rounded-md font-medium text-sm sm:text-base order-1 sm:order-2 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 transform hover:translate-y-[-2px]"
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
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

                {/* Very subtle background overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent"></div>

                {/* Hero Section - Blue Background */}
                <div className="max-w-4xl mx-auto text-center relative px-4 sm:px-6 h-screen flex flex-col justify-center items-center z-10">
                  <div className="transform translate-y-[-12vh]">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white hero-title">
                      {getContentValue(content, 'homepage', 'Hero', 'Hero Title', 'UroHealth Central Ltd')}
                    </h1>
                    <p className="text-xl sm:text-2xl md:text-3xl mb-2 text-white font-light hero-subtitle">
                      {getContentValue(content, 'homepage', 'Hero', 'Hero Subtitle', 'Specialist Urological Care')}
                    </p>
                    <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed text-white max-w-xl mx-auto hero-description">
                      {getContentValue(content, 'homepage', 'Hero', 'Hero Description', '20+ years of specialized medical excellence')}
                    </p>
                    <div className="flex flex-row justify-center gap-5 sm:gap-8 mt-6 sm:mt-8">
                      <div className="relative w-36 sm:w-auto">
                        <button
                          onClick={() => {
                            setShowBookingForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-white text-blue-700 hover:bg-blue-50 px-6 sm:px-8 py-3 rounded-full font-medium transition duration-300 text-sm sm:text-base flex items-center justify-center gap-2 w-full relative z-10 shadow-md"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          Book Now
                        </button>
                      </div>
                      <button
                        onClick={() => window.location.href = 'tel:+254722396296'}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-6 sm:px-8 py-3 rounded-full font-medium transition duration-300 text-sm sm:text-base flex items-center justify-center gap-2 w-36 sm:w-auto shadow-md pulse-animation"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        Call Us
                      </button>
                    </div>
                  </div>
                </div>

              </div>
              {/* End of blue background section */}

              {/* White background sections */}
              <div className="bg-white">
                {/* Services Section */}
                <div id="services" className="services-bg text-white py-16 sm:py-20 md:py-24 w-full relative overflow-hidden" onMouseMove={(e) => {
                    const mouseGlow = document.querySelector('.services-mouse-glow');
                    if (mouseGlow) {
                      mouseGlow.style.opacity = '1';
                      mouseGlow.style.left = `${e.pageX}px`;
                      mouseGlow.style.top = `${e.pageY}px`;
                    }
                  }} onMouseLeave={() => {
                    const mouseGlow = document.querySelector('.services-mouse-glow');
                    if (mouseGlow) {
                      mouseGlow.style.opacity = '0';
                    }
                  }}>
                  <div className="services-mouse-glow mouse-glow"></div>
                  <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12 relative">
                      <div className="bg-gradient-to-r from-white/30 via-white/50 to-white/30 h-1 w-24 mx-auto mb-4"></div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center relative inline-block services-title">
                        Our Services
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 to-white transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
                      </h3>
                      <p className="text-lg md:text-xl text-blue-100 mb-2 max-w-3xl mx-auto services-subtitle">
                        {getContentValue(content, 'homepage', 'About', 'About Text', 'We provide comprehensive urological care with state-of-the-art technology and personalized treatment plans.')}
                      </p>
                      <div className="h-1 w-16 bg-gradient-to-r from-blue-200 to-white mx-auto mt-4"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 px-4 sm:px-0 relative z-10 services-grid">
                      <div className="true-glass-card p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-white/10 hover:border-white/30 h-full group service-card relative overflow-hidden">
                        <div className="card-perimeter-animation absolute inset-0"></div>
                        <div className="card-light-effect"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent w-[200%]"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 w-[200%]"></div>
                        <div className="bg-white/20 p-5 rounded-full mb-6 group-hover:bg-white/30 transition-all duration-300">
                          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-white">
                          {getContentValue(content, 'services', 'Consultations', 'Title', 'Consultations')}
                        </h4>
                        <p className="text-blue-100 text-lg leading-relaxed mb-6">
                          {getContentValue(content, 'services', 'Consultations', 'Description', 'Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.')}
                        </p>
                        <div className="mt-auto">
                          <div className="mb-6 flex items-center justify-center text-white">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="text-lg">{getContentValue(content, 'services', 'Consultations', 'Feature', '30-60 minutes')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="true-glass-card p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-white/20 hover:border-white/40 h-full group relative overflow-hidden service-card">
                        <div className="card-perimeter-animation absolute inset-0"></div>
                        <div className="card-light-effect"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent w-[200%]"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 w-[200%]"></div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-8 -mb-8"></div>
                        <div className="bg-white/30 p-5 rounded-full mb-6 group-hover:bg-white/40 transition-all duration-300 relative z-10">
                          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-white relative z-10">
                          {getContentValue(content, 'services', 'Diagnostics', 'Title', 'Diagnostics')}
                        </h4>
                        <p className="text-blue-100 mb-6 text-lg leading-relaxed relative z-10">
                          {getContentValue(content, 'services', 'Diagnostics', 'Description', 'Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.')}
                        </p>
                        <div className="mt-auto relative z-10">
                          <div className="mb-6 flex items-center justify-center text-white">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            <span className="text-lg">{getContentValue(content, 'services', 'Diagnostics', 'Feature', 'Accurate Results')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="true-glass-card p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-white/10 hover:border-white/30 h-full group service-card relative overflow-hidden">
                        <div className="card-perimeter-animation absolute inset-0"></div>
                        <div className="card-light-effect"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent w-[200%]"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 w-[200%]"></div>
                        <div className="bg-white/20 p-5 rounded-full mb-6 group-hover:bg-white/30 transition-all duration-300">
                          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-white">
                          {getContentValue(content, 'services', 'Treatments', 'Title', 'Treatments')}
                        </h4>
                        <p className="text-blue-100 text-lg leading-relaxed mb-6">
                          {getContentValue(content, 'services', 'Treatments', 'Description', 'Comprehensive treatment options for various urological conditions, from medication to surgical interventions.')}
                        </p>
                        <div className="mt-auto">
                          <div className="mb-6 flex items-center justify-center text-white">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            <span className="text-lg">{getContentValue(content, 'services', 'Treatments', 'Feature', 'Personalized Care')}</span>
                          </div>
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

        {/* Footer */}
        <footer className="py-12 bg-blue-600 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between mb-8 fade-in-element">
              <div className="mb-8 md:mb-0 md:w-1/3">
                <h3 className="text-xl font-bold mb-4 text-white">UroHealth Central Ltd</h3>
                <p className="text-blue-100 mb-4 max-w-xs">
                  {content.footer?.['UroHealth Central Ltd']?.find(item => item.label === 'About Text')?.value ||
                   'Providing specialized urological care with a patient-centered approach since 2010.'}
                </p>
                <div className="h-1 w-24 bg-blue-500/30 rounded-full mb-4"></div>
              </div>

              <div className="md:w-2/3 md:pl-10">

                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
                  <ul className="space-y-4 text-sm text-blue-100">
                    {content.footer?.['Contact']?.filter(item => item.visible)?.map(contactItem => (
                      <li key={contactItem.id} className="footer-contact-item flex items-start">
                        {contactItem.label === 'Address' && (
                          <>
                            <svg className="w-4 h-4 mr-3 mt-0.5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>{contactItem.value}</span>
                          </>
                        )}
                        {contactItem.label === 'Phone' && (
                          <>
                            <svg className="w-4 h-4 mr-3 mt-0.5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <div>
                              <a href={`tel:${contactItem.value.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                                {contactItem.value}
                              </a>
                              <button
                                className="ml-2 bg-blue-700 hover:bg-blue-600 text-xs px-2 py-1 rounded transition-colors"
                                onClick={() => window.location.href = `tel:${contactItem.value.replace(/\s+/g, '')}`}
                              >
                                Call
                              </button>
                            </div>
                          </>
                        )}
                        {contactItem.label === 'Email' && (
                          <>
                            <svg className="w-4 h-4 mr-3 mt-0.5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <div>
                              <a href={`mailto:${contactItem.value}`} className="hover:text-white transition-colors">
                                {contactItem.value}
                              </a>
                              <button
                                className="ml-2 bg-blue-700 hover:bg-blue-600 text-xs px-2 py-1 rounded transition-colors"
                                onClick={() => window.location.href = `mailto:${contactItem.value}`}
                              >
                                Email
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-700">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-blue-200 mb-4 md:mb-0">
                  {content.footer?.['Legal']?.find(item => item.label === 'Copyright')?.value ||
                   `© ${new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.`}
                </p>
                <div className="flex space-x-6">
                  {content.footer?.['Legal']?.filter(item => item.type === 'link' && item.visible)?.map(link => (
                    <a key={link.id} href={link.url} className="text-sm text-blue-200 hover:text-white transition-colors">
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
