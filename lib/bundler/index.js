var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , promise = require('Promise')
  , browserify = require('browserify')
  , less = require('less')
  , config = require('../config')
  , backtrackFile = require('../utils/backtrack-file')
  , Watcher;

var Bundler = module.exports = {
  building: undefined,
  dirPath: undefined,
  compilerPromise: undefined,
  cssFileMappings: {},

  setup: function(options){
    Watcher = Watcher || require('./watcher');
    options = options || {};
    Bundler.isBuilding = options.isBuilding;
    Bundler.dirPath = options.path;
    Bundler.jsCompiler = require('./compilers/' + config.jsCompiler);
    Bundler.cssCompiler = require('./compilers/' + config.cssCompiler);
    Bundler.jsCompiler.setup(Bundler);
    Bundler.cssCompiler.setup(Bundler);
  },

  compile: function(){
    var promise = Bundler.jsCompiler.compile()
      .then( function(){
        return Bundler.cssCompiler.compile(Bundler.cssFileMappings);
      } )
      .then( Bundler.writeCssToBundle )
      .then(function(){
        log.info('bundler', 'compilation process finished successfully');
        log.info('', '-----------------------------------------------------------');
      });
    return promise;
  },

  writeCssToBundle: function(cssToWrite){
    return new Promise(function(fulfill, reject){
      var bundleName = Bundler.isBuilding? 'build.css' : 'bundle.css';
      var bundlePath = path.join( Bundler.dirPath, bundleName );
      var wStream = fs.createWriteStream(bundlePath);
      wStream.on('close', function(){
        log.info('bundler', 'css compiled successfully');
        fulfill();
      });
      wStream.write(cssToWrite);
      wStream.close();
    });
  },

  addCssObject: function(file, cssObj){
    var mappings = Bundler.cssFileMappings[file];
    mappings = mappings.filter(function(item){
      return item.cssPath !== cssObj.cssPath;
    })
    Bundler.cssFileMappings[file].push( cssObj );
    Watcher.addWatcher(cssObj.cssPath);
  },

  destroy: function(){
    Bundler.dirPath = null;
    Bundler.cssFileMappings = [];
  }
};
