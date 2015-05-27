var config = require('../config')
  , fs = require('graceful-fs')
  , path = require('path')
  , Bundler = require('../bundler')
  , Watcher = require('../bundler/watcher');

module.exports = function(){
  return function(req, res, next){
    var fullUrl = req.url.split('?').shift();
    var fullPath = path.join( config.basePath, fullUrl, '' );

    if( !fs.existsSync(fullPath) ){
      return next();
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
        
        Bundler.compilerPromise = Watcher.launch(fullPath);
      }

      return fs.createReadStream(indexName).pipe(res);
      
    } 
    next();
  };
};