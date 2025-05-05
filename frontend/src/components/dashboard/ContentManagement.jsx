import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaDesktop, FaEye, FaEyeSlash } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import ContentPreview from './ContentPreview';
import './DashboardStyles.css';

const ContentManagement = () => {
  const [contentSections, setContentSections] = useState([]);
  const [activeSection, setActiveSection] = useState('homepage');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContentItem, setNewContentItem] = useState({
    section: 'homepage',
    category: '',
    type: 'text',
    label: '',
    value: '',
    url: '',
    order: 0,
    visible: true
  });

  const sections = [
    { id: 'homepage', label: 'Homepage' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
    { id: 'footer', label: 'Footer' },
    { id: 'header', label: 'Header' }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllContent();

      // Organize content by section
      const organized = {};
      sections.forEach(section => {
        organized[section.id] = [];
      });

      data.forEach(item => {
        if (organized[item.section]) {
          organized[item.section].push(item);
        }
      });

      setContentSections(organized);
      setError(null);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({...item});
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingItem({
      ...editingItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNewItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewContentItem({
      ...newContentItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveItem = async () => {
    try {
      await apiService.updateContent(editingItem._id, editingItem);
      fetchContent();
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating content:', err);
      setError('Failed to update content. Please try again.');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await apiService.createContent(newContentItem);
      fetchContent();
      setShowAddModal(false);
      setNewContentItem({
        section: activeSection,
        category: '',
        type: 'text',
        label: '',
        value: '',
        url: '',
        order: 0,
        visible: true
      });
    } catch (err) {
      console.error('Error adding content:', err);
      setError('Failed to add content. Please try again.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this content item?')) {
      try {
        await apiService.deleteContent(id);
        fetchContent();
      } catch (err) {
        console.error('Error deleting content:', err);
        setError('Failed to delete content. Please try again.');
      }
    }
  };

  const openAddModal = () => {
    setNewContentItem({
      ...newContentItem,
      section: activeSection
    });
    setShowAddModal(true);
  };

  const renderContentItems = () => {
    const items = contentSections[activeSection] || [];

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No content items found for this section.
        </div>
      );
    }

    // Group items by category
    const groupedItems = {};
    items.forEach(item => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      groupedItems[item.category].push(item);
    });

    return (
      <div className="space-y-6">
        {Object.keys(groupedItems).map(category => (
          <div key={category} className="glass-card p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">{category}</h3>
            <div className="space-y-4">
              {groupedItems[category].map(item => (
                <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm">
                  {editingItem && editingItem._id === item._id ? (
                    <div className="space-y-3">
                      <div className="form-group">
                        <label className="form-label">Label</label>
                        <input
                          type="text"
                          name="label"
                          value={editingItem.label}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      {editingItem.type === 'text' && (
                        <div className="form-group">
                          <label className="form-label">Value</label>
                          <input
                            type="text"
                            name="value"
                            value={editingItem.value}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                      )}

                      {editingItem.type === 'longtext' && (
                        <div className="form-group">
                          <label className="form-label">Value</label>
                          <textarea
                            name="value"
                            value={editingItem.value}
                            onChange={handleInputChange}
                            className="form-input"
                            rows="4"
                          ></textarea>
                        </div>
                      )}

                      {editingItem.type === 'link' && (
                        <div className="form-group">
                          <label className="form-label">URL</label>
                          <input
                            type="text"
                            name="url"
                            value={editingItem.url}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label flex items-center">
                          <input
                            type="checkbox"
                            name="visible"
                            checked={editingItem.visible}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          Visible
                        </label>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="btn btn-outline-primary flex items-center"
                        >
                          <FaTimes className="mr-1" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveItem}
                          className="btn btn-primary flex items-center"
                        >
                          <FaSave className="mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{item.label}</h4>
                          <div className="mt-1">
                            {item.type === 'link' ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {item.url}
                              </a>
                            ) : (
                              <p className="text-gray-600 break-words">
                                {item.value.length > 100 ? `${item.value.substring(0, 100)}...` : item.value}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center">
                            <span className={`badge ${item.visible ? 'badge-green' : 'badge-gray'} mr-2`}>
                              {item.visible ? 'Visible' : 'Hidden'}
                            </span>
                            <span className="badge badge-blue">{item.type}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAddModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Add New Content Item</h2>

          <form onSubmit={handleAddItem}>
            <div className="form-group">
              <label className="form-label">Section</label>
              <select
                name="section"
                value={newContentItem.section}
                onChange={handleNewItemChange}
                className="form-input"
                required
              >
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                name="category"
                value={newContentItem.category}
                onChange={handleNewItemChange}
                className="form-input"
                required
                placeholder="e.g., Hero, About, Services"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="type"
                value={newContentItem.type}
                onChange={handleNewItemChange}
                className="form-input"
                required
              >
                <option value="text">Text</option>
                <option value="longtext">Long Text</option>
                <option value="link">Link</option>
                <option value="image">Image</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Label</label>
              <input
                type="text"
                name="label"
                value={newContentItem.label}
                onChange={handleNewItemChange}
                className="form-input"
                required
                placeholder="e.g., Hero Title, About Text"
              />
            </div>

            {newContentItem.type !== 'link' && (
              <div className="form-group">
                <label className="form-label">Value</label>
                {newContentItem.type === 'longtext' ? (
                  <textarea
                    name="value"
                    value={newContentItem.value}
                    onChange={handleNewItemChange}
                    className="form-input"
                    rows="4"
                    required
                  ></textarea>
                ) : (
                  <input
                    type="text"
                    name="value"
                    value={newContentItem.value}
                    onChange={handleNewItemChange}
                    className="form-input"
                    required
                  />
                )}
              </div>
            )}

            {newContentItem.type === 'link' && (
              <div className="form-group">
                <label className="form-label">URL</label>
                <input
                  type="text"
                  name="url"
                  value={newContentItem.url}
                  onChange={handleNewItemChange}
                  className="form-input"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Order</label>
              <input
                type="number"
                name="order"
                value={newContentItem.order}
                onChange={handleNewItemChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center">
                <input
                  type="checkbox"
                  name="visible"
                  checked={newContentItem.visible}
                  onChange={handleNewItemChange}
                  className="mr-2"
                />
                Visible
              </label>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline-primary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Group content items by category for the current section
  const getGroupedContent = () => {
    const items = contentSections[activeSection] || [];
    const groupedItems = {};

    items.forEach(item => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      groupedItems[item.category].push(item);
    });

    return groupedItems;
  };

  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="content-management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Content Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn btn-secondary flex items-center"
            title={showPreview ? "Hide Preview" : "Show Preview"}
          >
            <FaDesktop className="mr-2" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            onClick={openAddModal}
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Content
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`tab-button ${activeSection === section.id ? 'active' : ''}`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Editor */}
        <div className={showPreview ? "" : "lg:col-span-2"}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            renderContentItems()
          )}
        </div>

        {/* Content Preview */}
        {showPreview && (
          <div className="sticky top-4">
            <ContentPreview
              activeSection={activeSection}
              groupedContent={getGroupedContent()}
            />
          </div>
        )}
      </div>

      {showAddModal && renderAddModal()}
    </div>
  );
};

export default ContentManagement;
