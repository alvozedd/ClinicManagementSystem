/**
 * Utility functions for scroll-triggered animations
 */

// Initialize Intersection Observer for scroll animations
export const initScrollAnimations = () => {
  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    const animatedElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .services-title, .services-subtitle, .service-card');
    animatedElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    return;
  }

  // Create observer for service cards with staggered delay
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add a staggered delay based on the card's position
        setTimeout(() => {
          entry.target.classList.add('animate-visible');
        }, index * 150); // 150ms delay between each card
        
        // Unobserve after animation is triggered
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 }); // Trigger when at least 10% of the element is visible

  // Create observer for service section titles
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 }); // Trigger when at least 50% of the element is visible

  // Observe service cards
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    cardObserver.observe(card);
  });

  // Observe service section titles
  const serviceTitles = document.querySelectorAll('.services-title, .services-subtitle');
  serviceTitles.forEach(title => {
    titleObserver.observe(title);
  });

  return () => {
    // Cleanup function
    serviceCards.forEach(card => {
      cardObserver.unobserve(card);
    });
    serviceTitles.forEach(title => {
      titleObserver.unobserve(title);
    });
  };
};

// Add CSS class to make animations visible
export const addVisibleClass = () => {
  const style = document.createElement('style');
  style.textContent = `
    .animate-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
};
