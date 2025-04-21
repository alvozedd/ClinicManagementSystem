import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';

const AppointmentFormScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const patientId = searchParams.get('patient');
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(patientId || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState('');
  
  const isEditMode = Boolean(id);
  
  // Mock data for demonstration
  useEffect(() => {
    // Mock patients data
    const mockPatients = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Alice Smith' },
      { _id: '3', name: 'Michael Johnson' },
    ];
    
    setPatients(mockPatients);
    setLoadingPatients(false);
    
    // If in edit mode, fetch appointment data
    if (isEditMode) {
      // Mock appointment data for editing
      const mockAppointment = {
        _id: id,
        patient_id: '2',
        appointment_date: '2023-06-20',
        optional_time: '14:30',
        notes: 'Follow-up appointment',
      };
      
      setSelectedPatient(mockAppointment.patient_id);
      setDate(mockAppointment.appointment_date);
      setTime(mockAppointment.optional_time);
      setNotes(mockAppointment.notes);
    }
  }, [id, isEditMode, patientId]);

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (!selectedPatient || !date) {
      setError('Patient and date are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // In a real implementation, this would send the data to the backend
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      setLoading(false);
      navigate('/appointments');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit Appointment' : 'Create Appointment'}
        </h1>
        <Link 
          to="/appointments" 
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Appointments
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded shadow">
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="patient">
              Patient
            </label>
            {loadingPatients ? (
              <p>Loading patients...</p>
            ) : (
              <select
                id="patient"
                className="w-full px-3 py-2 border rounded"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                disabled={isEditMode || Boolean(patientId)}
                required
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="date">
              Appointment Date
            </label>
            <input
              type="date"
              id="date"
              className="w-full px-3 py-2 border rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="time">
              Appointment Time (Optional)
            </label>
            <input
              type="time"
              id="time"
              className="w-full px-3 py-2 border rounded"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              className="w-full px-3 py-2 border rounded"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentFormScreen;
