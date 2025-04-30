import React from 'react';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="loader-dots flex space-x-2 justify-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
