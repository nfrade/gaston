var config = require('../config')
  , fs = require('graceful-fs')
  , path = require('path')
  , through = require('through2')
  , Bundler = require('../bundler')
  , Watcher = require('./watcher')
  , gastonPath = path.join(__dirname, '..', 'browser', 'gaston-compiled.js')
  , gastonScriptPromise;

module.exports = function(Server){
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
        if(Watcher.compiledDir){
          Watcher.watchify.close();
          Watcher.watchify = null;
        }
        Watcher.compiledDir = dirname;

        //Bundler devmode

        Bundler.setup( { 
          path: dirname,
          isTesting: Server.isTesting
        } );
      
        return Bundler.compilerPromise = Bundler.compile()
          .then(function(){
            fs.createReadStream(indexName)
              .pipe(res);
          })
          .then(Watcher.updateWatchers)
          .catch( errorHandler(res) );
      } else {
        return fs.createReadStream(indexName)
          .pipe(res);
      }
    } 
    next();
  };
};

function errorHandler(res){
  return function(err){
    Watcher.updateWatchers();
    if(Watcher.compiledDir){
      if(Watcher.watchify){
        Watcher.watchify.close();
        Watcher.watchify = null;
      }
      Watcher.compiledDir = '';
    }
    if(err.stream){
      delete err.stream;
    }
    console.log(err.stack || err);
    var body;
    switch( path.extname(err.filename) ){
      case '.css':
      case '.less':
      case '.scss':
      case '.sass':
        body = JSON.stringify(err);
        break;
      default:
        body = err.message;
        break;
    }
    gastonScriptPromise
      .then(function(script){
        var script = '<script>' + script + '</script>';
        res.send(script + '<body>' + body + '</body>');
      });
  };
}


