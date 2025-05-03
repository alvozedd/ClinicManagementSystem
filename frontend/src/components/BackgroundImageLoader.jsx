import { useState, useEffect } from 'react';
import apiService from '../utils/apiService';

function BackgroundImageLoader({ useWaveEffect = false }) {
  // If wave effect is active, don't load background image
  if (useWaveEffect) {
    // Remove any existing background image
    useEffect(() => {
      document.documentElement.style.setProperty('--dynamic-background-image', 'none');
      document.documentElement.style.setProperty('--mobile-background-image', 'none');

      // Add a class to the body to indicate wave effect is active
      document.body.classList.add('wave-effect-active');

      return () => {
        document.body.classList.remove('wave-effect-active');
      };
    }, []);

    return null;
  }

  const [backgroundImage, setBackgroundImage] = useState('/backgroundimg/Theone.jpeg');
  // Use the same image for all devices to avoid white space issues
  const [mobileBackgroundImage, setMobileBackgroundImage] = useState('/backgroundimg/Theone.jpeg');

  useEffect(() => {
    // Force a cache-busting parameter to ensure the image is refreshed
    const timestamp = new Date().getTime();
    const imageWithCacheBusting = `${backgroundImage}?t=${timestamp}`;
    const mobileImageWithCacheBusting = `${mobileBackgroundImage}?t=${timestamp}`;

    // Set the initial background image
    document.documentElement.style.setProperty(
      '--dynamic-background-image',
      `url(${imageWithCacheBusting})`
    );

    // Set the mobile background image
    document.documentElement.style.setProperty(
      '--mobile-background-image',
      `url(${mobileImageWithCacheBusting})`
    );

    // Add media query listener for responsive background
    const handleScreenSizeChange = () => {
      // Use the same image for all devices to avoid white space issues
      console.log('Using same background image for all devices');
      document.documentElement.style.setProperty(
        '--mobile-background-image',
        `url(${imageWithCacheBusting})`
      );
    };

    // Call once on load
    handleScreenSizeChange();

    // Add resize listener
    window.addEventListener('resize', handleScreenSizeChange);

    // Clean up resize listener
    return () => {
      window.removeEventListener('resize', handleScreenSizeChange);
    };

    // Function to load images from the backgroundimg folder
    const loadBackgroundImages = async () => {
      try {
        // Call the API endpoint to get the list of background images
        const response = await apiService.get('/api/backgroundImages');

        if (response.data && response.data.images && response.data.images.length > 0) {
          // Randomly select an image if there are multiple
          const images = response.data.images;
          const randomIndex = Math.floor(Math.random() * images.length);
          const selectedImage = `/backgroundimg/${images[randomIndex]}`;

          // Update the background image with cache busting
          const timestamp = new Date().getTime();
          const imageWithCacheBusting = `${selectedImage}?t=${timestamp}`;

          setBackgroundImage(selectedImage);
          document.documentElement.style.setProperty(
            '--dynamic-background-image',
            `url(${imageWithCacheBusting})`
          );
        }
      } catch (error) {
        console.error('Error loading background images:', error);
        // Fallback to using the default image with cache busting
        const fallbackImage = '/backgroundimg/Theone.jpeg';
        const timestamp = new Date().getTime();
        const imageWithCacheBusting = `${fallbackImage}?t=${timestamp}`;

        document.documentElement.style.setProperty(
          '--dynamic-background-image',
          `url(${imageWithCacheBusting})`
        );

        // Try to directly check if the image exists in the public folder
        checkImageExists();
      }
    };

    // Function to check if images exist directly in the public folder
    const checkImageExists = () => {
      const commonImageNames = [
        'Theone.jpeg',
        'background.jpg',
        'background1.jpg',
        'background2.jpg',
        'hero.jpg',
        'bg.jpg',
        'main.jpg'
      ];

      // Try each potential image name
      commonImageNames.forEach(imageName => {
        const img = new Image();
        const imagePath = `/backgroundimg/${imageName}`;

        img.onload = () => {
          // If the image loads successfully, use it with cache busting
          const timestamp = new Date().getTime();
          const imageWithCacheBusting = `${imagePath}?t=${timestamp}`;

          setBackgroundImage(imagePath);
          document.documentElement.style.setProperty(
            '--dynamic-background-image',
            `url(${imageWithCacheBusting})`
          );
        };

        img.src = imagePath;
      });
    };

    // Check if the image exists directly first
    const directCheck = () => {
      const img = new Image();
      img.onload = () => {
        // Image exists, use it with cache busting
        const timestamp = new Date().getTime();
        const imageWithCacheBusting = `${backgroundImage}?t=${timestamp}`;

        document.documentElement.style.setProperty(
          '--dynamic-background-image',
          `url(${imageWithCacheBusting})`
        );
      };
      img.onerror = () => {
        // If direct check fails, try the API
        loadBackgroundImages();
      };
      img.src = backgroundImage;
    };

    // Try direct check first
    directCheck();

    // Also load background images from API
    loadBackgroundImages();

    // Set up an interval to periodically check for new images
    const intervalId = setInterval(loadBackgroundImages, 60000); // Check every minute

    return () => {
      // Clean up the interval when the component unmounts
      clearInterval(intervalId);
    };
  }, [backgroundImage]);

  return null; // This component doesn't render anything
}

export default BackgroundImageLoader;
