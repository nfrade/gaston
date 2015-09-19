#!/usr/bin/env node
var log = require('npmlog')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , daemon = require('../lib/daemon')
  , config = require('../config/gaston.json')
  , chokidar = require('chokidar')
  , configPath = path.join(__dirname, '../config/gaston.json');

daemon.start( config )
  .then( onStarted )
  .catch( onError );

function onStarted(){
  log.info('gaston', 'gaston running as a daemon on port', daemon.port);
};

function onError(err){
  log.error('gaston', err);
}