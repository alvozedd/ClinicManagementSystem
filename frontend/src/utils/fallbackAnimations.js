/**
 * Fallback animation utilities for the UroHealth Central website
 * These functions provide simple CSS-based animations without external dependencies
 */

// Apply fade-in animation to elements
export const applyFadeIn = (element, delay = 0) => {
  if (!element) return;
  
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
  element.style.transitionDelay = `${delay}ms`;
  
  // Trigger animation after a small delay
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, 10);
};

// Setup scroll animations
export const setupScrollAnimations = () => {
  // Helper to check if an element is in viewport
  const isInViewport = (element, offset = 0) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
      rect.bottom >= 0
    );
  };

  // Elements to animate
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const handleScroll = () => {
    animatedElements.forEach(element => {
      if (isInViewport(element, 50)) {
        element.classList.add('animated');
      }
    });
  };
  
  // Initial check
  handleScroll();
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// Apply staggered animations to children of a container
export const setupStaggeredAnimations = (containerSelector, delay = 100) => {
  const container = document.querySelector(containerSelector);
  if (!container) return () => {};
  
  const children = container.children;
  
  // Apply staggered animation to each child
  Array.from(children).forEach((child, index) => {
    child.style.opacity = '0';
    child.style.transform = 'translateY(20px)';
    child.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
    child.style.transitionDelay = `${index * delay}ms`;
    
    setTimeout(() => {
      child.style.opacity = '1';
      child.style.transform = 'translateY(0)';
    }, 100); // Small initial delay before starting animations
  });
  
  return () => {
    // Cleanup if needed
  };
};

// Add pulse animation to an element
export const addPulseAnimation = (element) => {
  if (!element) return;
  
  element.classList.add('pulse-animation');
};

// Add bounce animation to an element
export const addBounceAnimation = (element) => {
  if (!element) return;
  
  element.classList.add('bounce-animation');
};

// Add hover scale animation to an element
export const addHoverScaleAnimation = (element) => {
  if (!element) return;
  
  element.classList.add('hover-scale-animation');
};
