var http = require('http');
var test = require('tap').test;
var Runner = require('../lib/runner');

var port = 40001;
var serverHits = 0;

var server = http.createServer(function(req, res){
  serverHits++;
  res.writeHead(200, {
    'content-length': 1,
    'content-type': 'text/plain'
  });
  res.end('!')
});
server.listen(port);

process.nextTick(function() {
  
  test('overall', function(t){
    t.plan(6);

    var step = 0;
    var testList = {
      postPrepairRequest: function(request) {
        step++;
        t.equal(step, 2);
      },
      preProcessResponse: function(response) {
          step++;
          t.equal(step, 3)
      },
      tests: [{
        name: 'first',
        definition: { port: port },
        prepairRequest: function(request, assert, logger) {
          step++;
          t.equal(step, 1)
        },
        processResponse: function(response, assert, logger) {
          step++;
          t.equal(step, 4)
        }
      }]
    };

    var log = [];
    var runner = new Runner(testList);
    runner.logger.on('log', function(logEntry) { log.push(logEntry); })
    runner.run(function(err) {
      t.notOk(err);

      // TODO: analyse log
      t.equal(serverHits, 1);
      server.close();
      t.end();
    });
  });
});

test('connection refused calls callback', function(t) {

  var testList = {
    tests: [{
      name: 'query localhost',
      prepairRequest: function(request) {
        // port is reserved according to wikipedia
        request.port = 0;
      },
      processResponse: function(response) {
        t.ok(false, 'process response should not be reached');
      }
    }]
  };
  new Runner(testList).run(function(err) {
    t.ok(err, 'error must be present');
    t.end();
  })
});