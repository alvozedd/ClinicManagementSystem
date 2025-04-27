import { useState, useEffect } from 'react';
import apiService from '../utils/apiService';

function BackgroundImageLoader() {
  const [backgroundImage, setBackgroundImage] = useState('/backgroundimg/Leonardo_Phoenix_10_Create_a_visually_striking_innovative_back_2 (3).jpg');

  useEffect(() => {
    // Force a cache-busting parameter to ensure the image is refreshed
    const timestamp = new Date().getTime();
    const imageWithCacheBusting = `${backgroundImage}?t=${timestamp}`;

    // Set the initial background image
    document.documentElement.style.setProperty(
      '--dynamic-background-image',
      `url(${imageWithCacheBusting})`
    );

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
        const fallbackImage = '/backgroundimg/Leonardo_Phoenix_10_Create_a_visually_striking_innovative_back_2 (3).jpg';
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
        'Leonardo_Phoenix_10_Create_a_visually_striking_innovative_back_2 (3).jpg',
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
