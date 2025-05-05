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
        console.warn('API returned empty or invalid content data, will use fallback');
      }
    } catch (apiError) {
      console.error('Error fetching content from API, will use fallback:', apiError);
    }

    // Create a base content structure with all sections
    const organizedContent = {
      header: {},
      footer: {},
      homepage: {},
      services: {},
      contact: {}
    };

    // If API call succeeded and returned valid data, organize it
    if (apiSuccess) {
      console.log('Organizing content data from API');

      // Add API content to the organized structure
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
    }

    // Always merge with default content to ensure we have fallbacks for everything
    console.log('Merging with default content for complete data set');

    // Merge with default content
    Object.keys(defaultContent).forEach(section => {
      if (!organizedContent[section]) {
        organizedContent[section] = {};
      }

      Object.keys(defaultContent[section]).forEach(category => {
        if (!organizedContent[section][category]) {
          organizedContent[section][category] = [...defaultContent[section][category]];
        } else {
          // Check if we're missing any items from default content
          const existingLabels = organizedContent[section][category].map(item => item.label);

          defaultContent[section][category].forEach(defaultItem => {
            if (!existingLabels.includes(defaultItem.label)) {
              organizedContent[section][category].push(defaultItem);
            }
          });
        }
      });
    });

    // If a specific section was requested, return only that section
    if (section) {
      console.log(`Returning only requested section: ${section}`);
      return { [section]: organizedContent[section] || defaultContent[section] || {} };
    }

    console.log('Returning complete content with fallbacks');
    return organizedContent;
  } catch (error) {
    // If any unexpected error occurs, use default content
    console.error('Unexpected error in loadContent, using default content:', error);
    console.log('Returning complete default content');
    return section ? { [section]: defaultContent[section] || {} } : defaultContent;
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
  // Reduce logging to avoid console spam
  // console.log(`Looking for content item: ${section}.${category}.${label}`);

  // Handle missing content object
  if (!content) {
    console.warn('Content object is null or undefined in getContentItem');
    return null;
  }

  // Handle missing section
  if (!content[section]) {
    // console.warn(`Section '${section}' not found in content`);
    return null;
  }

  // Handle missing category
  if (!content[section][category]) {
    // console.warn(`Category '${category}' not found in section '${section}'`);
    return null;
  }

  const items = content[section][category];

  // Handle empty items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    // console.warn(`No items found in ${section}.${category}`);
    return null;
  }

  // Find the item with matching label that is not explicitly hidden
  const foundItem = items.find(item => item.label === label && item.visible !== false);

  // Only log on success to reduce console spam
  // if (foundItem) {
  //   console.log(`Found matching item for ${section}.${category}.${label}`);
  // }

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
  // Reduce logging to avoid console spam
  console.log(`Getting content value for ${section}.${category}.${label}`);

  // Handle missing content object
  if (!content) {
    console.warn('Content object is null or undefined in getContentValue');
    console.log(`Using default value for ${section}.${category}.${label}:`, defaultValue);
    return defaultValue;
  }

  // Handle missing section
  if (!content[section]) {
    console.warn(`Section '${section}' not found in content, using default value`);
    return defaultValue;
  }

  // Handle missing category
  if (!content[section][category]) {
    console.warn(`Category '${category}' not found in section '${section}', using default value`);
    return defaultValue;
  }

  // Try to find the item
  const item = getContentItem(content, section, category, label);

  if (item && item.value) {
    // Only log on success to reduce console spam
    return item.value;
  } else {
    console.log(`No item found for ${section}.${category}.${label}, using default:`, defaultValue);
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
