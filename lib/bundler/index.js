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
  , blessify = require('blessify');

var Bundler = module.exports = {
  building: undefined,
  dirPath: undefined,
  cssFileMappings: {},
  streams: {},

  setup: function(options){
    options = options || {};
    Bundler.dirPath = options.path || Bundler.dirPath;
    Bundler.jsCompiler = require('./compilers/' + config.jsCompiler);
    Bundler.jsCompiler.setup(Bundler);
  },

  compile: function(){
    return new Promise(function(fulfill, reject){
      var cssPath = path.join(Bundler.dirPath, 'bundle.css');
      var jsPath = path.join(Bundler.dirPath, 'bundle.js');
      var jsStream = Bundler.streams[jsPath] = Bundler.jsCompiler.compile();
      jsStream.on('end', onEndHandler);
      var cssStream = Bundler.streams[cssPath] = new Stream.Readable();
      cssStream._read = function noop() {};

      function onEndHandler(){
        blessify.render()
          .then(function(output){
            cssStream.push(output.css);
            cssStream.push(null);
            log.info('browserify', 'css compiled successfully');
          })
          .then(function(){
            log.info('bundler', 'compilation process finished successfully');
            log.info('', '-----------------------------------------------------------');
            fulfill(blessify);
          });
      };      

      cssStream.on('error', errorHandler);
      jsStream.on('error', errorHandler);
    })
    .catch( errorHandler );
  },

  uglify: function(source, target){
    source = source || path.join(Bundler.dirPath, 'bundle.js');
    target = target || path.join(Bundler.dirPath, 'build.js');
    var uglified = uglify.minify(source);

    return writeFile(target, uglified.code, 'utf8');
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
