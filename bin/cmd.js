#!/usr/bin/env node

console.log('WUT');
var sys = require('sys')
var exec = require('child_process').exec;
var child;

// executes `pwd`
child = exec("gulp compile-js", function (error, stdout, stderr) {
  sys.print('stdout: ' + stdout);
  sys.print('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
})
