#!/usr/bin/env node
var gaston = require('./gaston')
  , program = require('commander')
  , nocss

program
  .version('0.0.1')
  .option('-p, --port [nb], -port:[nb]', 'Port number on which to run the server [8080]', '8080')
  .option('-d, --debug', 'Debug')
  .option('-c, --close', 'Close')
  .option('-b, --build', 'Build')
  .option('-C, --no-css', 'CSS')
  .parse(process.argv)

nocss = !program.css

// console.log('port', program.port)
// console.log('debug', program.debug)
// console.log('close', program.close)
// console.log('build', program.build)
// console.log('nocss', nocss)
gaston(program.port, program.close, program.debug, program.build, nocss)