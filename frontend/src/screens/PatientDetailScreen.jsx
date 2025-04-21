import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const PatientDetailScreen = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mock data for demonstration
  useEffect(() => {
    // Mock patient data
    const mockPatient = {
      _id: id,
      name: 'John Doe',
      gender: 'Male',
      phone: '123-456-7890',
      next_of_kin_name: 'Jane Doe',
      next_of_kin_relationship: 'Spouse',
      next_of_kin_phone: '123-456-7891',
    };
    
    // Mock appointments data
    const mockAppointments = [
      {
        _id: '101',
        appointment_date: '2023-05-15T10:00:00.000Z',
        optional_time: '10:00 AM',
        notes: 'Regular checkup',
      },
      {
        _id: '102',
        appointment_date: '2023-06-20T14:30:00.000Z',
        optional_time: '2:30 PM',
        notes: 'Follow-up appointment',
      },
    ];
    
    setPatient(mockPatient);
    setAppointments(mockAppointments);
    setLoading(false);
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patient Details</h1>
        <Link 
          to="/patients" 
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Patients
        </Link>
      </div>
      
      {loading ? (
        <p>Loading patient details...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Gender:</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">Next of Kin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{patient.next_of_kin_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Relationship:</p>
                <p className="font-medium">{patient.next_of_kin_relationship}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{patient.next_of_kin_phone}</p>
              </div>
            </div>
            
            <div className="mt-6 flex">
              <Link
                to={`/patients/${patient._id}/edit`}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4"
              >
                Edit Patient
              </Link>
              <Link
                to={`/appointments/new?patient=${patient._id}`}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Book Appointment
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Appointments</h2>
              <Link
                to={`/appointments/new?patient=${patient._id}`}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Add New
              </Link>
            </div>
            
            {appointments.length === 0 ? (
              <p>No appointments found for this patient.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(appointment.appointment_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {appointment.optional_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {appointment.notes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/appointments/${appointment._id}/edit`}
                            className="text-blue-500 hover:text-blue-700 mr-4"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/appointments/${appointment._id}/diagnosis`}
                            className="text-green-500 hover:text-green-700"
                          >
                            Diagnosis
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDetailScreen;
