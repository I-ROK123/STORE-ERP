// services/mpesaService.js
const axios = require('axios');

class MpesaService {
  constructor(config) {
    console.log('Initializing M-Pesa Service with config:', {
      ...config,
      consumerSecret: '***hidden***' // Hide sensitive data in logs
    });
    
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  formatPhoneNumber(phoneNumber) {
    // Remove any spaces, dashes, or other characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    // Remove country code if present and add 254
    cleaned = cleaned.replace(/^(254|)/, '');
    cleaned = '254' + cleaned;
    
    // Ensure it's exactly 12 digits (254 + 9 digits)
    if (cleaned.length !== 12) {
      throw new Error('Phone number must be 9 digits after country code');
    }
    
    return cleaned;
  }




  async generateToken() {
    try {
      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`
      ).toString('base64');

      console.log('Generating token...');
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      console.log('Token generated successfully');
      return response.data.access_token;
    } catch (error) {
      console.error('Token generation error:', {
        message: error.message,
        response: error.response?.data
      });
      throw new Error(`Failed to generate access token: ${error.message}`);
    }
  }

  async initiateSTKPush(phoneNumber, amount, orderId) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      console.log('Starting STK push with config:', {
        shortcode: this.config.shortcode,
        environment: this.config.environment,
        phone: formattedPhone,
        amount: amount,
        hasConsumerKey: !!this.config.consumerKey,
        hasConsumerSecret: !!this.config.consumerSecret
      });
  
      const token = await this.generateToken();
      console.log('Token generated successfully');
  
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(
        `${this.config.shortcode}${this.config.passkey}${timestamp}`
      ).toString('base64');
  
      const requestBody = {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.config.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: "https://mydomain.com/callback",
        AccountReference: 'StoreERP',
        TransactionDesc: 'Store Purchase'
      };
  
      console.log('Making STK push request:', requestBody);
  
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('STK push response:', response.data);
      return response.data;
    } catch (error) {
      console.error('STK push detailed error:', {
        message: error.message,
        responseData: error.response?.data,
        config: error.config,
        baseUrl: this.baseUrl
      });
      throw error;
    }
  }
}

module.exports = MpesaService;