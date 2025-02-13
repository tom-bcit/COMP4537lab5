const http = require('http');
const url = require('url');
const fs = require('fs');
const Patients = require('./modules/patients');

class Server {

    constructor() {
        this.patients = new Patients();
        const messages = JSON.parse(fs.readFileSync('./lang/en/messages.json'));
        this.notFound = messages.notFound;
        this.routes = [
            { pathRegex: /^\/api\/patients\/?$/, action: this.patients.handleRequest.bind(this.patients) }
        ];
    }

    async start() {
        try {
            await this.patients.init();
            http.createServer((req, res) => {
                const urlParts = url.parse(req.url);
                for (let i = 0; i < this.routes.length; i++) {
                    if (this.routes[i].pathRegex.test(urlParts.pathname.toLowerCase())) {
                        return this.routes[i].action(req, res);
                    }
                }
                res.writeHead(404, { 'content-type': 'text/html' });
                res.end(this.notFound);
            }).listen(8080);
            
            console.log('Server listening on port 8080...');
        } catch (err) {
            console.error('Error during server start:', err);
        }
    }
}

const server = new Server();
server.start();