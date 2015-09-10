var path = require('path')
  , gaston = require('../../')

var bundle = module.exports = function bundle(args){
  var options = {
    source: args.s || args.source || path.join( process.cwd(), 'index.js' ),
    gaston: args.g || args.gaston || false
  };

  console.log(options);

  return gaston.bundle(options);
};