import { useState, useEffect } from 'react';
import IntegratedAppointmentQueue from './IntegratedAppointmentQueue';
import SimpleAppointmentQueue from './SimpleAppointmentQueue';

/**
 * A wrapper component that tries to use IntegratedAppointmentQueue first,
 * but falls back to SimpleAppointmentQueue if there's an error
 */
function AppointmentQueueWrapper(props) {
  const [useSimpleQueue, setUseSimpleQueue] = useState(false);
  const [error, setError] = useState(null);

  // Error boundary to catch errors in IntegratedAppointmentQueue
  useEffect(() => {
    const handleError = (event) => {
      console.error('Error caught by error handler:', event.error);
      // Check if the error is related to react-beautiful-dnd
      if (
        event.error && 
        (event.error.message.includes('beautiful-dnd') || 
         event.error.message.includes('DragDropContext'))
      ) {
        console.warn('Falling back to SimpleAppointmentQueue due to react-beautiful-dnd error');
        setUseSimpleQueue(true);
      }
      setError(event.error);
    };

    // Add global error handler
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // If we've detected an error with react-beautiful-dnd, use the simple queue
  if (useSimpleQueue) {
    return <SimpleAppointmentQueue {...props} />;
  }

  // Otherwise, try to use the integrated queue with drag-and-drop
  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>There was an error loading the queue with drag-and-drop functionality.</p>
          <button 
            onClick={() => setUseSimpleQueue(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded mt-2"
          >
            Switch to Simple Queue
          </button>
        </div>
      )}
      <IntegratedAppointmentQueue {...props} />
    </div>
  );
}

export default AppointmentQueueWrapper;
