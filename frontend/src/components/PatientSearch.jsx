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

function PatientSearch({ patients, onSelectPatient, onAddPatient }) {
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
      return <FaSort className="text-gray-400 ml-1 h-3 w-3 md:h-4 md:w-4" />;
    }

    if (field === 'lastName' || field === 'firstName') {
      return sortDirection === 'asc'
        ? <FaSortAlphaDown className="text-blue-600 ml-1 h-3 w-3 md:h-4 md:w-4" />
        : <FaSortAlphaUp className="text-blue-600 ml-1 h-3 w-3 md:h-4 md:w-4" />;
    } else {
      return sortDirection === 'asc'
        ? <FaSortNumericDown className="text-blue-600 ml-1 h-3 w-3 md:h-4 md:w-4" />
        : <FaSortNumericUp className="text-blue-600 ml-1 h-3 w-3 md:h-4 md:w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
      <div className="mb-3 md:mb-4">
        <div className="flex items-center justify-between mb-2 md:mb-3 gap-2">
          <h2 className="text-sm md:text-base font-bold flex items-center">
            <FaUser className="mr-2 text-blue-600" size={16} />
            Patient Search
          </h2>
          {onAddPatient && (
            <button
              onClick={onAddPatient}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Patient
            </button>
          )}
          <span className="text-xs md:text-sm text-gray-500">
            {searchTerm ? `Results: ${searchResults.length}` : `Total: ${searchResults.length}`}
          </span>
        </div>

        <div className="relative mb-3 md:mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 py-2 md:py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            placeholder="Search by name, ID, or phone"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="mb-3 md:mb-4">
          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            <span className="text-gray-600 self-center whitespace-nowrap">Sort:</span>
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
        {searchResults.length > 0 ? (
          <div className="space-y-2 md:space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto">
            {searchResults.map(patient => (
              <div
                key={patient.id}
                className="flex justify-between items-center p-3 md:p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onSelectPatient(patient);
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base truncate">{patient.firstName} {patient.lastName}</p>
                  <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-600 mt-1">
                    <span>{calculateAge(patient.dateOfBirth)} years</span>
                    <span className="mx-1">•</span>
                    <span>{patient.gender}</span>
                    <span className="mx-1">•</span>
                    <span>{patient.phone}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPatient(patient);
                    }}
                    title="Edit Patient"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm md:text-base">No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientSearch;
