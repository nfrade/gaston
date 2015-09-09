var log = require('npmlog')
  , gaston = require('../../');

var stop = module.exports = function stop(args){
  return gaston.stop(args);
};