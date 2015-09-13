"use strict";

var log = require('npmlog')
  , gaston = require('../../')
  , config = require('../../../config.json')
  , info = require('./info')

var restart = module.exports = function restart(args){
  return gaston.restart(config)
    .then(info)
    .then()
    .catch(function(err){
      log.error('gaston', 'error restarting', err);
    });
};