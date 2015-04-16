var log = require('npmlog')
  , fs = require('graceful-fs')
  , promise = require('Promise')
  , browserify = require('browserify')
  , less = require('less');

var Bundler = module.exports = {
  env: undefined,
  dirPath: undefined,
  fsWatcher: undefined,
  cssToCompile: '',

  setup: function(options){
    Bundler.env = options.env || 'dev'; // ['dev', 'prod']
    Bundler.Watcher = options.Watcher;
    Bundler.dirPath = options.path;
    var jsCompiler = options.jsCompiler || 'browserify';
    var cssCompiler = options.cssCompiler || 'less';
    Bundler.jsCompiler = require('./compilers/' + jsCompiler);
    Bundler.cssCompiler = require('./compilers/' + cssCompiler);
    Bundler.jsCompiler.setup(Bundler);
    Bundler.cssCompiler.setup(Bundler);
  },

  compile: function(){
    Bundler.jsCompiler.compile()
      .then( Bundler.cssCompiler.compile )
      .then(function(){
        log.info('bundler', 'compilation process finished successfully');
        log.info('', '-----------------------------------------------------------');
      }).catch(function(err){
        log.err('bundler', err)
      });
  },

  addLessFile: function(path){
    return new Promise(function(fulfill, resolve){
      fs.readFile(path, 'utf8', function(err, data){
        if(err){
          log.error('bundler', 'error reading less file', path);
        }
        Bundler.cssToCompile += '/* ['+path+'] */\n';
        Bundler.cssToCompile += data + '\n';
      });
    });
  },

  compileLess: function(fileName, isNewFile){
    log.info('compiling CSS (not implemented yet)');
  }, 

  destroy: function(){
    Bundler.env = null;
    Bundler.dirPath = null;
    Bundler.cssToCompile = '';
  }
};

//[TODO] implement Caching for when whatching
// * when a file is changed, test if replacing the contents inside the bundle
//   is faster than compiling the whole thing
//   * this goes for browserify and less