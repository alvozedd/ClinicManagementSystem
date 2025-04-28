import { useState, useEffect, useRef } from 'react';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';

function SimplifiedNotesModal({ appointment, onClose, onSave }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (appointment && appointment.diagnosis) {
      // Handle both string and object formats
      if (typeof appointment.diagnosis === 'string') {
        try {
          const parsedDiagnosis = JSON.parse(appointment.diagnosis);
          setDiagnosis(parsedDiagnosis.notes || '');
          setTreatment(parsedDiagnosis.treatment || '');
          setFollowUp(parsedDiagnosis.followUp || '');
          setExistingFiles(parsedDiagnosis.files || []);
        } catch (e) {
          // If parsing fails, use the string as is
          setDiagnosis(appointment.diagnosis);
        }
      } else {
        // It's already an object
        setDiagnosis(appointment.diagnosis.notes || '');
        setTreatment(appointment.diagnosis.treatment || '');
        setFollowUp(appointment.diagnosis.followUp || '');
        setExistingFiles(appointment.diagnosis.files || []);
      }
    }
  }, [appointment]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const removeFile = (index) => {
    const updatedFiles = [...existingFiles];
    updatedFiles.splice(index, 1);
    setExistingFiles(updatedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // Process files - create file data objects with URLs
      const fileData = [];

      // Process existing files
      if (existingFiles && existingFiles.length > 0) {
        fileData.push(...existingFiles);
      }

      // Process new files
      if (files && files.length > 0) {
        for (const file of files) {
          // Create a URL for the file (in a real implementation, this would upload to a server)
          const url = URL.createObjectURL(file);

          fileData.push({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            url: url
          });
        }
      }

      // Create a structured notes object
      const notesObj = {
        notes: diagnosis,
        treatment: treatment,
        followUp: followUp,
        files: fileData,
        updatedAt: new Date().toISOString()
      };

      // For API compatibility, convert the notes object to a string
      // The backend expects a diagnosis_text field
      const updatedAppointment = {
        ...appointment,
        diagnosis: notesObj,
        // Also include a text representation for the API
        diagnosisText: JSON.stringify(notesObj),
        // Set status to Completed when adding notes
        status: 'Completed',
        // If we're editing existing notes, include its ID
        diagnosisId: appointment.diagnosis?._id || appointment.diagnosis?.id
      };

      console.log('Saving notes with appointment:', updatedAppointment);
      onSave(updatedAppointment);
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {appointment && appointment.diagnosis ? 'Edit Notes' : 'Add New Notes'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
                placeholder="Enter your clinical notes..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
              <textarea
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter treatment plan..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Instructions</label>
              <textarea
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter follow-up instructions..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files</label>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                ref={fileInputRef}
              />
              <p className="mt-1 text-xs text-gray-500">Upload patient documents, test results, or other relevant files.</p>
            </div>

            {/* Display existing files */}
            {existingFiles && existingFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Existing Files</h4>
                <ul className="divide-y divide-gray-200">
                  {existingFiles.map((file, index) => (
                    <li key={index} className="py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <div className="flex space-x-2 text-sm">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
              >
                {appointment && appointment.diagnosis ? 'Update Notes' : 'Save Notes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SimplifiedNotesModal;
