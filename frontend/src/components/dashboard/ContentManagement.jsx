import { useState } from 'react';
import { FaDesktop } from 'react-icons/fa';
import SimpleContentEditor from '../SimpleContentEditor';
import './DashboardStyles.css';

const ContentManagement = () => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="content-management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Content Management</h1>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="btn btn-outline-primary flex items-center"
        >
          <FaDesktop className="mr-2" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {showPreview ? (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Preview functionality is not available in this simplified version.
            Changes will be visible directly on the website after saving.
          </p>
        </div>
      ) : null}

      <SimpleContentEditor />
    </div>
  );

};

export default ContentManagement;
