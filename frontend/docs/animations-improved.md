# UroHealth Website Animation Improvements

This document outlines the improved animation specifications implemented for the UroHealth website to create a more professional and engaging user experience.

## Loading Screen Animations

### Typed Text Effect
- **Effect**: Text appears as if being typed line by line slowly
- **Implementation**:
  ```jsx
  <motion.span 
    className="text-blue-300"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.3 }}
  >
    Uro
  </motion.span>
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, delay: 1.1 }}
  >
    Health
  </motion.span>
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, delay: 1.9 }}
    className="text-sm text-blue-100 mb-4"
  >
    Specialist Urological Care
  </motion.div>
  ```

### Improved Scroll Indicator
- **Effect**: Smooth scrolling with proper disappearance when scrolled
- **Implementation**:
  ```jsx
  // Track scroll position
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Only show scroll indicator when at top of page
  {showScrollIndicator && scrollPosition < 100 && (
    <motion.div 
      className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40 text-white cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onClick={() => {
        const homeSection = document.querySelector('.hero-section');
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
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
      >
        <span className="text-sm mb-2 font-light">Scroll Down</span>
        <FaChevronDown size={20} />
      </motion.div>
    </motion.div>
  )}
  ```

## Hero Section Animations

### Fixed Button Animation
- **Effect**: Pulsing effect without noticeable size changes
- **Implementation**:
  ```jsx
  <div className="relative overflow-hidden w-36 sm:w-auto">
    <motion.button
      className="bg-white text-blue-700 hover:bg-blue-50 px-6 sm:px-8 py-3 rounded-full font-medium transition duration-300 text-sm sm:text-base flex items-center justify-center gap-2 w-full"
      animate={{
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
      Book Now
    </motion.button>
    <motion.div 
      className="absolute inset-0 pointer-events-none border border-white rounded-full"
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(255, 255, 255, 0.2)",
          "0 0 0 8px rgba(255, 255, 255, 0)"
        ]
      }}
      transition={{
        duration: 2,
        ease: "easeOut",
        times: [0, 1],
        repeat: Infinity,
        repeatDelay: 1
      }}
    />
  </div>
  ```

## Services Section Animations

### Improved Card Reveal
- **Effect**: Cards emerge from below with frost glass effect, then text appears sequentially
- **Implementation**:
  ```jsx
  <motion.div
    className="true-glass-card p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-white/10 hover:border-white/30 transform hover:translate-y-[-8px] h-full group service-card relative overflow-hidden"
    initial={{ opacity: 0, y: 80 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px" }}
    transition={{ duration: 0.8, delay: 0.1 }}
  >
    {/* Light effect animation */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent w-[200%]"
      initial={{ x: '-100%' }}
      whileInView={{ x: '100%' }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay: 1.2, ease: 'easeInOut' }}
    />
    <motion.div 
      className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 w-[200%]"
      initial={{ x: '100%' }}
      whileInView={{ x: '-100%' }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay: 1.2, ease: 'easeInOut' }}
    />
    
    {/* Icon with delayed appearance */}
    <motion.div 
      className="bg-white/20 p-5 rounded-full mb-6 group-hover:bg-white/30 transition-all duration-300"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      <svg className="w-14 h-14 text-white">...</svg>
    </motion.div>
    
    {/* Title with delayed appearance */}
    <motion.h4 
      className="text-2xl font-semibold mb-4 text-white"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      {title}
    </motion.h4>
    
    {/* Description with delayed appearance */}
    <motion.p 
      className="text-blue-100 text-lg leading-relaxed mb-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.9 }}
    >
      {description}
    </motion.p>
    
    {/* Features with delayed appearance */}
    <motion.div 
      className="mb-6 flex items-center justify-center text-white"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 1.1 }}
    >
      <svg className="w-6 h-6 mr-2">...</svg>
      <span className="text-lg">{feature}</span>
    </motion.div>
  </motion.div>
  ```

### Light Effect Animation
- **Effect**: Light strip moves inside card outline when section loads and on hover
- **Implementation**:
  ```jsx
  {/* Light effect animation on load */}
  <motion.div 
    className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent w-[200%]"
    initial={{ x: '-100%' }}
    whileInView={{ x: '100%' }}
    viewport={{ once: true }}
    transition={{ duration: 1.5, delay: 1.2, ease: 'easeInOut' }}
  />
  <motion.div 
    className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 w-[200%]"
    initial={{ x: '100%' }}
    whileInView={{ x: '-100%' }}
    viewport={{ once: true }}
    transition={{ duration: 1.5, delay: 1.2, ease: 'easeInOut' }}
  />
  ```

## Contact Section Animations

### Slowed Down Animations
- **Effect**: Slower, more deliberate animations that only trigger when in viewport
- **Implementation**:
  ```jsx
  <motion.div 
    className="contact-card rounded-xl p-6"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px" }}
    transition={{ duration: 0.8, delay: 0.2 }}
  >
    {/* Contact card content */}
  </motion.div>
  
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px" }}
    transition={{ duration: 0.8, delay: 0.5 }}
  >
    {/* Map container */}
  </motion.div>
  
  <motion.div 
    className="map-container mt-4 mb-4"
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "0px" }}
    transition={{ duration: 0.8, delay: 0.8 }}
  >
    {/* Map iframe */}
  </motion.div>
  ```

## Accessibility Considerations

- All animations respect the `prefers-reduced-motion` media query
- Animations are subtle and professional, not distracting
- Interactive elements have clear hover states
- Animations complete within reasonable timeframes
- Scroll-triggered animations only play once

## Performance Optimizations

- Used hardware-accelerated properties (transform, opacity) for smooth animations
- Implemented proper viewport detection to only animate when elements are visible
- Added appropriate animation delays to create a natural flow
- Used staggered animations to reduce simultaneous animations
- Ensured animations don't cause layout shifts
