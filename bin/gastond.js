#!/usr/bin/env node

global.Config = require('../lib/config');

var log = require('npmlog')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , daemon = require('../lib/daemon');

Config.init()
  .then( daemon.start )
  .then( onStarted )
  .catch( onError );

function onStarted(){
  log.info('gaston', 'gaston running as a daemon on port', daemon.port);
};

function onError(err){
  log.error('gaston', err);
}