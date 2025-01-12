// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');
const salesRouter = require('./routes/sales');
const mpesaRouter = require('./routes/mpesa');
const dashboardRouter = require('./routes/dashboard');
const pool = require('./utils/db');
const mpesaRoutes = require('./routes/mpesa');
const usersRoutes = require('./routes/users');
const settingsRouter = require('./routes/Settings');
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  passkey: process.env.MPESA_PASSKEY,
  shortcode: process.env.MPESA_SHORTCODE,
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
};


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Log M-Pesa configuration
console.log('Initializing M-Pesa Service with config:', {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: '***hidden***',
  passkey: process.env.MPESA_PASSKEY,
  shortcode: process.env.MPESA_SHORTCODE,
  environment: process.env.MPESA_ENVIRONMENT
});

app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRouter);

// Router-based Routes
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/mpesa', mpesaRouter);
app.use('/api/dashboard', dashboardRouter);

mpesaRoutes.setConfig(mpesaConfig);




// Direct Routes
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.product_id,
        p.barcode,
        p.name,
        p.description,
        c.name AS category,
        b.name AS brand,
        p.unit_price,
        p.stock_quantity,
        p.reorder_level,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      WHERE p.is_active = 1
    `);
    console.log('Query executed, rows:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/brands', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brands');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const {
      barcode,
      name,
      description,
      category_id,
      brand_id,
      unit_price,
      stock_quantity,
      reorder_level
    } = req.body;

    if (!name || !category_id || !brand_id || !unit_price || !stock_quantity || !reorder_level) {
      return res.status(400).json({ error: 'All fields except description are required' });
    }

    const numericValues = {
      category_id: parseInt(category_id),
      brand_id: parseInt(brand_id),
      unit_price: parseFloat(unit_price),
      stock_quantity: parseInt(stock_quantity),
      reorder_level: parseInt(reorder_level)
    };

    const [result] = await pool.query(
      `INSERT INTO products (
        barcode, name, description, category_id, brand_id,
        unit_price, stock_quantity, reorder_level, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        barcode,
        name,
        description || '',
        numericValues.category_id,
        numericValues.brand_id,
        numericValues.unit_price,
        numericValues.stock_quantity,
        numericValues.reorder_level
      ]
    );

    res.status(201).json({ message: 'Product added successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete product with ID:', id);
    
    const [result] = await pool.query(
      'DELETE FROM products WHERE product_id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      barcode,
      name,
      description,
      category_id,
      brand_id,
      unit_price,
      stock_quantity,
      reorder_level
    } = req.body;

    const [result] = await pool.query(
      `UPDATE products 
       SET barcode = ?, name = ?, description = ?,
           category_id = ?, brand_id = ?, unit_price = ?,
           stock_quantity = ?, reorder_level = ?,
           updated_at = NOW()
       WHERE product_id = ?`,
      [
        barcode,
        name,
        description,
        category_id,
        brand_id,
        unit_price,
        stock_quantity,
        reorder_level,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products LIMIT 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;