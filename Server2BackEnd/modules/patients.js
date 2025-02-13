const url = require('url');
const fs = require('fs');
const Database = require('./database');

class Patients {

  constructor() {
    this.reqCount = 0;
    this.messages = JSON.parse(fs.readFileSync('./lang/en/messages.json'));

    this.adminDB = new Database(true); // Pass `true` to use the admin user
    this.userDB = new Database(false); // Use the default user
  }

  // Async method to initialize both admin and user DBs
  async init() {
    try {
      // Wait for adminDB and userDB connections to be established
      await this.adminDB.connect();
      await this.adminDB.ensureTableExists();
      await this.adminDB.close();
      await this.userDB.connect();

      console.log('Patients class initialized successfully!');
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  closeConnection() {
    this.userDB.close();
  }

  handleRequest = async (req, res) => {
    if (req.method === "GET")
      return this.handleGet(req, res);
    if (req.method === "POST")
      return this.handlePost(req, res);
  };


  // Handle GET requests
  async handleGet(req, res) {
    try {
      const urlParts = url.parse(req.url);
      const params = new URLSearchParams(urlParts.query);
      const sqlQuery = params.get('sqlQuery');
      const response = {};

      if (sqlQuery === null) {
        response.error = this.messages.missingSqlQuery;
        return this.sendResponse(res, 404, JSON.stringify(response));
      }

      await this.init(); // Ensure DB is initialized before executing query
      response.result = await this.executeQuery(sqlQuery); // Ensure query is awaited 
      this.closeConnection();
      return this.sendResponse(res, 200, JSON.stringify(response));
    } catch (err) {
      const response = {};
      response.error = this.messages.serverError + err;
      return this.sendResponse(res, 500, JSON.stringify(response));
    }
  }

  // Handle POST requests
  async handlePost(req, res) {
    try {
      const urlParts = url.parse(req.url);
      const params = new URLSearchParams(urlParts.query);
      const sqlQuery = params.get('sqlQuery');
      const response = {};

      if (sqlQuery === null) {
        response.error = this.messages.missingSqlQuery;
        return this.sendResponse(res, 404, JSON.stringify(response));
      }

      await this.init(); // Ensure DB is initialized before executing query
      response.result = await this.executeQuery(sqlQuery); // Ensure query is awaited
      this.closeConnection();
      return this.sendResponse(res, 200, JSON.stringify(response));
    } catch (err) {
      const response = {};
      response.error = this.messages.serverError + err;
      return this.sendResponse(res, 500, JSON.stringify(response));
    }
  }

  sendResponse(res, status, message) {
    res.writeHead(status, {
      'access-control-allow-methods': 'GET, POST',
      'Access-Control-Allow-Origin': '*',
      'content-type': "application/json"
    });
    res.write(message);
    res.end();
  }

  async executeQuery(sqlQuery) {
    try {
      const results = await this.userDB.query(sqlQuery);
      return results;
    } catch (err) {
      console.error('Error executing query:', err);
      return err;
    }
  }
}

module.exports = Patients;
