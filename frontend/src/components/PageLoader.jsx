import React, { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/fallbackAnimations.css';
import { motion, AnimatePresence } from 'framer-motion';

const PageLoader = ({ children, backgroundImage }) => {
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Preload the background image
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage || '/image/Theone.jpeg';
    img.onload = () => {
      setImageLoaded(true);
      // After image is loaded, wait a bit before removing the loader
      setTimeout(() => {
        setLoading(false);
        // Show scroll indicator after content is loaded
        setTimeout(() => {
          setShowScrollIndicator(true);
        }, 1000);
      }, 500);
    };

    // Fallback in case image fails to load
    const timeout = setTimeout(() => {
      if (!imageLoaded) {
        setImageLoaded(true);
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [backgroundImage]);

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
              <div className="text-white text-2xl md:text-3xl font-bold mb-4 flex items-center">
                <span className="text-blue-300">Uro</span>Health
              </div>
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
      >
        {children}

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <motion.div
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40 text-white cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
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
              className="flex flex-col items-center"
            >
              <span className="text-sm mb-2 font-light">Scroll Down</span>
              <FaChevronDown size={20} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default PageLoader;
