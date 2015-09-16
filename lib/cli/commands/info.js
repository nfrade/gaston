var log = require('npmlog')
  , gaston = require('../../')

var info = module.exports = function info(args){
  return gaston.info()
    .then( print );
};

function print(info){
  var keys = Object.keys(info);
  for(var i = 0, l = keys.length; i < l; i++){
    var key = keys[i];
    log.info(key, info[key]);
  }
};

module.exports.print = print;