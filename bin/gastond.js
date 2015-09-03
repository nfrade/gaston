#!/usr/bin/env node
var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , api = require('../daemon/api')
  , config = require('../config.json')
  , infoDescriptor
  , errorDescriptor;

fs.openAsync( path.join(__dirname, '..', 'logs', 'info.log'), 'w' )
  .then(function(fd){
    infoDescriptor = fd;
    return fs.openAsync( path.join(__dirname, '..', 'logs', 'error.log'), 'w' )
  })
  .then(function(fd){
    errorDescriptor = fd;
  })
  .then(function(){
    // require('daemon')({
    //   stdout: infoDescriptor,
    //   stderr: errorDescriptor 
    // });
    
    require('../daemon');
  });

log.info('gaston', 'is now running as a daemon');

