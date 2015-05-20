var log = require('npmlog')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , _ = require('lodash')
  , readFile = denodeify(fs.readFile)
  , path = require('path')
  , config = require('../config')
  , onFileChange = require('on-file-change')
  , socketServer = require('../server/socket-server')
  , Server = require('../server')
  , Bundler;


var Watcher = module.exports = {
  initialPath: undefined,
  fullPath: undefined,
  watchers: [],
  watchedPaths: [],
  watchify: undefined,
  compiledDir: undefined,
  globalWatcher: undefined,

  launch: function(fullPath){
    Bundler = Bundler || require('./');
    Watcher.compiledDir = fullPath;
    Watcher.killWatchers();
    Bundler.setup({
      path: fullPath,
      Watcher: Watcher
    });

    Bundler.globalWatcher = fs.watch(
      config.basePath, 
      { persistent: true, recursive: true }, 
      watcherHandlerGlobal
    );

    return Bundler.compile();

  },

  addWatcher: function(filePath){
    if(Watcher.watchedPaths.indexOf(filePath) === -1 && !config.isBuilding){
      Watcher.watchedPaths.push(filePath);
      var watcher = fs.watchFile( filePath, { interval: 500 }, watcherHandler(filePath) );
      Watcher.watchers.push(watcher);
    }
  }, 

  killWatchers: function(){
    Bundler.globalWatcher.close();
    Bundler.globalWatcher = null;
    for(var i = 0, len = Watcher.watchedPaths.length; i < len; i++){
      fs.unwatchFile( Watcher.watchedPaths[i] );
    }
    if(Watcher.watchify){
      Watcher.watchify.close();
      Watcher.watchify = null; 
      log.info('watcher', 'closed and killed watchify')
    }
    Watcher.watchers = [];
    Watcher.watchedPaths = [];
    log.info('watcher', 'killed all watchers');
  }
};

var watcherHandlerGlobal = function(changeType, fileName){
  if( changeType !== 'rename' || ~fileName.indexOf('bundle') ){
    return;
  }

  var fullPath = path.join(config.basePath, fileName);
  switch( path.extname(fileName) ){
    case '.js':
      compileJS()
        .then(browserReload)
          .catch(function(err){
            log.error(err.stack);
          });
      break;
  }
};

var watcherHandler = function(fullPath){
  return function(curr, prev){
    log.info('watcher', 'changed', fullPath);

    switch( path.extname(fullPath) ){
      case '.less':
      case '.css':
        var cssObj = findCssObjInMappings(fullPath);
        if(!cssObj){
          return compileCSS()
            .then( browserReload );
        }
        
        return readFile(cssObj.cssPath, 'utf8')
          .then(function(data){
            cssObj.input = data;
          })
          .then( compileCSS )
          .then( browserReload );
          break;
      case '.js':
      case '.json':
        compileJS(fullPath)
          .then(browserReload)
          .catch(function(err){
            log.error(err.stack);
          });
        break;
    }
  }
}

var compileJS = function(fullPath){
  var originalCssFiles = Bundler.cssFileMappings[fullPath];
  if(originalCssFiles){
    originalCssFiles = Array.prototype.slice.call(originalCssFiles);
    originalCssFiles = originalCssFiles.map(function(item){
      delete item.input;
      return item;
    });
  }

  Bundler.compilerPromise = Bundler.jsCompiler.compile()
    .then(function(){
      if(!originalCssFiles){
        return;
      }
      var promises = [];
      var finalCssFiles = Array.prototype.slice.call(Bundler.cssFileMappings[fullPath]);
      if( !_.isEqual(originalCssFiles, finalCssFiles) ){

        for(var i = 0, len = finalCssFiles.length; i < len; i++){
          var cssObj = finalCssFiles[i];
          var promise = readFile(cssObj.cssPath, 'utf8')
            .then(function(data){
              cssObj.input = data;
              return cssObj;
            });
          promises.push(promise);
        }
        return Promise.all(promises)
          .then(function(finalObjArray){
            Bundler.cssFileMappings[fullPath] = finalObjArray;
            return Bundler.cssCompiler.compile(Bundler.cssFileMappings);
          })
          .then(function(cssToWrite){
            Bundler.writeCssToBundle(cssToWrite)
          });
      }
    });
  return Bundler.compilerPromise;
}

var compileCSS = function(){
  return Bundler.compilerPromise = Bundler.cssCompiler.compile(Bundler.cssFileMappings)
    .then(function(cssToWrite){
      Bundler.writeCssToBundle(cssToWrite)
    })
}

var findCssObjInMappings = function(fullPath){
  var cssObj;
  var mappingKeys = Object.keys(Bundler.cssFileMappings);
  for(var i = 0, len = mappingKeys.length; i < len; i++){
    var key = mappingKeys[i];
    var mapping = Bundler.cssFileMappings[key];
    for(var j = 0, lenJ = mapping.length; j < lenJ; j++){
      if(mapping[j].cssPath === fullPath){
        return mapping[j];
      }
    }
  }
};

var browserReload = function(){
  if(!config.noAutoReload){
    socketServer.reloadClients()
  }
};