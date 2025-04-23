import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../utils/apiService';

function HomePage() {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        next_of_kin_name: '',
        next_of_kin_relationship: '',
        next_of_kin_phone: ''
      };

      console.log('Creating new patient:', patientData);
      const newPatient = await apiService.createPatient(patientData);
      console.log('New patient created:', newPatient);

      // 2. Create a new appointment with API
      const appointmentData = {
        patient_id: newPatient._id,
        appointment_date: new Date(formData.appointmentDate),
        optional_time: '09:00', // Default time set to 9:00 AM
        notes: `Type: ${formData.appointmentType}\nReason: ${formData.appointmentReason || 'Not specified'}\nStatus: Pending\nBooked online by patient. Time to be confirmed by secretary.`
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
    <div className="min-h-screen bg-white text-gray-800" style={{ scrollBehavior: 'smooth' }}>
      {/* Header with blue background */}
      <div className="bg-blue-800 text-white fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700" style={{zIndex: 0}}></div>
        <div className="absolute inset-0 opacity-40" style={{zIndex: 1}}>
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M0 0h10v10H0V0zm10 10h10v10H10V10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "20px 20px"}}>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-2">
          {/* Header */}
          <header className="flex justify-between items-center py-3 relative z-10">
            <div>
              <h1
                className="text-2xl font-bold text-white cursor-pointer hover:text-blue-200 transition-colors"
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                }}
              >UroHealth Central Ltd</h1>
            </div>
            <div className="flex space-x-8 items-center">
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                  setTimeout(() => {
                    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white hover:text-blue-200 transition-colors"
              >Services</button>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                  setTimeout(() => {
                    document.getElementById('location').scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white hover:text-blue-200 transition-colors"
              >Location</button>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingSuccess(false);
                  setTimeout(() => {
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white hover:text-blue-200 transition-colors"
              >Contact</button>
              <Link
                to="/login"
                className="bg-white text-blue-800 hover:bg-blue-100 p-2 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center"
                aria-label="Staff Login"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </Link>
            </div>
          </header>
        </div>
      </div>

      {/* Main content with padding for fixed header */}
      <div className="pt-16">
        <main>
          {bookingSuccess ? (
            /* Success message */
            <div className="py-12 bg-blue-800 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700"></div>
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "30px 30px"}}>
                </div>
              </div>
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-gray-800 relative z-10">
              <div className="text-center">
                <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
                  <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Booking Confirmed!</h2>
                <div className="bg-blue-50 p-6 rounded-xl mb-6">
                  <p className="mb-4 text-lg">Thank you for your booking. Your appointment has been scheduled for <strong>{formData.appointmentDate}</strong>.</p>
                  <p className="mb-4 text-lg">Our staff will contact you to confirm the exact time.</p>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg w-full md:w-auto"
                >
                  Return to Home
                </button>
              </div>
              </div>
            </div>
          ) : showBookingForm ? (
            /* Booking form */
            <div className="py-12 bg-blue-800 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700"></div>
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "30px 30px"}}>
                </div>
              </div>
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-gray-800 relative z-10">
              <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Book Your Appointment</h2>

              {error && (
                <div className="mb-6 bg-red-50 p-4 rounded-md border-l-4 border-red-400 text-red-700 text-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl mb-6">
                  <h3 className="font-semibold text-blue-700 mb-4 text-xl border-b border-blue-200 pb-2">Your Information</h3>

                  <div className="mb-4">
                    <label className="block text-lg font-medium mb-2" htmlFor="firstName">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-lg font-medium mb-2" htmlFor="lastName">
                      Other Names*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-lg font-medium mb-2" htmlFor="yearOfBirth">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-medium mb-2" htmlFor="gender">
                        Gender*
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
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
                    <label className="block text-lg font-medium mb-2" htmlFor="phone">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-lg font-medium mb-2" htmlFor="email">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-blue-700 mb-4 text-xl border-b border-blue-200 pb-2">Appointment Details</h3>

                  <div className="mb-4">
                    <label className="block text-lg font-medium mb-2" htmlFor="appointmentDate">
                      Preferred Date*
                    </label>
                    <input
                      type="date"
                      id="appointmentDate"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
                      required
                    />
                    <p className="text-base text-gray-600 mt-2">Our clinic hours are 8:00 AM to 5:00 PM</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-lg font-medium mb-2" htmlFor="appointmentType">
                      Appointment Type*
                    </label>
                    <select
                      id="appointmentType"
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
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
                    <label className="block text-lg font-medium mb-2" htmlFor="appointmentReason">
                      Reason for Visit (Optional)
                    </label>
                    <textarea
                      id="appointmentReason"
                      name="appointmentReason"
                      value={formData.appointmentReason}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-lg"
                      placeholder="Please briefly describe your symptoms or reason for the appointment"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-between pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="text-blue-600 hover:text-blue-800 text-lg font-medium px-6 py-3"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
              </div>
            </div>
          ) : (
            <div>
              {/* Home content */}
              <div className="text-center bg-blue-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700"></div>
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "30px 30px"}}>
                  </div>
                </div>
                {/* Hero Section - Blue Background */}
                <div className="max-w-4xl mx-auto py-32 text-center relative">
                  <h2 className="text-6xl font-bold mb-6 text-white">Expert Urological & Surgical<br />Care</h2>
                  <p className="text-2xl mb-4 text-white">UroHealth Central Ltd, Nyeri</p>
                  <p className="text-xl mb-10 leading-relaxed text-blue-100 max-w-3xl mx-auto">
                    Compassionate, patient-centered treatment with over 20 years of experience<br />in urological and general surgical care.
                  </p>

                  <div className="flex flex-row justify-center gap-6 mb-4">
                    <button
                      onClick={() => {
                        setShowBookingForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-blue-500 text-white hover:bg-blue-600 px-8 py-3 rounded-md font-medium transition duration-200 shadow-md text-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Book Appointment
                    </button>
                    <button
                      onClick={() => window.location.href = 'tel:+254722396296'}
                      className="border border-white text-white hover:bg-white hover:text-blue-800 px-8 py-3 rounded-md font-medium transition duration-200 text-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      Contact Us
                    </button>
                  </div>
                </div>
              </div>
              {/* End of blue background section */}

              {/* White background sections */}
              <div className="bg-white">
                {/* Services Section */}
                <div id="services" className="bg-gradient-to-r from-blue-50 via-white to-blue-50 text-gray-800 py-24 w-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)", backgroundSize: "30px 30px"}}></div>
                  </div>
                  <div className="max-w-5xl mx-auto px-4">
                    <h3 className="text-4xl font-bold text-blue-700 mb-4 text-center">Our Services</h3>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">We provide comprehensive urological care with state-of-the-art technology and personalized treatment plans.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-blue-50 rounded-xl p-8 shadow-sm hover:shadow-md transition duration-200 flex flex-col items-center text-center">
                        <div className="bg-blue-100 p-4 rounded-full mb-6">
                          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-blue-800">Consultations</h4>
                        <p className="text-gray-600 text-lg leading-relaxed">Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.</p>
                        <div className="mt-4 flex items-center justify-center text-blue-600">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="text-lg">30-60 minutes</span>
                        </div>
                    </div>

                      <div className="bg-blue-600 rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-200 transform hover:-translate-y-1 text-white flex flex-col items-center text-center">
                        <div className="bg-blue-500 p-4 rounded-full mb-6">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-white">Diagnostics</h4>
                        <p className="text-blue-100 mb-4 text-lg leading-relaxed">Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.</p>
                        <div className="mt-2 mb-6 flex items-center justify-center text-blue-100">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                          </svg>
                          <span className="text-lg">Accurate Results</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowBookingForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition duration-200 text-lg flex items-center gap-2 w-full justify-center"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          Book Now
                        </button>
                    </div>

                      <div className="bg-blue-50 rounded-xl p-8 shadow-sm hover:shadow-md transition duration-200 flex flex-col items-center text-center">
                        <div className="bg-blue-100 p-4 rounded-full mb-6">
                          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                          </svg>
                        </div>
                        <h4 className="text-2xl font-semibold mb-4 text-blue-800">Treatments</h4>
                        <p className="text-gray-600 text-lg leading-relaxed">Comprehensive treatment options for various urological conditions, from medication to surgical interventions.</p>
                        <div className="mt-4 flex items-center justify-center text-blue-600">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                          </svg>
                          <span className="text-lg">Personalized Care</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div id="contact" className="bg-gradient-to-b from-white to-blue-50 text-gray-800 py-24 w-full relative">
                  <div className="absolute inset-0 opacity-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                      <defs>
                        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2563eb" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#smallGrid)" />
                    </svg>
                  </div>
                  <div className="max-w-5xl mx-auto px-4">
                    <div className="text-blue-600 text-sm font-semibold mb-4 uppercase tracking-wider text-center">CONTACT US</div>
                    <h2 className="text-3xl font-bold mb-12 text-center text-blue-800">Get in touch</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                      Have questions about our services or need more information? Fill out the form and our team will get back to you as soon as possible.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-blue-200">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mb-4 mx-auto">
                          <span className="text-xl font-bold">UH</span>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2 text-blue-800">UROHEALTH CENTRAL LTD</h3>
                        <p className="text-sm text-center text-gray-500 mb-4">Specialist Urological & Surgical Care</p>
                        <p className="text-center font-medium text-sm text-blue-600 mb-6">DR. PAUL MUCHAI MBUGUA - CONSULTANT SURGEON & UROLOGIST</p>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <div>
                              <p className="text-sm text-gray-500">Mobile: 0722 396 296</p>
                              <p className="text-sm text-gray-500">Office: 0733 398 296</p>
                            </div>
                            <a href="tel:+254722396296" className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-sm">
                              Call
                            </a>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <p className="text-sm text-gray-500">info@urohealthcentral.com</p>
                            <a href="mailto:info@urohealthcentral.com" className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-sm">
                              Email
                            </a>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <div>
                              <p className="text-sm text-gray-500">1st Floor, Gatemu House,</p>
                              <p className="text-sm text-gray-500">Kimathi Way, Nyeri, Kenya</p>
                            </div>
                            <a href="https://maps.google.com/?q=Gatemu+House,+Kimathi+Way,+Nyeri,+Kenya" target="_blank" rel="noopener noreferrer" className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-sm">
                              Directions
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div id="location" className="bg-white text-gray-800 py-16 w-full relative">
                <div className="absolute inset-0 bg-blue-50 opacity-30"></div>
                <div className="max-w-5xl mx-auto px-4">
                  <div className="text-blue-600 text-sm font-semibold mb-4 uppercase tracking-wider text-center">LOCATION</div>
                  <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">Visit Our Clinic</h2>

                  <div className="rounded-lg overflow-hidden shadow-md mb-8 h-96">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-200">
                      <div className="flex items-center mb-4">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-blue-800">Address</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">1st Floor, Gatemu House,</p>
                      <p className="text-gray-600 text-sm mb-1">Kimathi Way,</p>
                      <p className="text-gray-600 text-sm">Nyeri, Kenya</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-200">
                      <div className="flex items-center mb-4">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-blue-800">Office Hours</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">Monday - Friday: 8:00 AM - 5:00 PM</p>
                      <p className="text-gray-600 text-sm mb-1">Saturday: By appointment</p>
                      <p className="text-gray-600 text-sm">Sunday: Closed</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-200">
                      <div className="flex items-center mb-4">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-blue-800">Facilities</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">• Free parking available</p>
                      <p className="text-gray-600 text-sm mb-1">• Wheelchair accessible</p>
                      <p className="text-gray-600 text-sm">• Modern medical equipment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-12 bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M0 0h10v10H0V0zm10 10h10v10H10V10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "20px 20px"}}>
            </div>
          </div>
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
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
  );
}

export default HomePage;
