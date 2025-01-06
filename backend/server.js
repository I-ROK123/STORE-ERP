const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const productRoutes = require('./routes/products.js');
const salesRoutes = require('./routes/sales.js');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'app_user',
  password: 'secure_password',
  database: 'store_erp'
};

const pool = mysql.createPool(dbConfig);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);

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

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all brands
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

    // Validate required fields
    if (!name || !category_id || !brand_id || !unit_price || !stock_quantity || !reorder_level) {
      return res.status(400).json({ error: 'All fields except description are required' });
    }

    // Convert string values to numbers where needed
    const numericValues = {
      category_id: parseInt(category_id),
      brand_id: parseInt(brand_id),
      unit_price: parseFloat(unit_price),
      stock_quantity: parseInt(stock_quantity),
      reorder_level: parseInt(reorder_level)
    };

    const [result] = await pool.query(
      `INSERT INTO products (
        barcode,
        name,
        description,
        category_id,
        brand_id,
        unit_price,
        stock_quantity,
        reorder_level,
        is_active,
        created_at,
        updated_at
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
    
    console.log('Delete result:', result);
    
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
       SET barcode = ?,
           name = ?,
           description = ?,
           category_id = ?,
           brand_id = ?,
           unit_price = ?,
           stock_quantity = ?,
           reorder_level = ?,
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

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products LIMIT 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;