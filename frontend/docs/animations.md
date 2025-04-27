# UroHealth Website Animation Guidelines

This document outlines the animation specifications for the UroHealth website to ensure a consistent, professional, and engaging user experience.

## Landing Page Animations

### Hero Section
- **Effect**: Subtle fade-in with slight upward movement
- **Duration**: 0.5 seconds
- **Timing Function**: ease-out
- **Implementation**:
  ```css
  @keyframes heroFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  ```
  ```jsx
  // Framer Motion implementation
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {/* Hero content */}
  </motion.div>
  ```

### Fluid Blue Design (Parallax Effect)
- **Effect**: Gentle parallax effect as users scroll
- **Implementation**:
  ```jsx
  // Using scroll position to create parallax
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Apply transform based on scroll position
  <div style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
    {/* Background elements */}
  </div>
  ```

### Call-to-Action Buttons
- **Effect**: Soft pulse animation on page load
- **Interval**: 3 seconds
- **Implementation**:
  ```css
  @keyframes softPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  }
  
  .cta-button {
    animation: softPulse 3s infinite;
  }
  ```
  ```jsx
  // Framer Motion implementation
  <motion.button
    animate={{
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 4px 6px rgba(0, 0, 0, 0.1)",
        "0 6px 8px rgba(0, 0, 0, 0.15)",
        "0 4px 6px rgba(0, 0, 0, 0.1)"
      ]
    }}
    transition={{
      duration: 3,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 0
    }}
  >
    Book Appointment
  </motion.button>
  ```

### Scroll Indicator
- **Effect**: Subtle bouncing arrow animation
- **Implementation**:
  ```css
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  .scroll-indicator {
    animation: bounce 2s infinite;
  }
  ```
  ```jsx
  // Framer Motion implementation
  <motion.div
    animate={{
      y: [0, -10, -5, 0]
    }}
    transition={{
      duration: 2,
      ease: "easeInOut",
      times: [0, 0.4, 0.6, 1],
      repeat: Infinity,
      repeatDelay: 0
    }}
    className="scroll-indicator"
  >
    <FaChevronDown />
  </motion.div>
  ```

### Accessibility Considerations
- Include support for users who prefer reduced motion:
  ```css
  @media (prefers-reduced-motion) {
    .hero-section, .cta-button, .scroll-indicator {
      animation: none;
      transition: none;
    }
  }
  ```
  ```jsx
  // Framer Motion implementation
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const heroAnimation = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
      };
  
  <motion.div {...heroAnimation}>
    {/* Hero content */}
  </motion.div>
  ```

### Performance Considerations
- Use hardware-accelerated properties (transform, opacity) for smooth animations
- Avoid animating layout properties (width, height, top, left) when possible
- Implement debouncing for scroll-based animations to improve performance
