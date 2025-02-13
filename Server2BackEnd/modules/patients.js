const url = require('url')
const fs = require('fs')
const Database = require('./database');

class Patients {

  constructor() {
    this.dictionary = []
    this.reqCount = 0
    this.messages = JSON.parse(fs.readFileSync('./lang/en/messages.json'))

    this.adminDB = new Database(true); // Pass `true` to use the admin user
    this.userDB = new Database(false); // Use the default user
  }

  async init() {
    try {
      await this.adminDB.connect(); // Ensure DB connection is established
      await this.adminDB.ensureTableExists(); // Ensure table is created if it doesn't exist
      await this.adminDB.close(); // Close the connection
      await this.userDB.connect(); // Ensure DB connection is established
      console.log('Patients class initialized successfully!');
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  closeConnection() {
    this.userDB.close();
  }


  handleRequest = (req, res) => {
    if (req.method === "GET")
      return this.handleGet(req, res)
    if (req.method === "POST")
      return this.handlePost(req, res)
  }

  handleGet = (req, res) => {
    try {
      const urlParts = url.parse(req.url)
      const params = new URLSearchParams(urlParts.query)
      const sqlQuery = params.get('sqlQuery')
      const response = {}

      if (sqlQuery === null) {
        response.error = this.messages.missingSqlQuery
        return this.sendResponse(res, 404, JSON.stringify(response))
      }

      this.init();
      response = this.executeQuery(sqlQuery);
      this.closeConnection();
      return this.sendResponse(res, 200, JSON.stringify(response))
    } catch (err) {
      const response = {}
      response.error = this.messages.serverError + err
      return this.sendResponse(res, 500, JSON.stringify(response))
    }
  }

  handlePost = (req, res) => {
    try {
      const urlParts = url.parse(req.url)
      const params = new URLSearchParams(urlParts.query)
      const sqlQuery = params.get('sqlQuery')
      const response = {}

      if (sqlQuery === null) {
        response.error = this.messages.missingSqlQuery
        return this.sendResponse(res, 404, JSON.stringify(response))
      }

      this.init();
      response = this.executeQuery(sqlQuery);
      this.closeConnection();
      
      return this.sendResponse(res, 200, JSON.stringify(response))
    } catch (err) {
      const response = {}
      response.error = this.messages.serverError + err
      return this.sendResponse(res, 500, JSON.stringify(response))
    }
  }

  sendResponse = (res, status, message) => {
    res.writeHead(status, {
      'access-control-allow-methods': 'GET, POST',
      'Access-Control-Allow-Origin': '*',
      'content-type': "application/json"
    })
    res.write(message)
    res.end()
  }

  executeQuery = (sqlQuery) => {
    for (let i = 0; i < this.dictionary.length; i++) {
      if (this.dictionary[i].sqlQuery === sqlQuery)
        return this.dictionary[i]
    }
    return null
  }

}

module.exports = Patients