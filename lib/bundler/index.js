var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , _ = require('lodash')
  , Promise = require('bluebird')
  , through = require('through2')
  , Stream = require('stream')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , exorcist = require('exorcist')
  , uglify = require('uglify-js')
  , less = require('less')
  , cssmin = require('cssmin')
  , config = require('../config')
  , backtrackFile = require('../utils/backtrack-file')
  , Watcher = require('./watcher')
  , SocketServer = require('../server/socket-server')
  , browserify = require('browserify')
  , wathify = require('watchify')
  , smapify = require('smapify')
  , blessify = require('blessify')
  , bundlesPath = path.join(config.basePath, 'bundles')
  , gastonPath = path.join(__dirname, '..', 'browser', 'gaston.js')
  , bOptions = {
    debug: true,
    cache: {}, 
    packageCache: {}, 
    fullPaths: true,
    noParse: []
  },
  bConfig = config.gaston.browserify || {};

var watchifies = {};


var Bundler = module.exports = {
  bundle: function(dirPath, action){
    action = action || 'dev';
    var bundleFileName = '_' + dirPath.replace(config.basePath, '').replace(/\//g, '_') + action;
    var jsPath = path.join( bundlesPath, bundleFileName + '.js' );
    var cssPath = path.join( bundlesPath, bundleFileName + '.css');

    return new Promise(function(fulfill, reject){
      var jsStream = fs.createWriteStream(jsPath);
      jsStream.on('close', fulfill);

      if(watchifies[dirPath]){
        return watchifies[dirPath].bundle()
          .pipe( jsStream );
      }

      var b = browserify(gastonPath, bOptions);
      applyTransformsAndRequires(b, dirPath, action);

      var bundle = b.bundle();
      bundle.on('error', function(err){
        console.log('bundling', err.stack);
        reject();
      });

      watchifies[dirPath] = watchify(b);
      
      bundle.pipe( jsStream );
    })
    .then(function(){
      blessify.render(dirPath)
        .then(function(output){
          Watcher.updateWatchers( dirPath, blessify );
          return fs.writeFileAsync(cssPath, output.css, 'utf8');
        });
    })
    .catch(function(err){ console.log('forDev', err.stack)});
  },

  forBuild: function(dirPath){

  }
};

var applyTransformsAndRequires = function applyTransforms(b, dirPath, action){
  b.transform( blessify, getBlessifyOptions(dirPath) );
  b.transform( require('./gaston-browser-transform') );
  b.require( path.join(dirPath, 'index.js'), {
    expose: 'index.js'
  });
  b.require( path.join(__dirname, '../browser/tester'), {
    expose: 'gaston-tester'
  });

  b.transform(require('./ignores-transform'), {
    global: true
  });

  var transforms = bOptions.transforms || [];
  for(var i = 0, len = transforms.length; i < len; i++){
    var options = _.extend({
      global: false, 
      branch: config.branch
    }, transforms[i].options);
    var tPath = path.join(config.basePath, 'node_modules', transforms[i].path);
    var transform = require(tPath);
    b.transform( transform, options );
  }

  if(!config.noPackage){
    b.require(path.join(config.basePath, 'package.json'), { 
      expose: 'package.json' 
    });
  }
};


var getBlessifyOptions = function(dirPath){
  var lOptions = (config.gaston.less && config.gaston.less.options) || {};
  return _.extend({
    global: true, 
    appName: config.pkg.name,
    basePath: config.basePath,
    dirPath: dirPath.replace(config.basePath, '/')
  }, lOptions);
};


var BundlerOld = {
  isBuilding: undefined,
  testing: undefined,
  dirPath: undefined,
  cssFileMappings: {},
  streams: {},

  setup: function(options){
    options = options || {};
    Bundler.isBuilding = options.isBuilding;
    Bundler.isTesting = options.isTesting;
    Bundler.dirPath = options.path || Bundler.dirPath;
    Bundler.jsCompiler = require('./compilers/' + config.jsCompiler);
    Bundler.jsCompiler.setup(Bundler);
  },

  compile: function(){
    return new Promise(function(fulfill, reject){
      var cssPath = path.join(Bundler.dirPath, 'bundle.css');
      var jsPath = path.join(Bundler.dirPath, 'bundle.js');
      var sourcemapPath = path.join(Bundler.dirPath, 'bundle.js.map')
      var jsBuildPath = path.join(Bundler.dirPath, 'build.js');
      var cssBuildPath = path.join(Bundler.dirPath, 'build.css');
      log.info('bundler', 'compiling');
      var jsStream = Bundler.streams[jsPath] = Bundler.jsCompiler.compile();
      jsStream.on('error', reject);
      var cssStream = Bundler.streams[cssPath] = new Stream.Readable();
      cssStream._read = function noop() {};

      var jsWriteStream = fs.createWriteStream(jsPath);

      smapify(Bundler.dirPath + path.sep);
      if(config.gaston['remote-logging']){
        jsStream.on('data', smapify.buildMaps);
      }


      jsWriteStream.on( 'close', Bundler.isBuilding? onEndBuildHandler : onEndBundleHandler );

      jsStream
        .pipe( exorcist(sourcemapPath) )
        .pipe( jsWriteStream );

      function onEndBundleHandler(){
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
