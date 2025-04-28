import { useState, useEffect } from 'react';
import { FaFileMedical, FaCalendarAlt, FaUser, FaClock, FaClipboardList, FaSearch, FaEdit, FaTrashAlt } from 'react-icons/fa';
import apiService from '../utils/apiService';

function GlobalDiagnosesView({ onViewPatient, onEditDiagnosis, onDeleteDiagnosis }) {
  const [allDiagnoses, setAllDiagnoses] = useState([]);
  const [filteredDiagnoses, setFilteredDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all diagnoses
        const diagnoses = await apiService.getDiagnoses();

        // Fetch all patients for the filter
        const patientsData = await apiService.getPatients();
        setPatients(patientsData);

        // Process diagnoses
        const processedDiagnoses = await Promise.all(diagnoses.map(async (diagnosis) => {
          // Get appointment details
          const appointment = diagnosis.appointment_id;
          const patient = appointment?.patient_id;

          // Parse the diagnosis_text if it's a JSON string
          let parsedDiagnosis = diagnosis.diagnosis_text;
          try {
            parsedDiagnosis = JSON.parse(diagnosis.diagnosis_text);
          } catch (e) {
            // If it's not valid JSON, keep the original text
          }

          return {
            id: diagnosis._id,
            appointmentId: appointment?._id,
            appointmentDate: new Date(appointment?.appointment_date),
            appointmentType: appointment?.type || 'Consultation',
            appointmentReason: appointment?.reason || 'Not specified',
            patientId: patient?._id,
            patientName: patient?.name || 'Unknown Patient',
            diagnosisText: parsedDiagnosis.notes || parsedDiagnosis,
            treatment: parsedDiagnosis.treatment,
            followUp: parsedDiagnosis.followUp,
            files: parsedDiagnosis.files || [],
            createdAt: new Date(diagnosis.createdAt)
          };
        }));

        setAllDiagnoses(processedDiagnoses);
      } catch (err) {
        console.error('Error fetching diagnoses:', err);
        setError('Failed to load diagnoses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    let result = [...allDiagnoses];

    // Filter by patient if selected
    if (selectedPatient !== 'all') {
      result = result.filter(d => d.patientId === selectedPatient);
    }

    // Filter by appointment type
    if (filterType !== 'all') {
      result = result.filter(d => d.appointmentType.toLowerCase() === filterType.toLowerCase());
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.patientName.toLowerCase().includes(term) ||
        d.diagnosisText.toLowerCase().includes(term) ||
        (d.treatment && d.treatment.toLowerCase().includes(term)) ||
        (d.appointmentReason && d.appointmentReason.toLowerCase().includes(term))
      );
    }

    // Sort results
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.appointmentDate - a.appointmentDate;
      } else {
        return a.appointmentDate - b.appointmentDate;
      }
    });

    setFilteredDiagnoses(result);
  }, [allDiagnoses, selectedPatient, filterType, searchTerm, sortOrder]);

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaFileMedical className="mr-2 text-blue-600" />
          All Notes
          <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredDiagnoses.length}
          </span>
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search notes..."
            />
          </div>

          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          >
            <option value="all">All Patients</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>{patient.name}</option>
            ))}
          </select>

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

      {filteredDiagnoses.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-8 rounded-lg text-center">
          <FaFileMedical className="mx-auto text-4xl mb-4 text-blue-400" />
          <h3 className="text-lg font-semibold mb-2">No Notes Found</h3>
          <p className="text-blue-600">
            No notes match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
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
                    <FaUser className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        <button
                          onClick={() => onViewPatient && onViewPatient(diagnosis.patientId)}
                          className="text-blue-600 hover:underline"
                        >
                          {diagnosis.patientName}
                        </button>
                      </h4>
                      <p className="text-sm text-gray-600">{diagnosis.appointmentReason}</p>
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
                          if (window.confirm('Are you sure you want to delete this diagnosis? This action cannot be undone.')) {
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
      )}
    </div>
  );
}

export default GlobalDiagnosesView;
