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
    Bundler.jsCompiler.compile()
      .then(function(){
        log.info('bundler', 'compilation process finished successfully')
      }).catch(function(err){
        log.err('bundler', err)
      });
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