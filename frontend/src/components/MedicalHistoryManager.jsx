import { useState } from 'react';

function MedicalHistoryManager({ medicalHistory = [], onUpdate }) {
  const [editedHistory, setEditedHistory] = useState([...medicalHistory]);
  const [newCondition, setNewCondition] = useState({
    condition: '',
    diagnosedDate: '',
    notes: ''
  });
  const [editIndex, setEditIndex] = useState(-1); // -1 means not editing any condition
  const [isEditing, setIsEditing] = useState(false);

  // Handle adding a new condition
  const handleAddCondition = () => {
    if (newCondition.condition.trim() && newCondition.diagnosedDate) {
      if (isEditing && editIndex >= 0) {
        // Update existing condition
        const updatedHistory = [...editedHistory];
        updatedHistory[editIndex] = { ...newCondition };
        setEditedHistory(updatedHistory);
        onUpdate(updatedHistory);
        setNewCondition({ condition: '', diagnosedDate: '', notes: '' });
        setEditIndex(-1);
        setIsEditing(false);
      } else {
        // Add new condition
        const updatedHistory = [...editedHistory, { ...newCondition }];
        setEditedHistory(updatedHistory);
        onUpdate(updatedHistory);
        setNewCondition({ condition: '', diagnosedDate: '', notes: '' });
      }
    }
  };

  // Handle editing a condition
  const handleEditCondition = (index) => {
    setNewCondition({ ...editedHistory[index] });
    setEditIndex(index);
    setIsEditing(true);
    // Scroll to the form
    document.getElementById('medicalHistoryForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle removing a condition
  const handleRemoveCondition = (index) => {
    const updatedHistory = editedHistory.filter((_, i) => i !== index);
    setEditedHistory(updatedHistory);
    onUpdate(updatedHistory);

    // If we were editing this condition, reset the form
    if (editIndex === index) {
      setNewCondition({ condition: '', diagnosedDate: '', notes: '' });
      setEditIndex(-1);
      setIsEditing(false);
    } else if (editIndex > index) {
      // If we were editing a condition after this one, adjust the index
      setEditIndex(editIndex - 1);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setNewCondition({ condition: '', diagnosedDate: '', notes: '' });
    setEditIndex(-1);
    setIsEditing(false);
  };

  // Handle input change for new/edited condition
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCondition(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Existing conditions */}
      {editedHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosed Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editedHistory.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.condition}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.diagnosedDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{item.notes}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCondition(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveCondition(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic mb-4">No medical history recorded.</p>
      )}

      {/* Add/Edit condition form */}
      <div id="medicalHistoryForm" className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-700 mb-3">
          {isEditing ? 'Edit Condition' : 'Add New Condition'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <input
              type="text"
              name="condition"
              value={newCondition.condition}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Hypertension"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosed Date</label>
            <input
              type="date"
              name="diagnosedDate"
              value={newCondition.diagnosedDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              name="notes"
              value={newCondition.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional details"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            onClick={handleAddCondition}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!newCondition.condition || !newCondition.diagnosedDate}
          >
            {isEditing ? 'Update Condition' : 'Add Condition'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicalHistoryManager;
