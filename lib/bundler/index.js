var log = require('npmlog')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , writeFile = denodeify( fs.writeFile )
  , path = require('path')
  , promise = require('Promise')
  , Stream = require('stream')
  , browserify = require('browserify')
  , less = require('less')
  , config = require('../config')
  , backtrackFile = require('../utils/backtrack-file')
  , SocketServer = require('../server/socket-server')
  , blessify = require('blessify')
  , Watcher;

var Bundler = module.exports = {
  building: undefined,
  dirPath: undefined,
  compilerPromise: undefined,
  cssFileMappings: {},
  streams: {},

  setup: function(options){
    Watcher = Watcher || require('./watcher');
    options = options || {};
    Bundler.dirPath = options.path || Bundler.dirPath;
    Bundler.jsCompiler = require('./compilers/' + config.jsCompiler);
    Bundler.jsCompiler.setup(Bundler);
  },

  compile: function(){
    var cssPath = path.join(Bundler.dirPath, 'bundle.css'); 
    var rStream = Bundler.streams[cssPath] = new Stream.Readable();
    rStream._read = function noop() {};
    return Bundler.compilerPromise = Bundler.jsCompiler.compile()
      .then(function(){
        return blessify.render()
          .then(function(output){
            rStream.push(output.css);
            rStream.push(null);
          });
      })
      .then(function(){
          log.info('browserify', 'css compiled successfully');
      })
      .then(function(){
        log.info('bundler', 'compilation process finished successfully');
        log.info('', '-----------------------------------------------------------');
      })
      .catch( function(err){
        errorHandler(err);
        throw err; 
      });
  },

  destroy: function(){
    Bundler.dirPath = null;
    Bundler.cssFileMappings = [];
  }
};

var errorHandler = function(err){
  log.error('bundler', err);
  SocketServer.broadcast('server-message', { type: 'error', message: err.message} );
};
