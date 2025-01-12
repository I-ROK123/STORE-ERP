// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise'); // Add this

// Add database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'app_user',
  password: 'secure_password',
  database: 'store_erp'
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, username, full_name, role, is_active, last_login, created_at FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, password, full_name, role, email, phone } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (
        username, 
        password_hash, 
        full_name, 
        role, 
        email, 
        phone, 
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, true)`,
      [username, hashedPassword, full_name, role, email, phone]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Add this for debugging

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND is_active = true',
      [username]
    );
    console.log('Found users:', users); // Add this for debugging

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Temporarily use direct comparison
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = 'dummy-token';

    res.json({
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;