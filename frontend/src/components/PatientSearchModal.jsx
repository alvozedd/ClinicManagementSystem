import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Loader from './Loader';
import Message from './Message';

const PatientSearchModal = ({ isOpen, onClose, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        patient =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.otherNames?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/patients');
      setPatients(data);
      setFilteredPatients(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch patients. Please try again.');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Patient</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-4 relative">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="pl-3 text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search by name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No patients found</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onSelectPatient(patient);
                    onClose();
                  }}
                >
                  <h3 className="font-medium">{patient.name} {patient.otherNames}</h3>
                  <p className="text-sm text-gray-600">
                    <span className="inline-block mr-3">
                      {patient.gender}
                    </span>
                    <span className="inline-block">
                      {patient.phone}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSearchModal;
