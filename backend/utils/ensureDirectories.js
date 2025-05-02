const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Ensures that required directories exist, creating them if necessary
 */
const ensureDirectories = () => {
  const requiredDirs = [
    path.join(__dirname, '../uploads')
  ];

  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      } catch (error) {
        logger.error(`Failed to create directory ${dir}: ${error.message}`);
      }
    } else {
      logger.info(`Directory exists: ${dir}`);
    }
  });
};

module.exports = ensureDirectories;
