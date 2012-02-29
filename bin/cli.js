#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var util = require('util');
var runner = require('../lib/runner');

var filesToLoad = process.argv.splice(2).map(function(file) {
  return path.join(process.cwd(), file);
});

if (!filesToLoad.length) {
  console.log('use:\n  kalliope.runner <file/dir> [file/dir] ...');
  return;
}

function processPath(file) {
  fs.stat(file, function(err, stats) {
    
    if (stats.isDirectory()) {
      fs.readdir(file, function(err, dirFiles) {
         dirFiles.forEach(function(dirFile) {
            processPath(path.join(file, dirFile));
         });
      });
    }

    if (stats.isFile()) {
      runner.run(require(file), function(result) {
        console.log(util.inspect(result, false, 3, true));
      });
    }
  });
}

filesToLoad.forEach(processPath);