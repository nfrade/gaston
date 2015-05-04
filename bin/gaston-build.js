var log = require('npmlog')
  , fs = require('fs')
  , path = require('path')
  , program = require('commander')
  , builder = require('../lib/builder');
  
program
  .option( '-P, --path [path]', 'run server from path <path> ( default process.cwd() )' )
  .option( '-b, --bump [bump]', 'bump type <bump>: major|minor|revision (revision)')
  .option( '-k, --keepalive [keepalive]', 'keep process running')
  .parse(process.argv);

builder.run()
  .then(function(){
    process.exit(1);
  })
  .catch(function(err){
    log.error('gaston-build', err)
  })

