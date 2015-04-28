var log = require('npmlog')
  , fs = require('fs')
  , path = require('path')
  , program = require('commander')
  , gaston = require('../lib')
  

program
  .option( '-P, --path [path]', 'run server from path <path> ( default process.cwd() )' )
  .option( '-b, --bump [bump]', 'bump type <bump>: major|minor|revision (revision)')
  .parse(process.argv);

var options = {
  port: program.port || 8080,
  path: program.path || process.cwd(),
  building: true,
  bump: program.bump || 'revision'
}

gaston.build(options);
