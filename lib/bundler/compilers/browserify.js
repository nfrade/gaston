var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , _ = require('lodash')
  , Promise = require('bluebird')
  , browserify = require('browserify')
  , stripify = require('stripify')
  , watchify = require('watchify')
  , Watcher = require('../../server/watcher')
  , backtrackFile = require('../../utils/backtrack-file')
  , repo = require('../../utils/repo')
  , blessify = require('blessify')
  , aliasify = require('aliasify')
  , config = require('../../config')
  , Bundler;

var Compiler = module.exports = {
  options: undefined,
  browserify: undefined,

  setup: function(bundler){
    Bundler = bundler;
    Compiler.options = {
      debug: true,
      cache: {}, 
      packageCache: {}, 
      fullPaths: true,
      noParse: []
    };
  }, 

  compile: function(){
    Compiler.browserify = browserify( path.join(Bundler.dirPath, 'index.js'), Compiler.options );
    
    Compiler.browserify.transform(blessify, {
      global: true, 
      appName: config.pkg.name,
      basePath: config.basePath
    });

    setSelfAlias();

    var ignoresTransform = require('./ignores-transform');
    
    Compiler.browserify.transform( ignoresTransform, { global: true } );

    var transforms = config.gaston['browserify-transforms'] || [];
    for(var i = 0, len = transforms.length; i < len; i++){
      var options = _.extend({global: true, branch: config.branch}, transforms[i].options);
      var tPath = path.join(config.basePath, 'node_modules', transforms[i].path);
      Compiler.browserify.transform( require(tPath), options );
    }

    if(config.isBuilding){
      Compiler.browserify.transform(stripify, {replacement: 'void(0)', global: true} );
    }

    if(!config.noPackage){
      Compiler.browserify.require( path.join(config.basePath, 'package.json'), { expose: 'package.json' } );
    }

    if(!config.isBulding && !Watcher.watchify){
      Watcher.watchify = watchify(Compiler.browserify);
    }

    if(Watcher.watchify){
      return Watcher.watchify.bundle();
    } else { 
      return Compiler.browserify.bundle();
    }
  }

};

var setSelfAlias = function(){
  var aliases = {};
  var requirePaths = config.gaston['require-paths']
  if(requirePaths){
    aliases = _.extend(aliases, requirePaths, function(v, o){
      return path.join(config.basePath, o);
    });
  }
  aliases[config.pkg.name] = config.basePath;
  aliases['~'] = config.basePath;

  Compiler.browserify.transform(aliasify, {
    aliases: aliases,
    verbose: false
  });
};
