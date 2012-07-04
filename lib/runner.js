var http = require('http');
var url = require('url');
var asserts = require('./asserts');
var Logger = require('./logger');

var request, response;

function joinBuffers(bufferStore) {
  var length = bufferStore
    .map(function(b) { return b.length; })
    .reduce(function(previous, current) { return previous + current; }, 0);

  var data = new Buffer(length);
  var startPos = 0;
  bufferStore.forEach(function(buffer){
    buffer.copy(data, startPos);
    startPos += buffer.length;
  });
  return data;
}


function response(test, next, assert, logger, testList, callback) {
  return function(res) {
    // decision: log response start?
    var response = {
      statusCode: res.statusCode,
      headers: res.headers
    };

    var bufferStore = [];
    res.on('data', function(data) { bufferStore.push(data); });
    res.on('end', function() {
      logger.logRaw({
        type: 'socket',
        event: 'end',
        message: test.name
      });

      var data = joinBuffers(bufferStore)
      if (data.length) { response.body = data; }

      if (testList.preProcessResponse) {
        testList.preProcessResponse(response);
      }

      try {
        test.processResponse(response, assert, logger);
      } catch (e) {
        callback(e);
        return;
      }

      logger.logRaw({
        type: 'test',
        event: 'end',
        message: test.name
      });

      next(); 
    });
  };
}

function request(test, next, assert, logger, testList, callback) {
  return function() {

    logger.logRaw({
      type: 'test',
      event: 'start',
      message: test.name
    });

    var request = JSON.parse(JSON.stringify(test.definition || {}));

    try {
      if (test.prepairRequest) {
        test.prepairRequest(request, assert, logger);
      }
    } catch (e) {
      callback(e);
      return;
    }

    if (testList.postPrepairRequest) {
      testList.postPrepairRequest(request);
    }

    var body = request.body;
    if (body) {
      if (Array.isArray(body)) {
        body = body.map(function(element) {
          if (Buffer.isBuffer(element)) {
            return element;
          } 
          return new Buffer(element);
        });
        body = joinBuffers(body);
      } else {
        body = new Buffer(body);
      }
      request.headers['content-length'] = body.length;
    }

    var req = http.request(request);
    if (body) { req.write(body); }

    req.on('socket', function() {
      logger.logRaw({
        type: 'socket',
        event: 'start',
        message: test.name
      });
    });
    req.on('response', response(test, next, assert, logger, testList, callback));
    req.on('error', callback);

    req.end();
  };
}

function Runner(testList) {
  var logger = this.logger = new Logger();

  this.run = function(callback) {
    var assert = asserts(logger);

    testList.tests.reduceRight(function(prev, curr) {
      return request(curr, prev, assert, logger, testList, callback);
    }, function successfullyCompleted(){
      callback(null);
    })();
  };
}

module.exports = Runner;