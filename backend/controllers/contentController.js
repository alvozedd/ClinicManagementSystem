const asyncHandler = require('../middleware/asyncHandler');
const Content = require('../models/contentModel');
const logger = require('../utils/logger');

// @desc    Create a new content item
// @route   POST /api/content
// @access  Private/Admin
const createContent = asyncHandler(async (req, res) => {
  const { section, category, type, label, value, url, order, visible } = req.body;

  logger.info('Creating content item', { section, category, type, label });

  const content = await Content.create({
    section,
    category,
    type,
    label,
    value,
    url,
    order: order || 0,
    visible: visible !== undefined ? visible : true,
    updated_by_user_id: req.user._id,
  });

  if (content) {
    res.status(201).json(content);
  } else {
    res.status(400);
    throw new Error('Invalid content data');
  }
});

// @desc    Get all content items or filter by section
// @route   GET /api/content
// @access  Public
const getContent = asyncHandler(async (req, res) => {
  const { section } = req.query;
  
  // Create filter object based on query parameters
  const filter = {};
  if (section) {
    filter.section = section;
  }

  logger.info('Getting content items', { filter });

  // Find content items and sort by section, category, and order
  const content = await Content.find(filter)
    .sort({ section: 1, category: 1, order: 1 });

  res.json(content);
});

// @desc    Get content item by ID
// @route   GET /api/content/:id
// @access  Public
const getContentById = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);

  if (content) {
    res.json(content);
  } else {
    res.status(404);
    throw new Error('Content item not found');
  }
});

// @desc    Update content item
// @route   PUT /api/content/:id
// @access  Private/Admin
const updateContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);

  if (content) {
    // Update fields
    content.section = req.body.section || content.section;
    content.category = req.body.category || content.category;
    content.type = req.body.type || content.type;
    content.label = req.body.label || content.label;
    
    // Handle value and url based on type
    if (content.type === 'link') {
      content.url = req.body.url || content.url;
      // For links, label is used instead of value
      if (req.body.label) {
        content.label = req.body.label;
      }
    } else {
      content.value = req.body.value !== undefined ? req.body.value : content.value;
    }
    
    content.order = req.body.order !== undefined ? req.body.order : content.order;
    content.visible = req.body.visible !== undefined ? req.body.visible : content.visible;
    content.updated_by_user_id = req.user._id;

    const updatedContent = await content.save();
    res.json(updatedContent);
  } else {
    res.status(404);
    throw new Error('Content item not found');
  }
});

// @desc    Delete content item
// @route   DELETE /api/content/:id
// @access  Private/Admin
const deleteContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);

  if (content) {
    await content.deleteOne();
    res.json({ message: 'Content item removed' });
  } else {
    res.status(404);
    throw new Error('Content item not found');
  }
});

module.exports = {
  createContent,
  getContent,
  getContentById,
  updateContent,
  deleteContent,
};
