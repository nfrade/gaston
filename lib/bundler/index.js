var log = require('npmlog')
  , fs = require('graceful-fs')
  , browserify = require('browserify')
  , less = require('less');

var Bundler = module.exports = {
  env: undefined,
  dirPath: undefined,

  setup: function(options){
    Bundler.env = options.env || 'prod'; // ['dev', 'prod']
    Bundler.dirPath = options.path;
    var jsCompiler = options.jsCompiler || 'browserify';
    var cssCompiler = options.cssCompiler || 'less';
    Bundler.jsCompiler = require('./compilers/' + jsCompiler);
    Bundler.cssCompiler = require('./compilers/' + cssCompiler);
    Bundler.jsCompiler.setup(Bundler);
    Bundler.cssCompiler.setup(Bundler);
  },

  compile: function(){ console.log('bundler->compile')
    Bundler.jsCompiler.compile();
  },

  compileJS: function(fileName, isNewFile){
    log.info('compiling JS');
    var filePath = Bundler.dirPath + (Bundler.env === 'dev'? 'bundle.js' : 'bundle.min.js');
    var wStream = fs.createWriteStream( filePath, {encoding: 'utf8'} );
    var b = Bundler.bCompiler.bundle();
    b.pipe(wStream);
    wStream.on( 'close', function(){ log.info('JS compiled successfully'); } )
  }, 

  compileLess: function(fileName, isNewFile){
    log.info('compiling CSS (not implemented yet)');
  }, 

  destroy: function(){
    Bundler.env = null;
    Bundler.dirPath = null;
  }
};

//[TODO] implement Caching for when whatching
// * when a file is changed, test if replacing the contents inside the bundle
//   is faster than compiling the whole thing
//   * this goes for browserify and less