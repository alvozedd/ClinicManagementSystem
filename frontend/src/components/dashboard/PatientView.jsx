import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaEdit, FaTrash, FaUserPlus, FaCalendarPlus, FaFileMedical, FaPhone } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import apiService from '../../utils/apiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import PatientForm from './PatientForm';
import AppointmentForm from './AppointmentForm';
import NotesView from './NotesView';
import { calculateAge } from '../../utils/helpers';
import './DashboardStyles.css';

const PatientView = ({ patient, onBackToPatients }) => {
  const [activeTab, setActiveTab] = useState('biodata');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  // Get user info from context as primary source
  const { userInfo: contextUserInfo } = useContext(AuthContext);

  // Also try to get from Redux as fallback
  const reduxUserInfo = useSelector((state) => state.auth?.userInfo);

  // Use context userInfo if available, otherwise use Redux userInfo
  const userInfo = contextUserInfo || reduxUserInfo || { role: 'visitor' };

  // Reset activeTab to 'biodata' if secretary tries to access 'notes' tab
  useEffect(() => {
    if (userInfo?.role !== 'doctor' && activeTab === 'notes') {
      setActiveTab('biodata');
    }
  }, [userInfo?.role, activeTab]);

  // Fetch patient appointments when component mounts or patient changes
  useEffect(() => {
    const fetchAppointments = async () => {
      if (patient && patient._id) {
        try {
          setLoadingAppointments(true);
          setError(null); // Clear any previous errors
          let fetchedAppointments = [];

          try {
            fetchedAppointments = await apiService.getAppointmentsByPatientId(patient._id);
          } catch (err) {
            console.error('Error fetching appointments:', err);
            fetchedAppointments = []; // Use empty array on error
          }

          // Ensure we always have an array, even if the API returns null or undefined
          setAppointments(Array.isArray(fetchedAppointments) ? fetchedAppointments : []);
          setLoadingAppointments(false);
        } catch (err) {
          console.error('Error in fetchAppointments:', err);
          setError('Failed to fetch appointments. Please try again later.');
          setAppointments([]); // Set empty array on error
          setLoadingAppointments(false);
        }
      }
    };

    fetchAppointments();
  }, [patient]);

  // Handle patient update
  const handleUpdatePatient = async (updatedPatient) => {
    try {
      setLoading(true);
      await apiService.updatePatient(patient._id, updatedPatient);
      // Refresh patient data
      const refreshedPatient = await apiService.getPatientById(patient._id);
      setLoading(false);
      setShowEditModal(false);
      // Update the patient in the parent component
      onBackToPatients(refreshedPatient);
    } catch (err) {
      setError(err.message || 'Failed to update patient');
      setLoading(false);
    }
  };

  // Handle patient deletion
  const handleDeletePatient = async () => {
    if (window.confirm(`Are you sure you want to delete ${patient.name}?`)) {
      try {
        setLoading(true);
        await apiService.deletePatient(patient._id);
        setLoading(false);
        onBackToPatients();
      } catch (err) {
        setError(err.message || 'Failed to delete patient');
        setLoading(false);
      }
    }
  };

  // Handle adding a new appointment
  const handleAddAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      await apiService.createAppointment(appointmentData);
      // Refresh appointments
      const fetchedAppointments = await apiService.getAppointmentsByPatientId(patient._id);
      setAppointments(fetchedAppointments);
      setLoading(false);
      setShowAddAppointmentModal(false);
    } catch (err) {
      setError(err.message || 'Failed to add appointment');
      setLoading(false);
    }
  };

  return (
    <div className="patient-view">
      <div className="flex items-center mb-6">
        <button
          onClick={() => onBackToPatients()}
          className="mr-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{patient.name}</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:text-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-4 rounded-lg md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-white">Patient Information</h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <FaEdit />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Name</p>
              <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Gender</p>
              <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Age</p>
              <p className="font-semibold text-gray-900 dark:text-white text-base">{calculateAge(patient.year_of_birth)} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Phone</p>
              <div className="flex items-center">
                <p className="font-semibold text-gray-900 dark:text-white text-base mr-2">{patient.phone}</p>
                {patient.phone && (
                  <a
                    href={`tel:${patient.phone}`}
                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full flex items-center justify-center"
                    title="Call patient"
                  >
                    <FaPhone size={12} />
                  </a>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Email</p>
              <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Added By</p>
              <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.createdBy || 'Staff'}</p>
            </div>
            {patient.next_of_kin && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Next of Kin</p>
                <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.next_of_kin}</p>
              </div>
            )}
            {patient.next_of_kin_phone && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Next of Kin Phone</p>
                <div className="flex items-center">
                  <p className="font-semibold text-gray-900 dark:text-white text-base mr-2">{patient.next_of_kin_phone}</p>
                  <a
                    href={`tel:${patient.next_of_kin_phone}`}
                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full flex items-center justify-center"
                    title="Call next of kin"
                  >
                    <FaPhone size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-3">Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full btn btn-outline-primary flex items-center justify-center dark:text-blue-300 dark:border-blue-500 dark:hover:bg-blue-900/30"
            >
              <FaEdit className="mr-2" />
              Edit Patient
            </button>
            <button
              onClick={() => setShowAddAppointmentModal(true)}
              className="w-full btn btn-outline-success flex items-center justify-center dark:text-green-300 dark:border-green-500 dark:hover:bg-green-900/30"
            >
              <FaCalendarPlus className="mr-2" />
              Add Appointment
            </button>
            {userInfo?.role === 'doctor' && (
              <button
                onClick={handleDeletePatient}
                className="w-full btn btn-outline btn-danger flex items-center justify-center dark:text-red-300 dark:border-red-500 dark:hover:bg-red-900/30"
              >
                <FaTrash className="mr-2" />
                Delete Patient
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b dark:border-gray-700">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`inline-block p-4 border-b-2 rounded-t-lg ${
              activeTab === 'biodata'
                ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('biodata')}
          >
            Biodata
          </button>
          <button
            className={`inline-block p-4 border-b-2 rounded-t-lg ${
              activeTab === 'appointments'
                ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          {userInfo?.role === 'doctor' && (
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'notes'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('notes')}
            >
              Notes
            </button>
          )}
          {userInfo?.role === 'doctor' && (
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'medical'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('medical')}
            >
              Medical History
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content relative">
        {activeTab === 'biodata' && (
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 dark:text-white mb-4">Patient Biodata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Name</p>
                <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Gender</p>
                <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Year of Birth</p>
                <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.year_of_birth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Age</p>
                <p className="font-semibold text-gray-900 dark:text-white text-base">{calculateAge(patient.year_of_birth)} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Phone</p>
                <div className="flex items-center">
                  <p className="font-semibold text-gray-900 dark:text-white text-base mr-2">{patient.phone}</p>
                  {patient.phone && (
                    <a
                      href={`tel:${patient.phone}`}
                      className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full flex items-center justify-center"
                      title="Call patient"
                    >
                      <FaPhone size={12} />
                    </a>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Email</p>
                <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Address</p>
                <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.address || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Added By</p>
                <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.createdBy || 'Staff'}</p>
              </div>
              {patient.next_of_kin && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Next of Kin</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.next_of_kin}</p>
                </div>
              )}
              {patient.next_of_kin_phone && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Next of Kin Phone</p>
                  <div className="flex items-center">
                    <p className="font-semibold text-gray-900 dark:text-white text-base mr-2">{patient.next_of_kin_phone}</p>
                    <a
                      href={`tel:${patient.next_of_kin_phone}`}
                      className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full flex items-center justify-center"
                      title="Call next of kin"
                    >
                      <FaPhone size={12} />
                    </a>
                  </div>
                </div>
              )}
              {patient.next_of_kin_relationship && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Relationship</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">{patient.next_of_kin_relationship}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="glass-card p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-white">Appointments</h3>
              <button
                onClick={() => setShowAddAppointmentModal(true)}
                className="btn btn-primary flex items-center dark:bg-blue-700 dark:hover:bg-blue-600"
                title="Add Appointment"
              >
                <FaCalendarPlus className="sm:mr-2" />
                <span className="hidden sm:inline">Add Appointment</span>
              </button>
            </div>

            {loadingAppointments ? (
              <Spinner />
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No appointments found for this patient.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div
                    key={appointment._id}
                    className={`glass-card p-4 rounded-lg ${
                      appointment.status === 'completed' ? 'border-l-4 border-green-500' :
                      appointment.status === 'scheduled' ? 'border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">{new Date(appointment.appointment_date).toLocaleDateString()}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.reason || 'No reason specified'}</p>
                      </div>
                      <span className={`badge ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <p>Added by: {appointment.createdBy || 'Staff'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && userInfo?.role === 'doctor' && (
          <div className="glass-card p-4 rounded-lg relative z-10">
            <NotesView patientId={patient._id} />
          </div>
        )}

        {activeTab === 'medical' && userInfo?.role === 'doctor' && (
          <div className="glass-card p-4 rounded-lg relative z-10">
            <h3 className="font-semibold text-gray-700 dark:text-white mb-4">Medical History</h3>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 dark:text-white mb-2">Medical Conditions</h4>
              {patient.medical_history && patient.medical_history.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-white">
                  {patient.medical_history.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No medical history recorded</p>
              )}
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 dark:text-white mb-2">Allergies</h4>
              {patient.allergies && patient.allergies.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-white">
                  {patient.allergies.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No allergies recorded</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-white mb-2">Current Medications</h4>
              {patient.current_medications && patient.current_medications.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-white">
                  {patient.current_medications.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No current medications recorded</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Patient Modal */}
      {showEditModal && (
        <Modal
          title="Edit Patient"
          onClose={() => setShowEditModal(false)}
          size="lg"
        >
          <PatientForm
            patient={patient}
            onSubmit={handleUpdatePatient}
            onCancel={() => setShowEditModal(false)}
            isEditing={true}
          />
        </Modal>
      )}

      {/* Add Appointment Modal */}
      {showAddAppointmentModal && (
        <Modal
          title="Add Appointment"
          onClose={() => setShowAddAppointmentModal(false)}
          size="lg"
        >
          <AppointmentForm
            patientId={patient._id}
            onSubmit={handleAddAppointment}
            onCancel={() => setShowAddAppointmentModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default PatientView;
