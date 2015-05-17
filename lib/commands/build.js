var gaston = require('../gaston');

var build = module.exports = function(){
  return gaston.build()
    .then(function(){
      process.exit(0);
    });
};