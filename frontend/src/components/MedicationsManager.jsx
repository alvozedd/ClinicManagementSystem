import { useState } from 'react';

function MedicationsManager({ medications = [], onUpdate }) {
  const [editedMedications, setEditedMedications] = useState([...medications]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: ''
  });
  const [editIndex, setEditIndex] = useState(-1); // -1 means not editing any medication
  const [isEditing, setIsEditing] = useState(false);

  // Handle adding a new medication or updating an existing one
  const handleAddMedication = () => {
    if (newMedication.name.trim() && newMedication.dosage.trim() && newMedication.frequency.trim()) {
      if (isEditing && editIndex >= 0) {
        // Update existing medication
        const updatedMedications = [...editedMedications];
        updatedMedications[editIndex] = { ...newMedication };
        setEditedMedications(updatedMedications);
        onUpdate(updatedMedications);
        setNewMedication({ name: '', dosage: '', frequency: '', startDate: '' });
        setEditIndex(-1);
        setIsEditing(false);
      } else {
        // Add new medication
        const updatedMedications = [...editedMedications, { ...newMedication }];
        setEditedMedications(updatedMedications);
        onUpdate(updatedMedications);
        setNewMedication({ name: '', dosage: '', frequency: '', startDate: '' });
      }
    }
  };

  // Handle editing a medication
  const handleEditMedication = (index) => {
    setNewMedication({ ...editedMedications[index] });
    setEditIndex(index);
    setIsEditing(true);
    // Scroll to the form
    document.getElementById('medicationForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle removing a medication
  const handleRemoveMedication = (index) => {
    const updatedMedications = editedMedications.filter((_, i) => i !== index);
    setEditedMedications(updatedMedications);
    onUpdate(updatedMedications);

    // If we were editing this medication, reset the form
    if (editIndex === index) {
      setNewMedication({ name: '', dosage: '', frequency: '', startDate: '' });
      setEditIndex(-1);
      setIsEditing(false);
    } else if (editIndex > index) {
      // If we were editing a medication after this one, adjust the index
      setEditIndex(editIndex - 1);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setNewMedication({ name: '', dosage: '', frequency: '', startDate: '' });
    setEditIndex(-1);
    setIsEditing(false);
  };

  // Handle input change for new/edited medication
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Existing medications */}
      {editedMedications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editedMedications.map((medication, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{medication.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{medication.dosage}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{medication.frequency}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{medication.startDate}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMedication(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveMedication(index)}
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
        <p className="text-gray-500 italic mb-4">No medications recorded.</p>
      )}

      {/* Add/Edit medication form */}
      <div id="medicationForm" className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-700 mb-3">
          {isEditing ? 'Edit Medication' : 'Add New Medication'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
            <input
              type="text"
              name="name"
              value={newMedication.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Lisinopril"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
            <input
              type="text"
              name="dosage"
              value={newMedication.dosage}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 10mg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <input
              type="text"
              name="frequency"
              value={newMedication.frequency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Once daily"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={newMedication.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            onClick={handleAddMedication}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!newMedication.name || !newMedication.dosage || !newMedication.frequency}
          >
            {isEditing ? 'Update Medication' : 'Add Medication'}
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

export default MedicationsManager;
