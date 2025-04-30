import React, { useState } from 'react';
import { FaNotesMedical, FaFileMedical, FaClipboardList, FaCalendarCheck } from 'react-icons/fa';
import Loader from './Loader';
import Message from './Message';

const DiagnosisForm = ({ onSubmit, onCancel }) => {
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      setError('Please enter consultation notes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a structured diagnosis object
      const diagnosisData = {
        notes,
        diagnosis,
        treatment,
        followUp,
        updatedAt: new Date().toISOString()
      };

      setSuccess(true);
      setLoading(false);
      
      // Call the onSubmit callback with the diagnosis data
      if (onSubmit) {
        onSubmit(diagnosisData);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaNotesMedical className="mr-2 text-blue-500" />
        Consultation Notes
      </h2>

      {loading && <Loader />}
      {error && <Message variant="danger">{error}</Message>}
      {success && (
        <Message variant="success">Notes saved successfully!</Message>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="notes" className="block text-gray-700 mb-2 flex items-center">
            <FaNotesMedical className="mr-2 text-blue-500" />
            Consultation Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter detailed consultation notes..."
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="diagnosis" className="block text-gray-700 mb-2 flex items-center">
            <FaFileMedical className="mr-2 text-blue-500" />
            Diagnosis
          </label>
          <textarea
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter diagnosis..."
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="treatment" className="block text-gray-700 mb-2 flex items-center">
            <FaClipboardList className="mr-2 text-blue-500" />
            Treatment Plan
          </label>
          <textarea
            id="treatment"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter treatment plan..."
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="followUp" className="block text-gray-700 mb-2 flex items-center">
            <FaCalendarCheck className="mr-2 text-blue-500" />
            Follow-up Instructions
          </label>
          <textarea
            id="followUp"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Enter follow-up instructions..."
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
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          >
            Complete Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiagnosisForm;
