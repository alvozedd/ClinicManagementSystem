import defaultContent from '../data/defaultContent';
import apiService from './apiService';

/**
 * Loads content from the API with fallback to default content
 * @param {string} section - Optional section to filter content
 * @returns {Object} - Organized content by section and category
 */
export const loadContent = async (section = null) => {
  try {
    // Try to fetch content from API
    let contentData;
    
    if (section) {
      contentData = await apiService.getContent(section);
    } else {
      contentData = await apiService.getContent();
    }

    // If we got data, organize it
    if (contentData && Array.isArray(contentData) && contentData.length > 0) {
      // Organize content by section and category
      const organizedContent = {
        header: {},
        footer: {},
        homepage: {},
        services: {},
        contact: {}
      };

      contentData.forEach(item => {
        if (!organizedContent[item.section]) {
          organizedContent[item.section] = {};
        }

        if (!organizedContent[item.section][item.category]) {
          organizedContent[item.section][item.category] = [];
        }

        organizedContent[item.section][item.category].push(item);
      });

      return organizedContent;
    } else {
      // If API returned empty data, use default content
      console.warn('API returned empty content data, using default content');
      return section ? { [section]: defaultContent[section] } : defaultContent;
    }
  } catch (error) {
    // If API call failed, use default content
    console.error('Error fetching content from API, using default content:', error);
    return section ? { [section]: defaultContent[section] } : defaultContent;
  }
};

/**
 * Gets a specific content item by section, category, and label
 * @param {Object} content - The organized content object
 * @param {string} section - The content section
 * @param {string} category - The content category
 * @param {string} label - The content label
 * @returns {Object|null} - The content item or null if not found
 */
export const getContentItem = (content, section, category, label) => {
  if (!content || !content[section] || !content[section][category]) {
    return null;
  }

  const items = content[section][category];
  return items.find(item => item.label === label && item.visible) || null;
};

/**
 * Gets the value of a specific content item
 * @param {Object} content - The organized content object
 * @param {string} section - The content section
 * @param {string} category - The content category
 * @param {string} label - The content label
 * @param {string} defaultValue - Default value to return if content item not found
 * @returns {string} - The content value or default value
 */
export const getContentValue = (content, section, category, label, defaultValue = '') => {
  const item = getContentItem(content, section, category, label);
  return item ? item.value : defaultValue;
};

/**
 * Gets all visible items in a category
 * @param {Object} content - The organized content object
 * @param {string} section - The content section
 * @param {string} category - The content category
 * @returns {Array} - Array of visible content items
 */
export const getCategoryItems = (content, section, category) => {
  if (!content || !content[section] || !content[section][category]) {
    return [];
  }

  return content[section][category].filter(item => item.visible);
};
