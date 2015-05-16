var fs = require('fs')
  , path = require('path')
  , Watcher = require('./watcher')
  , Bundler = require('../bundler');

module.exports = function(options){
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
};