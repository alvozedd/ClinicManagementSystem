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
      // Use the dedicated getContent method from apiService
      contentData = await apiService.getContent(section);

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
      console.log('Organized content sections:', Object.keys(organizedContent));
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

  // Debug content object structure
  if (content) {
    console.log('Content object structure:', Object.keys(content));
    // Log each section's categories
    Object.keys(content).forEach(sect => {
      if (content[sect]) {
        console.log(`Section '${sect}' categories:`, Object.keys(content[sect]));
      }
    });
  } else {
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

  // Check if items is an array
  if (!Array.isArray(items)) {
    console.log(`Items in ${section}.${category} is not an array`);
    return null;
  }

  console.log(`Found ${items.length} items in ${section}.${category}`);

  // Log all items in this category for debugging
  if (items.length > 0) {
    console.log(`Items in ${section}.${category}:`, items.map(item => item.label));
  }

  // Try to find the item with the matching label
  try {
    const foundItem = items.find(item => item.label === label && item.visible !== false);

    if (foundItem) {
      console.log(`Found matching item for ${section}.${category}.${label}:`, foundItem);
    } else {
      console.log(`No matching item found for ${section}.${category}.${label}`);
    }

    return foundItem || null;
  } catch (error) {
    console.error(`Error finding item for ${section}.${category}.${label}:`, error);
    return null;
  }
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

  // Additional validation and logging
  if (!content) {
    console.warn('Content object is null or undefined in getContentValue');
    console.log(`Using default value for ${section}.${category}.${label}:`, defaultValue);
    return defaultValue;
  }

  // Check if section exists
  if (!content[section]) {
    console.warn(`Section '${section}' not found in content`);
    console.log(`Using default value for ${section}.${category}.${label}:`, defaultValue);
    return defaultValue;
  }

  // Check if category exists
  if (!content[section][category]) {
    console.warn(`Category '${category}' not found in section '${section}'`);
    console.log(`Using default value for ${section}.${category}.${label}:`, defaultValue);
    return defaultValue;
  }

  // Check if category is an array
  if (!Array.isArray(content[section][category])) {
    console.warn(`Category '${category}' in section '${section}' is not an array`);
    console.log(`Using default value for ${section}.${category}.${label}:`, defaultValue);
    return defaultValue;
  }

  const item = getContentItem(content, section, category, label);

  if (item) {
    console.log(`Found item for ${section}.${category}.${label} from database:`, item.value);
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
