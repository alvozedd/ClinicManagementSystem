import { FaUserClock, FaUserCheck, FaUserTimes, FaPrint, FaPhone } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

function SimplifiedQueueCard({ queueEntry, onUpdateStatus, onRemove, onPrintTicket, userRole }) {
  // Format check-in time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate wait time
  const calculateWaitTime = (checkInTime) => {
    return formatDistanceToNow(new Date(checkInTime), { addSuffix: false });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'No-show':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Waiting':
        return <FaUserClock className="mr-1" />;
      case 'In Progress':
        return <FaUserCheck className="mr-1" />;
      case 'Completed':
        return <FaUserCheck className="mr-1" />;
      case 'No-show':
        return <FaUserTimes className="mr-1" />;
      case 'Cancelled':
        return <FaUserTimes className="mr-1" />;
      default:
        return <FaUserClock className="mr-1" />;
    }
  };

  // Get patient name
  const getPatientName = () => {
    if (queueEntry.patient_id?.name) {
      return queueEntry.patient_id.name;
    } else if (queueEntry.patient_id?.firstName && queueEntry.patient_id?.lastName) {
      return `${queueEntry.patient_id.firstName} ${queueEntry.patient_id.lastName}`;
    } else {
      return 'Unknown Patient';
    }
  };

  // Get appointment info
  const getAppointmentInfo = () => {
    if (queueEntry.appointment_id) {
      return queueEntry.appointment_id.type || 'Consultation';
    } else if (queueEntry.is_walk_in) {
      return 'Walk-in';
    } else {
      return 'No appointment';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${queueEntry.status === 'Waiting' ? 'border-yellow-200' : queueEntry.status === 'In Progress' ? 'border-blue-200' : 'border-gray-200'} flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center mb-3 md:mb-0">
        <div className="bg-blue-600 text-white font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-4">
          {queueEntry.ticket_number}
        </div>
        <div>
          <h3 className="font-semibold text-lg">
            {getPatientName()}
          </h3>
          <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-1">
            <span>{getAppointmentInfo()}</span>
            <span>•</span>
            <span>Checked in: {formatTime(queueEntry.check_in_time)}</span>
            {queueEntry.patient_id?.phone && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <FaPhone className="mr-1 text-blue-500" size={12} />
                  {queueEntry.patient_id.phone}
                </span>
              </>
            )}
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(queueEntry.status)}`}>
              {getStatusIcon(queueEntry.status)}
              {queueEntry.status} • {queueEntry.status === 'Waiting' ? `Waiting for ${calculateWaitTime(queueEntry.check_in_time)}` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {queueEntry.status === 'Waiting' && userRole === 'doctor' && (
          <button
            onClick={() => onUpdateStatus('In Progress')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            <FaUserCheck className="mr-1" />
            Start
          </button>
        )}
        
        {queueEntry.status === 'In Progress' && userRole === 'doctor' && (
          <button
            onClick={() => onUpdateStatus('Completed')}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            <FaUserCheck className="mr-1" />
            Complete
          </button>
        )}
        
        {queueEntry.status === 'Waiting' && (
          <button
            onClick={() => onUpdateStatus('No-show')}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            <FaUserTimes className="mr-1" />
            No-show
          </button>
        )}
        
        <button
          onClick={() => onPrintTicket(queueEntry)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
        >
          <FaPrint className="mr-1" />
          Print
        </button>
        
        {userRole === 'secretary' && (
          <button
            onClick={onRemove}
            className="bg-gray-200 hover:bg-gray-300 text-red-600 px-3 py-1 rounded text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default SimplifiedQueueCard;
