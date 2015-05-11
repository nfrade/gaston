var log = require('npmlog')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
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
      var fullPath = path.join(Watcher.initialPath, fullUrl);

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

        if( fullPath.indexOf(Watcher.compiledDir) === -1){
          if(isIndexHTML){
            fullPath = fullPath.split(path.sep);
            fullPath.pop();
            fullPath.join(path.sep) + path.sep;
          }
          
          Watcher.fullPath = fullPath;
          Watcher.compiledDir = Watcher.fullPath;
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
        var obj = Bundler.cssToCompile.filter(function(item){
          return fullPath === item.path;
        })[0];

        fs.readFile(fullPath, 'utf8', function(err, data){
          if(err){
            log.error('watcher', err);
          }
          if(!!obj){ 
            obj.css = data;
          }
          Bundler.compilerPromise = Bundler.cssCompiler.compile(Bundler.cssToCompile)
            .then( Bundler.writeCssToBundle )
            .then(browserReload);
        });
        break;
      case '.js':
      case '.json':
        var cssCount = Bundler.cssToCompile.length;
        Bundler.compilerPromise = Bundler.jsCompiler.compile()
          .then(function(){
            if(cssCount !== Bundler.cssToCompile.length){
              return Bundler.cssCompiler.compile( Bundler.cssToCompile )
                .then( Bundler.writeCssToBundle );
            }
          })
          .then(browserReload)
          .catch(function(err){
            log.error(err);
          });
        break;
    }
  }
}

var browserReload = function(){
  if(Watcher.autoreload){
    socketServer.reloadClients()
  }
};
