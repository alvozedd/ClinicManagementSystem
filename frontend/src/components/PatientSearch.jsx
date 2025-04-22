import { useState, useEffect } from 'react';
import { FaSort, FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp, FaUser } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

function PatientSearch({ patients, onSelectPatient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [sortField, setSortField] = useState('lastVisit'); // Default sort by last visit date
  const [sortDirection, setSortDirection] = useState('desc'); // Default to descending (newest first)

  // Function to sort patients based on selected field and direction
  const sortPatients = (patientsToSort) => {
    if (!patientsToSort || patientsToSort.length === 0) return [];

    const sortedPatients = [...patientsToSort];

    return sortedPatients.sort((a, b) => {
      let fieldA, fieldB;

      // Handle different field types
      if (sortField === 'lastVisit') {
        fieldA = a.lastVisit ? new Date(a.lastVisit) : new Date(0);
        fieldB = b.lastVisit ? new Date(b.lastVisit) : new Date(0);
      } else if (sortField === 'dateOfBirth') {
        fieldA = a.dateOfBirth ? new Date(a.dateOfBirth) : new Date(0);
        fieldB = b.dateOfBirth ? new Date(b.dateOfBirth) : new Date(0);
      } else if (sortField === 'lastName') {
        fieldA = a.lastName || '';
        fieldB = b.lastName || '';
      } else if (sortField === 'firstName') {
        fieldA = a.firstName || '';
        fieldB = b.firstName || '';
      } else {
        fieldA = a[sortField] || '';
        fieldB = b[sortField] || '';
      }

      // For string fields, use localeCompare
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }

      // For date fields
      if (fieldA instanceof Date && fieldB instanceof Date) {
        return sortDirection === 'asc'
          ? fieldA - fieldB
          : fieldB - fieldA;
      }

      // For other types
      return sortDirection === 'asc'
        ? (fieldA > fieldB ? 1 : -1)
        : (fieldB > fieldA ? 1 : -1);
    });
  };

  useEffect(() => {
    // Initialize with all patients sorted by the selected criteria
    if (patients && patients.length > 0) {
      const sorted = sortPatients(patients);
      // Keep track of recent patients for reference
      const recent = [...patients]
        .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
        .slice(0, 5);
      setRecentPatients(recent);
      // Show all patients by default
      setSearchResults(sorted);
    }
  }, [patients, sortField, sortDirection]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === '') {
      // If search is cleared, show all patients sorted by the current criteria
      const sorted = sortPatients(patients);
      setSearchResults(sorted);
      return;
    }

    // Search by name, ID, or phone
    const filteredResults = patients.filter(patient =>
      patient.id.toLowerCase().includes(term) ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(term) ||
      patient.phone.includes(term)
    );

    // Sort the filtered results
    const sortedResults = sortPatients(filteredResults);
    setSearchResults(sortedResults);
  };

  // Handle sort change
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending for names, descending for dates
      setSortField(field);
      if (field === 'firstName' || field === 'lastName') {
        setSortDirection('asc');
      } else {
        setSortDirection('desc');
      }
    }
  };

  // Get the appropriate sort icon
  const getSortIcon = (field) => {
    if (field !== sortField) {
      return <FaSort className="text-gray-400" />;
    }

    if (field === 'lastName' || field === 'firstName') {
      return sortDirection === 'asc' ? <FaSortAlphaDown className="text-blue-600" /> : <FaSortAlphaUp className="text-blue-600" />;
    } else {
      return sortDirection === 'asc' ? <FaSortNumericDown className="text-blue-600" /> : <FaSortNumericUp className="text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Patient Search</h2>
        <p className="text-gray-600 mb-4">Search for a patient to view their complete medical record</p>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by name, ID, or phone number"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex justify-end mb-4">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-gray-600 self-center">Sort by:</span>
            <button
              onClick={() => handleSort('lastName')}
              className={`flex items-center px-2 py-1 rounded ${
                sortField === 'lastName' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              Last Name {getSortIcon('lastName')}
            </button>
            <button
              onClick={() => handleSort('firstName')}
              className={`flex items-center px-2 py-1 rounded ${
                sortField === 'firstName' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              First Name {getSortIcon('firstName')}
            </button>
            <button
              onClick={() => handleSort('dateOfBirth')}
              className={`flex items-center px-2 py-1 rounded ${
                sortField === 'dateOfBirth' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              Date of Birth {getSortIcon('dateOfBirth')}
            </button>
            <button
              onClick={() => handleSort('lastVisit')}
              className={`flex items-center px-2 py-1 rounded ${
                sortField === 'lastVisit' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              Last Visit {getSortIcon('lastVisit')}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          {searchTerm ? `Search Results (${searchResults.length})` : `All Patients (${searchResults.length})`}
        </h3>

        {searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map(patient => (
              <div
                key={patient.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => {
                  // Scroll to top of page when selecting a patient
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onSelectPatient(patient);
                }}
              >
                <div>
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                  <p className="text-sm text-gray-600">
                    {calculateAge(patient.dateOfBirth)} years • {patient.gender} • {patient.phone}
                  </p>
                  {patient.createdBy && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <FaUser className="mr-1" size={10} />
                      Added by: <span className="font-medium ml-1">
                        {patient.createdBy === 'visitor' ? 'Patient (Online)' :
                         patient.createdBy === 'doctor' ? 'Doctor' :
                         patient.createdBy === 'secretary' ? 'Secretary' :
                         patient.createdByName || getCreatorLabel(patient.createdBy)}
                      </span>
                    </p>
                  )}
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No patients found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientSearch;
