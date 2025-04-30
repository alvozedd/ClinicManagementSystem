import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaUser, FaClipboardList, FaUserClock } from 'react-icons/fa';
import Loader from './Loader';
import Message from './Message';

const AppointmentForm = ({ patient, onSubmit, onCancel, isWalkIn = false }) => {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patient || !patient._id) {
      setError('Please select a patient first');
      return;
    }

    if (!date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentData = {
        patient: patient._id,
        date,
        reason: reason || 'General consultation',
        status: 'scheduled',
        type: isWalkIn ? 'Walk-in' : 'Scheduled'
      };

      const { data } = await axios.post('/api/appointments', appointmentData);

      setSuccess(true);
      setLoading(false);

      // Clear form
      setReason('');

      // Call the onSubmit callback with the created appointment
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {isWalkIn && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          <p className="flex items-center">
            <FaUserClock className="mr-2" /> Walk-in Appointment
          </p>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaCalendarAlt className="mr-2 text-blue-500" />
        Book Appointment
      </h2>

      {loading && <Loader />}
      {error && <Message variant="danger">{error}</Message>}
      {success && (
        <Message variant="success">Appointment booked successfully!</Message>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 flex items-center">
            <FaUser className="mr-2 text-blue-500" />
            Patient
          </label>
          <div className="p-3 border rounded-lg bg-gray-50">
            {patient ? (
              <div>
                <p className="font-medium">{patient.name} {patient.otherNames}</p>
                <p className="text-sm text-gray-600">{patient.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500">No patient selected</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 mb-2 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="reason" className="block text-gray-700 mb-2 flex items-center">
            <FaClipboardList className="mr-2 text-blue-500" />
            Reason (Optional)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Reason for appointment"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
