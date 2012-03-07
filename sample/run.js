var Runner = require('../lib/runner');
var Server = require('./helpers/server');
var testList = require('./testList');
var settings = require('./settings');

var server = new Server();
server.listen(settings.port, settings.host);

process.nextTick(function() {
  var runner = new Runner(testList);
  runner.logger.on('log', console.log);
  runner.run(function(err) {
    if (err) { throw err; }

    server.close();
  });
});