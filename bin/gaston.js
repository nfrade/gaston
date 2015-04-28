#!/usr/bin/env node

var program = require('commander')

program
  .version('0.5.0')
  .command('dev', 'run development environment')
  .command('build', 'build target')
  .parse(process.argv);




