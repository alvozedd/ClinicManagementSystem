/**
 * Simplified Animation utilities for the UroHealth Central website
 * These functions provide basic CSS class-based animations without DOM manipulation
 */

// Helper to check if an element is in viewport
export const isInViewport = (element, offset = 0) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
};

// Apply fade-in animation to elements when they enter viewport
export const setupScrollAnimations = () => {
  try {
    // Elements to animate
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements || animatedElements.length === 0) return () => {};

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
  } catch (error) {
    console.error('Error in setupScrollAnimations:', error);
    return () => {};
  }
};

// Apply staggered animations to children of a container
export const setupStaggeredAnimations = (containerSelector, delay = 100) => {
  try {
    const container = document.querySelector(containerSelector);
    if (!container) return () => {};

    const children = container.children;
    if (!children || children.length === 0) return () => {};

    // Add animation classes
    Array.from(children).forEach((child, index) => {
      child.classList.add('fade-in');
      child.style.animationDelay = `${index * 100}ms`;
    });

    return () => {};
  } catch (error) {
    console.error('Error in setupStaggeredAnimations:', error);
    return () => {};
  }
};

// Apply text reveal animation (simple class-based approach)
export const textRevealAnimation = (element, delay = 30) => {
  try {
    if (!element) return;
    element.classList.add('fade-in');
  } catch (error) {
    console.error('Error in textRevealAnimation:', error);
  }
};

// Apply image fade-in animation
export const imageRevealAnimation = (imgElement) => {
  try {
    if (!imgElement) return;
    imgElement.classList.add('fade-in');
    return () => {};
  } catch (error) {
    console.error('Error in imageRevealAnimation:', error);
    return () => {};
  }
};

// Apply service card animations
export const setupServiceCardAnimations = () => {
  try {
    const cards = document.querySelectorAll('.service-card');
    if (!cards || cards.length === 0) return () => {};

    cards.forEach((card, index) => {
      card.classList.add('fade-in');
      card.style.animationDelay = `${index * 100}ms`;
    });

    return () => {};
  } catch (error) {
    console.error('Error in setupServiceCardAnimations:', error);
    return () => {};
  }
};
