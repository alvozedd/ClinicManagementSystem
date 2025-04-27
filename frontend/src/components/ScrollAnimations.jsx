import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Make sure to register the plugin before using it
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ScrollTrigger is already registered in the import section

/**
 * Component that initializes and manages all scroll animations
 */
const ScrollAnimations = () => {
  // Refs for animation elements
  const scrollIndicatorRef = useRef(null);

  useEffect(() => {
    // Initialize all animations
    initFadeInAnimations();
    initParallaxEffects();
    initBackgroundTransitions();
    initScrollIndicator();

    // Cleanup function
    return () => {
      // Kill all ScrollTrigger instances to prevent memory leaks
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // 1. Fade-in Content Reveals with Subtle Upward Movement
  const initFadeInAnimations = () => {
    // Select all elements with the 'fade-in-element' class
    const fadeElements = document.querySelectorAll('.fade-in-element');

    fadeElements.forEach(element => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%", // Start animation when the top of the element is 80% from the top of the viewport
            toggleActions: "play none none none" // Play animation once when scrolled into view
          }
        }
      );
    });
  };

  // 2. Parallax Effect for Landing Page Fluid Elements
  const initParallaxEffects = () => {
    // Select all elements with the 'parallax-element' class
    const parallaxElements = document.querySelectorAll('.parallax-element');

    parallaxElements.forEach((element, index) => {
      // Create different speeds for different elements
      const speed = 0.1 + (index * 0.05);

      gsap.to(element, {
        y: () => -100 * speed, // Move element up as user scrolls down
        ease: "none",
        scrollTrigger: {
          trigger: element.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true // Smooth animation that's tied to the scrollbar position
        }
      });
    });
  };

  // 3. Background Gradient Transitions
  const initBackgroundTransitions = () => {
    // Select all sections with the 'gradient-section' class
    const sections = document.querySelectorAll('.gradient-section');

    sections.forEach((section, index) => {
      // Skip the first section (no transition needed for the first one)
      if (index === 0) return;

      // Get the data attributes for colors
      const fromColor = section.dataset.colorFrom || 'rgba(255, 255, 255, 1)';
      const toColor = section.dataset.colorTo || 'rgba(219, 234, 254, 1)';

      gsap.fromTo(
        section,
        {
          backgroundColor: fromColor
        },
        {
          backgroundColor: toColor,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 20%",
            scrub: true
          }
        }
      );
    });
  };

  // Scroll Indicator Animation
  const initScrollIndicator = () => {
    if (scrollIndicatorRef.current) {
      gsap.to(scrollIndicatorRef.current, {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "10% top",
          scrub: true
        }
      });
    }
  };

  return (
    <div className="scroll-indicator" ref={scrollIndicatorRef}>
      <div className="animate-bounce flex flex-col items-center text-white absolute bottom-10 left-1/2 transform -translate-x-1/2 z-50 opacity-80">
        <p className="text-sm mb-2">Scroll Down</p>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  );
};

export default ScrollAnimations;
