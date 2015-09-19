var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , restart = require('./restart')
  , restore = require('./restore')
  , info = require('./info')
  , gaston = require('../..')

var restart = module.exports = function restart(args){
  return gaston.restart()
    .then(info)
    .catch(function(err){
      log.error('gaston', err);
      return restore();
    });
};