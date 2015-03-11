#!/usr/bin/env node
var gaston = require('./gaston')
  , path = require('path')
  , program = require('commander')
  , nocss
  , entry
program
  .version('0.0.1')
  .option('-p, --port [nb], -port:[nb]', 'Port number on which to run the server [8080]', '8080')
  .option('-d, --debug', 'Debug')
  .option('-c, --close', 'Close')
  .option('-b, --build', 'Build')
  .option('-C, --no-css', 'CSS')
  .option('-f, --branch <name>', 'Branch [dev]', 'dev')
  .option('-a, --act <name>', 'Just perform an action and quit', /^(bundle|build)$/i)
  .parse(process.argv)

nocss = !program.css

// console.log('port', program.port)
// console.log('debug', program.debug)
// console.log('close', program.close)
// console.log('build', program.build)
// console.log('nocss', nocss)
if (program.act === true) {
  throw new Error("Invalid option `act`. Must be 'bundle' or 'build'")
} else if (program.act) {
  switch (program.act) {
    case 'bundle':
      entry = path.join(process.cwd(), 'index.js')
      gaston.bundle(entry
          , {
            branch: program.branch
          }
          , function (err) {
        if (err) {
          console.error('Error bundling index.js', err)
        } else {
          console.log("SUCCESS")
        }
      })
      break;
    case 'build':
      break;
    default:
      throw new Error("Impossible")
      break;
  }
} else {
  gaston(program.port, program.close, program.debug, program.build, nocss, program.branch)
}