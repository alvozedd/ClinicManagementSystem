import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function PatientNavigator({
  patients,
  currentPatient,
  onSelectPatient,
  onClose
}) {
  const [sortedPatients, setSortedPatients] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update sorted patients and find current index
  useEffect(() => {
    if (patients && patients.length > 0) {
      // Use patients as is without sorting
      setSortedPatients(patients);

      // Find the index of the current patient
      if (currentPatient) {
        const index = patients.findIndex(p => p.id === currentPatient.id);
        if (index !== -1) {
          setCurrentIndex(index);
        }
      }
    }
  }, [patients, currentPatient]);

  // Navigate to the previous patient
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onSelectPatient(sortedPatients[newIndex]);
    }
  };

  // Navigate to the next patient
  const goToNext = () => {
    if (currentIndex < sortedPatients.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onSelectPatient(sortedPatients[newIndex]);
    }
  };

  // No sorting functionality in this component anymore

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="mr-4 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 font-medium flex items-center px-3 py-2 rounded-md transition-colors duration-200"
          >
            <FaChevronLeft className="mr-1" />
            Back to List
          </button>
          <h2 className="text-lg font-semibold">
            Patient {currentIndex + 1} of {sortedPatients.length}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full ${
              currentIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Previous patient"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === sortedPatients.length - 1}
            className={`p-2 rounded-full ${
              currentIndex === sortedPatients.length - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Next patient"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Sorting removed from this component */}
    </div>
  );
}

export default PatientNavigator;
