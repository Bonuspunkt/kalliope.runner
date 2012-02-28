var http = require('http');

function request(test, next, stage) {
  return function() {

    stage.log('started', test.name);

    var options = JSON.parse(JSON.stringify(test.definition.request));

    if (test.processRequest) {
      test.processRequest(options, stage);
    }

    if (options.data) {
      options.headers['content-length'] = options.data.length;
    }

    var data = options.data;
    delete options.data;

    var req = http.request(options);
    if (data) { req.write(data); }

    req.on('response', response(test, next, stage));

    req.end();
  };
}

function response(test, next, stage) {
  return function(res) {
    var response = {
      statusCode: res.statusCode,
      headers: res.headers
    };

    var bufferStore = [];
    res.on('data', function(data) { bufferStore.push(data); });
    res.on('end', function() { 
      
      var length = bufferStore
        .map(function(b) { return b.length; })
        .reduce(function(previous, current) { return previous + current; }, 0);

      var data = new Buffer(length);
      var startPos = 0;
      bufferStore.forEach(function(buffer){
        buffer.copy(data, startPos);
        startPos += buffer.length;
      });
      if (startPos) { response.data = data.toString(); }

      test.processResponse(response, stage);

      stage.log('finished', test.name);

      if (stage.failed) { 
        stage.done();
      } else {
        next(); 
      }
    });
  }  
}

function generateStage(callback) {
  var log = [];
  var stage = {
    failed: false,
    log: function() {
      var args = Array.prototype.slice.call(arguments);
      log.push({
        stamp: new Date().toISOString(), 
        type: 'log', 
        message: args 
      });
    },
    done: function() {
      if (typeof callback === 'function') {
        callback(this.getResult());
      }
    },
    getResult: function() {

      return {
        success: !this.failed,    
        log: log
      };
    }
  };

  var assert = require('assert');
  Object.keys(assert)
    .filter(function(key) { return key[0] === key[0].toLowerCase(); })
    .forEach(function(key) { 
      
      stage[key] = function() {
        var isOk = true;
        try {
          assert[key].apply(assert, arguments);
        } catch (e) {
          isOk = false;
          stage.failed = true;
        }

        var args = Array.prototype.slice.call(arguments);
        log.push({
          stamp: new Date().toISOString(),
          type: 'assert', 
          method: key, 
          ok: isOk, 
          args: args 
        });
      };
    });

  return stage;
}

module.exports = {
  run: function(tests, callback) {
    var stage = generateStage(callback);

    var runStage = tests.reduceRight(function(prev, curr) {
      return request(curr, prev, stage);
    }, function() {
      if (typeof callback === 'function') {
        callback(stage.getResult());
      }
    });

    runStage();
  }
};