// routes/products.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const Product = require('../models/Product');

const dbConfig = {
  host: 'localhost',
  user: 'app_user',
  password: 'secure_password',
  database: 'store_erp'
};

const pool = mysql.createPool(dbConfig);

router.get('/count', async (req, res) => {
  try {
      const count = await Product.getProductCount();
      res.json({ count });
  } catch (error) {
      console.error('Error getting product count:', error);
      res.status(500).json({ error: 'Failed to get product count' });
  }
});

router.get('/low-stock', async (req, res) => {
  try {
      const threshold = parseInt(req.query.threshold) || 10;
      const items = await Product.getLowStockProducts(threshold);
      res.json({ items });
  } catch (error) {
      console.error('Error getting low stock products:', error);
      res.status(500).json({ error: 'Failed to get low stock products' });
  }
});

router.get('/stock-movement', async (req, res) => {
  try {
      const { period = '30d' } = req.query;
      const data = await Product.getStockMovement(period);
      res.json({ data });
  } catch (error) {
      console.error('Error getting stock movement:', error);
      res.status(500).json({ error: 'Failed to get stock movement' });
  }
});

module.exports = router;

// Get all products
router.get('/', async (req, res) => {
    try {
      const [products] = await pool.query(`
        SELECT 
          product_id,
          barcode,
          name,
          unit_price,
          stock_quantity,
          reorder_level,
          is_active
        FROM products 
        WHERE is_active = 1 
        ORDER BY name ASC
      `);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Error fetching products' });
    }
  });
// Update product stock
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    
    const [result] = await pool.query(
      'UPDATE products SET stock_quantity = ? WHERE product_id = ?',
      [stock_quantity, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const [products] = await pool.query(
      'SELECT * FROM products WHERE product_id = ?',
      [id]
    );
    
    res.json(products[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
});

module.exports = router;