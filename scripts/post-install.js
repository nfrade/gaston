#!/usr/bin/env node

var log = require('npmlog')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , configPath = path.join(__dirname, '..', 'config.json');

fs.editJSONAsync( configPath, editJSON, { space: 4 } )
  .then(function(){
    log.info('gaston', 'config[\'base-path\'] set to your home directory');
  })

function editJSON(obj){
  obj['base-path'] = process.env.HOME || process.env.USERPROFILE;
  return obj;
}