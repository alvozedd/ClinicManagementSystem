import { useState, useEffect } from 'react';
import { FaFileMedical, FaCalendarAlt, FaUser, FaClock, FaClipboardList } from 'react-icons/fa';
import apiService from '../utils/apiService';

function PatientDiagnosesTab({ patient, appointments }) {
  const [allDiagnoses, setAllDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchDiagnoses = async () => {
      if (!patient || !patient._id) return;
      
      setLoading(true);
      try {
        // Create a flattened array of all diagnoses across all appointments
        const diagnosesArray = [];
        
        // Get all appointments for this patient
        const patientAppointments = appointments || [];
        
        // For each appointment, fetch diagnoses
        for (const appointment of patientAppointments) {
          if (appointment.status === 'Completed') {
            try {
              const appointmentId = appointment._id || appointment.id;
              const diagnoses = await apiService.getDiagnosisByAppointmentId(appointmentId);
              
              if (diagnoses && diagnoses.length > 0) {
                diagnoses.forEach(diagnosis => {
                  // Parse the diagnosis_text if it's a JSON string
                  let parsedDiagnosis = diagnosis.diagnosis_text;
                  try {
                    parsedDiagnosis = JSON.parse(diagnosis.diagnosis_text);
                  } catch (e) {
                    // If it's not valid JSON, keep the original text
                  }
                  
                  diagnosesArray.push({
                    id: diagnosis._id,
                    appointmentId: appointmentId,
                    appointmentDate: new Date(appointment.appointment_date || appointment.date),
                    appointmentType: appointment.type,
                    appointmentReason: appointment.reason,
                    diagnosisText: parsedDiagnosis.notes || parsedDiagnosis,
                    treatment: parsedDiagnosis.treatment,
                    followUp: parsedDiagnosis.followUp,
                    createdAt: new Date(diagnosis.createdAt),
                    createdBy: appointment.created_by_user_id || 'doctor'
                  });
                });
              }
            } catch (err) {
              console.error(`Error fetching diagnoses for appointment ${appointment._id}:`, err);
            }
          }
        }
        
        setAllDiagnoses(diagnosesArray);
      } catch (err) {
        console.error('Error fetching diagnoses:', err);
        setError('Failed to load diagnoses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnoses();
  }, [patient, appointments]);

  // Sort diagnoses based on current sort order
  const sortedDiagnoses = [...allDiagnoses].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.appointmentDate - a.appointmentDate;
    } else {
      return a.appointmentDate - b.appointmentDate;
    }
  });

  // Filter diagnoses based on current filter
  const filteredDiagnoses = sortedDiagnoses.filter(diagnosis => {
    if (filterType === 'all') return true;
    return diagnosis.appointmentType.toLowerCase() === filterType.toLowerCase();
  });

  // Get unique appointment types for filter dropdown
  const appointmentTypes = [...new Set(allDiagnoses.map(d => d.appointmentType))];

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (filteredDiagnoses.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-8 rounded-lg text-center">
        <FaFileMedical className="mx-auto text-4xl mb-4 text-blue-400" />
        <h3 className="text-lg font-semibold mb-2">No Diagnoses Found</h3>
        <p className="text-blue-600">
          This patient doesn't have any recorded diagnoses yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FaFileMedical className="mr-2 text-blue-600" />
          Patient Diagnoses
          <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredDiagnoses.length}
          </span>
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          >
            <option value="all">All Types</option>
            {appointmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredDiagnoses.map((diagnosis, index) => (
          <div 
            key={diagnosis.id || index} 
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <div className="flex flex-col sm:flex-row justify-between mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-2 mb-2 sm:mb-0">
                <FaCalendarAlt className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">{formatDate(diagnosis.appointmentDate)}</h4>
                  <p className="text-sm text-gray-600">{diagnosis.appointmentType}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FaClipboardList className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Reason</h4>
                  <p className="text-sm text-gray-600">{diagnosis.appointmentReason || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Diagnosis</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-line">{diagnosis.diagnosisText}</p>
              </div>
            </div>
            
            {diagnosis.treatment && (
              <div className="mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Treatment Plan</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-800">{diagnosis.treatment}</p>
                </div>
              </div>
            )}
            
            {diagnosis.followUp && (
              <div className="mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Follow-up Instructions</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-800">{diagnosis.followUp}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500 flex items-center">
              <FaClock className="mr-1" />
              <span>Recorded on {formatDate(diagnosis.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientDiagnosesTab;
