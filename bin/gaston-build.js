var log = require('npmlog')
  , fs = require('fs')
  , path = require('path')
  , program = require('commander')
  , build = require('../lib/build');
  
program
  .option( '-P, --path [path]', 'run server from path <path> ( default process.cwd() )' )
  .option( '-b, --bump [bump]', 'bump type <bump>: major|minor|revision (revision)')
  .option( '-k, --keepalive [keepalive]', 'keep process running')
  .parse(process.argv);

var options = {

};

build.run(options)

