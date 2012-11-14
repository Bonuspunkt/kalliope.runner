var assert = require('assert');

function applyAssert(logger) {
  var asserts = {};
  Object.keys(assert)
    .filter(function(key) { return key[0] === key[0].toLowerCase(); })
    .forEach(function(key) {

      asserts[key] = function() {
        var args = Array.prototype.slice.call(arguments);
        var isOk = true;

        try {
          assert[key].apply(assert, args);
        } catch (e) {
          isOk = false;
          throw e;
        } finally {
          logger.logRaw({
            type: 'assert',
            ok: isOk,
            method: key,
            args: args
          });
        }
      };
    });

  return asserts;
}

module.exports = applyAssert;