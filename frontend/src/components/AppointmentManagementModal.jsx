import { useState, useEffect } from 'react';

function AppointmentManagementModal({ appointment, onClose, onSave, isNew = false, isEmbedded = false }) {
  // Initialize with empty values, will be populated in useEffect
  const [formData, setFormData] = useState({
    date: '',
    time: '',
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
      time: appointment?.time || '09:00',
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
      time: formData.time,
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
    <div className={isEmbedded ? '' : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"}>
      <div className={isEmbedded ? "w-full" : "bg-white rounded-lg shadow-xl p-6 w-full max-w-md"}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {isNew ? 'Add New Appointment' : 'Edit Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {!isNew && (
          <div className="mb-4 bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Patient:</span> {appointment.patientName}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Reason for appointment (optional)"
              />
            </div>

            {!isNew && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
              >
                {isNew ? 'Create Appointment' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentManagementModal;
