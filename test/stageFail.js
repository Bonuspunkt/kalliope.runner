var http = require('http');
var test = require('tap').test;
var runner = require('../lib/runner');

test('fail test', function(t) {
  var server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end();
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
      t.equal(log[0].type, 'log');

      var assertLog = log[1];
      t.equal(assertLog.type, 'assert');
      t.notOk(assertLog.ok);
      t.equal(assertLog.method, 'equal');
      t.equal(assertLog.args[0], 200);
      t.equal(assertLog.args[1], 300);


      t.equal(log[2].type, 'log');

      t.end();
    });
  });
});