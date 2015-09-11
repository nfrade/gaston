var path = require('path')
  , _ = require('lodash')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , Blessify = require('gaston-blessify')
  , smapify = require('smapify')
  , setAlias = require('./util/set-alias')

var bundle = module.exports = function bundle(options){
  return new Promise(function(resolve, reject){
    var compiledFiles = [];

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

    var blessify = new Blessify(options);
    b.transform( blessify.transform, { global: true } );
    b.transform( require('./transforms/ignores') );



    var pkgPath = options.package || path.join(__dirname, '..', 'browser', 'dummy.json');
    b.require( pkgPath , { expose: 'package.json' } );

    var bundle = b.bundle(function(err, buf){
      if(err){
        return reject(err);
      }

      var jsCode = buf.toString();

      blessify.render()
        .then(function(output){
          resolve({
            js: jsCode,
            css: output.css,
            files: compiledFiles
          });
        });
    });

    bundle.on('data', smapify.buildMaps);

    b.on('file', function(file){
      compiledFiles.push(file);
    });



    // resolve({
    //   js: 'js bundle code',
    //   css: 'css bundle code',
    //   files: 'files compiled, for watch'
    //   sourceMaps: 'source maps code',
    //   smaps: 'smaps object'
    // });
  });
};