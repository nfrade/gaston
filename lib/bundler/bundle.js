var path = require('path')
  , _ = require('lodash')
  , browserify = require('browserify')
  , watchify = require('watchify')

var bundle = module.exports = function bundle(options){
  return new Promise(function(resolve, reject){

    var bOptions = {
      debug: options.sourceMaps,
      cache: {}, 
      packageCache: {}, 
      fullPaths: true,
      noParse: []
    };
    
    var b;
    if(options.gaston){
      var gastonPath = path.join(__dirname, '..', 'browser', 'gaston.js'); 
      b = browserify( gastonPath, bOptions );
      b.require( options.source, { expose: 'index.js' } );
      var testerPath = path.join(__dirname, '..', 'browser', 'tester.js');
      b.require( testerPath, { expose: 'gaston-tester' } );

      b.transform( require('./transforms/gaston-browser') );
    } else {
      b = browserify( options.source, bOptions );
    }

    b.transform( require('./transforms/ignores') );

    var pkgPath = options.package || path.join(__dirname, '..', 'browser', 'dummy.json');
    console.log( pkgPath, require('fs').existsSync(pkgPath) );
    b.require( pkgPath , { expose: 'package.json' } );

    var bundle = b.bundle(function(err, buff){
      console.log('finished bundle');
      var jsCode = buff.toString();
      console.log(jsCode.length)
      resolve({
        js: jsCode
      });
    });

    bundle.on('data', function(){
      console.log('data')
    });

    // b.on('file', function(file){
    //   console.log(file);
    // });



    // resolve({
    //   js: 'js bundle code',
    //   css: 'css bundle code',
    //   sourceMaps: 'source maps code',
    //   smaps: 'smaps object'
    // });
  });
};