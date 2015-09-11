#!/usr/bin/env node
var log = require('npmlog')
  , minimist = require('minimist')
  , args = minimist( process.argv )
  , daemon = require('../lib/daemon')
  , config = require('../config.json');

daemon.start( config )
  .then(function(){
    log.info('gaston', 'gaston running as a daemon on port', daemon.port);
  });