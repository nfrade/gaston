var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , Bundler = require('../bundler');

var Watcher = module.exports = {
  initialPath: undefined,
  fullPath: undefined,
  fsWatchers: [],
  watchersPaths: [],
  activeStreams: {},
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
            Watcher.launch()
              .then(function(){
                console.log('compilation done');
                //[TODO] - auto-reload the browser
              });
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

  addWatcher: function(path){
    if( ~Watcher.watchersPaths.indexOf(path) ){
      return;
    }
    Watcher.watchersPaths.push(path);
    var watcher = fs.watch( path, watcherHandler.bind(null, path) );
    Watcher.fsWatchers.push(watcher);
    var prettyPath = path.replace(Watcher.initialPath, '').split(path.sep).pop();
    log.info('watcher', 'launched watcher on', prettyPath);
  }, 

  killWatchers: function(){
    for(var i = 0, len = Watcher.fsWatchers.length; i < len; i++){
      var watcher = Watcher.fsWatchers[i];
      watcher.close();
    }
    Watcher.fsWatchers = [];
    Watcher.watchersPaths = [];
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

var watcherHandler = function(path, ev, fileName){
  if( ~fileName.indexOf('bundle') ){
    return;
  }
  console.log('in watcherHandler', path + fileName); return;
  var isNewFile = ev === 'rename';
  switch( path.extname(fileName) ){
    case '.js':
      compiler.compileJS(fileName, isNewFile);
      break;
    case '.less':
      compiler.compileLess(fileName, isNewFile);
      break; 
  }
}