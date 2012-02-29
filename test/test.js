var http = require('http');
var test = require('tap').test;
var runner = require('../lib/runner');

test('integral test', function(t) {
  var server = http.createServer(function(req, res) {
    t.equal(req.url, '/', 'correct url');
    t.equal(req.method, 'POST', 'correct method');
    t.equal(req.headers.cookie, 'nom', 'nom header is present');

    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('pong');
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
          data: 'ping'
        }
      },
      processRequest: function(request, stage) {
        request.headers.cookie = 'nom';
      },
      processResponse: function(response, stage) {
        stage.equal(response.statusCode, 200);
        stage.equal(response.data, 'pong');
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
      t.deepEqual(asserts[1].args, ['pong', 'pong']);

      t.end();
    });

  });
  
});


test('fail test', function(t) {
  var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('pong');
  });
  server.listen(41001);



  process.nextTick(function() {
    var tests = [{
      name: 'test',
      definition: {
        request: {
          host: '127.0.0.1',
          port: 41001,

          path: '/',
          method: 'GET'
        }
      },
      processResponse: function(response, stage) {
        stage.equal(response.statusCode, 300);
        stage.equal(response.data, 'derp');
      }
    },{
      name: 'test should not be run',
      definition: {
        request: {
          host: '127.0.0.1',
          port: 41001,

          path: '/',
          method: 'GET'
        }
      },
      processRequest: function(request, stage) {
      },
      processResponse: function(response, stage) {
        stage.equal(response.statusCode, 300);
      }
    }];

    runner.run(tests, function(result) {
      server.close();
      t.notOk(result.success, 'test worked');

      var log = result.log;
      t.equal(log.length, 3, 'only 3 log entries');
      t.equal(log[0].type, 'log')

      var assertLog = log[1];
      t.equal(assertLog.type, 'assert');
      t.notOk(assertLog.ok);
      t.equal(assertLog.method, 'equal');
      t.equal(assertLog.args[0], 200);
      t.equal(assertLog.args[1], 300);


      t.equal(log[2].type, 'log')

      t.end();
    });

  });
  
});