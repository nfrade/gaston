var gaston = require('../lib/gaston')
  , config;

var build = module.exports = function(cfg){
  config = cfg;
  return gaston.build()
    .then(function(){
      process.exit(0);
    });
};