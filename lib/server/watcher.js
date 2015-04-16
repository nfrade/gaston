var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , bundler = require('../bundler');

var Watcher = module.exports = {
  initialPath: undefined,
  fullPath: undefined,
  fsWatchers: [],

  middleware: function(initialPath){
    Watcher.initialPath = initialPath;
    return function(req, res, next){
      Watcher.fullPath = initialPath + req.url + '/';
      var isDirectory = fs.statSync(Watcher.fullPath).isDirectory();

      if(isDirectory){
        var hasApp = fs.existsSync( path.join(Watcher.fullPath, 'index.html') );
        if(hasApp){
          Watcher.killWatchers();
          Watcher.addWatcher(Watcher.fullPath, Watcher.prettyPath);
          bundler.setup({ 
            path: Watcher.fullPath,
            Watcher: Watcher
          });
          bundler.compile();
        }
      }

      next();
    };
  },

  addWatcher: function(path){
    var watcher = fs.watch( path, {
      recursive: true
    }, watcherHandler );
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
    log.info('watcher', 'killed all watchers');
  }
};

var watcherHandler = function(ev, fileName){
  if( ~fileName.indexOf('bundle') ){
    return;
  }
  console.log('in watcherHandler', fileName); return;
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