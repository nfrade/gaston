#!/usr/bin/env node

var log = require('npmlog')
  , gaston = require('../lib/');

gaston.start( {}, function(){ 
  log.info('gaston started successfully'); 
} );