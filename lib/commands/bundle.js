var gaston = require('../gaston')

module.exports = function(){
  return gaston.bundle()
    .then(function(){
      process.exit(0);
    });
}