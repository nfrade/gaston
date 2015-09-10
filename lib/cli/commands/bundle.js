var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , gaston = require('../../')

var bundle = module.exports = function bundle(args){
  var cwd = process.cwd();
  var source = args.s || args.source;
  if(source && !~source.indexOf(cwd)){
    source = path.join( cwd, source );
  }

  var pkgPath = args.p || args.package;
  if(pkgPath && !~pkgPath.indexOf(cwd) ){
    pkgPath = path.join( cwd, pkgPath );
  }

  var options = {
    sourceMaps: args.m || args['source-maps'],
    source: source || path.join( process.cwd(), 'index.js' ),
    gaston: args.g || args.gaston || false,
    package: pkgPath
  };

  return gaston.bundle(options)
    .then(function(res){
      console.log('bundle', res.js.length);
    });
};