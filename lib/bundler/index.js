var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('bluebird')
  , Stream = require('stream')
  , browserify = require('browserify')
  , uglify = require('uglify-js2')
  , less = require('less')
  , cssmin = require('cssmin')
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
      var cssPath = path.join(Bundler.dirPath, config.bundle, 'bundle.css');
      var jsPath = path.join(Bundler.dirPath, config.bundle, 'bundle.js');
      var jsBuildPath = path.join(Bundler.dirPath, config.build, 'build.js');
      var cssBuildPath = path.join(Bundler.dirPath, config.build, 'build.css');
      log.info('bundler', 'compiling JS');
      var jsStream = Bundler.streams[jsPath] = Bundler.jsCompiler.compile();
      jsStream.on('error', reject);
      var cssStream = Bundler.streams[cssPath] = new Stream.Readable();
      cssStream._read = function noop() {};
      if(!config.isBuilding){
        jsStream.on('end', onEndBundleHandler);
      }

      if(config.isBuilding){
        var jsWriteStream = fs.createWriteStream(jsPath);
        jsWriteStream.on('close', onEndBuildHandler);
        jsStream.pipe(jsWriteStream);
      }

      function onEndBundleHandler(){
        log.info('bundler', 'JS compiled successfully');

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
          })
          .catch(reject);
      };

      function onEndBuildHandler(){
        return fs.readFileAsync( jsPath, 'utf8' )
          .then(function(data){
            log.info('bundler', 'uglifying JS');
            var uglified = uglify.minify( data, {fromString: true} );
            fs.writeFileAsync( jsBuildPath, uglified.code, 'utf8')
              .then(function(){
                log.info('bundler', jsBuildPath.replace(Bundler.dirPath + '/', ''), 'written successfully');
                log.info('bundler', 'compiling CSS');
              })
              .then( blessify.render )
              .then(function(output){
                log.info('bundler', 'CSS compiled successfully');
                log.info('bundler', 'minifying CSS');
                return cssmin(output.css);
              })
              .then(function(minifiedCss){
                return fs.writeFileAsync(cssBuildPath, minifiedCss, 'utf8');
              })
              .then(function(){
                log.info('bundler', cssBuildPath.replace(Bundler.dirPath + '/', ''), 'written successfully');
                log.info('bundler', 'build process finished successfully');
                log.info('', '-----------------------------------------------------------');
                fulfill();
              });
          });
      }
    })
    .catch( errorHandler );
  },
  
  destroy: function(){
    Bundler.dirPath = null;
    Bundler.cssFileMappings = [];
  }
};

var errorHandler = function(err){
  if(err.stream){
    delete err.stream;
  }
  console.log(err);
  SocketServer.broadcast('server-message', { type: 'error', message: err.message} );
};
