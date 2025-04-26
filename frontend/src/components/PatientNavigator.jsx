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
    <div className="bg-white rounded-md shadow-sm p-0.5 mb-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="mr-2 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 text-xs md:text-sm font-medium flex items-center px-2 md:px-3 py-1 md:py-1.5 rounded transition-colors duration-200"
          >
            <FaChevronLeft className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
            <span className="ml-1 md:ml-1.5">Back to Search</span>
          </button>
          <h2 className="text-xs font-medium">
            {currentIndex + 1}/{sortedPatients.length}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`p-1.5 rounded ${
              currentIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title="Previous patient"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === sortedPatients.length - 1}
            className={`p-1.5 rounded ${
              currentIndex === sortedPatients.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title="Next patient"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientNavigator;
