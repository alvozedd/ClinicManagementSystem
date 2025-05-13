import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../utils/apiService';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaArrowRight, FaInfoCircle, FaCalendarAlt, FaUserMd, FaHospital, FaUserLock } from 'react-icons/fa';
import './GlassEffects.css';

function WelcomePage() {
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Combined form data for both patient and appointment
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
        createdBy: 'visitor', // Explicitly set the creator as visitor
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || ''
      };

      console.log('Creating patient with year of birth:', formData.yearOfBirth);

      console.log('Creating new patient:', patientData);
      const newPatient = await apiService.createPatient(patientData);
      console.log('New patient created:', newPatient);

      // 2. Create a new appointment with API
      const appointmentData = {
        patient_id: newPatient._id,
        appointment_date: new Date(formData.appointmentDate),
        // No time needed
        notes: `Type: ${formData.appointmentType}\nStatus: Scheduled\nBooked online by patient.`,
        reason: formData.appointmentReason || 'General consultation', // Use a default reason if not specified
        type: formData.appointmentType,
        status: 'Scheduled', // Set status to Scheduled for visitor bookings
        createdBy: 'visitor' // Explicitly set the creator as visitor
      };

      console.log('Creating new appointment:', appointmentData);
      const newAppointment = await apiService.createAppointment(appointmentData);
      console.log('New appointment created:', newAppointment);

      // 3. Show success message
      setStep(2);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    // Success page
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header with clinic name */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800">UroHealth Central Ltd</h1>
            <p className="text-blue-600 mt-2 text-lg">Consultant Surgeon & Urologist</p>
          </div>

          <div className="max-w-2xl mx-auto glass-card rounded-lg shadow-lg overflow-hidden border border-blue-100 fade-in-element">
            <div className="bg-blue-600 p-6 relative">
              <div className="absolute inset-0 opacity-15">
                <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\",%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white text-center relative z-10">Booking Confirmed!</h1>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium mb-2">Thank you for your booking!</p>
                <p className="text-blue-700">Your appointment has been scheduled for:</p>
                <p className="text-blue-900 font-bold mt-2">
                  {formData.appointmentDate}
                </p>

              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">What happens next?</h2>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>Please arrive at the clinic at your scheduled time</li>
                  <li>Please arrive 15 minutes before your appointment time</li>
                  <li>Bring any relevant medical records or test results</li>
                </ol>
              </div>

              <div className="flex justify-center">
                <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200 flex items-center shadow-md">
                  <span>Return to Home</span>
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Contact information at the bottom */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>For any questions, please contact us at: <a href="tel:0722398296" className="text-blue-600 hover:text-blue-800 font-medium">0722398296</a></p>
          </div>
        </div>
      </div>
    );
  }

  // Booking form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%233b82f6\" fill-opacity=\"0.2\",%3E%3Cpath d=\"M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with clinic name and navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">UroHealth Central Ltd</h1>
              <p className="text-blue-600 text-sm">Consultant Surgeon & Urologist</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-4 items-center">
            <a href="#services" className="text-blue-600 hover:text-blue-800 font-medium">Services</a>
            <a href="#about" className="text-blue-600 hover:text-blue-800 font-medium">About Us</a>
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md text-sm font-medium transition duration-200 flex items-center justify-center">
              <FaUserLock className="text-lg" />
            </Link>
          </div>
        </div>

        {/* Hero section */}
        <div className="mb-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl overflow-hidden shadow-xl relative">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "30px 30px"}}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Expert Urological &amp; Surgical<br />Care</h1>
              <p className="text-blue-100 mb-6 text-lg">Specialized medical care with a patient-centered approach</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <a href="#booking" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium text-base transition-all duration-500 ease-in-out transform hover:scale-105 inline-flex items-center justify-center shadow-md" onClick={(e) => {
                    e.preventDefault();
                    const bookingElement = document.getElementById('booking');
                    if (bookingElement) {
                      // Scroll with offset to ensure the element is visible
                      const yOffset = -80; // Adjust this value as needed
                      const y = bookingElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({top: y, behavior: 'smooth'});
                    }
                  }}>
                  <FaCalendarAlt className="mr-2" />
                  Book Appointment
                </a>
                <a
                  href="#contact"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-md font-medium text-base transition duration-300 inline-flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    const contactElement = document.getElementById('contact');
                    if (contactElement) {
                      // Scroll with offset to ensure the element is visible
                      const yOffset = -80; // Adjust this value as needed
                      const y = contactElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({top: y, behavior: 'smooth'});
                    }
                  }}
                >
                  <FaPhone className="mr-2" />
                  Contact Us
                </a>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-blue-800 opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Doctor with patient"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div id="booking" className="scroll-mt-24 w-full"></div> {/* Anchor point with scroll margin */}
          {/* Left column - Contact info and map */}
          <div className="lg:col-span-1 mx-auto max-w-md w-full flex flex-col justify-start">
            <div id="contact" className="scroll-mt-24"></div> {/* Anchor point with scroll margin */}
            <div className="glass-card rounded-lg shadow-lg overflow-hidden mb-8 border border-blue-100 w-full fade-in-element h-full">
              <div className="bg-blue-600 p-4 relative">
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M0 0h10v10H0V0zm10 10h10v10H10V10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "20px 20px"}}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white relative z-10">Contact Information</h2>
              </div>
              <div className="p-4 space-y-4">
                <a href="tel:0722398296" className="w-full block bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-md transition duration-200 text-blue-700 font-medium">
                  <div className="flex items-center mb-1">
                    <FaPhone className="text-blue-600 mr-2" />
                    <span>0722398296</span>
                  </div>
                  <span className="text-sm text-gray-600 ml-6">Mobile</span>
                </a>

                <a href="tel:0722398296" className="w-full block bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-md transition duration-200 text-blue-700 font-medium">
                  <div className="flex items-center mb-1">
                    <FaPhone className="text-blue-600 mr-2" />
                    <span>0722398296</span>
                  </div>
                  <span className="text-sm text-gray-600 ml-6">Office</span>
                </a>

                <a href="mailto:info@urohealthcentral.com" className="w-full block bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-md transition duration-200 text-blue-700 font-medium">
                  <div className="flex items-center mb-1">
                    <FaEnvelope className="text-blue-600 mr-2" />
                    <span>info@urohealthcentral.com</span>
                  </div>
                  <span className="text-sm text-gray-600 ml-6">Email Us</span>
                </a>

                <div className="w-full block bg-blue-50 py-2 px-4 rounded-md text-blue-700 font-medium">
                  <div className="flex items-center mb-1">
                    <FaClock className="text-blue-600 mr-2" />
                    <span>Mon-Fri: 8:00 AM - 5:00 PM</span>
                  </div>
                  <span className="text-sm text-gray-600 ml-6">Working Hours</span>
                </div>

                <div className="w-full block bg-blue-50 py-2 px-4 rounded-md text-blue-700 font-medium">
                  <div className="flex items-center mb-1">
                    <FaMapMarkerAlt className="text-blue-600 mr-2" />
                    <span>Catering Building, 1st Floor<br />P.O. Box 31-10100<br />Nyeri, Kenya</span>
                  </div>
                  <span className="text-sm text-gray-600 ml-6">Our Location</span>
                </div>

                <a
                  href="https://maps.google.com/?q=Catering+Building,+Nyeri,+Kenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-md transition duration-200 text-blue-700 font-medium"
                >
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-blue-600 mr-2" />
                    <span>Open in Google Maps</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="glass-card rounded-lg shadow-lg overflow-hidden border border-blue-100 w-full fade-in-element h-full">
              <div className="bg-blue-600 p-4 relative">
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M0 0h10v10H0V0zm10 10h10v10H10V10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "20px 20px"}}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white relative z-10">Map View</h2>
              </div>
              <div className="p-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4031.2694726181694!2d36.950227399999996!3d-0.42221149999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18285f7be335efcb%3A0xe3fe6bef56106781!2sDr.%20Muchai%20Mbugua%20Clinic!5e1!3m2!1sen!2ske!4v1745775112645!5m2!1sen!2ske"
                  width="100%"
                  height="350"
                  style={{border:0}}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UroHealth Central Location"
                  className="w-full"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Right column - Booking form */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-lg shadow-lg overflow-hidden border border-blue-100 fade-in-element">
              <div className="bg-blue-600 p-6 relative">
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "30px 30px"}}
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white relative z-10">Book Your Appointment</h1>
                <p className="text-blue-100 mt-2 relative z-10">Complete this form to schedule your visit with UroHealth Central</p>
              </div>
              <div className="p-6">
                {error && (
                  <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100">Your Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="firstName">
                          First Name*
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="lastName">
                          Other Names*
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="yearOfBirth">
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
                          className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Only year is required</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="gender">
                          Gender*
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="phone">
                          Phone Number*
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="email">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100">Appointment Details</h2>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="appointmentDate">
                        Preferred Date*
                      </label>
                      <input
                        type="date"
                        id="appointmentDate"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Please select your preferred date for the appointment.</p>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="appointmentType">
                        Appointment Type*
                      </label>
                      <select
                        id="appointmentType"
                        name="appointmentType"
                        value={formData.appointmentType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        required
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Check-up">Check-up</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Procedure">Procedure</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-blue-700 mb-1" htmlFor="appointmentReason">
                        Reason for Visit (Optional)
                      </label>
                      <textarea
                        id="appointmentReason"
                        name="appointmentReason"
                        value={formData.appointmentReason}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="Please briefly describe your symptoms or reason for the appointment"
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Fields marked with * are required. By submitting this form, you agree to our terms and privacy policy.
                    </p>

                    <div className="flex items-center justify-between">
                      <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center font-medium">
                        <span className="mr-1">←</span> Back to Home
                      </Link>

                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200 flex items-center shadow-md"
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
                          'Book Appointment'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Services section */}
        <div id="services" className="mt-16 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-2">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide comprehensive urological care with state-of-the-art equipment and experienced specialists</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaUserMd className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-blue-800 text-xl mb-2">Consultations</h3>
              <p className="text-gray-600">Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.</p>
              <a href="#booking" className="text-blue-600 hover:text-blue-800 font-medium mt-4 inline-block transition-all duration-500 ease-in-out transform hover:translate-x-1" onClick={(e) => {
                  e.preventDefault();
                  const bookingElement = document.getElementById('booking');
                  if (bookingElement) {
                    // Scroll with offset to ensure the element is visible
                    const yOffset = -80; // Adjust this value as needed
                    const y = bookingElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                  }
                }}>Book a consultation →</a>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-600 text-2xl" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-blue-800 text-xl mb-2">Diagnostics</h3>
              <p className="text-gray-600">Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.</p>
              <a href="#booking" className="text-blue-600 hover:text-blue-800 font-medium mt-4 inline-block transition-all duration-500 ease-in-out transform hover:translate-x-1" onClick={(e) => {
                  e.preventDefault();
                  const bookingElement = document.getElementById('booking');
                  if (bookingElement) {
                    // Scroll with offset to ensure the element is visible
                    const yOffset = -80; // Adjust this value as needed
                    const y = bookingElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                  }
                }}>Learn more →</a>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-600 text-2xl" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="font-semibold text-blue-800 text-xl mb-2">Treatments</h3>
              <p className="text-gray-600">Comprehensive treatment options for various urological conditions, from medication to surgical interventions.</p>
              <a href="#booking" className="text-blue-600 hover:text-blue-800 font-medium mt-4 inline-block transition-all duration-500 ease-in-out transform hover:translate-x-1" onClick={(e) => {
                  e.preventDefault();
                  const bookingElement = document.getElementById('booking');
                  if (bookingElement) {
                    // Scroll with offset to ensure the element is visible
                    const yOffset = -80; // Adjust this value as needed
                    const y = bookingElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                  }
                }}>Schedule now →</a>
            </div>
          </div>
        </div>

        {/* About Us section */}
        <div id="about" className="mt-16 mb-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-blue-800 mb-4">About UroHealth Central</h2>
                <p className="text-gray-600 mb-4">UroHealth Central Ltd is a specialized urological clinic dedicated to providing the highest quality care for patients with urological conditions.</p>
                <p className="text-gray-600 mb-4">Our team of experienced urologists and medical staff are committed to delivering personalized treatment plans using the latest medical technologies and evidence-based practices.</p>
                <div className="flex items-center mt-6">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Dr. Muchai Mbugua"
                    className="w-16 h-16 rounded-full mr-4 border-2 border-blue-500"
                  />
                  <div>
                    <h3 className="font-semibold text-blue-800">Dr. Muchai Mbugua</h3>
                    <p className="text-gray-600 text-sm">Lead Consultant Urologist</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Modern medical facility"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges section */}
        <div className="mt-16 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-2">Why Choose UroHealth Central</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We are committed to providing exceptional care with a patient-centered approach</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaInfoCircle className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-blue-800 text-xl mb-2">Expert Care</h3>
              <p className="text-gray-600">Our team of specialists brings years of experience and expertise in urological care, ensuring you receive the best possible treatment.</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaClock className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-blue-800 text-xl mb-2">Convenient Scheduling</h3>
              <p className="text-gray-600">We offer flexible appointment times and an easy online booking system to accommodate your busy schedule.</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaMapMarkerAlt className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-blue-800 text-xl mb-2">Central Location</h3>
              <p className="text-gray-600">Our clinic is conveniently located in Nyeri with modern facilities and easy access for all patients.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-blue-100 bg-blue-600 text-white relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10 px-4 py-6 fade-in-element">
            <div>
              <h3 className="font-bold text-white mb-4">UroHealth Central</h3>
              <p className="text-blue-100 text-sm">Providing specialized urological care with a patient-centered approach since 2010.</p>
            </div>



            <div>
              <h3 className="font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="tel:+254722396296" className="flex items-center text-blue-100 hover:text-white transition duration-200">
                    <FaPhone className="text-blue-200 mr-2" /> +254 722 396 296
                  </a>
                </li>
                <li>
                  <a href="mailto:info@urohealthcentral.com" className="flex items-center text-blue-100 hover:text-white transition duration-200">
                    <FaEnvelope className="text-blue-200 mr-2" /> info@urohealthcentral.com
                  </a>
                </li>
                <li>
                  <a href="https://maps.google.com/?q=Catering+Building,+Nyeri,+Kenya" target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-100 hover:text-white transition duration-200">
                    <FaMapMarkerAlt className="text-blue-200 mr-2" /> Catering Building, Nyeri
                  </a>
                </li>
                <li className="flex items-center text-blue-100">
                  <FaClock className="text-blue-200 mr-2" /> Mon-Fri: 8:00 AM - 5:00 PM
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-full transition duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                </a>
                <a href="#" className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-full transition duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                  </svg>
                </a>
                <a href="#" className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-full transition duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="text-center text-blue-100 text-sm pt-4 border-t border-blue-800 relative z-10">
            <p>&copy; {new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
