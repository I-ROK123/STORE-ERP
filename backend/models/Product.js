// models/Product.js
const db = require('../utils/db');

class Product {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM products');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(productData) {
    const { name, price, stock, category_id, brand_id } = productData;
    try {
      const [result] = await db.query(
        'INSERT INTO products (name, price, stock, category_id, brand_id) VALUES (?, ?, ?, ?, ?)',
        [name, price, stock, category_id, brand_id]
      );
      return this.getById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async update(id, productData) {
    const { name, price, stock, category_id, brand_id } = productData;
    try {
      const [result] = await db.query(
        'UPDATE products SET name = ?, price = ?, stock = ?, category_id = ?, brand_id = ? WHERE id = ?',
        [name, price, stock, category_id, brand_id, id]
      );
      if (result.affectedRows === 0) return null;
      return this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateStock(id, quantity) {
    try {
      const [result] = await db.query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [quantity, id]
      );
      if (result.affectedRows === 0) return null;
      return this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  // Additional methods for dashboard
  static async getLowStockProducts(threshold = 10) {
    try {
      const [rows] = await db.query('SELECT * FROM products WHERE stock <= ?', [threshold]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getTotalProducts() {
    try {
      const [rows] = await db.query('SELECT COUNT(*) as total FROM products');
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;