import defaultContent from '../data/defaultContent';
import apiService from './apiService';

/**
 * Loads content from the API with fallback to default content
 * @param {string} section - Optional section to filter content
 * @returns {Object} - Organized content by section and category
 */
export const loadContent = async (section = null) => {
  try {
    // Try to fetch content from API with multiple attempts
    let contentData;
    let apiSuccess = false;

    console.log('Loading content from API, section:', section || 'all');

    try {
      if (section) {
        contentData = await apiService.getContent(section);
      } else {
        contentData = await apiService.getContent();
      }

      // Check if we got valid data
      if (contentData && Array.isArray(contentData) && contentData.length > 0) {
        console.log('Successfully loaded content from API, items count:', contentData.length);
        apiSuccess = true;
      } else {
        console.warn('API returned empty or invalid content data');
      }
    } catch (apiError) {
      console.error('Error fetching content from API:', apiError);
    }

    // If API call succeeded and returned valid data, organize it
    if (apiSuccess) {
      console.log('Organizing content data from API');

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

      console.log('Successfully organized content from API');
      return organizedContent;
    } else {
      // If API call failed or returned empty data, use default content
      console.warn('Using default content as fallback');
      const fallbackContent = section ? { [section]: defaultContent[section] } : defaultContent;
      console.log('Fallback content sections:', Object.keys(fallbackContent));
      return fallbackContent;
    }
  } catch (error) {
    // If any unexpected error occurs, use default content
    console.error('Unexpected error in loadContent, using default content:', error);
    const fallbackContent = section ? { [section]: defaultContent[section] } : defaultContent;
    return fallbackContent;
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
  console.log(`Looking for content item: ${section}.${category}.${label}`);
  console.log('Content object structure:', Object.keys(content));

  if (!content) {
    console.log('Content object is null or undefined');
    return null;
  }

  if (!content[section]) {
    console.log(`Section '${section}' not found in content`);
    return null;
  }

  if (!content[section][category]) {
    console.log(`Category '${category}' not found in section '${section}'`);
    return null;
  }

  const items = content[section][category];
  console.log(`Found ${items.length} items in ${section}.${category}`);

  const foundItem = items.find(item => item.label === label && item.visible !== false);

  if (foundItem) {
    console.log(`Found matching item for ${section}.${category}.${label}:`, foundItem);
  } else {
    console.log(`No matching item found for ${section}.${category}.${label}`);
  }

  return foundItem || null;
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
  console.log(`Getting content value for ${section}.${category}.${label}`);
  const item = getContentItem(content, section, category, label);

  if (item) {
    console.log(`Found item for ${section}.${category}.${label} from database`);
    return item.value;
  } else {
    console.log(`No item found for ${section}.${category}.${label} in database, using default:`, defaultValue);
    return defaultValue;
  }
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
