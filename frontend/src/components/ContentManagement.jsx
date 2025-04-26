import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import apiService from '../utils/apiService';

function ContentManagement() {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('footer');
  
  // Mock data for initial development - will be replaced with API calls
  useEffect(() => {
    // Simulate loading content from an API
    setLoading(true);
    
    // Mock data structure for website content
    const mockContent = {
      footer: [
        { 
          id: 'footer-links-1', 
          type: 'link', 
          section: 'footer',
          category: 'Quick Links',
          label: 'Privacy Policy', 
          url: '#', 
          order: 1,
          visible: true
        },
        { 
          id: 'footer-links-2', 
          type: 'link', 
          section: 'footer',
          category: 'Quick Links',
          label: 'Terms of Service', 
          url: '#', 
          order: 2,
          visible: true
        },
        { 
          id: 'footer-contact-1', 
          type: 'text', 
          section: 'footer',
          category: 'Contact',
          label: 'Address', 
          value: '1st Floor, Gatemu House, Kimathi Way, Nyeri, Kenya', 
          order: 1,
          visible: true
        },
        { 
          id: 'footer-contact-2', 
          type: 'text', 
          section: 'footer',
          category: 'Contact',
          label: 'Phone', 
          value: '+254 722 396 296', 
          order: 2,
          visible: true
        },
        { 
          id: 'footer-contact-3', 
          type: 'text', 
          section: 'footer',
          category: 'Contact',
          label: 'Email', 
          value: 'info@urohealthcentral.com', 
          order: 3,
          visible: true
        },
        { 
          id: 'footer-copyright', 
          type: 'text', 
          section: 'footer',
          category: 'Legal',
          label: 'Copyright', 
          value: `© ${new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.`, 
          order: 1,
          visible: true
        }
      ],
      header: [
        {
          id: 'header-title',
          type: 'text',
          section: 'header',
          category: 'Branding',
          label: 'Site Title',
          value: 'UroHealth Central Ltd',
          order: 1,
          visible: true
        },
        {
          id: 'header-subtitle',
          type: 'text',
          section: 'header',
          category: 'Branding',
          label: 'Subtitle',
          value: 'Specialist Urological & Surgical Care',
          order: 2,
          visible: true
        }
      ],
      homepage: [
        {
          id: 'homepage-hero-title',
          type: 'text',
          section: 'homepage',
          category: 'Hero',
          label: 'Hero Title',
          value: 'DR. PAUL MUCHAI MBUGUA - CONSULTANT SURGEON & UROLOGIST',
          order: 1,
          visible: true
        },
        {
          id: 'homepage-about-text',
          type: 'longtext',
          section: 'homepage',
          category: 'About',
          label: 'About Text',
          value: 'Providing specialized urological care with a patient-centered approach since 2010.',
          order: 1,
          visible: true
        }
      ]
    };
    
    // Set the content based on active section
    setContentItems(mockContent[activeSection] || []);
    setLoading(false);
  }, [activeSection]);
  
  // Function to handle editing content
  const handleEditContent = (id, updatedData) => {
    setContentItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      )
    );
    
    // In a real implementation, we would save to the database here
    console.log('Updated content:', id, updatedData);
    // apiService.updateContent(id, updatedData);
  };
  
  // Function to handle toggling visibility
  const handleToggleVisibility = (id) => {
    setContentItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };
  
  // Group content items by category
  const groupedContent = contentItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Content Management</h2>
          <p className="text-sm text-gray-600">Edit website content without changing code</p>
        </div>
      </div>
      
      {/* Section Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveSection('footer')}
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeSection === 'footer'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Footer
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveSection('header')}
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeSection === 'header'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Header
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveSection('homepage')}
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeSection === 'homepage'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Homepage
            </button>
          </li>
        </ul>
      </div>
      
      {/* Content Preview */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-md font-medium text-gray-700 mb-2">Preview</h3>
        <div className="p-4 bg-blue-800 text-white rounded-lg">
          {activeSection === 'footer' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(groupedContent).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-bold text-white mb-2">{category}</h4>
                  <ul className="space-y-1">
                    {items.filter(item => item.visible).map(item => (
                      <li key={item.id} className="text-sm text-blue-100">
                        {item.type === 'link' ? (
                          <a href={item.url} className="hover:text-white">{item.label}</a>
                        ) : (
                          <span>{item.value}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          
          {activeSection === 'header' && (
            <div className="flex flex-col items-center justify-center py-4">
              {groupedContent['Branding']?.filter(item => item.visible).map(item => (
                <div key={item.id} className={item.label === 'Site Title' ? 'text-xl font-bold' : 'text-sm'}>
                  {item.value}
                </div>
              ))}
            </div>
          )}
          
          {activeSection === 'homepage' && (
            <div className="flex flex-col items-center justify-center py-4">
              {groupedContent['Hero']?.filter(item => item.visible).map(item => (
                <div key={item.id} className="text-xl font-bold mb-2">
                  {item.value}
                </div>
              ))}
              {groupedContent['About']?.filter(item => item.visible).map(item => (
                <div key={item.id} className="text-sm max-w-md text-center">
                  {item.value}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Content Editor */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-4">Edit Content</h3>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedContent).map(([category, items]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">{category}</h4>
                <div className="space-y-4">
                  {items.map(item => (
                    <ContentItem 
                      key={item.id} 
                      item={item} 
                      onEdit={handleEditContent}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Component for individual content items
function ContentItem({ item, onEdit, onToggleVisibility }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(item.type === 'link' ? item.label : item.value);
  const [editedUrl, setEditedUrl] = useState(item.url || '');
  
  const handleSave = () => {
    const updatedData = item.type === 'link' 
      ? { label: editedValue, url: editedUrl }
      : { value: editedValue };
    
    onEdit(item.id, updatedData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedValue(item.type === 'link' ? item.label : item.value);
    setEditedUrl(item.url || '');
    setIsEditing(false);
  };
  
  return (
    <div className={`p-3 rounded-lg ${item.visible ? 'bg-white' : 'bg-gray-100'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-sm font-medium text-gray-700">{item.label}</span>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            item.type === 'link' ? 'bg-purple-100 text-purple-800' : 
            item.type === 'longtext' ? 'bg-green-100 text-green-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {item.type}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleVisibility(item.id)}
            className={`p-1 rounded ${
              item.visible ? 'text-gray-500 hover:text-gray-700' : 'text-red-500 hover:text-red-700'
            }`}
            title={item.visible ? 'Hide' : 'Show'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {item.visible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              )}
            </svg>
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-blue-600 hover:text-blue-800 rounded"
              title="Edit"
            >
              <FaEdit className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-800 rounded"
                title="Save"
              >
                <FaSave className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-600 hover:text-gray-800 rounded"
                title="Cancel"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          {item.type === 'link' ? (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Link Text</label>
                <input
                  type="text"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">URL</label>
                <input
                  type="text"
                  value={editedUrl}
                  onChange={(e) => setEditedUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </>
          ) : item.type === 'longtext' ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Content</label>
              <textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={4}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Content</label>
              <input
                type="text"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          {item.type === 'link' ? (
            <div>
              <div>Text: <span className="font-medium">{item.label}</span></div>
              <div>URL: <a href={item.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{item.url}</a></div>
            </div>
          ) : (
            <div className={item.type === 'longtext' ? 'whitespace-pre-wrap' : ''}>
              {item.type === 'link' ? item.label : item.value}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContentManagement;
