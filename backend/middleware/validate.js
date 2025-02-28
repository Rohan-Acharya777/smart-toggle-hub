
const { formatResponse } = require('../utils/responseFormatter');

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  try {
    // Validate request body against schema
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json(formatResponse(null, false, error.details[0].message));
    }
    
    next();
  } catch (error) {
    res.status(500).json(formatResponse(null, false, 'Validation error'));
  }
};

module.exports = validate;
