import React, { useState, useEffect } from 'react';

const PatientForm = ({ patient, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    phone: '',
    year_of_birth: '',
    next_of_kin_name: '',
    next_of_kin_relationship: '',
    next_of_kin_phone: '',
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        year_of_birth: patient.year_of_birth || '',
        next_of_kin_name: patient.next_of_kin_name || '',
        next_of_kin_relationship: patient.next_of_kin_relationship || '',
        next_of_kin_phone: patient.next_of_kin_phone || '',
      });
    }
  }, [patient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label dark:text-white">Full Name*</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label dark:text-white">Gender*</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label dark:text-white">Phone Number*</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label dark:text-white">Year of Birth</label>
        <input
          type="number"
          name="year_of_birth"
          value={formData.year_of_birth}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
          min="1900"
          max={new Date().getFullYear()}
        />
      </div>

      <div className="form-group">
        <label className="form-label dark:text-white">Next of Kin Name</label>
        <input
          type="text"
          name="next_of_kin_name"
          value={formData.next_of_kin_name}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="form-group">
        <label className="form-label dark:text-white">Next of Kin Relationship</label>
        <input
          type="text"
          name="next_of_kin_relationship"
          value={formData.next_of_kin_relationship}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="form-group">
        <label className="form-label dark:text-white">Next of Kin Phone</label>
        <input
          type="tel"
          name="next_of_kin_phone"
          value={formData.next_of_kin_phone}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline-primary mr-2 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-900/30"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {isEditing ? 'Update Patient' : 'Add Patient'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
