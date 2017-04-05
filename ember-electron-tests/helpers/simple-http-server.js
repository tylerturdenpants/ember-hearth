const http = require('http');
const Promise = require('bluebird');

class SimpleHTTPServer {
  constructor(callback, port = 0, host = 'localhost') {
    this._port = port;
    this._host = host;
    this.httpServer = http.createServer(function (req, res) {
      callback(req, res);
    });
    this.httpServer.timeout = 4 * 1000;
  }

  port(){
    return this.httpServer.address().port;
  }

  start() {
    this.httpServer.listen(this._port, this._host);
    return new Promise(resolve => {
      this.httpServer.listen(this._port, this._host, () => resolve(this.httpServer));
    });
  }

  stop() {
    return Promise.promisify(this.httpServer.close, {context: this.httpServer});
  }
}

module.exports = SimpleHTTPServer;
