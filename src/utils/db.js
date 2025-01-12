import mysql from 'mysql2/promise';
const dbConfig = require('../config/db.config');

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(error => {
    console.error('Database connection failed:', error);
  });

module.exports = pool;

const createDBConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'app_user',
      password: 'secure_password',
      database: 'store_erp'
    });
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export default createDBConnection;