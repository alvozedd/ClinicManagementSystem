import { useState, useEffect } from 'react';

function PatientSearch({ patients, onSelectPatient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [sortBy, setSortBy] = useState('lastVisit'); // Default sort by last visit date

  // Function to sort patients based on selected criteria
  const sortPatients = (patientsToSort, sortCriteria) => {
    if (!patientsToSort || patientsToSort.length === 0) return [];

    const sortedPatients = [...patientsToSort];

    switch(sortCriteria) {
      case 'name':
        return sortedPatients.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'lastVisit':
        return sortedPatients.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
      default:
        return sortedPatients;
    }
  };

  useEffect(() => {
    // Initialize with all patients sorted by the selected criteria
    if (patients && patients.length > 0) {
      const sorted = sortPatients(patients, sortBy);
      // Keep track of recent patients for reference
      const recent = sortPatients([...patients], 'lastVisit').slice(0, 5);
      setRecentPatients(recent);
      // Show all patients by default
      setSearchResults(sorted);
    }
  }, [patients, sortBy]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === '') {
      // If search is cleared, show all patients sorted by the current criteria
      const sorted = sortPatients(patients, sortBy);
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
    const sortedResults = sortPatients(filteredResults, sortBy);
    setSearchResults(sortedResults);
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);

    // Re-sort current results
    if (searchTerm.trim() === '') {
      // Show all patients with the new sort criteria
      const sorted = sortPatients(patients, newSortBy);
      // Update recent patients list separately
      const recent = sortPatients([...patients], 'lastVisit').slice(0, 5);
      setRecentPatients(recent);
      // Show all patients sorted by the new criteria
      setSearchResults(sorted);
    } else {
      // Re-filter and sort with the current search term
      const filteredResults = patients.filter(patient =>
        patient.id.toLowerCase().includes(searchTerm) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm) ||
        patient.phone.includes(searchTerm)
      );

      const sortedResults = sortPatients(filteredResults, newSortBy);
      setSearchResults(sortedResults);
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

        <div className="flex justify-end mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => handleSortChange('name')}
                className={`px-3 py-1 text-sm rounded-l-md ${sortBy === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Name
              </button>
              <button
                onClick={() => handleSortChange('lastVisit')}
                className={`px-3 py-1 text-sm rounded-r-md ${sortBy === 'lastVisit' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Last Visit
              </button>
            </div>
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
                onClick={() => onSelectPatient(patient)}
              >
                <div>
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                  <p className="text-sm text-gray-600">
                    ID: {patient.id} • DOB: {patient.dateOfBirth} • {patient.phone}
                  </p>
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
