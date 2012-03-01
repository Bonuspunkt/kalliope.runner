var http = require('http');
var test = require('tap').test;
var runner = require('../lib/runner');

test('overall test', function(t) {
  var server = http.createServer(function(req, res) {
    t.equal(req.url, '/', 'correct url');
    t.equal(req.method, 'POST', 'correct method');
    t.equal(req.headers.cookie, 'nom', 'nom header is present');

    req.on('data', function(data) {
      var expected = new Buffer('píng');
      var length = parseInt(req.headers['content-length'], 10);
      t.equal(length, expected.length);
      //t.equal(data.toString(), expected.toString());
    });
    req.on('end', function() {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end('pöng');
    });
  });
  server.listen(41000);

  process.nextTick(function() {
    var tests = [{
      name: 'test',
      definition: {
        request: {
          host: '127.0.0.1',
          port: 41000,

          path: '/',
          method: 'POST',
          headers: {
            'content-type': 'text/plain'
          },
          data: 'píng'
        }
      },
      processRequest: function(request, stage) {
        request.headers.cookie = 'nom';
      },
      processResponse: function(response, stage) {
        stage.equal(response.statusCode, 200);
        stage.equal(response.data, 'pöng');
      }
    }];

    runner.run(tests, function(result) {
      server.close();
      t.ok(result.success, 'test worked');

      var logMsg = result.log.filter(function(msg) { return msg.type === 'log'; });
      t.equal(logMsg.length, 2, 'correct msgCount');
      t.deepEqual(logMsg[0].message, [ 'started', 'test' ]);
      t.deepEqual(logMsg[1].message, [ 'finished', 'test' ]);

      var asserts = result.log.filter(function(msg) { return msg.type === 'assert'; });
      t.equal(logMsg.length, 2, 'correct assertCount');

      t.equal(asserts[0].method, 'equal');
      t.deepEqual(asserts[0].args, [200, 200]);
      
      t.equal(asserts[1].method, 'equal');
      t.deepEqual(asserts[1].args, ['pöng', 'pöng']);

      t.end();
    });

  });
  
});