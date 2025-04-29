import { FaUserClock, FaUserCheck, FaUserTimes, FaPrint, FaPhone } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

function SuperSimpleQueueCard({ queueEntry, onUpdateStatus, onRemove, onPrintTicket, userRole, patients }) {
  // Format check-in time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate wait time
  const calculateWaitTime = (checkInTime) => {
    return formatDistanceToNow(new Date(checkInTime), { addSuffix: false });
  };

  // Get patient name
  const getPatientName = () => {
    // If patient_id is an object with name property
    if (queueEntry.patient_id && typeof queueEntry.patient_id === 'object' && queueEntry.patient_id.name) {
      return queueEntry.patient_id.name;
    }

    // If patientName is directly available
    if (queueEntry.patientName) {
      return queueEntry.patientName;
    }

    // If patient_id is just an ID, try to find the patient in the global patients array
    if (patients && Array.isArray(patients) && queueEntry.patient_id) {
      const patientId = typeof queueEntry.patient_id === 'object' ?
        (queueEntry.patient_id._id || queueEntry.patient_id.id) : queueEntry.patient_id;

      const patient = patients.find(p => p._id === patientId || p.id === patientId);
      if (patient) {
        return patient.name;
      }
    }

    return 'Unknown Patient';
  };

  // Get appointment info
  const getAppointmentInfo = () => {
    if (queueEntry.is_walk_in) {
      return 'Walk-in';
    }
    if (queueEntry.appointment_id) {
      // Handle both populated and non-populated appointment_id
      const appointment = queueEntry.appointment_id;
      if (typeof appointment === 'object') {
        return appointment.type || 'Appointment';
      }
    }
    return 'Appointment';
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
        return null;
    }
  };

  // Get card background color based on status
  const getCardBackground = (status) => {
    switch (status) {
      case 'Waiting':
        return 'border-yellow-200 bg-yellow-50';
      case 'In Progress':
        return 'border-blue-200 bg-blue-50';
      case 'Completed':
        return 'border-green-200 bg-green-50';
      case 'No-show':
        return 'border-red-200 bg-red-50';
      case 'Cancelled':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getCardBackground(queueEntry.status)} flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center mb-3 md:mb-0 w-full md:w-auto">
        <div className="bg-blue-600 text-white font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-4">
          {queueEntry.ticket_number}
        </div>
        <div className="flex-grow">
          <div className="flex items-center">
            <h3 className="font-semibold text-lg">
              {getPatientName()}
            </h3>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(queueEntry.status)}`}>
              {getStatusIcon(queueEntry.status)}
              {queueEntry.status}
            </span>
          </div>
          <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-1">
            <span>{getAppointmentInfo()}</span>
            <span>•</span>
            <span>Checked in: {formatTime(queueEntry.check_in_time)}</span>
            {queueEntry.status === 'Waiting' && (
              <>
                <span>•</span>
                <span>Waiting for: {calculateWaitTime(queueEntry.check_in_time)}</span>
              </>
            )}
            {queueEntry.patient_id && typeof queueEntry.patient_id === 'object' && queueEntry.patient_id.phone && (
              <>
                <span>•</span>
                <a
                  href={`tel:${queueEntry.patient_id.phone}`}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaPhone className="mr-1" size={12} />
                  {queueEntry.patient_id.phone}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
        {queueEntry.status === 'Waiting' && (userRole === 'doctor' || userRole === 'secretary' || userRole === 'admin') && (
          <button
            onClick={() => onUpdateStatus('In Progress')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            <FaUserCheck className="mr-1" />
            Start
          </button>
        )}

        {queueEntry.status === 'In Progress' && (userRole === 'doctor' || userRole === 'secretary' || userRole === 'admin') && (
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
          onClick={onPrintTicket}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
        >
          <FaPrint className="mr-1" />
          Print
        </button>

        <button
          onClick={onRemove}
          className="bg-gray-200 hover:bg-gray-300 text-red-600 px-3 py-1 rounded text-sm font-medium flex items-center"
        >
          <FaUserTimes className="mr-1" />
          Remove
        </button>
      </div>
    </div>
  );
}

export default SuperSimpleQueueCard;
