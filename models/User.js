const { pool } = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, employee_id, name, email, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(userData) {
    const { employee_id, name, email, password, role } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (employee_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [employee_id, name, email, password, role || 'packer']
    );
    return result.insertId;
  }

  static async getAllUsers() {
    const [rows] = await pool.execute(
      'SELECT id, employee_id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }
}

module.exports = User;