var events = require('events');
var util = require('util');

function log(level) {
  var args = Array.prototype.slice.call(arguments, 1);
  var now = new Date().toISOString();

  this.emit('log', {
    stamp: now, 
    type: 'log', 
    level: level,
    message: args 
  });
}

function logRaw(logEntry) {
  var now = new Date().toISOString();

  logEntry.stamp = now;
  logEntry.type = logEntry.type || 'log';

  this.emit('log', logEntry);
}

function Logger() {
  events.EventEmitter.call(this);

  this.error = log.bind(this, 'error');
  this.warn = log.bind(this, 'warn');
  this.info = log.bind(this, 'info');
  this.trace = log.bind(this, 'trace');

  this.logRaw = logRaw.bind(this);
}

util.inherits(Logger, events.EventEmitter);

module.exports = Logger;