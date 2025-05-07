import React from 'react';

const TestComponent = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Component</h1>
        <p className="text-xl mb-8">This is a test component to verify that our changes are working.</p>
        <div className="flex justify-center">
          <a 
            href="/"
            className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold text-lg"
          >
            Go Back Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
