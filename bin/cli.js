#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var util = require('util');
var Runner = require('../lib/runner');

var filesToLoad = process.argv.splice(2).map(function(file) {
  return path.join(process.cwd(), file);
});

if (!filesToLoad.length) {
  console.log('use:\n  kalliope.runner <file/dir> [file/dir] ...');
  return;
}

function processPath(file, recurse) {
  fs.stat(file, function(err, stats) {
    
    if (stats.isDirectory()) {
      if (!recurse) { return; }
      fs.readdir(file, function(err, dirFiles) {
         dirFiles.forEach(function(dirFile) {
            processPath(path.join(file, dirFile), !recurse);
         });
      });
    }

    if (stats.isFile()) {
      var testList = require(file);
      var runner = new Runner(testList);
      runner.logger.on('log', function(logEntry){
        console.log(logEntry);
      });
      runner.run(function(err) {
        if (err) { throw err; }
      });
    }
  });
}

filesToLoad.forEach(function(file) {
  processPath(file, true);
});