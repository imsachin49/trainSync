const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
        throw new ApiError(400, 'Username or email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    await db.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, 'user']
    );

    res.status(201).json(new ApiResponse(201, 'User registered successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error registering user');
  }
});

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get user
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
        throw new ApiError(401, 'Invalid credentials');
    }
    
    const user = users[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new ApiError(401, 'Invalid credentials');
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    throw new ApiError(500, 'Error logging in');
  }
};

module.exports = { register, login };