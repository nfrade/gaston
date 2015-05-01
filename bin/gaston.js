#!/usr/bin/env node
var program = require('commander');

if (process.argv.indexOf('dev') === -1 && process.argv.indexOf('build') === -1) {
  process.argv.push('dev');
}

program
  .version('0.5.0')
  .command('dev', 'run development environment')
  .command('build', 'build target')
  .parse(process.argv);
