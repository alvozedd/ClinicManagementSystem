import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-3 text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  );
};

export default Spinner;
