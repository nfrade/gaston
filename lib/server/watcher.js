var fs = require('graceful-fs')
  , path = require('path')
  , compiler = require('./compiler')
  , fsWatcher;

var Watcher = module.exports = function(initialPath){
  return function(req, res, next){
    var fullPath = initialPath + req.url
      , isDirectory = fs.statSync(fullPath).isDirectory();

    if( !isDirectory ){
      var ext = req.url.split('.').pop();
      if(ext === 'html'){
        if(fsWatcher){
          return next();
        }
        var dirPath = req.url.substr(0, req.url.lastIndexOf('/'));
        var watchPath = initialPath + dirPath;
        fsWatcher = fs.watch(watchPath, {

        }, watcherHandler.bind( null, initialPath + dirPath ) );
      }
    } else {
      if(fsWatcher){
        fsWatcher.close();
        fsWatcher = null;
      }
    }

    next();

  };
}

var watcherHandler = function(dirPath, ev, filename){
  console.log(dirPath);
  console.log('file changed:', filename);
  console.log('event is:', ev);
  console.log( path.extname(filename) );

  switch( path.extname(filename) ){
    case '.js':
      compiler.compileJS(dirPath);
      break;
    case '.less':
      compiler.compileLess(dirPath);
      break; 
  }
}