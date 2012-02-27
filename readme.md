# kalliope.runner
very simple straight forward testrunner, specially targeting testing REST api server
## installation
if you planing on using the cli, install globally (`-g`)

    npm install https://github.com/Bonuspunkt/kalliope.runner/tarball/master

### example setup
#### test.js
    module.exports = [{
      name: 'test',
      definition: require('./def/login'),
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

# (un)licence
    This is free and unencumbered software released into the public domain.

    Anyone is free to copy, modify, publish, use, compile, sell, or
    distribute this software, either in source code form or as a compiled
    binary, for any purpose, commercial or non-commercial, and by any
    means.

    In jurisdictions that recognize copyright laws, the author or authors
    of this software dedicate any and all copyright interest in the
    software to the public domain. We make this dedication for the benefit
    of the public at large and to the detriment of our heirs and
    successors. We intend this dedication to be an overt act of
    relinquishment in perpetuity of all present and future rights to this
    software under copyright law.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
    OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
    ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

    For more information, please refer to <http://unlicense.org/>