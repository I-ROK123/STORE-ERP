// routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    console.log('Fetching dashboard metrics...');
    
    // Get daily sales using the correct column name 'total'
    const [dailySales] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as daily_sales 
      FROM sales 
      WHERE DATE(created_at) = CURDATE()
    `);
    console.log('Daily sales:', dailySales[0]);

    // Get total products
    const [totalProducts] = await db.query(`
      SELECT COUNT(*) as total 
      FROM products
    `);
    console.log('Total products:', totalProducts[0]);

    // Get low stock items count
    const [lowStock] = await db.query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE stock_quantity <= reorder_level
    `);
    console.log('Low stock count:', lowStock[0]);

    // Calculate growth (compare current month sales with previous month)
    const [currentMonth] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM sales
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE)
    `);

    const [previousMonth] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM sales
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
    `);

    const growth = previousMonth[0].total === 0 ? 0 : 
      ((currentMonth[0].total - previousMonth[0].total) / previousMonth[0].total) * 100;

    console.log('Growth calculation:', {
      currentMonth: currentMonth[0].total,
      previousMonth: previousMonth[0].total,
      growth
    });

    res.json({
      dailySales: Number(dailySales[0].daily_sales),
      totalProducts: Number(totalProducts[0].total),
      lowStock: Number(lowStock[0].count),
      growth: Number(growth.toFixed(2))
    });
  } catch (error) {
    console.error('Error in /metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Get sales chart data
router.get('/sales-chart', async (req, res) => {
  try {
    console.log('Fetching sales chart data...');
    
    const [salesData] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total), 0) as sales,
        COUNT(*) as transactions,
        payment_method
      FROM sales
      WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
      GROUP BY DATE(created_at), payment_method
      ORDER BY date ASC, payment_method
    `);

    console.log('Sales chart data:', salesData);
    res.json(salesData);
  } catch (error) {
    console.error('Error in /sales-chart:', error);
    res.status(500).json({ error: 'Failed to fetch sales chart data' });
  }
});

// Get stock alerts
router.get('/stock-alerts', async (req, res) => {
  try {
    console.log('Fetching stock alerts...');
    
    const [alerts] = await db.query(`
      SELECT 
        product_id as id,
        name as product,
        stock_quantity as currentStock
      FROM products
      WHERE stock_quantity <= reorder_level
      ORDER BY stock_quantity ASC
      LIMIT 5
    `);

    console.log('Stock alerts:', alerts);
    res.json(alerts);
  } catch (error) {
    console.error('Error in /stock-alerts:', error);
    res.status(500).json({ error: 'Failed to fetch stock alerts' });
  }
});

// Get payment methods summary
router.get('/payment-methods', async (req, res) => {
  try {
    console.log('Fetching payment methods summary...');
    
    const [summary] = await db.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as total_amount
      FROM sales
      WHERE DATE(created_at) = CURDATE()
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `);

    console.log('Payment methods summary:', summary);
    res.json(summary);
  } catch (error) {
    console.error('Error in /payment-methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods summary' });
  }
});

module.exports = router;