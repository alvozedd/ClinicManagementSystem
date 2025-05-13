import React, { useState, useEffect } from 'react';
import { loadContent, forceContentRefresh } from '../utils/contentUtils';
import apiService from '../utils/apiService';
import { toast } from 'react-toastify';

const SimpleContentEditor = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedContent, setEditedContent] = useState({});
  const [filter, setFilter] = useState('');

  // Load content on component mount
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      // Get raw content items from API
      const contentData = await apiService.getContent(null, Date.now());
      
      if (contentData && Array.isArray(contentData)) {
        console.log('Loaded content items:', contentData.length);
        setContent(contentData);
        
        // Initialize edited content with current values
        const initialEdited = {};
        contentData.forEach(item => {
          initialEdited[item._id] = item.value;
        });
        setEditedContent(initialEdited);
      } else {
        console.error('Invalid content data format');
        toast.error('Failed to load content');
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (id, value) => {
    setEditedContent(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveItem = async (item) => {
    try {
      setSaving(true);
      const updatedItem = {
        ...item,
        value: editedContent[item._id]
      };
      
      const result = await apiService.updateContent(updatedItem);
      if (result && result._id) {
        // Update the item in the local state
        setContent(prev => 
          prev.map(c => c._id === result._id ? result : c)
        );
        toast.success(`Updated ${item.label} successfully`);
        
        // Force content refresh to update the website
        forceContentRefresh();
      } else {
        toast.error(`Failed to update ${item.label}`);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(`Failed to update ${item.label}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (item) => {
    try {
      setSaving(true);
      const updatedItem = {
        ...item,
        visible: !item.visible
      };
      
      const result = await apiService.updateContent(updatedItem);
      if (result && result._id) {
        // Update the item in the local state
        setContent(prev => 
          prev.map(c => c._id === result._id ? result : c)
        );
        toast.success(`${result.visible ? 'Showed' : 'Hidden'} ${item.label} successfully`);
        
        // Force content refresh to update the website
        forceContentRefresh();
      } else {
        toast.error(`Failed to update visibility for ${item.label}`);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error(`Failed to update visibility for ${item.label}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  // Filter content based on search term
  const filteredContent = content.filter(item => {
    const searchText = filter.toLowerCase();
    return (
      item.section.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText) ||
      item.label.toLowerCase().includes(searchText) ||
      item.value.toLowerCase().includes(searchText)
    );
  });

  // Group content by section and category
  const groupedContent = filteredContent.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = {};
    }
    if (!acc[item.section][item.category]) {
      acc[item.section][item.category] = [];
    }
    acc[item.section][item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Website Content Management</h2>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search content..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filter}
          onChange={handleFilterChange}
        />
      </div>
      
      {Object.keys(groupedContent).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No content items found
        </div>
      ) : (
        Object.keys(groupedContent).sort().map(section => (
          <div key={section} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">{section}</h3>
            
            {Object.keys(groupedContent[section]).sort().map(category => (
              <div key={`${section}-${category}`} className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-gray-600">{category}</h4>
                
                <div className="space-y-4">
                  {groupedContent[section][category].sort((a, b) => a.order - b.order).map(item => (
                    <div key={item._id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-medium text-gray-700">{item.label}</label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleVisibility(item)}
                            className={`px-3 py-1 rounded-md text-sm ${
                              item.visible 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-400 text-white'
                            }`}
                            disabled={saving}
                          >
                            {item.visible ? 'Visible' : 'Hidden'}
                          </button>
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                            onClick={() => saveItem(item)}
                            disabled={saving || editedContent[item._id] === item.value}
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                      
                      {item.type === 'text' ? (
                        <input
                          type="text"
                          value={editedContent[item._id] || ''}
                          onChange={(e) => handleValueChange(item._id, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : item.type === 'textarea' ? (
                        <textarea
                          value={editedContent[item._id] || ''}
                          onChange={(e) => handleValueChange(item._id, e.target.value)}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editedContent[item._id] || ''}
                          onChange={(e) => handleValueChange(item._id, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchContent}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          disabled={loading}
        >
          Refresh Content
        </button>
      </div>
    </div>
  );
};

export default SimpleContentEditor;
