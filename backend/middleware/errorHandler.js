
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);
  
  // Check the type of error
  if (err.name === 'ValidationError') {
    return res.status(400).json(formatResponse(null, false, err.message));
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json(formatResponse(null, false, 'Invalid ID format'));
  }
  
  if (err.code === 11000) {
    return res.status(400).json(formatResponse(null, false, 'Duplicate key error'));
  }
  
  // Default server error
  res.status(500).json(formatResponse(null, false, 'Server Error'));
};

module.exports = errorHandler;
