#!/usr/bin/env node
var program = require('commander'),
  pkg = require('../package.json');

if (process.argv.indexOf('dev') === -1 && process.argv.indexOf('build') === -1) {
  process.argv.push('dev');
}

program
  .version(pkg.version)
  .command('init', 'bootstrap a project')
  .command('dev', 'run development environment')
  .command('build', 'build target')
  .parse(process.argv);
