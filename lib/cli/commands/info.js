"use strict";

var log = require('npmlog')
  , gaston = require('../../')

var info = module.exports = function info(args){
  return gaston.info()
    .then(function(info){
      var keys = Object.keys(info);
      for(let i = 0, l = keys.length; i < l; i++){
        var key = keys[i];
        log.info(key, info[key]);
      }
    });
};