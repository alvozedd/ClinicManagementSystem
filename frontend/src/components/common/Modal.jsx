import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ title, children, onClose, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
