// backend/config/mpesa.js
const config = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    passkey: process.env.MPESA_PASSKEY,
    shortcode: process.env.MPESA_SHORTCODE, // Your till number
    environment: 'sandbox', // Change to 'production' for live
  };
  
  module.exports = config;