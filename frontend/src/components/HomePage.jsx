import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../utils/apiService';
import { FaBars, FaTimes } from 'react-icons/fa';

// Add custom CSS for responsive background image
const responsiveBackgroundStyles = `
  @media (max-width: 768px) {
    .responsive-bg {
      background-position: 65% center !important;
      background-size: cover !important;
    }
  }

  @media (max-width: 480px) {
    .responsive-bg {
      background-position: 70% center !important;
    }
  }

  /* Remove any background from navbar */
  header, nav, .navbar {
    background: transparent !important;
    background-color: transparent !important;
  }
`;

function HomePage() {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
        next_of_kin_name: 'Not Provided',
        next_of_kin_relationship: 'Not Provided',
        next_of_kin_phone: '0000000000'
      };

      console.log('Creating new patient:', patientData);
      const newPatient = await apiService.createPatient(patientData);
      console.log('New patient created:', newPatient);

      // 2. Create a new appointment with API
      const appointmentData = {
        patient_id: newPatient._id,
        appointment_date: new Date(formData.appointmentDate),
        optional_time: '09:00', // Default time set to 9:00 AM
        notes: `Booked online by patient. Time to be confirmed by secretary.`,
        status: 'Pending',
        type: formData.appointmentType,
        reason: formData.appointmentReason || 'Not specified'
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

      <div className="text-gray-800 responsive-bg" style={{
        scrollBehavior: 'smooth',
        backgroundImage: "url('/image/Theone.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center center", /* Center position for all screen sizes */
        backgroundAttachment: "fixed",
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


              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 text-gray-800 relative z-10 border border-gray-100 transform transition-all duration-300">
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
                  <p className="mb-3 text-sm sm:text-base">Our staff will contact you to confirm the exact time.</p>
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


              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-5 sm:p-6 md:p-8 text-gray-800 relative z-10 border border-gray-100">
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
                <div className="bg-blue-50 p-3 sm:p-5 rounded-xl mb-5 shadow-sm border border-blue-100">
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

                <div className="bg-blue-50 p-3 sm:p-5 rounded-xl shadow-sm border border-blue-100">
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
                    className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium px-4 py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-all duration-200 order-2 sm:order-1 shadow-sm hover:shadow"
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
                  <div className="transform translate-y-[-10vh]">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
                      UroHealth Central Ltd
                    </h1>
                    <p className="text-xl sm:text-2xl md:text-3xl mb-2 text-white font-light">
                      Specialist Urological Care
                    </p>
                    <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed text-white max-w-xl mx-auto">
                      20+ years of specialized medical excellence
                    </p>
                    <div className="flex flex-row justify-center gap-5 sm:gap-8 mt-6 sm:mt-8">
                      <button
                        onClick={() => {
                          setShowBookingForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white text-blue-700 hover:bg-blue-50 px-6 sm:px-8 py-3 rounded-full font-medium transition duration-300 text-sm sm:text-base flex items-center justify-center gap-2 w-36 sm:w-auto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Book Now
                      </button>
                      <button
                        onClick={() => window.location.href = 'tel:+254722396296'}
                        className="border-2 border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 rounded-full font-medium transition duration-300 text-sm sm:text-base flex items-center justify-center gap-2 w-36 sm:w-auto"
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
                <div id="services" className="bg-white text-gray-800 py-16 sm:py-20 md:py-24 w-full relative overflow-hidden">
                  <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12 relative">
                      <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 h-1 w-24 mx-auto mb-4"></div>
                      <h3 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4 text-center relative inline-block">
                        Our Services
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
                      </h3>
                      <p className="text-lg md:text-xl text-gray-600 mb-2 max-w-3xl mx-auto">We provide comprehensive urological care with state-of-the-art technology and personalized treatment plans.</p>
                      <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-4"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 px-4 sm:px-0">
                      <div className="bg-blue-50 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-blue-100 hover:border-blue-300 transform hover:translate-y-[-8px] h-full group">
                        <div className="bg-blue-100 p-5 rounded-full mb-6 group-hover:bg-blue-200 transition-all duration-300 transform group-hover:scale-110">
                          <svg className="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-blue-800">Consultations</h4>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.</p>
                        <div className="mt-auto">
                          <div className="mb-6 flex items-center justify-center text-blue-600">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="text-lg">30-60 minutes</span>
                          </div>
                          <button
                            onClick={() => {
                              setShowBookingForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-base flex items-center gap-2 w-full justify-center shadow-sm hover:shadow group-hover:scale-105"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Book Now
                          </button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-8px] text-white flex flex-col items-center text-center border border-blue-500 h-full group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 opacity-10 rounded-full -mr-8 -mt-8"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-800 opacity-10 rounded-full -ml-8 -mb-8"></div>
                        <div className="bg-blue-500 p-5 rounded-full mb-6 group-hover:bg-blue-400 transition-all duration-300 transform group-hover:scale-110 relative z-10">
                          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-white relative z-10">Diagnostics</h4>
                        <p className="text-blue-100 mb-6 text-lg leading-relaxed relative z-10">Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.</p>
                        <div className="mt-auto relative z-10">
                          <div className="mb-6 flex items-center justify-center text-blue-100">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            <span className="text-lg">Accurate Results</span>
                          </div>
                          <button
                            onClick={() => {
                              setShowBookingForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-white text-blue-600 hover:bg-blue-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-base flex items-center gap-2 w-full justify-center shadow-md hover:shadow-lg group-hover:scale-105"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Book Now
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-blue-100 hover:border-blue-300 transform hover:translate-y-[-8px] h-full group">
                        <div className="bg-blue-100 p-5 rounded-full mb-6 group-hover:bg-blue-200 transition-all duration-300 transform group-hover:scale-110">
                          <svg className="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-blue-800">Treatments</h4>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">Comprehensive treatment options for various urological conditions, from medication to surgical interventions.</p>
                        <div className="mt-auto">
                          <div className="mb-6 flex items-center justify-center text-blue-600">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                            </svg>
                            <span className="text-lg">Personalized Care</span>
                          </div>
                          <button
                            onClick={() => {
                              setShowBookingForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-base flex items-center gap-2 w-full justify-center shadow-sm hover:shadow group-hover:scale-105"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div id="contact" className="bg-white text-gray-800 py-16 sm:py-20 md:py-24 w-full relative">
                  <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12 relative">
                      <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 h-1 w-24 mx-auto mb-4"></div>
                      <div className="text-blue-600 text-sm font-semibold mb-3 uppercase tracking-wider text-center">CONTACT US</div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-blue-800 relative inline-block">
                        Get in touch
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
                      </h2>
                      <p className="text-center text-gray-600 mb-4 max-w-2xl mx-auto">
                        Have questions about our services or need more information? Our team will get back to you as soon as possible.
                      </p>
                      <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-4 sm:px-0">
                      {/* Location Map on the left */}
                      <div className="order-2 md:order-1">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-200 h-full group relative">
                          <div className="flex items-center mb-4">
                            <svg className="w-7 h-7 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <h3 className="text-lg font-semibold text-blue-800">Our Location</h3>
                          </div>

                          <div className="rounded-lg overflow-hidden shadow-md mb-4 h-48 sm:h-56 border border-gray-200 group-hover:shadow-lg transition-all duration-300 relative">
                            <iframe
                              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7979.417165608913!2d36.9536629!3d-0.4249518!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18285f7be335efcb%3A0xe3fe6bef56106781!2sDr.%20Muchai%20Mbugua%20Clinic!5e0!3m2!1sen!2ske!4v1745316449986!5m2!1sen!2ske"
                              width="100%"
                              height="100%"
                              style={{border:0}}
                              allowFullScreen=""
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title="UroHealth Central Location"
                            ></iframe>

                            {/* Clinic hours overlay on hover */}
                            <div className="absolute inset-0 bg-blue-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4">
                              <h4 className="font-semibold text-lg mb-2">Clinic Hours</h4>
                              <p className="text-sm mb-1">Monday - Friday: 8:00 AM - 5:00 PM</p>
                              <p className="text-sm mb-1">Saturday: By appointment</p>
                              <p className="text-sm">Sunday: Closed</p>
                            </div>
                          </div>

                          <div className="mt-4 animate-fadeIn">
                            <div className="flex items-start mb-3">
                              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              <div>
                                <p className="text-gray-600 text-sm mb-1">1st Floor, Gatemu House,</p>
                                <p className="text-gray-600 text-sm mb-1">Kimathi Way,</p>
                                <p className="text-gray-600 text-sm">Nyeri, Kenya</p>
                              </div>
                            </div>
                            <a
                              href="https://maps.google.com/?q=Gatemu+House,+Kimathi+Way,+Nyeri,+Kenya"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg mt-2 group-hover:shadow-sm"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                              </svg>
                              Get Directions
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information on the right */}
                      <div className="order-1 md:order-2">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-all duration-500 hover:shadow-xl hover:border-blue-200 transform hover:translate-y-[-8px] relative overflow-hidden">
                          {/* Background pattern */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full -ml-16 -mb-16 opacity-50"></div>

                          {/* Logo with background shape */}
                          <div className="relative">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-100 rounded-full opacity-70"></div>
                            <div className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full mb-4 mx-auto relative z-10 shadow-md animate-float">
                              <span className="text-xl font-bold">UH</span>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-center mb-2 text-blue-800 relative z-10">UROHEALTH CENTRAL LTD</h3>
                          <p className="text-sm text-center text-gray-500 mb-4 relative z-10">Specialist Urological & Surgical Care</p>
                          <p className="text-center font-medium text-sm text-blue-600 mb-6 relative z-10">DR. PAUL MUCHAI MBUGUA - CONSULTANT SURGEON & UROLOGIST</p>

                          <div className="space-y-4 relative z-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md group animate-slideUp">
                              <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-full mr-3 group-hover:bg-blue-200 transition-colors duration-300">
                                  <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 font-medium">Mobile: 0722 396 296</p>
                                  <p className="text-sm text-gray-500">Office: 0733 398 296</p>
                                </div>
                              </div>
                              <a href="tel:+254722396296" className="w-full sm:w-auto sm:ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm text-center transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                Call
                              </a>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md group animate-slideUp" style={{ animationDelay: "0.2s" }}>
                              <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-full mr-3 group-hover:bg-blue-200 transition-colors duration-300">
                                  <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">info@urohealthcentral.com</p>
                              </div>
                              <a href="mailto:info@urohealthcentral.com" className="w-full sm:w-auto sm:ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm text-center transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Email
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              </div>

              {/* Location section removed and integrated into contact section */}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-12 bg-blue-800 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div className="mb-8 md:mb-0">
                <h3 className="text-xl font-bold mb-4 text-white">UroHealth Central Ltd</h3>
                <p className="text-blue-100 mb-4 max-w-xs">Providing specialized urological care with a patient-centered approach since 2010.</p>
                <div className="flex space-x-4 mb-4">
                  <a href="#" className="text-white hover:text-blue-300 transition-colors bg-blue-700 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-blue-300 transition-colors bg-blue-700 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Services</h4>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li><a href="#" className="hover:text-white transition-colors">Urological Services</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">General Surgery</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Consultations</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Diagnostics</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li>
                      <button
                        onClick={() => {
                          setShowBookingForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="hover:text-white transition-colors"
                      >
                        Book Appointment
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setShowBookingForm(false);
                          setBookingSuccess(false);
                          setTimeout(() => {
                            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="hover:text-white transition-colors"
                      >
                        Contact Us
                      </button>
                    </li>
                    <li><Link to="/login" className="hover:text-white transition-colors">Staff Login</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>1st Floor, Gatemu House, Kimathi Way, Nyeri, Kenya</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>+254 722 396 296</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      <span>drmuchaimbuguaclinic@gmail.com</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-700">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-blue-200 mb-4 md:mb-0">&copy; {new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.</p>
                <div className="flex space-x-6">
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
}

export default HomePage;
