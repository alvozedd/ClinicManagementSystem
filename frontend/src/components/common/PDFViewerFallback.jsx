import React from 'react';
import { FaDownload, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

/**
 * A fallback component for when the PDF viewer cannot be loaded
 * This provides a simple interface to download or open the PDF externally
 */
const PDFViewerFallback = ({ fileUrl, fileName, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
            {fileName || 'PDF Document'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
          <div className="text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              PDF Viewer Unavailable
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The PDF viewer couldn't be loaded. You can download the file or open it in a new tab.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={fileUrl}
                download={fileName || 'document.pdf'}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaDownload className="mr-2" />
                Download PDF
              </a>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaExternalLinkAlt className="mr-2" />
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewerFallback;
