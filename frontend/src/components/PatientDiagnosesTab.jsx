import { useState, useEffect, useRef } from 'react';
import { FaFileMedical, FaCalendarAlt, FaUser, FaClock, FaClipboardList, FaEdit, FaTrashAlt, FaSync } from 'react-icons/fa';
import apiService from '../utils/apiService';

function PatientDiagnosesTab({ patient, appointments, onEditDiagnosis, onDeleteDiagnosis }) {
  const [allDiagnoses, setAllDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterType, setFilterType] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh
  const currentPatientId = useRef(null);

  // Effect to clear diagnoses when patient changes
  useEffect(() => {
    if (!patient) return;

    const patientId = patient._id || patient.id;

    // If patient has changed, clear diagnoses and set loading state
    if (currentPatientId.current !== patientId) {
      console.log('Patient changed, clearing diagnoses');
      setAllDiagnoses([]);
      setLoading(true);
      currentPatientId.current = patientId;
    }
  }, [patient]);

  // Effect to fetch diagnoses
  useEffect(() => {
    // Skip if we're already loading or there's no patient
    if (!patient) {
      setLoading(false);
      return;
    }

    const fetchDiagnoses = async () => {
      const patientId = patient._id || patient.id;
      if (!patientId) {
        console.log('No patient ID available');
        setLoading(false);
        return;
      }

      // Double-check we're fetching for the current patient
      if (currentPatientId.current !== patientId) {
        console.log('Patient ID mismatch, not fetching diagnoses');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching diagnoses for patient: ${patientId} (refresh key: ${refreshKey})`);

        // Try to get diagnoses directly by patient ID first (new method)
        try {
          const diagnoses = await apiService.getDiagnosesByPatientId(patientId);

          // Verify we're still looking at the same patient
          if (currentPatientId.current !== patientId) {
            console.log('Patient changed during fetch, aborting');
            return;
          }

          if (diagnoses && diagnoses.length > 0) {
            console.log('Found diagnoses using patient ID method:', diagnoses.length);

            // Process the diagnoses
            const diagnosesArray = diagnoses.map(diagnosis => {
              const appointment = diagnosis.appointment_id;

              // Parse the diagnosis_text if it's a JSON string
              let parsedDiagnosis = diagnosis.diagnosis_text || '';
              try {
                if (typeof diagnosis.diagnosis_text === 'string' && diagnosis.diagnosis_text.trim() !== '') {
                  parsedDiagnosis = JSON.parse(diagnosis.diagnosis_text);
                }
              } catch (e) {
                // If it's not valid JSON, keep the original text
                console.warn('Failed to parse diagnosis text, using as-is');
              }

              // Ensure parsedDiagnosis is an object
              if (typeof parsedDiagnosis !== 'object' || parsedDiagnosis === null) {
                parsedDiagnosis = { notes: parsedDiagnosis };
              }

              return {
                id: diagnosis._id,
                patientId: patientId, // Store patient ID for verification
                appointmentId: appointment?._id,
                appointmentDate: new Date(appointment?.appointment_date),
                appointmentType: appointment?.type || 'Consultation',
                appointmentReason: appointment?.reason || 'Not specified',
                diagnosisText: parsedDiagnosis.notes || parsedDiagnosis,
                diagnosis: parsedDiagnosis.diagnosis || '',
                treatment: parsedDiagnosis.treatment || '',
                followUp: parsedDiagnosis.followUp || '',
                files: parsedDiagnosis.files || [],
                createdAt: new Date(diagnosis.createdAt),
                createdBy: diagnosis.created_by_user_id || 'doctor'
              };
            });

            // Final verification that these diagnoses belong to the current patient
            const verifiedDiagnoses = diagnosesArray.filter(d =>
              d.patientId === patientId ||
              !d.patientId // Include if patientId is missing (shouldn't happen but just in case)
            );

            if (verifiedDiagnoses.length !== diagnosesArray.length) {
              console.warn(`Filtered out ${diagnosesArray.length - verifiedDiagnoses.length} diagnoses that didn't match patient ID`);
            }

            setAllDiagnoses(verifiedDiagnoses);
            setLoading(false);
            return; // Exit early if we got diagnoses by patient ID
          } else {
            console.log('No diagnoses found for patient:', patientId);
            setAllDiagnoses([]);
          }
        } catch (err) {
          console.error('Error fetching diagnoses by patient ID, falling back to appointment method:', err);
        }

        // Verify we're still looking at the same patient
        if (currentPatientId.current !== patientId) {
          console.log('Patient changed during fetch, aborting fallback method');
          return;
        }

        // Fallback: Create a flattened array of all diagnoses across all appointments
        const diagnosesArray = [];

        // Get all appointments for this patient
        const patientAppointments = appointments || [];

        // For each appointment, fetch diagnoses
        for (const appointment of patientAppointments) {
          // Verify we're still looking at the same patient before each appointment fetch
          if (currentPatientId.current !== patientId) {
            console.log('Patient changed during appointment loop, aborting');
            return;
          }

          if (appointment.status === 'Completed') {
            try {
              const appointmentId = appointment._id || appointment.id;
              const diagnoses = await apiService.getDiagnosisByAppointmentId(appointmentId);

              if (diagnoses && diagnoses.length > 0) {
                diagnoses.forEach(diagnosis => {
                  // Parse the diagnosis_text if it's a JSON string
                  let parsedDiagnosis = diagnosis.diagnosis_text || '';
                  try {
                    if (typeof diagnosis.diagnosis_text === 'string' && diagnosis.diagnosis_text.trim() !== '') {
                      parsedDiagnosis = JSON.parse(diagnosis.diagnosis_text);
                    }
                    console.log('Successfully parsed diagnosis');
                  } catch (e) {
                    console.warn('Error parsing diagnosis_text, using as-is');
                    // If it's not valid JSON, keep the original text
                  }

                  // Ensure parsedDiagnosis is an object
                  if (typeof parsedDiagnosis !== 'object' || parsedDiagnosis === null) {
                    parsedDiagnosis = { notes: parsedDiagnosis };
                  }

                  diagnosesArray.push({
                    id: diagnosis._id,
                    patientId: patientId, // Store patient ID for verification
                    appointmentId: appointmentId,
                    appointmentDate: new Date(appointment.appointment_date || appointment.date),
                    appointmentType: appointment.type,
                    appointmentReason: appointment.reason,
                    diagnosisText: parsedDiagnosis.notes || parsedDiagnosis,
                    diagnosis: parsedDiagnosis.diagnosis || '',
                    treatment: parsedDiagnosis.treatment || '',
                    followUp: parsedDiagnosis.followUp || '',
                    files: parsedDiagnosis.files || [],
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

        // Final verification that we're still on the same patient
        if (currentPatientId.current !== patientId) {
          console.log('Patient changed after fetching all appointments, aborting');
          return;
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

    // Set a timeout to stop loading after 10 seconds to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, stopping loading spinner');
        setLoading(false);
        if (allDiagnoses.length === 0) {
          setError('Could not load notes. Please try refreshing.');
        }
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [patient, appointments, refreshKey]); // Removed 'loading' from dependency array to prevent infinite loop

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
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 text-center">Loading patient notes...</p>
        <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">{error}</p>
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              setRefreshKey(prev => prev + 1);
            }}
            className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            <FaSync className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (filteredDiagnoses.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-8 rounded-lg text-center">
        <FaFileMedical className="mx-auto text-4xl mb-4 text-blue-400" />
        <h3 className="text-lg font-semibold mb-2">No Notes Found</h3>
        <p className="text-blue-600 mb-4">
          This patient doesn't have any recorded notes yet.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setRefreshKey(prev => prev + 1);
          }}
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Notes"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <FaFileMedical className="mr-2 text-blue-600" />
            Patient Notes
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {filteredDiagnoses.length}
            </span>
          </h3>
          <button
            onClick={() => {
              setAllDiagnoses([]);
              setLoading(true);
              setRefreshKey(prev => prev + 1);
            }}
            className="ml-3 text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
            title="Refresh notes"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
          </button>
        </div>

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

              <div className="flex items-center gap-4">
                <div className="flex items-start gap-2">
                  <FaClipboardList className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Reason</h4>
                    <p className="text-sm text-gray-600">{diagnosis.appointmentReason || 'Not specified'}</p>
                  </div>
                </div>

                {/* Edit and Delete buttons */}
                {onEditDiagnosis && onDeleteDiagnosis && (
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => onEditDiagnosis(diagnosis)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                      title="Edit Notes"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete these notes? This action cannot be undone.')) {
                          onDeleteDiagnosis(diagnosis.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                      title="Delete Notes"
                    >
                      <FaTrashAlt className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Notes</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-line">{diagnosis.diagnosisText}</p>
              </div>
            </div>

            {diagnosis.diagnosis && (
              <div className="mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Diagnosis</h4>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-800">{diagnosis.diagnosis}</p>
                </div>
              </div>
            )}

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

            {diagnosis.files && diagnosis.files.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Attached Files</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {diagnosis.files.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                        <div className="flex items-center">
                          {file.type && file.type.includes('pdf') ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          ) : file.type && file.type.includes('image') ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            View
                          </a>
                          <a
                            href={file.url}
                            download={file.name}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
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
