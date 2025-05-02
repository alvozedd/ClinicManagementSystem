import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const AppointmentForm = ({ patientId, onSubmit, onCancel }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    patient_id: patientId,
    appointment_date: '',
    reason: '',
    status: 'scheduled',
    createdBy: userInfo ? userInfo.role : 'staff',
  });

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
        <label className="form-label dark:text-white">Appointment Date*</label>
        <input
          type="date"
          name="appointment_date"
          value={formData.appointment_date}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label dark:text-white">Reason</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
          rows="3"
        ></textarea>
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
          Add Appointment
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
