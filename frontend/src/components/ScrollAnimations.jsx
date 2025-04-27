import { useEffect, useRef } from 'react';

/**
 * Component that initializes and manages all scroll animations
 * This version is simplified to work in both development and production environments
 */
const ScrollAnimations = () => {
  // Refs for animation elements
  const scrollIndicatorRef = useRef(null);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Dynamically import GSAP to avoid SSR issues
    const initAnimations = async () => {
      try {
        // Dynamically import GSAP and ScrollTrigger
        const gsapModule = await import('gsap');
        const gsap = gsapModule.default;

        const scrollTriggerModule = await import('gsap/ScrollTrigger');
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

        // Register the plugin
        gsap.registerPlugin(ScrollTrigger);

        // Initialize animations
        initFadeInAnimations(gsap, ScrollTrigger);
        initParallaxEffects(gsap, ScrollTrigger);
        initBackgroundTransitions(gsap, ScrollTrigger);
        initScrollIndicator(gsap, ScrollTrigger);

        // Return cleanup function
        return () => {
          ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
      } catch (error) {
        console.error('Failed to initialize animations:', error);
        // Make all fade-in elements visible if animations fail
        document.querySelectorAll('.fade-in-element').forEach(el => {
          el.style.opacity = 1;
          el.style.transform = 'none';
        });
      }
    };

    // Start the animation initialization
    initAnimations();
  }, []);

  // 1. Fade-in Content Reveals with Subtle Upward Movement
  const initFadeInAnimations = (gsap, ScrollTrigger) => {
    try {
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
    } catch (error) {
      console.error('Error initializing fade-in animations:', error);
    }
  };

  // 2. Parallax Effect for Landing Page Fluid Elements
  const initParallaxEffects = (gsap, ScrollTrigger) => {
    try {
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
    } catch (error) {
      console.error('Error initializing parallax effects:', error);
    }
  };

  // 3. Background Gradient Transitions
  const initBackgroundTransitions = (gsap, ScrollTrigger) => {
    try {
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
    } catch (error) {
      console.error('Error initializing background transitions:', error);
    }
  };

  // Scroll Indicator Animation
  const initScrollIndicator = (gsap, ScrollTrigger) => {
    try {
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
    } catch (error) {
      console.error('Error initializing scroll indicator:', error);
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
