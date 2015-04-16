var log = require('npmlog')
  , fs = require('graceful-fs')
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
    Compiler.compiler = browserify( Bundler.dirPath + 'index.js', Compiler.options );
    
    var noLessTransform = require('./no-less-transform')(Compiler);
    Compiler.compiler.transform(noLessTransform);
  }, 

  compile: function(){
    log.info('compiling JS');
    var filePath = Bundler.dirPath + (Bundler.env === 'dev'? 'bundle.js' : 'bundle.min.js');
    var wStream = fs.createWriteStream( filePath, {encoding: 'utf8'} );
    var b = Compiler.compiler.bundle();

    b.on('error', function(err){
      log.error(err);
    });

    b.pipe(wStream);
    wStream.on( 'close', function(){ log.info('JS compiled successfully'); } )
  }, 

  destroy: function(){

  }
}