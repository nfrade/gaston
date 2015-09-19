#!/usr/bin/env node

var log = require('npmlog')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , configPath = path.join(__dirname, '..', 'config/gaston.json')
  , initialConfig = {
    "http-port": 8080,
    "api-port": 64571,
    "base-path": process.env.HOME || process.env.USERPROFILE
  };

fs.existsAsync( configPath )
  .then(function(exists){
    if(!exists){
      fs.writeJSONAsync( configPath, initialConfig, { space: 2, mkdirp: true } );
    }
  });