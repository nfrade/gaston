var log = require('npmlog')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , writeFile = denodeify( fs.writeFile )
  , readFile = denodeify( fs.readFile )
  , path = require('path')
  , promise = require('Promise')
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
      jsStream.on('error', errorHandler);
      var cssStream = Bundler.streams[cssPath] = new Stream.Readable();
      cssStream.on('error', errorHandler);
      cssStream._read = function noop() {};
      jsStream.on('end', onEndHandler);

      if(config.isBuilding){
        var jsWriteStream = fs.createWriteStream(jsPath);
        jsStream.pipe(jsWriteStream);
      }

      function onEndHandler(){
        log.info('bundler', 'JS compiled successfully');

        if(config.isBuilding){
          return readFile( jsPath, 'utf8' )
            .then(function(data){
              log.info('bundler', 'uglifying JS');
              var uglified = uglify.minify( data, {fromString: true} );
              writeFile( jsBuildPath, uglified.code, 'utf8')
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
                  return writeFile(cssBuildPath, minifiedCss, 'utf8');
                })
                .then(function(){
                  log.info('bundler', cssBuildPath.replace(Bundler.dirPath + '/', ''), 'written successfully');
                  log.info('bundler', 'build process finished successfully');
                  log.info('', '-----------------------------------------------------------');
                  Watcher.destroy();
                  fulfill();
                });
            });
        } else {
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
        }
      };
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
