import { useState, useEffect } from 'react';

function DiagnosisModal({ appointment, onClose, onSave }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followUp, setFollowUp] = useState('');

  useEffect(() => {
    if (appointment && appointment.diagnosis) {
      setDiagnosis(appointment.diagnosis.notes || '');
      setTreatment(appointment.diagnosis.treatment || '');
      setFollowUp(appointment.diagnosis.followUp || '');
    }
  }, [appointment]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedAppointment = {
      ...appointment,
      diagnosis: {
        notes: diagnosis,
        treatment: treatment,
        followUp: followUp,
        updatedAt: new Date().toISOString()
      }
    };

    onSave(updatedAppointment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Patient Consultation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="mb-6 bg-blue-50 p-5 rounded-lg shadow-sm">
          <h3 className="font-medium text-blue-800 mb-3 text-lg">Appointment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base">
            <div className="p-2">
              <span className="font-medium">Patient:</span> {appointment?.patientName}
            </div>
            <div className="p-2">
              <span className="font-medium">Date:</span> {appointment?.date}
            </div>
            <div className="p-2">
              <span className="font-medium">Time:</span> {appointment?.time}
            </div>
            <div className="p-2">
              <span className="font-medium">Reason:</span> {appointment?.reason}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Diagnosis/Impression</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                required
                placeholder="Enter your diagnosis and clinical impression of the patient..."
              ></textarea>
              <p className="mt-2 text-base text-gray-500">Include your observations, assessment, and final diagnosis.</p>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Treatment Plan</label>
              <textarea
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                required
                placeholder="Describe the treatment plan..."
              ></textarea>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Follow-up Recommendations</label>
              <textarea
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Any follow-up recommendations..."
              ></textarea>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 border border-transparent rounded-md text-base font-medium text-white hover:bg-green-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save Diagnosis
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DiagnosisModal;
