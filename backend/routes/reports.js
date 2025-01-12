// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Generate sales report
router.get('/sales', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id,
        s.total,
        s.payment_method,
        s.created_at,
        GROUP_CONCAT(p.name) as products
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN products p ON si.product_id = p.product_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    // Create the report content
    const reportContent = rows.map(sale => ({
      saleId: sale.id,
      amount: sale.total,
      paymentMethod: sale.payment_method,
      date: sale.created_at,
      products: sale.products
    }));

    // Send report data
    res.json(reportContent);
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Generate inventory report
router.get('/inventory', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_id,
        p.name,
        p.stock_quantity,
        p.reorder_level,
        c.name as category,
        b.name as brand
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      ORDER BY p.stock_quantity ASC
    `);

    // Create the report content
    const reportContent = rows.map(product => ({
      productId: product.product_id,
      name: product.name,
      stock: product.stock_quantity,
      reorderLevel: product.reorder_level,
      category: product.category,
      brand: product.brand,
      status: product.stock_quantity <= product.reorder_level ? 'Low Stock' : 'In Stock'
    }));

    // Send report data
    res.json(reportContent);
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

// Generate financial report
router.get('/financial', async (req, res) => {
  try {
    // Get total sales
    const [salesTotal] = await db.query(`
      SELECT SUM(total) as total_sales
      FROM sales
      WHERE DATE(created_at) = CURDATE()
    `);

    // Get payment method breakdown
    const [paymentMethods] = await db.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as total
      FROM sales
      WHERE DATE(created_at) = CURDATE()
      GROUP BY payment_method
    `);

    // Get top selling products
    const [topProducts] = await db.query(`
      SELECT 
        p.name,
        COUNT(*) as sales_count,
        SUM(s.total) as revenue
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.product_id
      WHERE DATE(s.created_at) = CURDATE()
      GROUP BY p.product_id
      ORDER BY sales_count DESC
      LIMIT 5
    `);

    // Create the report content
    const reportContent = {
      dailySales: salesTotal[0].total_sales || 0,
      paymentBreakdown: paymentMethods,
      topProducts: topProducts
    };

    // Send report data
    res.json(reportContent);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

module.exports = router;