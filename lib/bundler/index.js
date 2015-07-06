var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('bluebird')
  , through = require('through2')
  , Stream = require('stream')
  , browserify = require('browserify')
  , exorcist = require('exorcist')
  , uglify = require('uglify-js2')
  , less = require('less')
  , cssmin = require('cssmin')
  , config = require('../config')
  , backtrackFile = require('../utils/backtrack-file')
  , SocketServer = require('../server/socket-server')
  , smapify = require('smapify')
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
      var sourcemapPath = path.join(Bundler.dirPath, config.bundle, 'bundle.js.map')
      var jsBuildPath = path.join(Bundler.dirPath, config.build, 'build.js');
      var cssBuildPath = path.join(Bundler.dirPath, config.build, 'build.css');
      log.info('bundler', 'compiling');
      var jsStream = Bundler.streams[jsPath] = Bundler.jsCompiler.compile();
      jsStream.on('error', reject);
      var cssStream = Bundler.streams[cssPath] = new Stream.Readable();
      cssStream._read = function noop() {};

      var jsWriteStream = fs.createWriteStream(jsPath);

      smapify(Bundler.dirPath + path.sep);
      if(config.gaston['remote-logging']){
        jsStream.on('data', smapify.getCode);
      }


      jsWriteStream.on( 'close', config.isBuilding? onEndBuildHandler : onEndBundleHandler );

      if( config.gaston['source-maps'] ){
        jsStream
          .pipe( exorcist(sourcemapPath) )
          .pipe( jsWriteStream );
      } else {
        jsStream
          .pipe( jsWriteStream );
      }

      function onEndBundleHandler(){
        smapify.buildMaps();
        blessify.render()
          .then(function(output){
            return fs.writeFileAsync(cssPath, output.css, 'utf8');
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
            fs.createReadStream( path.join(Bundler.dirPath, 'index.html') )
              .pipe( through(function(buf, enc, next){
                var data = buf.toString('utf8');
                data = data.replace('bundle.css', 'build.css');
                data = data.replace('bundle.js', 'build.js');
                this.push(data);
                next();
              }) )
              .pipe( fs.createWriteStream( path.join(Bundler.dirPath, 'build.html') ) );

            if(Bundler.noMinimize){
              log.info('bundler', 'done');
              return fulfill();
            }

            var uglified = uglify.minify( data, {fromString: true} );
            fs.writeFileAsync( jsBuildPath, uglified.code, 'utf8')
              .then( blessify.render )
              .then(function(output){
                return cssmin(output.css);
              })
              .then(function(minifiedCss){
                return fs.writeFileAsync(cssBuildPath, minifiedCss, 'utf8');
              })
              .then(function(){
                log.info('bundler', 'build process finished successfully');
                log.info('', '-----------------------------------------------------------');
                fulfill();
              });
          });
      }
    })
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
