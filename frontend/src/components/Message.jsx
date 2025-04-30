import React from 'react';

const Message = ({ variant, children }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className={`message p-4 mb-4 rounded-lg border ${getVariantClass()}`} role="alert">
      {children}
    </div>
  );
};

export default Message;
