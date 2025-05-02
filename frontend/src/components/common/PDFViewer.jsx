import React from 'react';
import PDFViewerFallback from './PDFViewerFallback';

/**
 * PDFViewer component
 *
 * This is a simplified version that just uses the fallback component
 * to avoid build issues with react-pdf in the Netlify environment.
 *
 * Users can download the PDF or open it in a new tab.
 */
const PDFViewer = ({ fileUrl, fileName, onClose }) => {
  // Simply return the fallback component
  return <PDFViewerFallback fileUrl={fileUrl} fileName={fileName} onClose={onClose} />;
};

export default PDFViewer;
