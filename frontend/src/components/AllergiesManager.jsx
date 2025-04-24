import { useState } from 'react';

function AllergiesManager({ allergies = [], onUpdate }) {
  const [editedAllergies, setEditedAllergies] = useState([...allergies]);
  const [newAllergy, setNewAllergy] = useState('');
  const [editIndex, setEditIndex] = useState(-1); // -1 means not editing any allergy
  const [isEditing, setIsEditing] = useState(false);

  // Handle adding a new allergy or updating an existing one
  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      if (isEditing && editIndex >= 0) {
        // Update existing allergy
        const updatedAllergies = [...editedAllergies];
        updatedAllergies[editIndex] = newAllergy.trim();
        setEditedAllergies(updatedAllergies);
        onUpdate(updatedAllergies);
        setNewAllergy('');
        setEditIndex(-1);
        setIsEditing(false);
      } else {
        // Add new allergy
        const updatedAllergies = [...editedAllergies, newAllergy.trim()];
        setEditedAllergies(updatedAllergies);
        onUpdate(updatedAllergies);
        setNewAllergy('');
      }
    }
  };

  // Handle editing an allergy
  const handleEditAllergy = (index) => {
    setNewAllergy(editedAllergies[index]);
    setEditIndex(index);
    setIsEditing(true);
    // Focus on the input field
    document.getElementById('allergyInput')?.focus();
  };

  // Handle removing an allergy
  const handleRemoveAllergy = (index) => {
    const updatedAllergies = editedAllergies.filter((_, i) => i !== index);
    setEditedAllergies(updatedAllergies);
    onUpdate(updatedAllergies);

    // If we were editing this allergy, reset the form
    if (editIndex === index) {
      setNewAllergy('');
      setEditIndex(-1);
      setIsEditing(false);
    } else if (editIndex > index) {
      // If we were editing an allergy after this one, adjust the index
      setEditIndex(editIndex - 1);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setNewAllergy('');
    setEditIndex(-1);
    setIsEditing(false);
  };

  // Handle key press (Enter) to add/update allergy
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
                <div className="ml-2 flex space-x-1">
                  <button
                    onClick={() => handleEditAllergy(index)}
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveAllergy(index)}
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No allergies recorded.</p>
        )}
      </div>

      {/* Add/Edit allergy form */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-700 mb-3">
          {isEditing ? 'Edit Allergy' : 'Add New Allergy'}
        </h4>
        <div className="flex">
          <input
            id="allergyInput"
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
            {isEditing ? 'Update' : 'Add'}
          </button>
        </div>
        {isEditing && (
          <div className="mt-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel Editing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllergiesManager;
