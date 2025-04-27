/**
 * Animation utilities for the UroHealth Central website
 * These functions provide simple animations without external dependencies
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

// Apply text reveal animation (letter by letter)
export const textRevealAnimation = (element, delay = 30) => {
  if (!element) return;
  
  const text = element.textContent;
  element.textContent = '';
  element.style.opacity = '1';
  
  // Create spans for each letter
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.textContent = text[i];
    span.style.opacity = '0';
    span.style.display = 'inline-block';
    span.style.transform = 'translateY(10px)';
    span.style.transition = `opacity 0.2s ease, transform 0.2s ease`;
    span.style.transitionDelay = `${i * delay}ms`;
    element.appendChild(span);
    
    // Trigger animation after a small delay
    setTimeout(() => {
      span.style.opacity = '1';
      span.style.transform = 'translateY(0)';
    }, 10);
  }
};

// Apply image fade-in animation
export const imageRevealAnimation = (imgElement) => {
  if (!imgElement) return;
  
  // Set initial state
  imgElement.style.opacity = '0';
  imgElement.style.transform = 'scale(0.95)';
  imgElement.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  
  // Function to handle image load
  const handleImageLoad = () => {
    imgElement.style.opacity = '1';
    imgElement.style.transform = 'scale(1)';
  };
  
  // Check if image is already loaded
  if (imgElement.complete) {
    handleImageLoad();
  } else {
    imgElement.addEventListener('load', handleImageLoad);
  }
  
  // Return cleanup function
  return () => {
    imgElement.removeEventListener('load', handleImageLoad);
  };
};

// Apply service card animations
export const setupServiceCardAnimations = () => {
  const cards = document.querySelectorAll('.service-card');
  
  const handleScroll = () => {
    cards.forEach((card, index) => {
      if (isInViewport(card, 100)) {
        setTimeout(() => {
          card.classList.add('animated');
        }, index * 150); // Staggered delay
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
