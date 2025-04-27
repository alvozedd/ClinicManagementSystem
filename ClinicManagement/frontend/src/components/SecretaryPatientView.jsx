import { useState, useEffect } from 'react';
import AppointmentManagementModal from './AppointmentManagementModal';
import PatientNavigator from './PatientNavigator';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';
import { clearAllCaches } from '../data/mockData';

function SecretaryPatientView({ patient, patients, appointments, onClose, onUpdatePatient, onSelectPatient, onDeletePatient }) {
  const [activeTab, setActiveTab] = useState('appointments');
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState({...patient});
  const [managingAppointment, setManagingAppointment] = useState(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);

  // Update local state when patient prop changes
  useEffect(() => {
    setEditedPatient({...patient});
  }, [patient]);

  // Check if the patient was created within the last hour (secretary can only edit for 1 hour)
  const canEdit = () => {
    if (!patient.createdAt) return false;

    const creationTime = new Date(patient.createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

    return (currentTime - creationTime) <= oneHourInMs;
  };

  // Calculate time remaining for editing
  const getTimeRemaining = () => {
    if (!patient.createdAt) return { expired: true, minutes: 0 };

    const creationTime = new Date(patient.createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

    const timeElapsedMs = currentTime - creationTime;
    const timeRemainingMs = oneHourInMs - timeElapsedMs;

    if (timeRemainingMs <= 0) {
      return { expired: true, minutes: 0 };
    }

    // Convert to minutes
    const minutesRemaining = Math.floor(timeRemainingMs / (60 * 1000));
    return { expired: false, minutes: minutesRemaining };
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Separate past and upcoming appointments
  const pastAppointments = [...appointments]
    .filter(a => a.date < today || (a.date === today && a.status === 'Completed'))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

  const upcomingAppointments = [...appointments]
    .filter(a => a.date > today || (a.date === today && a.status !== 'Completed'))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Earliest first

  // Combined sorted appointments (for backward compatibility)
  const sortedAppointments = [...upcomingAppointments, ...pastAppointments];

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="bg-white rounded-lg">
      <h1>Secretary Patient View</h1>
      <p>This is a simplified version of the component</p>
    </div>
  )
}

export default SecretaryPatientView;
