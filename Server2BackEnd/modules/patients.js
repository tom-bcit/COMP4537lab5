const url = require('url');
const fs = require('fs');
const Database = require('./database');

class Patients {

  constructor() {
    this.reqCount = 0;
    this.messages = JSON.parse(fs.readFileSync('./lang/en/messages.json'));

    this.adminDB = new Database(true);
    this.userDB = new Database(false);
  }

  async init() {
    try {
      await this.adminDB.connect();
      await this.adminDB.ensureTableExists();
      await this.adminDB.close();
      console.log('Patients class initialized successfully!');
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async openConnection() {
    await this.userDB.connect();
  }

  async closeConnection() {
    await this.userDB.close();
  }

  async handleRequest(req, res) {
    if (req.method === "OPTIONS") {
      return this.handleOptions(res);
    }
    if (req.method === "GET") {
      return this.handleGet(req, res);
    }
    if (req.method === "POST") {
      return this.handlePost(req, res);
    }
  }

  handleOptions(res) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end();
  }

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
      await this.openConnection();
      response.result = await this.executeQuery(sqlQuery);
      await this.closeConnection();
      return this.sendResponse(res, 200, JSON.stringify(response));
    } catch (err) {
      const response = { error: this.messages.serverError + err };
      return this.sendResponse(res, 500, JSON.stringify(response));
    }
  }

  async handlePost(req, res) {
    try {
      let body = '';
  
      // Read the request body
      req.on('data', chunk => {
        body += chunk.toString();
      });
  
      req.on('end', async () => {
        try {
          // Parse JSON data
          const parsedBody = JSON.parse(body);
          const { query } = parsedBody;
  
          if (!query) {
            return this.sendResponse(res, 400, JSON.stringify({ error: this.messages.missingSqlQuery }));
          }
  
          // Open database connection, execute query, and return result
          await this.openConnection();
          const result = await this.executeQuery(query);
          await this.closeConnection();
  
          return this.sendResponse(res, 200, JSON.stringify({ result }));
        } catch (jsonError) {
          return this.sendResponse(res, 400, JSON.stringify({ error: "Invalid JSON format" }));
        }
      });
    } catch (err) {
      return this.sendResponse(res, 500, JSON.stringify({ error: this.messages.serverError + err }));
    }
  }
  

  sendResponse(res, status, message) {
    res.writeHead(status, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': "application/json"
    });
    res.write(message);
    res.end();
  }
  

  async executeQuery(sqlQuery) {
    try {
      return await this.userDB.query(sqlQuery);
    } catch (err) {
      console.error('Error executing query:', err);
      return err;
    }
  }
}

module.exports = Patients;
