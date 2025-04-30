import { useState } from 'react';
import { FaUserClock, FaUserCheck, FaUserTimes, FaExclamationTriangle, FaEllipsisV, FaPhone, FaCalendarAlt, FaPrint } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

function QueueCard({ queueEntry, onUpdateStatus, onRemove, onPrintTicket }) {
  const [showActions, setShowActions] = useState(false);

  // Format check-in time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate wait time
  const calculateWaitTime = (checkInTime) => {
    if (!checkInTime) return 'unknown time';
    return formatDistanceToNow(new Date(checkInTime), { addSuffix: false });
  };

  // Get status color - handle both legacy and integrated appointment statuses
  const getStatusColor = (status) => {
    // Normalize status to handle both systems
    const normalizedStatus = status?.toLowerCase() || '';

    if (normalizedStatus.includes('wait') || normalizedStatus.includes('check') || normalizedStatus === 'scheduled') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (normalizedStatus.includes('progress') || normalizedStatus === 'in-progress') {
      return 'bg-blue-100 text-blue-800';
    } else if (normalizedStatus.includes('complete')) {
      return 'bg-green-100 text-green-800';
    } else if (normalizedStatus.includes('no-show') || normalizedStatus === 'no-show') {
      return 'bg-red-100 text-red-800';
    } else if (normalizedStatus.includes('cancel')) {
      return 'bg-gray-100 text-gray-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon - handle both legacy and integrated appointment statuses
  const getStatusIcon = (status) => {
    // Normalize status to handle both systems
    const normalizedStatus = status?.toLowerCase() || '';

    if (normalizedStatus.includes('wait') || normalizedStatus.includes('check') || normalizedStatus === 'scheduled') {
      return <FaUserClock className="mr-1" />;
    } else if (normalizedStatus.includes('progress') || normalizedStatus === 'in-progress') {
      return <FaUserCheck className="mr-1" />;
    } else if (normalizedStatus.includes('complete')) {
      return <FaUserCheck className="mr-1" />;
    } else if (normalizedStatus.includes('no-show') || normalizedStatus === 'no-show') {
      return <FaUserTimes className="mr-1" />;
    } else if (normalizedStatus.includes('cancel')) {
      return <FaExclamationTriangle className="mr-1" />;
    } else {
      return <FaUserClock className="mr-1" />;
    }
  };

  // Helper to get patient info from either system
  const getPatientInfo = () => {
    // For integrated appointment system
    if (queueEntry.patient) {
      return {
        name: queueEntry.patient.name,
        phone: queueEntry.patient.phone
      };
    }
    // For legacy queue system
    else if (queueEntry.patient_id) {
      return {
        name: typeof queueEntry.patient_id === 'object' ? queueEntry.patient_id.name : 'Unknown Patient',
        phone: typeof queueEntry.patient_id === 'object' ? queueEntry.patient_id.phone : 'No phone'
      };
    }
    // Fallback
    return {
      name: 'Unknown Patient',
      phone: 'No phone'
    };
  };

  // Get ticket number from either system
  const getTicketNumber = () => {
    return queueEntry.queueNumber || queueEntry.ticket_number || '?';
  };

  // Get check-in time from either system
  const getCheckInTime = () => {
    return queueEntry.checkedInAt || queueEntry.check_in_time || new Date();
  };

  // Determine if it's a walk-in from either system
  const isWalkIn = () => {
    return queueEntry.isWalkIn || queueEntry.is_walk_in || false;
  };

  // Get patient info
  const patientInfo = getPatientInfo();

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(queueEntry.status)} flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all duration-300 relative`}>
      <div className="flex items-center mb-3 md:mb-0">
        <div className="bg-blue-600 text-white font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-4">
          {getTicketNumber()}
        </div>
        <div>
          <h3 className="font-semibold text-lg">
            {patientInfo.name}
          </h3>
          <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-1">
            <span className="flex items-center">
              <FaCalendarAlt className="mr-1 text-blue-500" size={12} />
              {isWalkIn() ? 'Walk-in' : 'Appointment'}
            </span>
            <span className="flex items-center">
              <FaUserClock className="mr-1 text-blue-500" size={12} />
              {formatTime(getCheckInTime())}
            </span>
            <span className="flex items-center">
              <FaPhone className="mr-1 text-blue-500" size={12} />
              {patientInfo.phone}
            </span>
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(queueEntry.status)}`}>
              {getStatusIcon(queueEntry.status)}
              {queueEntry.status} • Waiting for {calculateWaitTime(getCheckInTime())}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        {/* Start button - show for waiting or checked-in status */}
        {(queueEntry.status === 'Waiting' ||
          queueEntry.status === 'Checked-in' ||
          queueEntry.status === 'checked-in' ||
          queueEntry.status === 'scheduled') && (
          <button
            onClick={() => onUpdateStatus('In Progress')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            <FaUserCheck className="mr-1" />
            Start
          </button>
        )}

        {/* Complete button - show for in progress status */}
        {(queueEntry.status === 'In Progress' ||
          queueEntry.status === 'in-progress' ||
          queueEntry.status === 'In-progress') && (
          <button
            onClick={() => onUpdateStatus('Completed')}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            <FaUserCheck className="mr-1" />
            Complete
          </button>
        )}

        {/* No-show button - show for waiting or checked-in status */}
        {(queueEntry.status === 'Waiting' ||
          queueEntry.status === 'Checked-in' ||
          queueEntry.status === 'checked-in' ||
          queueEntry.status === 'scheduled') && (
          <button
            onClick={() => onUpdateStatus('No-show')}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            <FaUserTimes className="mr-1" />
            No-show
          </button>
        )}

        {/* Print ticket button */}
        <button
          onClick={() => onPrintTicket(queueEntry)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
        >
          <FaPrint className="mr-1" />
          Print
        </button>

        {/* More actions dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded text-sm font-medium"
          >
            <FaEllipsisV />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                {/* Cancel button - don't show if already cancelled */}
                {!queueEntry.status?.toLowerCase().includes('cancel') && (
                  <button
                    onClick={() => {
                      onUpdateStatus('Cancelled');
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                )}
                {/* Remove button */}
                <button
                  onClick={() => {
                    onRemove();
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Remove from Queue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueueCard;
