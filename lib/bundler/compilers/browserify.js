var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('promise')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , Bundler
  , backtrackFile = require('../../utils/backtrack-file')
  , pkgPath = backtrackFile( 'package.json', process.cwd() )
  , pkgJson = require(pkgPath);

var Compiler = module.exports = {
  options: undefined,
  browserify: undefined,

  setup: function(bundler){
    Bundler = bundler;
    Compiler.options = {
      debug: (Bundler.env === 'dev'),
      cache: {}, 
      packageCache: {}, 
      fullPaths: false
    }
    Compiler.browserify = browserify( path.join(Bundler.dirPath, 'index.js'), Compiler.options );
    
    var noLessTransform = require('./no-less-transform')(Bundler);
    Compiler.browserify.transform( noLessTransform, { global: true } );
  }, 

  compile: function(){
    return new Promise(function(fulfill, reject){
      log.info('browserify', 'compiling JS');
      var fileName = Bundler.env === 'dev'? 'bundle.js' : 'bundle.min.js';
      var filePath = path.join(Bundler.dirPath, fileName);
      var wStream = fs.createWriteStream( filePath, {encoding: 'utf8'} );
      wStream.write('window.package = ' + JSON.stringify(pkgJson) + ';');
      var b = Compiler.browserify.bundle();
      if(!Compiler.watchify){
        Compiler.watchify = watchify(Compiler.browserify);
      }

      b.on('error', function(err){
        log.error('browserify', err);
        reject(err);
      });

      var rStream = fs.createReadStream(filePath);

      b.pipe(wStream);
      wStream.on( 'close', function(){ 
        log.info('browserify', 'JS compiled successfully');
        fulfill();
      } );
    })
      .catch(function(err){
        log.error('browserify', err);
      });
  }, 

  destroy: function(){

  }
}