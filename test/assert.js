var test = require('tap').test;
var Logger = require('../lib/logger');
var asserts = require('../lib/asserts');

test('assert.ok', function(t) {
  t.plan(9);

  var logger =  new Logger();
  var assert = asserts(logger);
  logger.once('log', function(logEntry) {
    t.equal(logEntry.type, 'assert');
    t.equal(logEntry.method, 'ok');
    t.equal(logEntry.ok, true);
    t.deepEqual(logEntry.args, [true]);
  });
  assert.ok(true);

  try {
    logger.once('log', function(logEntry) {
      t.equal(logEntry.type, 'assert');
      t.equal(logEntry.method, 'ok');
      t.equal(logEntry.ok, false);
      t.deepEqual(logEntry.args, [false]);
    });
    assert.ok(false);
  } catch(e) {
    t.equal(e.name, 'AssertionError');
  }
  t.end();
});

// are other methods also relevant for testing?