var log = require('npmlog')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , _ = require('lodash')
  , readFile = denodeify(fs.readFile)
  , path = require('path')
  , onFileChange = require('on-file-change')
  , Bundler = require('../bundler')
  , socketServer = require('./socket-server')
  , Server;


var Watcher = module.exports = {
  initialPath: undefined,
  fullPath: undefined,
  watchers: [],
  watchedPaths: [],
  watchify: undefined,
  compiledDir: undefined,

  middleware: function(options){
    Watcher.initialPath = options.initialPath;
    Watcher.autoreload = options.autoreload;
    return function(req, res, next){
      var fullUrl = req.url.split('?').shift();
      var fullPath = path.join(Watcher.initialPath, fullUrl, '');

      if( !fs.existsSync(fullPath) ){
        return res.sendStatus(404);
      }

      var ext = path.extname(fullPath);

      var isDirectory = fs.statSync(fullPath).isDirectory();
      var isProject = isDirectory && fs.existsSync( path.join(fullPath, 'index.html') );
      var isIndexHTML = fullPath.split(path.sep).pop() === 'index.html';

      if(isDirectory && !isProject){
        return next();
      }
      
      if( isProject || isIndexHTML){
        var indexName = isIndexHTML? fullPath : path.join(fullPath, 'index.html'); 

        if(fullPath[fullPath.length - 1] !== '/'){
          return res.send('<script> window.location.href = window.location.href + "/";</script>');
        }

        if( fullPath !== Watcher.compiledDir ){
          if(isIndexHTML){
            fullPath = fullPath.split(path.sep);
            fullPath.pop();
            fullPath.join(path.sep) + path.sep;
          }
          
          Watcher.fullPath = fullPath;
          Watcher.compiledDir = path.join(Watcher.fullPath, '/');

          Bundler.compilerPromise = Watcher.launch();
        }

        return fs.createReadStream(indexName).pipe(res);
        
      } 
      next();
    };
  },

  launch: function(){
    Server = Server || require('./');
    Watcher.killWatchers();
    Bundler.setup({
      injectPackage: Server.injectPackage,
      path: Watcher.fullPath,
      Watcher: Watcher
    });
    return Bundler.compile();
  },

  addWatcher: function(filePath){
    if(Watcher.watchedPaths.indexOf(filePath) === -1){
      Watcher.watchedPaths.push(filePath);
      var watcher = fs.watchFile( filePath, { interval: 500 }, watcherHandler(filePath) );
      Watcher.watchers.push(watcher);
    }
  }, 

  killWatchers: function(){
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
  }, 

  destroy: function(){
    initialPath = null;
    fullPath = null;
    compiledDir = null;
    Watcher.killWatchers();
    Bundler.destroy();
    log.info('watcher', 'destroyed')
  }
};

var watcherHandler = function(fullPath){
  return function(curr, prev){
    log.info('watcher', 'changed', fullPath);

    switch( path.extname(fullPath) ){
      case '.less':
      case '.css':
        var cssObj = findCssObjInMappings(fullPath);
        
        readFile(cssObj.cssPath, 'utf8')
          .then(function(data){
            cssObj.input = data;
          })
          .then(function(){
            return Bundler.compilerPromise = Bundler.cssCompiler.compile(Bundler.cssFileMappings);
          })
          .then(function(cssToWrite){
            Bundler.writeCssToBundle(cssToWrite)
          })
          .then( browserReload );
      case '.js':
      case '.json':
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
          })
          .then(browserReload)
          .catch(function(err){
            log.error(err.stack);
          });
        break;
    }
  }
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
  if(Watcher.autoreload){
    socketServer.reloadClients()
  }
};