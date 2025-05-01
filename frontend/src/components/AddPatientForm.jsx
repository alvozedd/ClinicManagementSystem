import { useState } from 'react';
import { createPatientRecord } from '../utils/recordCreation';

function AddPatientForm({ onSave, onCancel, createdBy = 'secretary' }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    yearOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinPhone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName.trim()) {
      alert('First Name is required');
      return;
    }

    if (!formData.lastName.trim()) {
      alert('Other Names is required');
      return;
    }

    if (!formData.gender) {
      alert('Gender is required');
      return;
    }

    if (!formData.phone.trim()) {
      alert('Phone number is required');
      return;
    }

    // Format the data to match the backend model
    const patientData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      gender: formData.gender,
      phone: formData.phone,
      year_of_birth: formData.yearOfBirth ? parseInt(formData.yearOfBirth) : new Date().getFullYear() - 30,
      next_of_kin_name: formData.nextOfKinName || 'Not Provided',
      next_of_kin_relationship: formData.nextOfKinRelationship || 'Not Provided',
      // Make sure next of kin phone is in a valid format (digits only) or use a default
      next_of_kin_phone: formData.nextOfKinPhone ? formData.nextOfKinPhone.replace(/[^0-9]/g, '') : '0000000000',
      // Add required arrays for medical history, allergies, and medications
      medicalHistory: [
        {
          condition: 'None',
          diagnosedDate: new Date().toISOString().split('T')[0],
          notes: 'Initial record'
        }
      ],
      allergies: ['None'],
      medications: [
        {
          name: 'None',
          dosage: 'N/A',
          frequency: 'N/A',
          startDate: new Date().toISOString().split('T')[0]
        }
      ],
      createdBy: createdBy
    };

    // Also ensure the main phone number is in a valid format
    patientData.phone = patientData.phone.replace(/[^0-9]/g, '');

    console.log('Creating patient with data:', patientData);

    try {
      onSave(patientData);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert(`Failed to save patient: ${error.message || error}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Add New Patient</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Names</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year of Birth</label>
            <input
              type="number"
              name="yearOfBirth"
              value={formData.yearOfBirth || ''}
              onChange={(e) => {
                const year = e.target.value;
                if (year && !isNaN(year)) {
                  // Create a date string with just the year (Jan 1 of that year)
                  const dateOfBirth = `${year}-01-01`;
                  setFormData(prev => ({
                    ...prev,
                    yearOfBirth: parseInt(year),
                    dateOfBirth: dateOfBirth
                  }));
                } else {
                  // If input is empty or invalid, clear the date
                  setFormData(prev => ({
                    ...prev,
                    yearOfBirth: null,
                    dateOfBirth: ''
                  }));
                }
              }}
              min="1900"
              max={new Date().getFullYear()}
              placeholder="YYYY"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Only year is required</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2 mt-4 border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Next of Kin Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin Name</label>
            <input
              type="text"
              name="nextOfKinName"
              value={formData.nextOfKinName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <input
              type="text"
              name="nextOfKinRelationship"
              value={formData.nextOfKinRelationship}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin Phone</label>
            <input
              type="text"
              name="nextOfKinPhone"
              value={formData.nextOfKinPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Patient
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPatientForm;
