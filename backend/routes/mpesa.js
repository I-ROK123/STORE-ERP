// routes/mpesa.js
const express = require('express');
const router = express.Router();
const MpesaService = require('../services/mpesaService');

let mpesaService;

router.setConfig = (config) => {
  mpesaService = new MpesaService(config);
};

router.post('/stkpush', async (req, res) => {
  try {
    console.log('STK Push Request:', req.body);
    let { phoneNumber, amount, orderId } = req.body;
    
    // Validate inputs
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Format phone number - remove any non-digits first
    phoneNumber = phoneNumber.replace(/\D/g, '');
    
    // If number starts with 0, replace with 254
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '254' + phoneNumber.slice(1);
    }
    
    // If number doesn't start with 254, add it
    if (!phoneNumber.startsWith('254')) {
      phoneNumber = '254' + phoneNumber;
    }

    console.log('Formatted Phone Number:', phoneNumber);
    
    if (!mpesaService) {
      console.error('M-Pesa service is not initialized');
      return res.status(500).json({ 
        error: 'M-Pesa service not initialized',
        details: 'Please check server configuration'
      });
    }
    const response = await mpesaService.initiateSTKPush(
      phoneNumber,
      amount,
      orderId
    );

    console.log('M-Pesa Response:', response);
    res.json(response);
  } catch (error) {
    console.error('Payment error:', {
      message: error.message,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Payment initiation failed', 
      details: error.message 
    });
  }
});

module.exports = router;