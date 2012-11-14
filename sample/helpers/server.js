var http = require('http');
var util = require('util');

function request(req, res) {
  var store = this.store;
  var id = parseInt(req.url.substring(1), 10);

  switch (req.method) {
    case 'GET':
      var body;
      if (isNaN(id)) {
          body = store;
      } else {
        body = store[id];
      }

      if (!body) {
        res.writeHead(404);
        res.end();
      } else {
        var buffer = new Buffer(JSON.stringify(body));
        res.writeHead(200, {
          'content-type': 'application/json',
          'content-length': buffer.length
        });
        res.end(buffer);
      }
      break;

    case 'POST':
      var inBuffer = '';
      req.setEncoding('utf8');
      req.on('data', function(data){
        inBuffer += data;
      });
      req.on('end', function() {
        var body = JSON.parse(inBuffer);
        body.id = store.length;
        store.push(body);

        var outBuffer = new Buffer(JSON.stringify(body));
        res.writeHead(201, {
          'content-type': 'application/json',
          'content-length': outBuffer.length,
          'location': '/' + body.id
        });
        res.end(outBuffer);
      });
      break;

    case 'DELETE':
      if (store[id]) {
        delete store[id];
        res.writeHead(200);
      } else {
        res.writeHead(404);
      }
      res.end();
      break;
  }
}

function Server() {
  http.Server.call(this);

  this.store = [];
  this.on('request', request.bind(this));
}

util.inherits(Server, http.Server);

module.exports = Server;