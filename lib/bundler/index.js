var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , _ = require('lodash')
  , Promise = require('bluebird')
  , through = require('through2')
  , Stream = require('stream')
  , browserify = require('browserify')
  , aliasify = require('aliasify')
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
  };

var watchifies = {};


var Bundler = module.exports = {
  bundle: function(dirPath, action, fileToCompile){
    action = action || 'dev';
    var bundleFileName = '_' + dirPath.replace(config.basePath, '').replace(/\//g, '_') + action;
    var jsPath = path.join( bundlesPath, bundleFileName + '.js' );
    var cssPath = path.join( bundlesPath, bundleFileName + '.css');

    return new Promise(function(fulfill, reject){
      var jsStream = fs.createWriteStream(jsPath);
      jsStream.on('close', fulfill);

      var b = browserify(gastonPath, bOptions);
      applyTransformsAndRequires(b, dirPath, action, fileToCompile);
      setSelfAlias(b);

      var bundle = b.bundle();
      
      bundle.on('error', reject);

      if( watchifies[dirPath] && watchifies[dirPath][fileToCompile] ){
        return watchifies[dirPath][fileToCompile].bundle()
          .pipe( jsStream );
      }

      watchifies[dirPath] = watchifies[dirPath] || []; 
      watchifies[dirPath][fileToCompile] = watchify(b);
      bundle.pipe( jsStream );
    })
    .then(function(){
      blessify.render(dirPath)
        .then(function(output){
          Watcher.updateWatchers( dirPath, blessify );
          return fs.writeFileAsync(cssPath, output.css, 'utf8');
        });
    });
  },

  build: function(fileToCompile, destination, isBase){
    var dirPath = path.dirname(destination);
    return new Promise(function(fulfill, reject){
      var unminimizedJS = '';
      
      var jsStream = fs.createWriteStream( path.join(destination, 'build.js') );
      jsStream.on('close', fulfill);
      var options = _.clone(bOptions);
      options.debug = false;
      var b = browserify(fileToCompile, options);
      applyTransformsAndRequires(b, dirPath, 'build', fileToCompile);
      setSelfAlias(b);
      var bundle = b.bundle();
      bundle.on('error', reject);
      bundle.on('data', function(buf){
        unminimizedJS += buf.toString('utf8');
      });
      bundle.on('end', function(){
        var uglified = uglify.minify( unminimizedJS, {fromString: true} );
        jsStream.write(uglified.code);
        jsStream.close();
      });
    })
    .then(function(){
      return blessify.render(dirPath)
        .then(function(output){
          var cssPath = path.join(destination, 'build.css')
          fs.writeFileSync(cssPath, output.css, 'utf8');
        });
    });
  }
};

var setSelfAlias = function(b){
  var aliases = {};
  var requirePaths = config.gaston['require-paths']
  if(requirePaths){
    aliases = _.extend(aliases, requirePaths, function(v, o){
      return path.join(config.basePath, o);
    });
  }
  aliases[config.pkg.name] = config.basePath;
  aliases['~'] = config.basePath;

  b.transform(aliasify, {
    aliases: aliases,
    verbose: false
  });
};

var applyTransformsAndRequires = function applyTransforms(b, dirPath, action, fileToCompile){
  action = action || 'dev';
  var blessifyOptions = getBlessifyOptions(dirPath);
  if(action === 'build'){
    blessifyOptions.compress = true;
  }
  b.transform( blessify, blessifyOptions );
  b.transform( require('./gaston-browser-transform') );
  
  if(action === 'dev'){
    var toCompile = path.join(dirPath, fileToCompile);
    b.require(toCompile , {
      expose: 'index.js'
    });
    b.require( path.join(__dirname, '../browser/tester'), {
      expose: 'gaston-tester'
    });
  }

  b.transform(require('./ignores-transform'), {
    global: true
  });

  var transforms = config.gaston.browserify.transforms || [];
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

var errorHandler = function(err){
  if(err.stream){
    delete err.stream;
  }
  console.log(err);
};
