var log = require('npmlog')
  , denodeify = require('denodeify')
  , fs = require('graceful-fs')
  , writeFile = denodeify( fs.writeFile )
  , path = require('path')
  , _ = require('lodash')
  , Promise = require('promise')
  , browserify = require('browserify')
  , stripify = require('stripify')
  , watchify = require('watchify')
  , uglify = require('uglify-js')
  , Watcher = require('../watcher')
  , backtrackFile = require('../../utils/backtrack-file')
  , repo = require('../../utils/repo')
  , Inform = require('./inform')
  , blessify = require('./blessify')
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
    var gastonBrowserTransform = require('./gaston-browser-transform');
    
    Compiler.browserify.transform( ignoresTransform, { global: true } );

    if(config.isBuilding){
      Compiler.browserify.transform(stripify, {replacement: 'void(0)', global: true} );
    } else {
      Compiler.browserify.transform( gastonBrowserTransform );
      var browserGastonPath = path.join(__dirname, '../../', 'browser/');
      Compiler.browserify.require( browserGastonPath + 'gaston.js', { expose: 'gaston' } );
      Compiler.browserify.require( browserGastonPath + 'user-agent.js', { expose: 'user-agent' } );
    }

    var promise =  new Promise(function(fulfill, reject){
      log.info('browserify', 'compiling JS');
      var fileName = 'bundle.js';
      var filePath = path.join(Bundler.dirPath, config.bundle, fileName);
      var wStream = fs.createWriteStream( filePath, {encoding: 'utf8'} );
      wStream.on('close', function(){ 
        log.info('browserify', 'JS compiled successfully');
        if(config.isBuilding){
          log.info('browserify', 'uglifying JS');
          Compiler.uglify()
            .then(function(){
              log.info('browserify', 'JS minified to build.js');
              fulfill();
            })
            .catch(function(err){
              reject(err);
            });
        } else {
          fulfill();
        }
      });

      var b = Compiler.browserify.bundle();

      if(!config.isBulding && !Watcher.watchify){
        Watcher.watchify = watchify(Compiler.browserify);
      }

      b.on('error', function(err){
        reject(err);
      });

      if(config.noPackage){
        b.pipe(wStream);
      } else {
        injectPackageJSON(wStream)
          .then(function(){
            b.pipe(wStream);
          });
      }
    });

    return promise;
  },

  uglify: function(source, target){
    source = source || path.join(Bundler.dirPath, 'bundle.js');
    target = target || path.join(Bundler.dirPath, 'build.js');
    var uglified = uglify.minify(source);

    return writeFile(target, uglified.code, 'utf8');
  }

};

var injectPackageJSON = function(wStream){
  var pkgStream = fs.createReadStream(config.pkgPath);
  return repo.getBranch(config.basePath)
    .then(function(branch){
      //[TODO: this is hackish, has to be fixed before open sourcing]
      if(!config.pkg.vigour){
        wStream.write("window.package=" + JSON.stringify(config.pkg) + ";\n")
      } else {
        var inform = new Inform({ branch: branch });
        log.info('inform', 'branch: ' + branch)
        inform.on('error', function (err) {
          log.error('inform error', err.message);
        });
        return pkgStream
          .pipe(inform)
          .pipe(wStream);
      }    
    })
    .catch(function(err){
      log.error('inject package', err);
    });
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
