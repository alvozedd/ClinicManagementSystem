import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AppointmentListScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mock data for demonstration
  useEffect(() => {
    const mockAppointments = [
      {
        _id: '101',
        patient: { _id: '1', name: 'John Doe' },
        appointment_date: '2023-05-15T10:00:00.000Z',
        optional_time: '10:00 AM',
        notes: 'Regular checkup',
      },
      {
        _id: '102',
        patient: { _id: '2', name: 'Alice Smith' },
        appointment_date: '2023-06-20T14:30:00.000Z',
        optional_time: '2:30 PM',
        notes: 'Follow-up appointment',
      },
      {
        _id: '103',
        patient: { _id: '3', name: 'Michael Johnson' },
        appointment_date: '2023-07-05T09:15:00.000Z',
        optional_time: '9:15 AM',
        notes: 'Annual physical',
      },
    ];
    
    setAppointments(mockAppointments);
    setLoading(false);
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Link 
          to="/dashboard" 
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Dashboard
        </Link>
      </div>
      
      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <input
                type="date"
                className="px-3 py-2 border rounded"
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Filter by Date
              </button>
            </div>
            <Link
              to="/appointments/new"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Add New Appointment
            </Link>
          </div>
          
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
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
                      <Link 
                        to={`/patients/${appointment.patient._id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {appointment.patient.name}
                      </Link>
                    </td>
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
        </>
      )}
    </div>
  );
};

export default AppointmentListScreen;
