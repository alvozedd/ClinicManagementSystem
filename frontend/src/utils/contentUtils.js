import hardcodedContent from '../data/hardcodedContent';

// Cache for content data with timestamp
let contentCache = {
  data: null,
  timestamp: 0
};

/**
 * Force a refresh of content on next load (no-op in hardcoded version)
 */
export const forceContentRefresh = () => {
  console.log('Content refresh requested, but using hardcoded content');
  // No action needed as we're using hardcoded content
};

/**
 * Loads hardcoded content
 * @param {string} section - Optional section to filter content
 * @returns {Object} - Organized content by section and category
 */
export const loadContent = async (section = null) => {
  try {
    // Check if we should use cached content
    if (contentCache.data) {
      console.log('Using cached hardcoded content');
      if (section) {
        // Return only the requested section
        return { [section]: contentCache.data[section] };
      }
      return contentCache.data;
    }

    console.log('Loading hardcoded content, section:', section || 'all');

    // Use hardcoded content
    const content = hardcodedContent;

    // Update the cache
    contentCache.data = content;
    contentCache.timestamp = Date.now();

    // Return the requested section or all content
    if (section) {
      return { [section]: content[section] };
    }
    return content;
  } catch (error) {
    console.error('Unexpected error in loadContent:', error);
    // Return the hardcoded content directly
    return section ? { [section]: hardcodedContent[section] } : hardcodedContent;
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

  // Log all items in this category for debugging
  console.log(`Items in ${section}.${category}:`, content[section][category].map(item =>
    `${item.label} (${item.visible !== false ? 'visible' : 'hidden'})`
  ));

  // Try to find the item with the matching label
  try {
    const foundItem = content[section][category].find(item => item.label === label && item.visible !== false);

    if (foundItem) {
      console.log(`Found matching item for ${section}.${category}.${label}:`, foundItem);
      return foundItem.type === 'link' ? foundItem.url : foundItem.value;
    } else {
      console.log(`No matching item found for ${section}.${category}.${label}, using default:`, defaultValue);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error finding item for ${section}.${category}.${label}:`, error);
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
