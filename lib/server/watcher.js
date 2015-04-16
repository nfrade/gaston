var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , bundler = require('../bundler');

var Watcher = module.exports = {
  initialPath: undefined,
  appPath: undefined,
  fullPath: undefined,
  fsWatcher: undefined,

  setup: function(){
  
  }, 

  middleware: function(initialPath){
    Watcher.initialPath = initialPath + '/';
    return function(req, res, next){
      Watcher.fullPath = initialPath + req.url + '/';
      Watcher.prettyPath = initialPath.split(path.sep).pop() + req.url + '/';
      var isDirectory = fs.statSync(Watcher.fullPath).isDirectory();

      if(isDirectory){
        var hasApp = fs.existsSync( path.join(Watcher.fullPath, 'index.html') );
        if(hasApp){
          bundler.setup({ path: Watcher.fullPath });
          bundler.compile();
          runWatcher();
        }
      }

      next();
    };
  }
};

var runWatcher = function(){
  killWatcher();
  Watcher.fsWatcher = fs.watch( Watcher.fullPath, {
    recursive: true
  }, watcherHandler );
  log.info('watcher', 'launched watcher on', Watcher.prettyPath);
};

var killWatcher = function(){
  if(Watcher.fsWatcher) {
    Watcher.fsWatcher.close();
    Watcher.fsWatcher = null;
    log.info('watcher', 'killed watcher on', Watcher.prettyPath);
  }
}

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