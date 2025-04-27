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
        value: 'DR. PAUL MUCHAI MBUGUA - CONSULTANT SURGEON & UROLOGIST',
        visible: true
      },
      {
        id: 'homepage-hero-2',
        section: 'homepage',
        category: 'Hero',
        type: 'text',
        label: 'Hero Subtitle',
        value: 'UROLOGIST',
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
        value: 'UroHealth Central Ltd is a leading urological clinic dedicated to providing comprehensive care for urological conditions. Our team of experienced specialists is committed to delivering personalized treatment with compassion and the highest standards of medical excellence.',
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
    'Urological Services': [
      {
        id: 'services-uro-1',
        section: 'services',
        category: 'Urological Services',
        type: 'text',
        label: 'Service Title',
        value: 'General Urology',
        visible: true
      },
      {
        id: 'services-uro-2',
        section: 'services',
        category: 'Urological Services',
        type: 'longtext',
        label: 'Service Description',
        value: 'Comprehensive evaluation and treatment of common urological conditions including urinary tract infections, kidney stones, and prostate issues.',
        visible: true
      }
    ],
    'General Surgery': [
      {
        id: 'services-surgery-1',
        section: 'services',
        category: 'General Surgery',
        type: 'text',
        label: 'Service Title',
        value: 'Minimally Invasive Surgery',
        visible: true
      },
      {
        id: 'services-surgery-2',
        section: 'services',
        category: 'General Surgery',
        type: 'longtext',
        label: 'Service Description',
        value: 'Advanced surgical techniques that minimize incision size, reduce recovery time, and decrease post-operative pain.',
        visible: true
      }
    ],
    'Consultations': [
      {
        id: 'services-consult-1',
        section: 'services',
        category: 'Consultations',
        type: 'text',
        label: 'Service Title',
        value: 'Urological Consultations',
        visible: true
      },
      {
        id: 'services-consult-2',
        section: 'services',
        category: 'Consultations',
        type: 'longtext',
        label: 'Service Description',
        value: 'Expert evaluation and personalized treatment plans for all urological conditions.',
        visible: true
      }
    ],
    'Diagnostics': [
      {
        id: 'services-diag-1',
        section: 'services',
        category: 'Diagnostics',
        type: 'text',
        label: 'Service Title',
        value: 'Advanced Diagnostics',
        visible: true
      },
      {
        id: 'services-diag-2',
        section: 'services',
        category: 'Diagnostics',
        type: 'longtext',
        label: 'Service Description',
        value: 'State-of-the-art diagnostic tools and techniques for accurate assessment of urological conditions.',
        visible: true
      }
    ]
  },
  contact: {
    'Office Hours': [
      {
        id: 'contact-hours-1',
        section: 'contact',
        category: 'Office Hours',
        type: 'text',
        label: 'Working Hours',
        value: 'Mon-Fri: 8:00 AM - 5:00 PM',
        visible: true
      },
      {
        id: 'contact-hours-2',
        section: 'contact',
        category: 'Office Hours',
        type: 'text',
        label: 'Weekend Hours',
        value: 'Saturday: 9:00 AM - 1:00 PM',
        visible: true
      }
    ],
    'Location': [
      {
        id: 'contact-location-1',
        section: 'contact',
        category: 'Location',
        type: 'text',
        label: 'Address',
        value: '123 Medical Plaza, Suite 456, Lagos, Nigeria',
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
        value: '+234 123 456 7890',
        visible: true
      },
      {
        id: 'contact-info-2',
        section: 'contact',
        category: 'Contact Information',
        type: 'text',
        label: 'Office',
        value: '+234 987 654 3210',
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
