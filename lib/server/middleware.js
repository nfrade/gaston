var config = require('../config')
  , fs = require('graceful-fs')
  , path = require('path')
  , Bundler = require('../bundler')
  , Watcher = require('./watcher');

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

      var dirname = path.dirname(indexName);

      if(dirname !== Watcher.compiledDir){
        Watcher.compiledDir = dirname;
        Bundler.setup( { path: dirname } );
      
        return Bundler.compilerPromise = Bundler.compile()
          .then(function(){
            return fs.createReadStream(indexName).pipe(res);
          })
          .then(Watcher.updateWatchers)
          .catch( errorHandler(res) );
      } else {
        return fs.createReadStream(indexName).pipe(res);
      }
    } 
    next();
  };
};

function errorHandler(res){
  return function(err){
    if(err.stream){
      delete err.stream;
    }
    console.log(err);
    switch( path.extname(err.filename) ){
      case '.js':
      case '.json':
        res.send(err.message);
        break;
      case '.css':
      case '.less':
      case '.scss':
      case '.sass':
        res.send(err);
        break;
    }  
  };
}


