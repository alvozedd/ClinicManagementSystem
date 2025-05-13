import { useState, useEffect } from 'react';
import { FaSave, FaUndo, FaSpinner, FaSync } from 'react-icons/fa';
import apiService from '../utils/apiService';
import { loadContent, forceContentRefresh } from '../utils/contentUtils';

function SimplifiedContentManagement() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});

  // Fetch content from API with fallback
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Use the loadContent utility which handles fallbacks
        const organizedContent = await loadContent();
        setContent(organizedContent);

        // Create a flat structure for the form data
        const flatData = {};

        // Process each section
        Object.keys(organizedContent).forEach(section => {
          Object.keys(organizedContent[section] || {}).forEach(category => {
            (organizedContent[section][category] || []).forEach(item => {
              const key = `${section}_${category}_${item.label}`;
              flatData[key] = item.type === 'link' ? item.url : item.value;

              // Store the item ID for later use when saving
              flatData[`${key}_id`] = item._id || item.id;
            });
          });
        });

        setFormData(flatData);
        setOriginalData(flatData);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFormData(originalData);
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Create an array of update promises
      const updatePromises = [];

      // For each changed field, create an update promise
      Object.keys(formData).forEach(key => {
        // Skip ID fields
        if (key.endsWith('_id')) return;

        // Check if the value has changed
        if (formData[key] !== originalData[key]) {
          const id = formData[`${key}_id`];
          if (!id) return;

          // Parse the key to get section, category, and label
          const [section, category, ...labelParts] = key.split('_');
          const label = labelParts.join('_');

          // Find the original item to determine its type
          let itemType = 'text';
          let updateData = {};

          // Look through the content to find the matching item
          if (content[section] && content[section][category]) {
            const item = content[section][category].find(i => i.label === label);
            if (item) {
              itemType = item.type;

              // Prepare update data based on item type
              if (itemType === 'link') {
                updateData = { url: formData[key] };
              } else {
                updateData = { value: formData[key] };
              }

              // Add the update promise
              updatePromises.push(apiService.updateContent(id, updateData));
            }
          }
        }
      });

      // Execute all updates in parallel
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);

        // Force content refresh in the frontend
        forceContentRefresh();

        setSuccess('Content updated successfully! The changes will be visible on the website.');

        // Update the original data to reflect the new values
        setOriginalData(formData);
      } else {
        setSuccess('No changes detected.');
      }
    } catch (err) {
      console.error('Error updating content:', err);
      setError('Failed to update content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Website Content Management</h2>
          <p className="text-sm text-gray-600">Edit website content to match your needs</p>
        </div>
        <button
          onClick={() => { forceContentRefresh(); setSuccess('Content cache cleared! Refreshing website content...'); setTimeout(() => setSuccess(null), 3000); }}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md flex items-center hover:bg-blue-200 transition-colors"
          title="Force refresh content on the website"
        >
          <FaSync className="mr-2" />
          Refresh Website
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section Preview */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-8 text-center relative">
            <h3 className="text-lg font-semibold mb-4 bg-black bg-opacity-30 inline-block px-3 py-1 rounded">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="homepage_Hero_Hero Title"
                  value={formData['homepage_Hero_Hero Title'] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white bg-opacity-90 text-gray-800 text-center text-xl font-bold"
                  placeholder="UroHealth Central Ltd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  name="homepage_Hero_Hero Subtitle"
                  value={formData['homepage_Hero_Hero Subtitle'] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white bg-opacity-90 text-gray-800 text-center text-lg"
                  placeholder="Specialist Urological Care"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  name="homepage_Hero_Hero Description"
                  value={formData['homepage_Hero_Hero Description'] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white bg-opacity-90 text-gray-800 text-center"
                  placeholder="20+ years of specialized medical excellence"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services Section Preview */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-8">
            <h3 className="text-lg font-semibold mb-4 text-center text-blue-700">Our Services</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Services Introduction</label>
              <textarea
                name="homepage_About_About Text"
                value={formData['homepage_About_About Text'] || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                placeholder="We provide comprehensive urological care with state-of-the-art technology and personalized treatment plans."
                rows="2"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Consultations */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-lg mb-2">
                  <input
                    type="text"
                    name="services_Consultations_Title"
                    value={formData['services_Consultations_Title'] || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-center"
                    placeholder="Consultations"
                  />
                </h4>
                <textarea
                  name="services_Consultations_Description"
                  value={formData['services_Consultations_Description'] || ''}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-3"
                  placeholder="Comprehensive evaluation and diagnosis of urological conditions by our expert consultants."
                  rows="3"
                ></textarea>
                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1">Feature</label>
                  <input
                    type="text"
                    name="services_Consultations_Feature"
                    value={formData['services_Consultations_Feature'] || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-center font-medium"
                    placeholder="30-60 minutes"
                  />
                </div>
              </div>

              {/* Diagnostics */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-lg mb-2">
                  <input
                    type="text"
                    name="services_Diagnostics_Title"
                    value={formData['services_Diagnostics_Title'] || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-center"
                    placeholder="Diagnostics"
                  />
                </h4>
                <textarea
                  name="services_Diagnostics_Description"
                  value={formData['services_Diagnostics_Description'] || ''}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-3"
                  placeholder="Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies."
                  rows="3"
                ></textarea>
                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1">Feature</label>
                  <input
                    type="text"
                    name="services_Diagnostics_Feature"
                    value={formData['services_Diagnostics_Feature'] || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-center font-medium"
                    placeholder="Accurate Results"
                  />
                </div>
              </div>

              {/* Treatments */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-lg mb-2">
                  <input
                    type="text"
                    name="services_Treatments_Title"
                    value={formData['services_Treatments_Title'] || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-center"
                    placeholder="Treatments"
                  />
                </h4>
                <textarea
                  name="services_Treatments_Description"
                  value={formData['services_Treatments_Description'] || ''}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-3"
                  placeholder="Comprehensive treatment options for various urological conditions, from medication to surgical interventions."
                  rows="3"
                ></textarea>
                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1">Feature</label>
                  <input
                    type="text"
                    name="services_Treatments_Feature"
                    value={formData['services_Treatments_Feature'] || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-center font-medium"
                    placeholder="Personalized Care"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section Preview */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-8">
            <h3 className="text-lg font-semibold mb-4 text-center text-blue-700">
              <input
                type="text"
                name="contact_Main_Title"
                value={formData['contact_Main_Title'] || ''}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-center font-bold"
                placeholder="CONTACT US"
              />
            </h3>
            <div className="text-center mb-4">
              <input
                type="text"
                name="contact_Main_Subtitle"
                value={formData['contact_Main_Subtitle'] || ''}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-center"
                placeholder="Get in touch"
              />
            </div>
            <div className="mb-6">
              <textarea
                name="contact_Main_Description"
                value={formData['contact_Main_Description'] || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center"
                placeholder="Have questions about our services or need more information? Our team will get back to you as soon as possible."
                rows="2"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-4">Clinic Hours</h4>
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      name="contact_Office Hours_Weekday Hours"
                      value={formData['contact_Office Hours_Weekday Hours'] || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Monday - Friday: 8:00 AM - 5:00 PM"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="contact_Office Hours_Saturday Hours"
                      value={formData['contact_Office Hours_Saturday Hours'] || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Saturday: By appointment"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="contact_Office Hours_Sunday Hours"
                      value={formData['contact_Office Hours_Sunday Hours'] || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Sunday: Closed"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-4">Location</h4>
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      name="contact_Location_Address Line 1"
                      value={formData['contact_Location_Address Line 1'] || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="1st Floor, Gatemu House,"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="contact_Location_Address Line 2"
                      value={formData['contact_Location_Address Line 2'] || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Kimathi Way,"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="contact_Location_Address Line 3"
                      value={formData['contact_Location_Address Line 3'] || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Nyeri, Kenya"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Contact Information */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label className="block text-sm font-medium mb-1">Mobile</label>
                <input
                  type="text"
                  name="footer_Contact_Mobile"
                  value={formData['footer_Contact_Mobile'] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0722 396 296"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label className="block text-sm font-medium mb-1">Office</label>
                <input
                  type="text"
                  name="footer_Contact_Office"
                  value={formData['footer_Contact_Office'] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0733 398 296"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="text"
                  name="footer_Contact_Email"
                  value={formData['footer_Contact_Email'] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="info@urohealthcentral.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center"
            disabled={saving}
          >
            <FaUndo className="mr-2" /> Reset Changes
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
            disabled={saving}
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Save All Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SimplifiedContentManagement;
