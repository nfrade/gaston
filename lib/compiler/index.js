var log = require('npmlog')
  , fs = require('graceful-fs')
  , browserify = require('browserify')
  , less = require('less');

var Compiler = module.exports = {
  env: undefined,
  dirPath: undefined,
  bOptions: undefined,
  bCompiler: undefined,

  init: function(dirPath, env){
    this.env = env || 'dev'; // ['dev', 'prod']
    this.dirPath = dirPath;
    this.setUpBrowserify();
  },

  setUpBrowserify: function(){
    this.bOptions = {
      debug: (this.env === 'dev'),
      cache: {}, 
      packageCache: {}, 
      fullPaths: false,
    }
    this.bCompiler = browserify( this.dirPath + 'index.js', this.bOptions )
  },

  compile: function(){
    this.compileJS();
    this.compileLess();
  },

  compileJS: function(fileName, isNewFile){
    log.info('compiling JS');
    var filePath = this.dirPath + (this.env === 'dev'? 'bundle.js' : 'bundle.min.js');
    var wStream = fs.createWriteStream( filePath, {encoding: 'utf8'} );
    var b = this.bCompiler.bundle();
    b.pipe(wStream);
    wStream.on( 'close', function(){ log.info('JS compiled successfully'); } )
  }, 

  compileLess: function(fileName, isNewFile){
    log.info('compiling CSS (not implemented yet)');
  }, 

  destroy: function(){
    this.env = null;
    this.dirPath = null;
    this.bOptions = null;
    this.bCompiler = null;
  }
};

//[TODO] implement Caching for when whatching
// * when a file is changed, test if replacing the contents inside the bundle
//   is faster than compiling the whole thing
//   * this goes for browserify and less