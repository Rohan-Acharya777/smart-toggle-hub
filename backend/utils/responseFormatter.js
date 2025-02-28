
/**
 * Format API response
 * @param {any} data - Response data
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @returns {Object} Formatted response
 */
const formatResponse = (data = null, success = true, message = '') => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

module.exports = { formatResponse };
