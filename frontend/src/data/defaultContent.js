/**
 * Default content data for the website
 * This serves as a fallback when the API fails to load content
 */

const defaultContent = {
  header: {
    'Branding': [
      {
        id: 'header-branding-1',
        section: 'header',
        category: 'Branding',
        type: 'text',
        label: 'Site Title',
        value: 'UroHealth Central Ltd',
        visible: true
      }
    ],
    'Navigation': [
      {
        id: 'header-nav-1',
        section: 'header',
        category: 'Navigation',
        type: 'link',
        label: 'Services',
        url: '#services',
        visible: true
      },
      {
        id: 'header-nav-2',
        section: 'header',
        category: 'Navigation',
        type: 'link',
        label: 'Contact',
        url: '#contact',
        visible: true
      },
      {
        id: 'header-nav-3',
        section: 'header',
        category: 'Navigation',
        type: 'link',
        label: 'Location',
        url: '#location',
        visible: true
      }
    ]
  },
  footer: {
    'UroHealth Central Ltd': [
      {
        id: 'footer-about-1',
        section: 'footer',
        category: 'UroHealth Central Ltd',
        type: 'text',
        label: 'About Text',
        value: 'Providing specialized urological care with a patient-centered approach since 2010.',
        visible: true
      }
    ],
    'Contact': [
      {
        id: 'footer-contact-1',
        section: 'footer',
        category: 'Contact',
        type: 'text',
        label: 'Address',
        value: '123 Medical Plaza, Suite 456, Lagos, Nigeria',
        visible: true
      },
      {
        id: 'footer-contact-2',
        section: 'footer',
        category: 'Contact',
        type: 'text',
        label: 'Mobile',
        value: '+234 123 456 7890',
        visible: true
      },
      {
        id: 'footer-contact-3',
        section: 'footer',
        category: 'Contact',
        type: 'text',
        label: 'Office',
        value: '+234 987 654 3210',
        visible: true
      },
      {
        id: 'footer-contact-4',
        section: 'footer',
        category: 'Contact',
        type: 'text',
        label: 'Email',
        value: 'info@urohealthcentral.com',
        visible: true
      }
    ],
    'Quick Links': [
      {
        id: 'footer-links-1',
        section: 'footer',
        category: 'Quick Links',
        type: 'link',
        label: 'Book Appointment',
        url: '#booking',
        visible: true
      },
      {
        id: 'footer-links-2',
        section: 'footer',
        category: 'Quick Links',
        type: 'link',
        label: 'Contact Us',
        url: '#contact',
        visible: true
      },
      {
        id: 'footer-links-3',
        section: 'footer',
        category: 'Quick Links',
        type: 'link',
        label: 'Staff Login',
        url: '/login',
        visible: true
      }
    ]
  },
  homepage: {
    'Hero': [
      {
        id: 'homepage-hero-1',
        section: 'homepage',
        category: 'Hero',
        type: 'text',
        label: 'Hero Title',
        value: 'UroHealth Central Ltd',
        visible: true
      },
      {
        id: 'homepage-hero-2',
        section: 'homepage',
        category: 'Hero',
        type: 'text',
        label: 'Hero Subtitle',
        value: 'Specialist Urological Care',
        visible: true
      },
      {
        id: 'homepage-hero-3',
        section: 'homepage',
        category: 'Hero',
        type: 'text',
        label: 'Hero Description',
        value: '20+ years of specialized medical excellence',
        visible: true
      }
    ],
    'About': [
      {
        id: 'homepage-about-1',
        section: 'homepage',
        category: 'About',
        type: 'longtext',
        label: 'About Text',
        value: 'We provide comprehensive urological care with state-of-the-art technology and personalized treatment plans.',
        visible: true
      }
    ],
    'Doctor': [
      {
        id: 'homepage-doctor-1',
        section: 'homepage',
        category: 'Doctor',
        type: 'text',
        label: 'Doctor Name',
        value: 'DR. PAUL MUCHAI MBUGUA - CONSULTANT SURGEON & UROLOGIST',
        visible: true
      }
    ],
    'Features': [
      {
        id: 'homepage-features-1',
        section: 'homepage',
        category: 'Features',
        type: 'text',
        label: 'Feature 1',
        value: 'Expert Specialists',
        visible: true
      },
      {
        id: 'homepage-features-2',
        section: 'homepage',
        category: 'Features',
        type: 'text',
        label: 'Feature 2',
        value: 'Advanced Technology',
        visible: true
      },
      {
        id: 'homepage-features-3',
        section: 'homepage',
        category: 'Features',
        type: 'text',
        label: 'Feature 3',
        value: 'Personalized Care',
        visible: true
      },
      {
        id: 'homepage-features-4',
        section: 'homepage',
        category: 'Features',
        type: 'text',
        label: 'Feature 4',
        value: 'Comfortable Environment',
        visible: true
      }
    ]
  },
  services: {
    'Consultations': [
      {
        id: 'services-consult-1',
        section: 'services',
        category: 'Consultations',
        type: 'text',
        label: 'Title',
        value: 'Consultations',
        visible: true
      },
      {
        id: 'services-consult-2',
        section: 'services',
        category: 'Consultations',
        type: 'longtext',
        label: 'Description',
        value: 'Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.',
        visible: true
      },
      {
        id: 'services-consult-3',
        section: 'services',
        category: 'Consultations',
        type: 'text',
        label: 'Feature',
        value: '30-60 minutes',
        visible: true
      }
    ],
    'Diagnostics': [
      {
        id: 'services-diag-1',
        section: 'services',
        category: 'Diagnostics',
        type: 'text',
        label: 'Title',
        value: 'Diagnostics',
        visible: true
      },
      {
        id: 'services-diag-2',
        section: 'services',
        category: 'Diagnostics',
        type: 'longtext',
        label: 'Description',
        value: 'Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.',
        visible: true
      },
      {
        id: 'services-diag-3',
        section: 'services',
        category: 'Diagnostics',
        type: 'text',
        label: 'Feature',
        value: 'Accurate Results',
        visible: true
      }
    ],
    'Treatments': [
      {
        id: 'services-treat-1',
        section: 'services',
        category: 'Treatments',
        type: 'text',
        label: 'Title',
        value: 'Treatments',
        visible: true
      },
      {
        id: 'services-treat-2',
        section: 'services',
        category: 'Treatments',
        type: 'longtext',
        label: 'Description',
        value: 'Comprehensive treatment options for various urological conditions, from medication to surgical interventions.',
        visible: true
      },
      {
        id: 'services-treat-3',
        section: 'services',
        category: 'Treatments',
        type: 'text',
        label: 'Feature',
        value: 'Personalized Care',
        visible: true
      }
    ]
  },
  contact: {
    'Main': [
      {
        id: 'contact-main-1',
        section: 'contact',
        category: 'Main',
        type: 'text',
        label: 'Title',
        value: 'CONTACT US',
        visible: true
      },
      {
        id: 'contact-main-2',
        section: 'contact',
        category: 'Main',
        type: 'text',
        label: 'Subtitle',
        value: 'Get in touch',
        visible: true
      },
      {
        id: 'contact-main-3',
        section: 'contact',
        category: 'Main',
        type: 'longtext',
        label: 'Description',
        value: 'Have questions about our services or need more information? Our team will get back to you as soon as possible.',
        visible: true
      }
    ],
    'Office Hours': [
      {
        id: 'contact-hours-1',
        section: 'contact',
        category: 'Office Hours',
        type: 'text',
        label: 'Weekday Hours',
        value: 'Monday - Friday: 8:00 AM - 5:00 PM',
        visible: true
      },
      {
        id: 'contact-hours-2',
        section: 'contact',
        category: 'Office Hours',
        type: 'text',
        label: 'Saturday Hours',
        value: 'Saturday: By appointment',
        visible: true
      },
      {
        id: 'contact-hours-3',
        section: 'contact',
        category: 'Office Hours',
        type: 'text',
        label: 'Sunday Hours',
        value: 'Sunday: Closed',
        visible: true
      }
    ],
    'Location': [
      {
        id: 'contact-location-1',
        section: 'contact',
        category: 'Location',
        type: 'text',
        label: 'Address Line 1',
        value: '1st Floor, Gatemu House,',
        visible: true
      },
      {
        id: 'contact-location-2',
        section: 'contact',
        category: 'Location',
        type: 'text',
        label: 'Address Line 2',
        value: 'Kimathi Way,',
        visible: true
      },
      {
        id: 'contact-location-3',
        section: 'contact',
        category: 'Location',
        type: 'text',
        label: 'Address Line 3',
        value: 'Nyeri, Kenya',
        visible: true
      }
    ],
    'Contact Information': [
      {
        id: 'contact-info-1',
        section: 'contact',
        category: 'Contact Information',
        type: 'text',
        label: 'Mobile',
        value: '0722 396 296',
        visible: true
      },
      {
        id: 'contact-info-2',
        section: 'contact',
        category: 'Contact Information',
        type: 'text',
        label: 'Office',
        value: '0733 398 296',
        visible: true
      },
      {
        id: 'contact-info-3',
        section: 'contact',
        category: 'Contact Information',
        type: 'text',
        label: 'Email',
        value: 'info@urohealthcentral.com',
        visible: true
      }
    ]
  }
};

export default defaultContent;
