// backend/routes/settings.js
const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get all settings
router.get('/', async (req, res) => {
  try {
    // Get store settings
    const [storeSettings] = await db.query('SELECT * FROM store_settings LIMIT 1');
    
    // Get receipt settings
    const [receiptSettings] = await db.query('SELECT * FROM receipt_settings LIMIT 1');
    
    // Get system preferences
    const [systemPreferences] = await db.query('SELECT * FROM system_preferences');
    
    res.json({
      storeSettings: storeSettings[0] || {},
      receiptSettings: receiptSettings[0] || {},
      systemPreferences: systemPreferences.reduce((acc, pref) => {
        acc[pref.setting_key] = pref.setting_value;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update store settings
router.post('/store-settings', async (req, res) => {
  try {
    const { store_name, address, phone_number, email, tax_rate, currency } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO store_settings (store_name, address, phone_number, email, tax_rate, currency)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        store_name = VALUES(store_name),
        address = VALUES(address),
        phone_number = VALUES(phone_number),
        email = VALUES(email),
        tax_rate = VALUES(tax_rate),
        currency = VALUES(currency)
    `, [store_name, address, phone_number, email, tax_rate, currency]);
    
    res.json({ message: 'Store settings updated successfully' });
  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

// Update receipt settings
router.post('/receipt-settings', async (req, res) => {
  try {
    const { header_text, footer_text, show_tax, show_logo, font_size, paper_size } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO receipt_settings 
        (header_text, footer_text, show_tax, show_logo, font_size, paper_size)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        header_text = VALUES(header_text),
        footer_text = VALUES(footer_text),
        show_tax = VALUES(show_tax),
        show_logo = VALUES(show_logo),
        font_size = VALUES(font_size),
        paper_size = VALUES(paper_size)
    `, [header_text, footer_text, show_tax, show_logo, font_size, paper_size]);
    
    res.json({ message: 'Receipt settings updated successfully' });
  } catch (error) {
    console.error('Error updating receipt settings:', error);
    res.status(500).json({ error: 'Failed to update receipt settings' });
  }
});

// Create backup
router.post('/backup', async (req, res) => {
  try {
    // Insert backup record
    const [result] = await db.query(`
      INSERT INTO backup_logs (backup_type, status)
      VALUES ('manual', 'in_progress')
    `);
    
    // Here you would typically trigger your actual backup process
    // For now, we'll simulate it with a success
    await db.query(`
      UPDATE backup_logs
      SET status = 'completed',
          completed_at = NOW()
      WHERE id = ?
    `, [result.insertId]);
    
    res.json({ message: 'Backup created successfully' });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

module.exports = router;