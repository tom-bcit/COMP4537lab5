const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

class Database {
  constructor(isAdmin = false) {
    this.connection = mysql.createConnection({
      host: 'db-mysql-sfo2-03273-do-user-18774309-0.f.db.ondigitalocean.com',
      user: isAdmin ? process.env.DB_ADMIN_USER : process.env.DB_USER_USER,
      password: isAdmin ? process.env.DB_ADMIN_PASSWORD : process.env.DB_USER_PASSWORD,
      database: process.env.DATABASE,
      port: process.env.DB_PORT
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          console.error('Error connecting to MySQL:', err);
          return reject(err);
        }
        console.log('Connected to MySQL as', this.connection.config.user);
        resolve();
      });
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
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
      this.connect();
      await this.query(createTableQuery);
      this.close();
      console.log('Table "patients" checked/created successfully.');
    } catch (err) {
      console.error('Error ensuring table exists:', err);
    }
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) {
          return reject(err);
        }
        console.log('MySQL connection closed.');
        resolve();
      });
    });
  }
}

module.exports = Database;
