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
    Bundler.dirPath = options.path || Bundler.dirPath;
    Bundler.jsCompiler = require('./compilers/' + config.jsCompiler);
    Bundler.jsCompiler.setup(Bundler);
  },

  compile: function(){
    return new Promise(function(fulfill, reject){
        Bundler.jsCompiler.compile()
        .then(function(){
          log.info('bundler', 'compilation process finished successfully');
          log.info('', '-----------------------------------------------------------');
          fulfill();
        })
        .catch(function(err){
          log.info('bundler', err.message);
        });
    });
  },

  destroy: function(){
    Bundler.dirPath = null;
    Bundler.cssFileMappings = [];
  }
};
