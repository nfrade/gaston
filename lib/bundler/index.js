var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , promise = require('Promise')
  , browserify = require('browserify')
  , less = require('less');

var styleRegExp = /\/.+\.less$/;

var Bundler = module.exports = {
  Watcher: undefined,
  env: undefined,
  building: undefined,
  dirPath: undefined,
  compilerPromise: undefined,
  cssFilesToCompile: [],
  cssToCompile: [],
  compiledCSS: [],

  setup: function(options){
    options = options || {};
    Bundler.env = Bundler.env || options.env || 'dev'; // ['dev', 'prod']
    Bundler.building = options.building,
    Bundler.injectPackage = Bundler.injectPackage || options.injectPackage,
    Bundler.Watcher = Bundler.Watcher || options.Watcher;
    Bundler.dirPath = options.path;
    var jsCompiler = options.jsCompiler || 'browserify';
    var cssCompiler = options.cssCompiler || 'less';
    Bundler.jsCompiler = require('./compilers/' + jsCompiler);
    Bundler.cssCompiler = require('./compilers/' + cssCompiler);
    Bundler.jsCompiler.setup(Bundler);
    Bundler.cssCompiler.setup(Bundler);
  },

  compile: function(){
    Bundler.cssToCompile = [];
    Bundler.cssFilesToCompile = [];
    var promise = Bundler.jsCompiler.compile()
      .then( function(){
        return Bundler.cssCompiler.compile(Bundler.cssToCompile);
      } )
      .then( Bundler.writeCssToBundle )
      .then(function(){
        log.info('bundler', 'compilation process finished successfully');
        log.info('', '-----------------------------------------------------------');
      }).catch(function(err){
        log.err('bundler', err)
      });
    return promise;
  },

  writeCssToBundle: function(cssToWrite){
    return new Promise(function(fulfill, reject){
      var bundleName = Bundler.building? 'build.css' : 'bundle.css';
      var bundlePath = path.join(Bundler.dirPath, bundleName);
      var wStream = fs.createWriteStream(bundlePath);
      wStream.on('close', function(){
        log.info('bundler', 'css compiled successfully');
        fulfill();
      });
      wStream.write(cssToWrite);
      wStream.close();
    });
  },

  addLessFile: function(cssObj){ //console.log(cssObj.path);
    if( Bundler.cssFilesToCompile.indexOf(cssObj.path) === -1 ){
      Bundler.cssFilesToCompile.push(cssObj.path);
      Bundler.cssToCompile.unshift(cssObj);
    }
  },

  destroy: function(){
    Bundler.env = null;
    Bundler.dirPath = null;
    Bundler.cssToCompile = '';
    log.info('bundler', 'destroyed');
  }
};
