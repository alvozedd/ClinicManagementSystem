import { useState } from 'react';

function AllergiesManager({ allergies = [], onUpdate }) {
  const [editedAllergies, setEditedAllergies] = useState([...allergies]);
  const [newAllergy, setNewAllergy] = useState('');

  // Handle adding a new allergy
  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      const updatedAllergies = [...editedAllergies, newAllergy.trim()];
      setEditedAllergies(updatedAllergies);
      onUpdate(updatedAllergies);
      setNewAllergy('');
    }
  };

  // Handle removing an allergy
  const handleRemoveAllergy = (index) => {
    const updatedAllergies = editedAllergies.filter((_, i) => i !== index);
    setEditedAllergies(updatedAllergies);
    onUpdate(updatedAllergies);
  };

  // Handle key press (Enter) to add allergy
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAllergy();
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing allergies */}
      <div className="mb-4">
        {editedAllergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {editedAllergies.map((allergy, index) => (
              <div key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                {allergy}
                <button
                  onClick={() => handleRemoveAllergy(index)}
                  className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No allergies recorded.</p>
        )}
      </div>

      {/* Add new allergy form */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-700 mb-3">Add New Allergy</h4>
        <div className="flex">
          <input
            type="text"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Penicillin"
          />
          <button
            type="button"
            onClick={handleAddAllergy}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!newAllergy.trim()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllergiesManager;
