import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import ScrollScene from './ScrollScene'
import { loadContent, getContentValue } from '../../utils/contentUtils'
import '../../styles/3DStyles.css'

// 3D version of the HomePage component
const ThreeDHomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [content, setContent] = useState({
    header: {},
    footer: {},
    homepage: {}
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  
  // Fetch content from API with fallback to default content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const organizedContent = await loadContent()
        setContent(organizedContent)
      } catch (err) {
        console.error('Error in content loading process:', err)
      }
    }

    fetchContent()
  }, [])
  
  // Define sections for the 3D scroll scene
  const sections = [
    {
      type: 'hero',
      title: getContentValue(content, 'homepage', 'Hero', 'Hero Title', 'UroHealth Central Ltd'),
      content: (
        <div className="hero-section">
          <h1>{getContentValue(content, 'homepage', 'Hero', 'Hero Title', 'UroHealth Central Ltd')}</h1>
          <p>{getContentValue(content, 'homepage', 'Hero', 'Hero Subtitle', 'Specialist Urological Care')}</p>
          <p className="hero-description">
            {getContentValue(content, 'homepage', 'Hero', 'Hero Description', '20+ years of specialized medical excellence')}
          </p>
          <div className="button-group">
            <button 
              className="primary-button"
              onClick={() => setShowBookingForm(true)}
            >
              Book Appointment
            </button>
            <a 
              href="tel:+254722396296" 
              className="secondary-button"
            >
              Call Us
            </a>
          </div>
        </div>
      )
    },
    {
      type: 'services',
      title: 'Our Services',
      content: (
        <div className="services-section">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>{getContentValue(content, 'services', 'Consultations', 'Title', 'Consultations')}</h3>
              <p>{getContentValue(content, 'services', 'Consultations', 'Description', 'Comprehensive urological consultations with our experienced specialists.')}</p>
            </div>
            <div className="service-card">
              <h3>{getContentValue(content, 'services', 'Diagnostics', 'Title', 'Diagnostics')}</h3>
              <p>{getContentValue(content, 'services', 'Diagnostics', 'Description', 'Advanced diagnostic procedures using state-of-the-art equipment.')}</p>
            </div>
            <div className="service-card">
              <h3>{getContentValue(content, 'services', 'Treatments', 'Title', 'Treatments')}</h3>
              <p>{getContentValue(content, 'services', 'Treatments', 'Description', 'Effective treatment plans tailored to your specific condition.')}</p>
            </div>
            <div className="service-card">
              <h3>{getContentValue(content, 'services', 'Surgery', 'Title', 'Surgery')}</h3>
              <p>{getContentValue(content, 'services', 'Surgery', 'Description', 'Minimally invasive surgical procedures with faster recovery times.')}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      type: 'contact',
      title: 'Contact Us',
      content: (
        <div className="contact-section">
          <h2>Contact Us</h2>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4>Phone</h4>
                  <p>{getContentValue(content, 'contact', 'Phone', 'Value', '+254 722 396 296')}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4>Email</h4>
                  <p>{getContentValue(content, 'contact', 'Email', 'Value', 'info@urohealth.com')}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4>Address</h4>
                  <p>{getContentValue(content, 'contact', 'Address', 'Value', '123 Medical Plaza, Nairobi')}</p>
                </div>
              </div>
            </div>
            <div className="contact-map">
              <iframe
                title="UroHealth Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8193213224513!2d36.81984807413555!3d-1.2833309356092828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d8eeeee7d7%3A0xf2a3b7e84ee30e01!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1682345678901!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '0.75rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      )
    },
    {
      type: 'booking',
      title: 'Book Appointment',
      content: (
        <div className="booking-section">
          <h2>Book Your Appointment</h2>
          <form className="booking-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input type="email" id="email" name="email" />
            </div>
            <div className="form-group">
              <label htmlFor="date">Preferred Date</label>
              <input type="date" id="date" name="date" required />
            </div>
            <div className="form-group">
              <label htmlFor="type">Appointment Type</label>
              <select id="type" name="type" required>
                <option value="">Select Type</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Check-up">Check-up</option>
                <option value="Procedure">Procedure</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason for Visit (Optional)</label>
              <textarea id="reason" name="reason" rows="3"></textarea>
            </div>
            <button type="submit" className="submit-button">Book Appointment</button>
          </form>
        </div>
      )
    }
  ]
  
  return (
    <div className="three-d-homepage">
      {/* 3D Scroll Scene */}
      <ScrollScene sections={sections} />
      
      {/* Fixed Header */}
      <header className="fixed-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="logo-uro">Uro</span>Health
          </Link>
          
          {/* Mobile menu button */}
          <div className="mobile-menu-button">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="desktop-nav">
            <ul>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
              <li>
                <Link to="/login" className="login-button">
                  Staff Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <ul>
              <li>
                <a 
                  href="#services"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </a>
              </li>
              <li>
                <a 
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
              </li>
              <li>
                <Link 
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
    </div>
  )
}

export default ThreeDHomePage
