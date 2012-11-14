var test = require('tap').test;
var Logger = require('../lib/logger');

test('test error', function(t) {
  t.plan(3);

  var logger = new Logger();
  var message = 'FATALITY';

  logger.on('log', function(logEntry) {
    t.equal(logEntry.type, 'log');
    t.equal(logEntry.level, 'error');
    t.equal(logEntry.message[0], message);
  });
  logger.error(message);

  t.end();
});

test('test warn', function(t) {
  t.plan(3);

  var logger = new Logger();
  var message = 'warning';
  logger.on('log', function(logEntry) {
    t.equal(logEntry.type, 'log');
    t.equal(logEntry.level, 'warn');
    t.equal(logEntry.message[0], message);
  });
  logger.warn(message);

  t.end();
});

test('test info', function(t) {
  t.plan(3);

  var logger = new Logger();
  var message = 'this isn´t really important';
  logger.once('log', function(logEntry) {
    t.equal(logEntry.type, 'log');
    t.equal(logEntry.level, 'info');
    t.equal(logEntry.message[0], message);
  });
  logger.info(message);

  t.end();
});

test('test trace', function(t) {
  t.plan(3);

  var logger = new Logger();
  var message = 'this is to fill your screen with random text';
  logger.once('log', function(logEntry) {
    t.equal(logEntry.type, 'log');
    t.equal(logEntry.level, 'trace');
    t.equal(logEntry.message[0], message);
  });
  logger.trace(message);

  t.end();
});

test('test logRaw', function(t) {
  t.plan(5);

  var logger = new Logger();
  var logEntry = {
    type: 'assert',
    method: 'equal',
    ok: false,
    args: [200, 300]
  };
  logger.on('log', function(log) {
    t.ok(log.stamp, 'log stamp present');
    t.equal(log.type, logEntry.type);
    t.equal(log.method, logEntry.method);
    t.equal(log.ok, logEntry.ok),
    t.deepEqual(log.args, logEntry.args);
  });
  logger.logRaw(logEntry);
});