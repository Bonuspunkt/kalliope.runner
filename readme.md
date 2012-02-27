# kalliope.runner
very simple straight forward testrunner, specially targeting testing REST api server
## installation
if you planing on using the cli, install globally (`-g`)

    npm install kalliope.runner

### example setup
#### test.js
    module.exports = [{
      name: 'test',
      definition: require('def/login'),
      processRequest: function(request, state) {
        var data = {
          name: 'user',
          pass: 'password'
        }
        request.data = JSON.stringify(data);
      },
      processResponse: function(response, stage) {
        var result = JSON.parse(response.data);
        stage.equal(response.statusCode, 200);
      }
    }];
#### def/login.json
    {
      request: { // = http://nodejs.org/docs/latest/api/http.html#http.request options
        host: 'myTestApp',
        port: 2000,
        path: '/login',
        method: 'POST'
      }
    }    
## usage cli
    kalliope.runner <testFiles>
## usage as module
    var runner = require('kalliope.runner');
    var tests = require('./test.js');

    runner.run(tests, function(result) {
      // result = {
      //   success: true/false,
      //   log: [{ type: type, ... }]
      // }
    });
