var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , onFileChange = require('on-file-change')
  , Bundler = require('../bundler')
  , io = require('./socket-server');

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
      var fullPath = Watcher.initialPath + req.url;
      
      fs.exists(fullPath, function(exists){
        if(!exists){
          return next();
        }
        var isDirectory = fs.statSync(fullPath).isDirectory();
        if(isDirectory){
          Watcher.fullPath = fullPath;
          var hasApp = fs.existsSync( path.join(Watcher.fullPath, 'index.html') );
        } else {
          var ext = path.extname(fullPath);
          if(ext === '.html'){
            if( fullPath.indexOf(Watcher.compiledDir) === -1){
              fullPath = fullPath.split(path.sep);
              fullPath.pop();
              Watcher.fullPath = fullPath.join(path.sep) + '/';
              Watcher.compiledDir = Watcher.fullPath;
              Watcher.launch();
            }
          }
        }
        next();
      });
    };
  },

  launch: function(){
    Watcher.killWatchers();
    Bundler.setup({ 
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
        var obj = Bundler.cssToCompile.filter(function(item){
          return fullPath === item.path;
        }); 

        fs.readFile(fullPath, 'utf8', function(err, data){
          if(err){
            log.error('watcher', err);
          }
          obj.css = data;
          Bundler.compilerPromise = Bundler.cssCompiler.compile(Bundler.cssToCompile)
            .then( Bundler.writeCssToBundle )
            .then(browserReload);
        })
        break;
      case '.js':
        Bundler.compilerPromise = Bundler.jsCompiler.compile()
          .then(browserReload);
        break;
    }
  }
}

var browserReload = function(){
  if(Watcher.autoreload){
    log.info('watcher', 'reloading the browser');
    io.emit('reload');
  }
}