import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../utils/apiService';
import { loadContent, getContentValue } from '../utils/contentUtils';
import { FaBars, FaTimes } from 'react-icons/fa';
import EnhancedContact from './EnhancedContact';
import EnhancedServices from './EnhancedServices';
import EnhancedHero from './EnhancedHero';
import PageLoader from './PageLoader';
import StandardBackground from './WaveBackground';
import GradientBackground from './GradientBackground';
import '../styles/animations.css';
import '../styles/textAnimations.css';
import '../styles/fallbackAnimations.css';
import '../styles/glassEffects.css';
import '../styles/ThreeStyles.css';
import '../components/GlassEffects.css';
import { setupScrollAnimations } from '../utils/animationUtils';

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
        setLoading(true);
        const organizedContent = await loadContent();
        console.log("Content loaded successfully:", organizedContent);

        // Ensure we have content for the services section
        if (!organizedContent.services || !organizedContent.services.Main) {
          console.warn('Services content missing, adding default content');
          const updatedContent = {
            ...organizedContent,
            services: {
              ...organizedContent.services,
              Main: [
                {
                  id: 'services-main-1',
                  section: 'services',
                  category: 'Main',
                  label: 'Title',
                  value: 'Our Services',
                  visible: true
                },
                {
                  id: 'services-main-2',
                  section: 'services',
                  category: 'Main',
                  label: 'Subtitle',
                  value: 'What We Offer',
                  visible: true
                },
                {
                  id: 'services-main-3',
                  section: 'services',
                  category: 'Main',
                  label: 'Description',
                  value: 'We provide comprehensive urological care with a focus on patient comfort and the latest medical technologies.',
                  visible: true
                }
              ],
              Consultations: [
                {
                  id: 'services-consult-1',
                  section: 'services',
                  category: 'Consultations',
                  label: 'Title',
                  value: 'Consultations',
                  visible: true
                },
                {
                  id: 'services-consult-2',
                  section: 'services',
                  category: 'Consultations',
                  label: 'Description',
                  value: 'Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.',
                  visible: true
                },
                {
                  id: 'services-consult-3',
                  section: 'services',
                  category: 'Consultations',
                  label: 'Feature',
                  value: '30-60 minutes',
                  visible: true
                }
              ],
              Diagnostics: [
                {
                  id: 'services-diag-1',
                  section: 'services',
                  category: 'Diagnostics',
                  label: 'Title',
                  value: 'Diagnostics',
                  visible: true
                },
                {
                  id: 'services-diag-2',
                  section: 'services',
                  category: 'Diagnostics',
                  label: 'Description',
                  value: 'Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.',
                  visible: true
                },
                {
                  id: 'services-diag-3',
                  section: 'services',
                  category: 'Diagnostics',
                  label: 'Feature',
                  value: 'Accurate Results',
                  visible: true
                }
              ],
              Treatments: [
                {
                  id: 'services-treat-1',
                  section: 'services',
                  category: 'Treatments',
                  label: 'Title',
                  value: 'Treatments',
                  visible: true
                },
                {
                  id: 'services-treat-2',
                  section: 'services',
                  category: 'Treatments',
                  label: 'Description',
                  value: 'Comprehensive treatment options for various urological conditions, from medication to surgical interventions.',
                  visible: true
                },
                {
                  id: 'services-treat-3',
                  section: 'services',
                  category: 'Treatments',
                  label: 'Feature',
                  value: 'Personalized Care',
                  visible: true
                }
              ]
            }
          };
          setContent(updatedContent);
        } else {
          setContent(organizedContent);
        }
      } catch (err) {
        console.error('Error in content loading process:', err);
        // Set default content on error
        setContent({
          homepage: {
            Hero: [
              {
                id: 'homepage-hero-1',
                section: 'homepage',
                category: 'Hero',
                label: 'Hero Title',
                value: 'UroHealth Central Ltd',
                visible: true
              },
              {
                id: 'homepage-hero-2',
                section: 'homepage',
                category: 'Hero',
                label: 'Hero Subtitle',
                value: 'Specialist Urological Care',
                visible: true
              },
              {
                id: 'homepage-hero-3',
                section: 'homepage',
                category: 'Hero',
                label: 'Hero Description',
                value: '',
                visible: false
              }
            ]
          },
          services: {
            Main: [
              {
                id: 'services-main-1',
                section: 'services',
                category: 'Main',
                label: 'Title',
                value: 'Our Services',
                visible: true
              },
              {
                id: 'services-main-2',
                section: 'services',
                category: 'Main',
                label: 'Subtitle',
                value: 'What We Offer',
                visible: true
              },
              {
                id: 'services-main-3',
                section: 'services',
                category: 'Main',
                label: 'Description',
                value: 'We provide comprehensive urological care with a focus on patient comfort and the latest medical technologies.',
                visible: true
              }
            ],
            Consultations: [
              {
                id: 'services-consult-1',
                section: 'services',
                category: 'Consultations',
                label: 'Title',
                value: 'Consultations',
                visible: true
              },
              {
                id: 'services-consult-2',
                section: 'services',
                category: 'Consultations',
                label: 'Description',
                value: 'Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.',
                visible: true
              },
              {
                id: 'services-consult-3',
                section: 'services',
                category: 'Consultations',
                label: 'Feature',
                value: '30-60 minutes',
                visible: true
              }
            ],
            Diagnostics: [
              {
                id: 'services-diag-1',
                section: 'services',
                category: 'Diagnostics',
                label: 'Title',
                value: 'Diagnostics',
                visible: true
              },
              {
                id: 'services-diag-2',
                section: 'services',
                category: 'Diagnostics',
                label: 'Description',
                value: 'Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.',
                visible: true
              },
              {
                id: 'services-diag-3',
                section: 'services',
                category: 'Diagnostics',
                label: 'Feature',
                value: 'Accurate Results',
                visible: true
              }
            ],
            Treatments: [
              {
                id: 'services-treat-1',
                section: 'services',
                category: 'Treatments',
                label: 'Title',
                value: 'Treatments',
                visible: true
              },
              {
                id: 'services-treat-2',
                section: 'services',
                category: 'Treatments',
                label: 'Description',
                value: 'Comprehensive treatment options for various urological conditions, from medication to surgical interventions.',
                visible: true
              },
              {
                id: 'services-treat-3',
                section: 'services',
                category: 'Treatments',
                label: 'Feature',
                value: 'Personalized Care',
                visible: true
              }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Initialize scroll animations
  useEffect(() => {
    // Setup scroll animations when component mounts
    const cleanup = setupScrollAnimations();

    // Return cleanup function to remove event listeners when component unmounts
    return cleanup;
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
      <header className="bg-transparent text-white z-10 relative">
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
        <main className="">
          {bookingSuccess ? (
            /* Success message */
            <div className="min-h-screen flex items-center justify-center bg-transparent relative">
              <StandardBackground />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent z-[1]"></div>
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center my-12 w-full mx-4 sm:mx-auto relative z-20">
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
            <div className="min-h-screen flex items-center justify-center bg-transparent relative">
              <GradientBackground />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent z-[1]"></div>
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 my-12 w-full mx-4 sm:mx-auto relative z-20">
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
              <EnhancedHero
                content={content}
                getContentValue={getContentValue}
                onBookAppointment={() => {
                  setShowBookingForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {/* Services Section */}
              <EnhancedServices content={content} getContentValue={getContentValue} />

              {/* Contact Section */}
              <EnhancedContact content={content} getContentValue={getContentValue} />
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
