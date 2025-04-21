import { useState } from 'react';
import { Link } from 'react-router-dom';
import { savePatients, saveAppointments, patients, appointments } from '../data/mockData';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaArrowRight, FaInfoCircle } from 'react-icons/fa';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create a new patient
      const patientId = 'P' + Math.floor(Math.random() * 10000).toString().padStart(3, '0');
      const dateOfBirth = formData.yearOfBirth ? `${formData.yearOfBirth}-01-01` : '';

      const newPatient = {
        id: patientId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: dateOfBirth,
        yearOfBirth: formData.yearOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email || '',
        address: '',
        lastVisit: new Date().toISOString().split('T')[0],
        medicalHistory: [],
        medications: [],
        allergies: []
      };

      // 2. Create a new appointment
      const appointmentId = 'A' + Math.floor(Math.random() * 10000).toString().padStart(3, '0');
      const newAppointment = {
        id: appointmentId,
        patientId: patientId,
        patientName: `${formData.firstName} ${formData.lastName}`,
        date: formData.appointmentDate,
        time: '09:00', // Default time set to 9:00 AM
        type: formData.appointmentType,
        reason: formData.appointmentReason,
        status: 'Scheduled',
        notes: 'Booked online by patient. Time to be confirmed by secretary.'
      };

      // 3. Save both to our mock database
      const updatedPatients = [...patients, newPatient];
      const updatedAppointments = [...appointments, newAppointment];

      savePatients(updatedPatients);
      saveAppointments(updatedAppointments);

      // 4. Show success message
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

          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-blue-100">
            <div className="bg-blue-600 p-6">
              <h1 className="text-2xl font-bold text-white text-center">Booking Confirmed!</h1>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium mb-2">Thank you for your booking!</p>
                <p className="text-blue-700">Your appointment has been scheduled for:</p>
                <p className="text-blue-900 font-bold mt-2">
                  {formData.appointmentDate}
                </p>
                <p className="text-blue-700 mt-1">
                  Our staff will contact you to confirm the exact time.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">What happens next?</h2>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>You'll receive a confirmation call from our staff</li>
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
            <p>For any questions, please contact us at: <a href="tel:+254722396296" className="text-blue-600 hover:text-blue-800 font-medium">+254 722 396 296</a></p>
          </div>
        </div>
      </div>
    );
  }

  // Booking form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with clinic name */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800">UroHealth Central Ltd</h1>
          <p className="text-blue-600 mt-2 text-lg">Consultant Surgeon & Urologist</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Contact info and map */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 border border-blue-100">
              <div className="bg-blue-600 p-4">
                <h2 className="text-xl font-semibold text-white">Contact Information</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center">
                  <FaPhone className="text-blue-600 mr-3" />
                  <a href="tel:+254722396296" className="text-gray-700 hover:text-blue-600 transition duration-200">
                    +254 722 396 296
                  </a>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-blue-600 mr-3" />
                  <a href="tel:+254733396296" className="text-gray-700 hover:text-blue-600 transition duration-200">
                    +254 733 396 296
                  </a>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-blue-600 mr-3" />
                  <a href="mailto:info@urohealthcentral.com" className="text-gray-700 hover:text-blue-600 transition duration-200">
                    info@urohealthcentral.com
                  </a>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-blue-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Catering Building, 1st Floor<br />P.O. Box 31-10100<br />Nyeri, Kenya</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-blue-600 mr-3" />
                  <span className="text-gray-700">Mon-Fri: 8:00 AM - 5:00 PM</span>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-blue-100">
              <div className="bg-blue-600 p-4">
                <h2 className="text-xl font-semibold text-white">Find Us</h2>
              </div>
              <div className="p-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7979.417165608913!2d36.9536629!3d-0.4249518!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18285f7be335efcb%3A0xe3fe6bef56106781!2sDr.%20Muchai%20Mbugua%20Clinic!5e0!3m2!1sen!2ske!4v1745262820405!5m2!1sen!2ske"
                  width="100%"
                  height="300"
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
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-blue-100">
              <div className="bg-blue-600 p-6">
                <h1 className="text-2xl font-bold text-white">Book Your Appointment</h1>
                <p className="text-blue-100 mt-2">Complete this form to schedule your visit</p>
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
                      <p className="text-xs text-gray-500 mt-1">Our clinic hours are 8:00 AM to 5:00 PM. We'll contact you to confirm the exact time.</p>
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

        {/* Trust badges section */}
        <div className="mt-8 mb-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">Why Choose UroHealth Central</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 shadow-md">
                  <FaInfoCircle className="text-blue-600 text-2xl" />
                </div>
                <h3 className="font-medium text-blue-800 mb-2">Expert Care</h3>
                <p className="text-gray-600 text-sm">Specialized urological care from experienced consultants</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 shadow-md">
                  <FaClock className="text-blue-600 text-2xl" />
                </div>
                <h3 className="font-medium text-blue-800 mb-2">Convenient Scheduling</h3>
                <p className="text-gray-600 text-sm">Easy online booking with flexible appointment times</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 shadow-md">
                  <FaMapMarkerAlt className="text-blue-600 text-2xl" />
                </div>
                <h3 className="font-medium text-blue-800 mb-2">Central Location</h3>
                <p className="text-gray-600 text-sm">Easily accessible clinic with modern facilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-500 text-sm mt-8">
          <p>&copy; {new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
