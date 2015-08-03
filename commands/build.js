var gaston = require('./lib/gaston');

var build = module.exports = function(){
  return gaston.build()
    .then(function(){
      process.exit(0);
    });
};