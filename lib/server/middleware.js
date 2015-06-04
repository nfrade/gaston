var config = require('../config')
  , fs = require('graceful-fs')
  , path = require('path')
  , through = require('through2')
  , Bundler = require('../bundler')
  , Watcher = require('./watcher')
  , gastonPath = path.join(__dirname, '..', 'browser', 'gaston-compiled.js')
  , gastonScriptPromise;

module.exports = function(){
  return function(req, res, next){

    gastonScriptPromise = gastonScriptPromise || fs.readFileAsync( gastonPath, 'utf8' );

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

      if(fullPath[fullPath.length - 1] !== path.sep){
        return res.send('<script> window.location.href = window.location.href + "/";</script>');
      }

      var dirname = path.dirname(indexName);

      if(dirname !== Watcher.compiledDir){
        Watcher.compiledDir = dirname;
        Bundler.setup( { path: dirname } );
      
        return Bundler.compilerPromise = Bundler.compile()
          .then(function(){
            serveIndex(indexName, res); 
          })
          .then(Watcher.updateWatchers)
          .catch( errorHandler(res) );
      } else {
        return serveIndex(indexName, res);
      }
    } 
    next();
  };
};

var serveIndex = function(indexName, res){
  fs.createReadStream(indexName)
    .pipe( through(function(buf, enc, next){
      var self = this;
      var index = buf.toString('utf8');
      var final = index.replace('<head>', '<head><script src="gaston-compiled.js"></script>');
      self.push(final);
      next();
    }) )
    .pipe(res);
};

function errorHandler(res){
  return function(err){
    Watcher.updateWatchers();
    Watcher.compiledDir = '';
    if(err.stream){
      delete err.stream;
    }
    console.log(err);
    var body;
    switch( path.extname(err.filename) ){
      case '.js':
      case '.json':
        body = err.message;
        break;
      case '.css':
      case '.less':
      case '.scss':
      case '.sass':
        body = JSON.stringify(err);
        break;
    }
    gastonScriptPromise
      .then(function(script){
        var script = '<script>' + script + '</script>';
        res.send(script + '<body>' + body + '</body>');
      });
  };
}


