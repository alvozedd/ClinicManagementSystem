import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClipboardList, FaUserInjured, FaRegStickyNote, FaTimes, FaCheck } from 'react-icons/fa';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';

function AppointmentManagementModal({ appointment, onClose, onSave, isNew = false, isEmbedded = false }) {
  // Initialize with empty values, will be populated in useEffect
  const [formData, setFormData] = useState({
    date: '',
    type: '',
    reason: '',
    status: '',
    notes: ''
  });

  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log('Setting appointment date, today is:', today);

    // For both new and existing appointments, properly initialize the form
    setFormData({
      // For existing appointments, use their values; for new ones, use defaults
      date: appointment?.date || today,
      type: appointment?.type || 'Consultation',
      reason: appointment?.reason || '',
      status: appointment?.status || 'Scheduled',
      notes: appointment?.notes || ''
    });

    console.log('Appointment form initialized with date:', appointment?.date || today);
  }, [appointment, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a properly structured updated appointment
    const updatedAppointment = {
      // Preserve the original ID and patient information
      // For existing appointments, keep the original ID; for new ones, create a temporary ID
      id: appointment?.id || `new-${Date.now()}`,
      _id: appointment?._id, // Make sure to include MongoDB _id if it exists
      patientId: appointment?.patientId,
      patientName: appointment?.patientName,
      // Use the form data for appointment details
      date: formData.date,
      type: formData.type,
      reason: formData.reason,
      status: formData.status, // This is the status we want to set
      // Don't include notes here - let the transformer handle it
      // Preserve any diagnosis information if it exists
      diagnosis: appointment?.diagnosis,
      diagnosisDate: appointment?.diagnosisDate,
      // Preserve creator information
      createdBy: appointment?.createdBy,
      createdAt: appointment?.createdAt || new Date().toISOString(),
      // Update the updatedAt timestamp
      updatedAt: new Date().toISOString()
    };

    // Log detailed information about the appointment being saved
    console.log('Saving appointment with status:', updatedAppointment.status);
    console.log('Full appointment data:', updatedAppointment);
    console.log(`Appointment date: ${updatedAppointment.date}, Today's date: ${new Date().toISOString().split('T')[0]}`);
    console.log(`Is this appointment for today? ${updatedAppointment.date === new Date().toISOString().split('T')[0]}`);

    onSave(updatedAppointment);
  };

  return (
    <div className={isEmbedded ? '' : "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"}>
      <div className={isEmbedded ? "w-full" : "bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200"}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">
            {isNew ? 'Add New Appointment' : 'Edit Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {!isNew && (
          <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Patient:</span> {appointment.patientName}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-sm transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Actual time will be determined when the patient arrives and is added to the queue.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaClipboardList className="mr-2 text-blue-600" />
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-sm transition-all duration-200"
                required
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Check-up">Check-up</option>
                <option value="Emergency">Emergency</option>
                <option value="Procedure">Procedure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaUserInjured className="mr-2 text-blue-600" />
                Reason
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-sm transition-all duration-200"
                placeholder="Reason for appointment (optional)"
              />
            </div>

            {!isNew && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-sm transition-all duration-200"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaRegStickyNote className="mr-2 text-blue-600" />
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-sm transition-all duration-200"
                placeholder="Additional notes..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-200 flex items-center"
              >
                <FaTimes className="mr-1" /> Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 transform hover:translate-y-[-1px] flex items-center"
              >
                <FaCheck className="mr-1" /> {isNew ? 'Create Appointment' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentManagementModal;
