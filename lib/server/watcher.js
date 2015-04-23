var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , onFileChange = require('on-file-change')
  , Bundler = require('../bundler');

var Watcher = module.exports = {
  initialPath: undefined,
  fullPath: undefined,
  watchers: [],
  watchedPaths: [],
  compiledDir: undefined,

  middleware: function(initialPath){
    Watcher.initialPath = initialPath;
    return function(req, res, next){
      var fullPath = initialPath + req.url;
      //[TODO] - replace this condition with checking if path exists
      if( path.extname(fullPath) === '.ico' ){ 
        return next(); 
      }
      var isDirectory = fs.statSync(fullPath).isDirectory();

      if(isDirectory){
        Watcher.fullPath = fullPath;
        var hasApp = fs.existsSync( path.join(Watcher.fullPath, 'index.html') );
        if(hasApp){
          Watcher.launch();
          Watcher.compiledDir = Watcher.fullPath;
        } else {
          Watcher.destroy();
        }
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

  addWatcher: function(pathObj){
    //for js files
    if(typeof pathObj === 'string'){
      if(Watcher.watcherPaths.indexOf(pathObj) === -1){
        Watcher.watcherPaths.push(pathObj);
        var watcher = fs.watchFile( pathObj, { interval: 500 }, watcherHandler(pathObj) );
        Watcher.watchers.push(watcher);
      }
      return;
    }
    //for css files
    var keys = Object.keys(pathObj);
    for( var i = 0, len = keys.length; i < len; i++ ){
      var fullPath = Object.keys(pathObj)[i];
      if( ~Watcher.watcherPaths.indexOf(fullPath) ){
        continue;
      }
      var stylePath = pathObj[fullPath];
      var watcher = fs.watchFile( fullPath, { interval: 500 }, watcherHandler(fullPath, stylePath) );
      Watcher.watchers.push(watcher);
      Watcher.watcherPaths.push(fullPath);
    }
  }, 

  killWatchers: function(){
    for(var i = 0, len = Watcher.watchers.length; i < len; i++){
      var watcher = Watcher.watchers[i];
      watcher.stop();
    }
    Watcher.watchers = [];
    Watcher.watcherPaths = [];
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
          Bundler.cssCompiler.compile(Bundler.cssToCompile)
            .then( Bundler.writeCssToBundle );
        })
        break;
      case '.js':
        Bundler.jsCompiler.compile();
        break;
    }
  }
}