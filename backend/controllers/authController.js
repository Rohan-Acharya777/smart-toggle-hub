
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json(formatResponse(null, false, 'User already exists'));
    }
    
    // Create user
    const user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { id: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(201).json(formatResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }));
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json(formatResponse(null, false, 'Invalid credentials'));
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json(formatResponse(null, false, 'Invalid credentials'));
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(200).json(formatResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }));
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json(formatResponse(null, false, 'User not found'));
    }
    
    res.status(200).json(formatResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }));
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

module.exports = {
  register,
  login,
  getMe
};
