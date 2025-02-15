const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor(isAdmin = false) {
    this.config = {
      host: process.env.DB_HOST,
      user: isAdmin ? process.env.DB_ADMIN_USER : process.env.DB_USER_USER,
      password: isAdmin ? process.env.DB_ADMIN_PASSWORD : process.env.DB_USER_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT
    };
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log('Connected to MySQL as', this.connection.config.user);
    } catch (err) {
      console.error('Error connecting to MySQL:', err);
      throw err;
    }
  }

  async query(sql, params = []) {
    if (!this.connection) throw new Error('Database not connected.');
    const [results] = await this.connection.execute(sql, params);
    return results;
  }

  async ensureTableExists() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dateOfBirth DATE NOT NULL
      )
    `;
    try {
      await this.query(createTableQuery);
      console.log('Table "patients" checked/created successfully.');
    } catch (err) {
      console.error('Error ensuring table exists:', err);
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('MySQL connection closed.');
    }
  }
}

module.exports = Database;
