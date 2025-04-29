import { useRef, useEffect } from 'react';
import { FaPrint } from 'react-icons/fa';

function QueueTicketPrint({ queueEntry, onClose }) {
  const printRef = useRef();

  useEffect(() => {
    // Auto-print when component mounts
    if (queueEntry) {
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [queueEntry]);

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = `Print_${uniqueName}`;
    const printWindow = window.open(windowUrl, windowName, 'height=600,width=400');
    
    printWindow.document.write('<html><head><title>Patient Ticket</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 20px; 
        width: 80mm; /* Standard thermal receipt width */
      }
      .ticket { 
        border: 1px solid #ccc; 
        padding: 15px; 
        width: 100%; 
        box-sizing: border-box;
      }
      .ticket-header { 
        text-align: center; 
        margin-bottom: 15px; 
        border-bottom: 1px dashed #ccc;
        padding-bottom: 10px;
      }
      .clinic-name { 
        font-size: 18px; 
        font-weight: bold; 
        margin: 0;
      }
      .ticket-date { 
        font-size: 12px; 
        color: #666; 
        margin: 5px 0;
      }
      .ticket-number { 
        font-size: 36px; 
        font-weight: bold; 
        margin: 15px 0; 
        text-align: center;
      }
      .patient-info { 
        margin: 15px 0; 
        font-size: 14px;
      }
      .info-row { 
        display: flex; 
        justify-content: space-between; 
        margin-bottom: 5px;
      }
      .info-label { 
        font-weight: bold; 
        color: #666;
      }
      .ticket-footer { 
        text-align: center; 
        font-size: 12px; 
        color: #666; 
        margin-top: 15px;
        border-top: 1px dashed #ccc;
        padding-top: 10px;
      }
      @media print {
        body { 
          width: 100%; 
          margin: 0; 
          padding: 0;
        }
        .ticket { 
          border: none;
        }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (!queueEntry) return null;

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">
            Patient Ticket
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center w-full"
          >
            <FaPrint className="mr-2" />
            Print Ticket
          </button>
        </div>

        <div className="border border-gray-300 rounded-lg p-4" ref={printRef}>
          <div className="ticket">
            <div className="ticket-header">
              <p className="clinic-name">UroHealth Central Ltd</p>
              <p className="ticket-date">{formatDate(queueEntry.check_in_time)}</p>
            </div>
            
            <div className="ticket-number">
              #{queueEntry.ticket_number}
            </div>
            
            <div className="patient-info">
              <div className="info-row">
                <span className="info-label">Patient:</span>
                <span>{queueEntry.patient_id?.name || 'Unknown Patient'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Visit Type:</span>
                <span>{queueEntry.is_walk_in ? 'Walk-in' : 'Appointment'}</span>
              </div>
              {queueEntry.appointment_id && (
                <div className="info-row">
                  <span className="info-label">Appointment:</span>
                  <span>{queueEntry.appointment_id.type || 'Consultation'}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span>{queueEntry.status}</span>
              </div>
            </div>
            
            <div className="ticket-footer">
              <p>Please wait until your number is called.</p>
              <p>Thank you for choosing UroHealth Central Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueueTicketPrint;
