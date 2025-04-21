import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const DiagnosisFormScreen = () => {
  const { id } = useParams(); // appointment id
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [existingDiagnosis, setExistingDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Mock data for demonstration
  useEffect(() => {
    // Mock appointment data
    const mockAppointment = {
      _id: id,
      appointment_date: '2023-06-20T14:30:00.000Z',
      optional_time: '2:30 PM',
      notes: 'Follow-up appointment',
    };
    
    // Mock patient data
    const mockPatient = {
      _id: '2',
      name: 'Alice Smith',
      gender: 'Female',
      phone: '123-456-7892',
    };
    
    // Mock existing diagnosis (if any)
    const mockDiagnosis = {
      _id: '201',
      appointment_id: id,
      diagnosis_text: 'Patient shows signs of improvement. Continue with prescribed medication for another week.',
    };
    
    setAppointment(mockAppointment);
    setPatient(mockPatient);
    
    // Check if there's an existing diagnosis
    if (mockDiagnosis && mockDiagnosis.appointment_id === id) {
      setExistingDiagnosis(mockDiagnosis);
      setDiagnosisText(mockDiagnosis.diagnosis_text);
    }
    
    setLoading(false);
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (!diagnosisText.trim()) {
      setError('Diagnosis text is required');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    // In a real implementation, this would send the data to the backend
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      setSubmitting(false);
      navigate(`/patients/${patient._id}`);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {existingDiagnosis ? 'Edit Diagnosis' : 'Add Diagnosis'}
        </h1>
        <Link 
          to={`/patients/${patient?._id}`} 
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Patient
        </Link>
      </div>
      
      {loading ? (
        <p>Loading appointment details...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Patient:</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{formatDate(appointment.appointment_date)}</p>
              </div>
              <div>
                <p className="text-gray-600">Time:</p>
                <p className="font-medium">{appointment.optional_time}</p>
              </div>
              <div>
                <p className="text-gray-600">Notes:</p>
                <p className="font-medium">{appointment.notes || 'None'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <form onSubmit={submitHandler}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="diagnosis">
                  Diagnosis
                </label>
                <textarea
                  id="diagnosis"
                  className="w-full px-3 py-2 border rounded"
                  rows="6"
                  value={diagnosisText}
                  onChange={(e) => setDiagnosisText(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Diagnosis'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default DiagnosisFormScreen;
