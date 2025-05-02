import { useState, useEffect, useContext } from 'react';
import { FaUserPlus, FaCalendarPlus, FaSearch, FaEdit, FaTrash, FaPhone, FaEnvelope } from 'react-icons/fa';
import DashboardLayout from './DashboardLayout';
import AuthContext from '../../context/AuthContext';
import apiService from '../../utils/apiService';
import PatientManagement from './PatientManagement';
import AppointmentManagement from './AppointmentManagement';
import './DashboardStyles.css';

const SecretaryDashboard = () => {
  const { userInfo } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'patients') {
      fetchPatients();
    } else if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
  };

  // Dashboard Overview
  const renderDashboardOverview = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card-blue p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Today's Appointments</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {appointments.filter(apt => 
                  new Date(apt.appointment_date).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarPlus className="text-blue-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="glass-card-green p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Total Patients</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{patients.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserPlus className="text-green-500 text-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} role="secretary">
      {activeTab === 'patients' && (
        <PatientManagement 
          role="secretary"
          selectedPatient={selectedPatient}
          onSelectPatient={handlePatientSelect}
          onBackToPatients={handleBackToPatients}
        />
      )}
      
      {activeTab === 'appointments' && (
        <AppointmentManagement role="secretary" />
      )}
    </DashboardLayout>
  );
};

export default SecretaryDashboard;
