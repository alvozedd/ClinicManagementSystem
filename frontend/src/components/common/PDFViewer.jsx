import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FaArrowLeft, FaArrowRight, FaDownload, FaTimes } from 'react-icons/fa';
import Spinner from './Spinner';
import PDFViewerFallback from './PDFViewerFallback';
import ErrorBoundary from './ErrorBoundary';

// Dynamically import react-pdf to avoid build issues
const PDFModule = lazy(() => import('react-pdf'));

// Create a component that will load the PDF components
const PDFRenderer = ({ fileUrl, pageNumber, onDocumentLoadSuccess, onDocumentLoadError }) => {
  const [pdfjs, setPdfjs] = useState(null);

  useEffect(() => {
    // Dynamically import pdfjs
    import('react-pdf').then((pdf) => {
      // Set up the worker for PDF.js
      pdf.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdf.pdfjs.version}/pdf.worker.min.js`;
      setPdfjs(pdf);
    });
  }, []);

  if (!pdfjs) return <Spinner />;

  const { Document, Page } = pdfjs;

  return (
    <Document
      file={fileUrl}
      onLoadSuccess={onDocumentLoadSuccess}
      onLoadError={onDocumentLoadError}
      loading={<Spinner />}
      className="flex justify-center"
    >
      <Page
        pageNumber={pageNumber}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="shadow-md"
        scale={1.2}
      />
    </Document>
  );
};

const PDFViewer = ({ fileUrl, fileName, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    setLoadFailed(false);
  };

  // Handle document load error
  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try downloading the file instead.');
    setLoading(false);
    setLoadFailed(true);
  };

  // If the PDF viewer fails to load, show the fallback component
  if (loadFailed) {
    return <PDFViewerFallback fileUrl={fileUrl} fileName={fileName} onClose={onClose} />;
  };

  // Navigate to previous page
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  // Navigate to next page
  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
            {fileName || 'PDF Document'}
          </h2>
          <div className="flex items-center space-x-2">
            <a
              href={fileUrl}
              download
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              title="Download"
            >
              <FaDownload />
            </a>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              <p>{error}</p>
              <a
                href={fileUrl}
                download
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Download PDF Instead
              </a>
            </div>
          )}

          <Suspense fallback={<Spinner />}>
            <ErrorBoundary fallback={<PDFViewerFallback fileUrl={fileUrl} fileName={fileName} onClose={onClose} />}>
              <PDFRenderer
                fileUrl={fileUrl}
                pageNumber={pageNumber}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                onDocumentLoadError={onDocumentLoadError}
              />
            </ErrorBoundary>
          </Suspense>
        </div>

        {/* Footer with pagination */}
        {numPages && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className={`flex items-center ${
                pageNumber <= 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              }`}
            >
              <FaArrowLeft className="mr-1" /> Previous
            </button>
            <p className="text-gray-700 dark:text-gray-300">
              Page {pageNumber} of {numPages}
            </p>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className={`flex items-center ${
                pageNumber >= numPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              }`}
            >
              Next <FaArrowRight className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
