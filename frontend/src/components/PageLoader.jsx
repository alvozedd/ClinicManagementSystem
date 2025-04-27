import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageLoader = ({ children, backgroundImage }) => {
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Preload the background image
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage || '/image/Theone.jpeg';
    img.onload = () => {
      setImageLoaded(true);
      // After image is loaded, wait a bit before removing the loader
      setTimeout(() => {
        setLoading(false);
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
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageLoader;
