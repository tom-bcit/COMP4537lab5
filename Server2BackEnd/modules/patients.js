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
      await this.userDB.connect();
      console.log('Patients class initialized successfully!');
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async closeConnection() {
    await this.userDB.close();
  }

  async handleRequest(req, res) {
    if (req.method === "GET")
      return this.handleGet(req, res);
    if (req.method === "POST")
      return this.handlePost(req, res);
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
      const urlParts = url.parse(req.url);
      const params = new URLSearchParams(urlParts.query);
      const sqlQuery = params.get('sqlQuery');
      const response = {};

      if (sqlQuery === null) {
        response.error = this.messages.missingSqlQuery;
        return this.sendResponse(res, 404, JSON.stringify(response));
      }

      response.result = await this.executeQuery(sqlQuery);
      await this.closeConnection();
      return this.sendResponse(res, 200, JSON.stringify(response));
    } catch (err) {
      const response = { error: this.messages.serverError + err };
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
      return await this.userDB.query(sqlQuery);
    } catch (err) {
      console.error('Error executing query:', err);
      return err;
    }
  }
}

module.exports = Patients;
