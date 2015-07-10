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
      debug: config.gaston['source-maps'],
      cache: {}, 
      packageCache: {}, 
      fullPaths: true,
      noParse: []
    };
  }, 

  compile: function(){
    var lOptions = (config.gaston.less && config.gaston.less.options) || {};
    var bOptions = (config.gaston.browserify) || {};
    var blessifyOptions = _.extend({
      global: true, 
      appName: config.pkg.name,
      basePath: config.basePath
    }, lOptions);

    if(!Bundler.isBuilding){
      var gastonPath = path.join(__dirname, '../..', 'browser', 'gaston.js');
      Compiler.browserify = browserify( gastonPath, Compiler.options );
      Compiler.browserify.transform(blessify, blessifyOptions);
      var gastonTransform = require('./gaston-browser-transform');
      Compiler.browserify.transform( gastonTransform );
      Compiler.browserify.require( path.join(Bundler.dirPath, 'index.js'), {expose: 'index.js'} );
      if(Bundler.isTesting){
        Compiler.browserify.require( path.join(__dirname, '../../tester'), { 
          expose: 'tester' 
        });
      }
    } else {
      Compiler.browserify = browserify( path.join(Bundler.dirPath, 'index.js'), Compiler.options );
      Compiler.browserify.transform(blessify, blessifyOptions);
      Compiler.browserify.transform(stripify, {replacement: 'void(0)', global: true} );
    }

    setSelfAlias();

    var ignoresTransform = require('./ignores-transform');
    
    Compiler.browserify.transform( ignoresTransform, { global: true } );

    log.info('gaston', 'current branch:', config.branch);
    var transforms = bOptions.transforms || [];
    for(var i = 0, len = transforms.length; i < len; i++){
      var options = _.extend({global: false, branch: config.branch}, transforms[i].options);
      var tPath = path.join(config.basePath, 'node_modules', transforms[i].path);
      var packageBranchConfig = require(tPath);
      Compiler.browserify.transform( packageBranchConfig, options );
    }

    if(!config.noPackage){
      Compiler.browserify.require( path.join(config.basePath, 'package.json'), { expose: 'package.json' } );
    }

    if(!config.isBulding && !Watcher.watchify){
      Watcher.watchify = watchify(Compiler.browserify);
    }

    if(Watcher.watchify && !Bundler.isBuilding){
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
