#!/usr/bin/env node
var path = require('path');
var runner = require('../lib/runner');

var filesToLoad = process.argv.splice(2).map(function(file) {
  return path.combine(process.cwd(), file);
});

if (!filesToLoad.length) {
  console.log('use:\n  runner <file/dir> [file/dir] ...');
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
      runner(require(file), console.log);
    }
  });
}

filesToLoad.forEach(processPath);
