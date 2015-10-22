"use strict";

var log = require('npmlog')
var gaston = require('../../')

module.exports = function info (args) {
  return gaston.info()
    .then(print)
}

function print (info) {
  var keys = Object.keys(info)
  for (let i = 0, l = keys.length; i < l; i++) {
    let key = keys[i]
    log.info(key, info[key])
  }
}

module.exports.print = print
