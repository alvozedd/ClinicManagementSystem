import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../utils/apiService';
import { loadContent, getContentValue } from '../utils/contentUtils';
import { FaBars, FaTimes } from 'react-icons/fa';
import EnhancedContact from './EnhancedContact';
import PageLoader from './PageLoader';
import '../styles/animations.css';

function NewHomePage() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [content, setContent] = useState({
    header: {},
    footer: {},
    homepage: {},
    services: {},
    contact: {}
  });

  // Fetch content from API with fallback to default content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const organizedContent = await loadContent();
        setContent(organizedContent);
        console.log("Content loaded successfully:", organizedContent);
      } catch (err) {
        console.error('Error in content loading process:', err);
      }
    };

    fetchContent();
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-blue-300">Uro</span>
              <span>Health</span>
            </Link>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 focus:outline-none"
              >
                {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-6">
              <a 
                href="#services" 
                className="hover:text-blue-300 transition-colors"
              >
                Services
              </a>
              <a 
                href="#contact" 
                className="hover:text-blue-300 transition-colors"
              >
                Contact
              </a>
              <Link 
                to="/login" 
                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md"
              >
                Staff Login
              </Link>
            </nav>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <nav className="mt-4 pb-4 md:hidden">
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#services" 
                    className="block hover:text-blue-300 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    className="block hover:text-blue-300 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <Link 
                    to="/login" 
                    className="block bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md w-full text-center mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Staff Login
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      <PageLoader>
        <main>
          {bookingSuccess ? (
            /* Success message */
            <div className="py-12 bg-white">
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Booking Confirmed!</h2>
                <div className="bg-green-50 p-5 rounded-xl mb-5 border border-green-200">
                  <p className="mb-3">Thank you for your booking. Your appointment has been scheduled for <strong>{formData.appointmentDate}</strong>.</p>
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
                  className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
                >
                  Return to Home
                </button>
              </div>
            </div>
          ) : showBookingForm ? (
            /* Booking form */
            <div className="py-12 bg-white">
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-700">Book Your Appointment</h2>
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 p-4 rounded-md border-l-4 border-red-400 text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-blue-50 p-5 rounded-xl mb-5 border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-4 text-lg border-b border-blue-200 pb-2">Your Information</h3>

                    <div className="mb-4">
                      <label className="block font-medium mb-2" htmlFor="firstName">
                        First Name*
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block font-medium mb-2" htmlFor="lastName">
                        Other Names*
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block font-medium mb-2" htmlFor="yearOfBirth">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-2" htmlFor="gender">
                          Gender*
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
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
                      <label className="block font-medium mb-2" htmlFor="phone">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="block font-medium mb-2" htmlFor="email">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-4 text-lg border-b border-blue-200 pb-2">Appointment Details</h3>

                    <div className="mb-4">
                      <label className="block font-medium mb-2" htmlFor="appointmentDate">
                        Preferred Date*
                      </label>
                      <input
                        type="date"
                        id="appointmentDate"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
                        required
                      />
                      <p className="text-sm text-gray-600 mt-2 italic">Our clinic hours are 8:00 AM to 5:00 PM</p>
                    </div>

                    <div className="mb-4">
                      <label className="block font-medium mb-2" htmlFor="appointmentType">
                        Appointment Type*
                      </label>
                      <select
                        id="appointmentType"
                        name="appointmentType"
                        value={formData.appointmentType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
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
                      <label className="block font-medium mb-2" htmlFor="appointmentReason">
                        Reason for Visit (Optional)
                      </label>
                      <textarea
                        id="appointmentReason"
                        name="appointmentReason"
                        value={formData.appointmentReason}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
                        placeholder="Please briefly describe your symptoms or reason for the appointment"
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium order-2 sm:order-1"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium order-1 sm:order-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Book Appointment'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <section className="bg-blue-900 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    {getContentValue(content, 'homepage', 'Hero', 'Hero Title', 'UroHealth Central Ltd')}
                  </h1>
                  <p className="text-2xl md:text-3xl mb-4 text-blue-200">
                    {getContentValue(content, 'homepage', 'Hero', 'Hero Subtitle', 'Specialist Urological Care')}
                  </p>
                  <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
                    {getContentValue(content, 'homepage', 'Hero', 'Hero Description', '20+ years of specialized medical excellence')}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => {
                        setShowBookingForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg"
                    >
                      Book Appointment
                    </button>
                    <a
                      href="#contact"
                      className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </section>

              {/* Doctor Section */}
              <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-3xl font-bold mb-8 text-blue-900">Our Specialist</h2>
                  <div className="max-w-3xl mx-auto bg-blue-50 p-8 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-blue-800 mb-4">
                      {getContentValue(content, 'homepage', 'Doctor', 'Doctor Name', 'DR. PAUL MUCHAI MBUGUA - CONSULTANT SURGEON & UROLOGIST')}
                    </h3>
                    <p className="text-gray-700 mb-6">
                      {getContentValue(content, 'homepage', 'About', 'About Text', 'We provide comprehensive urological care with state-of-the-art technology and personalized treatment plans.')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section id="services" className="py-16 bg-gray-100">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold mb-12 text-center text-blue-900">Our Services</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-bold mb-3 text-blue-800">
                        {getContentValue(content, 'services', 'Consultations', 'Title', 'Consultations')}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {getContentValue(content, 'services', 'Consultations', 'Description', 'Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.')}
                      </p>
                      <div className="text-blue-600 font-medium">
                        {getContentValue(content, 'services', 'Consultations', 'Feature', '30-60 minutes')}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-bold mb-3 text-blue-800">
                        {getContentValue(content, 'services', 'Diagnostics', 'Title', 'Diagnostics')}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {getContentValue(content, 'services', 'Diagnostics', 'Description', 'Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.')}
                      </p>
                      <div className="text-blue-600 font-medium">
                        {getContentValue(content, 'services', 'Diagnostics', 'Feature', 'Accurate Results')}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-bold mb-3 text-blue-800">
                        {getContentValue(content, 'services', 'Treatments', 'Title', 'Treatments')}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {getContentValue(content, 'services', 'Treatments', 'Description', 'Comprehensive treatment options for various urological conditions, from medication to surgical interventions.')}
                      </p>
                      <div className="text-blue-600 font-medium">
                        {getContentValue(content, 'services', 'Treatments', 'Feature', 'Personalized Care')}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section id="contact" className="py-16 bg-white">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold mb-12 text-center text-blue-900">
                    {getContentValue(content, 'contact', 'Main', 'Title', 'CONTACT US')}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold mb-4 text-blue-800">Contact Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-blue-700">Address:</h4>
                          <p className="text-gray-700">
                            {getContentValue(content, 'contact', 'Location', 'Address Line 1', '1st Floor, Gatemu House,')} <br />
                            {getContentValue(content, 'contact', 'Location', 'Address Line 2', 'Kimathi Way,')} <br />
                            {getContentValue(content, 'contact', 'Location', 'Address Line 3', 'Nyeri, Kenya')}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-blue-700">Phone:</h4>
                          <p className="text-gray-700">
                            Mobile: {getContentValue(content, 'contact', 'Contact Information', 'Mobile', '0722 396 296')} <br />
                            Office: {getContentValue(content, 'contact', 'Contact Information', 'Office', '0733 398 296')}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-blue-700">Email:</h4>
                          <p className="text-gray-700">
                            {getContentValue(content, 'contact', 'Contact Information', 'Email', 'info@urohealthcentral.com')}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-blue-700">Office Hours:</h4>
                          <p className="text-gray-700">
                            {getContentValue(content, 'contact', 'Office Hours', 'Weekday Hours', 'Monday - Friday: 8:00 AM - 5:00 PM')} <br />
                            {getContentValue(content, 'contact', 'Office Hours', 'Saturday Hours', 'Saturday: By appointment')} <br />
                            {getContentValue(content, 'contact', 'Office Hours', 'Sunday Hours', 'Sunday: Closed')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md overflow-hidden h-96">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7575147797297!2d36.95016937386752!3d-0.42171763541068937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18285f1e0b8e0b9d%3A0x9d0d2c271d23c1d0!2sGatemu%20House%2C%20Nyeri!5e0!3m2!1sen!2ske!4v1682345678901!5m2!1sen!2ske" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="UroHealth Central Ltd Location"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-blue-900 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">UroHealth Central Ltd</h3>
                <p className="text-blue-200">
                  {getContentValue(content, 'footer', 'UroHealth Central Ltd', 'About Text', 'Providing specialized urological care with a patient-centered approach since 2010.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Contact</h3>
                <p className="text-blue-200">
                  {getContentValue(content, 'footer', 'Contact', 'Address', '123 Medical Plaza, Suite 456, Lagos, Nigeria')}
                </p>
                <p className="text-blue-200">
                  Mobile: {getContentValue(content, 'footer', 'Contact', 'Mobile', '+234 123 456 7890')}
                </p>
                <p className="text-blue-200">
                  Email: {getContentValue(content, 'footer', 'Contact', 'Email', 'info@urohealthcentral.com')}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        setShowBookingForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      Book Appointment
                    </button>
                  </li>
                  <li>
                    <a href="#contact" className="text-blue-200 hover:text-white transition-colors">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <Link to="/login" className="text-blue-200 hover:text-white transition-colors">
                      Staff Login
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-blue-800 mt-8 pt-6 text-center text-blue-300">
              <p>&copy; {new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </PageLoader>
    </div>
  );
}

export default NewHomePage;
