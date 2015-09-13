"use strict";

var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , gaston = require('../../')
  , info = require('./info')
  , configPath = path.join(__dirname, '../../../config.json')

var restart = module.exports = function restart(args){
  return fs.readJSONAsync(configPath)
    .then(gaston.restart)
    .then(info)
    .catch(function(err){
      log.error('gaston', 'error restarting', err);
    });
};