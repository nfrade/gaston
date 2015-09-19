#!/usr/bin/env node
var os = require('os')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , homedir = process.env.USERPROFILE || process.env.HOME
  , configPath = path.join(homedir, '.gaston', 'config/gaston.json')
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