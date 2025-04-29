import React, { useState, useEffect } from 'react';
import '../styles/fallbackAnimations.css';
import { motion, AnimatePresence } from 'framer-motion';

const PageLoader = ({ children, backgroundImage }) => {
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Scroll indicator and scroll position tracking removed

  // Preload the background image
  useEffect(() => {
    // Determine which background image to use based on screen size
    const isMobile = window.innerWidth <= 768;
    const mobileImage = '/backgroundimg/mobile.jpeg';
    const desktopImage = '/backgroundimg/Theone.jpeg';

    // Preload both images
    const imgDesktop = new Image();
    imgDesktop.src = desktopImage;

    const imgMobile = new Image();
    imgMobile.src = mobileImage;

    // Use the appropriate image based on screen size
    const img = new Image();
    img.src = isMobile ? mobileImage : (backgroundImage || desktopImage);

    // Add event listener for image load
    img.onload = () => {
      console.log('Background image loaded successfully');
      setImageLoaded(true);
      // After image is loaded, wait a bit before removing the loader
      setTimeout(() => {
        setLoading(false);
        // Removed scroll indicator code
      }, 500);
    };

    // Add error handler
    img.onerror = (err) => {
      console.error('Error loading background image:', err);
      setImageLoaded(true); // Still set as loaded to remove loader
      setLoading(false);
    };

    // Fallback in case image fails to load
    const timeout = setTimeout(() => {
      if (!imageLoaded) {
        console.warn('Background image load timeout - forcing continue');
        setImageLoaded(true);
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [backgroundImage, imageLoaded]);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-blue-900 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-white text-2xl md:text-3xl font-bold mb-4 flex items-center justify-center">
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
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.9 }}
                className="text-sm text-blue-100 mb-4"
              >
                Specialist Urological Care
              </motion.div>
              <div className="loader-dots flex space-x-2 justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0
                  }}
                  className="w-3 h-3 bg-white rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0,
                    delay: 0.2
                  }}
                  className="w-3 h-3 bg-white rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0,
                    delay: 0.4
                  }}
                  className="w-3 h-3 bg-white rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
        style={{ margin: 0, padding: 0 }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageLoader;
