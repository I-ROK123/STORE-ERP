// routes/sales.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const Sale = require('../models/Sale.js');

const dbConfig = {
  host: 'localhost',
  user: 'app_user',
  password: 'secure_password',
  database: 'store_erp'
};

const pool = mysql.createPool(dbConfig);


router.get('/total', async (req, res) => {
  try {
      const total = await Sale.getTotalSales();
      res.json({ total });
  } catch (error) {
      console.error('Error getting total sales:', error);
      res.status(500).json({ error: 'Failed to get total sales' });
  }
});

router.get('/trend', async (req, res) => {
  try {
      const { period = '30d' } = req.query;
      const data = await Sale.getSalesTrend(period);
      res.json({ data });
  } catch (error) {
      console.error('Error getting sales trend:', error);
      res.status(500).json({ error: 'Failed to get sales trend' });
  }
});

module.exports = router;



// Create new sale
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { items, total, paymentMethod } = req.body;
    
    // Create sale record
    const [saleResult] = await connection.query(
      'INSERT INTO sales (total, payment_method) VALUES (?, ?)',
      [total, paymentMethod]
    );
    
    const saleId = saleResult.insertId;
    
    // Create sale items and update product stock
    for (const item of items) {
      // Add sale item
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.productId, item.quantity, item.price, item.quantity * item.price]
      );
      
      // Update product stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.productId]
      );
    }
    
    // Get complete sale data
    const [sales] = await connection.query(
      `SELECT s.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', si.id,
            'productId', si.product_id,
            'quantity', si.quantity,
            'price', si.price,
            'subtotal', si.subtotal
          )
        ) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.id = ?
      GROUP BY s.id`,
      [saleId]
    );
    
    await connection.commit();
    res.status(201).json(sales[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Error creating sale' });
  } finally {
    connection.release();
  }
});

// Get recent sales
router.get('/', async (req, res) => {
  try {
    const [sales] = await pool.query(
      `SELECT s.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', si.id,
            'productId', si.product_id,
            'quantity', si.quantity,
            'price', si.price,
            'subtotal', si.subtotal
          )
        ) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 50`
    );
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Error fetching sales' });
  }
});

module.exports = router;