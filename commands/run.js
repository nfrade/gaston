var gaston = require('../lib/gaston')
  , config

module.exports = function(cfg){
  config = cfg;
  return gaston.bundle();
}