
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const { formatResponse } = require('../utils/responseFormatter');

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json(formatResponse(null, false, 'No token, authorization denied'));
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Add user ID to request
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json(formatResponse(null, false, 'Token is not valid'));
  }
};

module.exports = auth;
