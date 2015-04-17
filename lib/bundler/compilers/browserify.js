var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('promise')
  , browserify = require('browserify')
  , Bundler;

var Compiler = module.exports = {
  options: undefined,
  compiler: undefined,

  setup: function(bundler){
    Bundler = bundler;
    Compiler.options = {
      debug: (Compiler.env === 'dev'),
      cache: {}, 
      packageCache: {}, 
      fullPaths: false,
    }
    Compiler.compiler = browserify( path.join(Bundler.dirPath, 'index.js'), Compiler.options );
    
    var noLessTransform = require('./no-less-transform')(Bundler);
    Compiler.compiler.transform(noLessTransform);
  }, 

  compile: function(){
    return new Promise(function(fulfill, reject){
      log.info('browserify', 'compiling JS');
      var fileName = Bundler.env === 'dev'? 'bundle.js' : 'bundle.min.js';
      var filePath = Bundler.dirPath + fileName;
      var wStream = fs.createWriteStream( filePath, {encoding: 'utf8'} );
      var b = Compiler.compiler.bundle();

      b.on('error', function(err){
        log.error('browserify', err);
        reject(err);
      });

      var rStream = fs.createReadStream(filePath);
      Bundler.Watcher.activeStreams[filePath] = b;

      b.pipe(wStream);
      wStream.on( 'close', function(){ 
        log.info('browserify', 'JS compiled successfully');
        fulfill();
      } );
    });
  }, 

  destroy: function(){

  }
}