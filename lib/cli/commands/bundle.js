var gaston = require('../../')

var bundle = module.exports = function bundle(args){
  var options = {
    source: args.s || args.source || path.join( process.cwd(), 'index.js' ),
    gaston: args.g || args.gaston || false
  };

  return gaston.bundle(options);
};