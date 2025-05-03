import React from 'react';
import { Link } from 'react-router-dom';

const ThreeDEntryPoint = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link 
        to="/modern-clinic.html" 
        target="_blank"
        className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-3 rounded-lg font-medium transition duration-300 shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-1"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
          ></path>
        </svg>
        3D Experience
      </Link>
    </div>
  );
};

export default ThreeDEntryPoint;
