var config = require('../config')
  , fs = require('graceful-fs')
  , path = require('path')
  , through = require('through2')
  , Bundler = require('../bundler')
  , Watcher = require('./watcher')
  , gastonPath = path.join(__dirname, '..', 'browser', 'gaston-compiled.js')
  , gastonCompiled;

module.exports = function(Server){
  return function(req, res, next){

    if(!gastonCompiled){
      fs.readFileAsync( gastonPath, 'utf8' )
      .then(function(data){
        gastonCompiled = data;
      });
    }

    var fullUrl = req.url.split('?').shift();
    var fullPath = path.join( config.basePath, fullUrl, '' );

    if( !fs.existsSync(fullPath) ){
      return next();
    }

    var ext = path.extname(fullPath);

    var isDirectory = fs.statSync(fullPath).isDirectory();
    var isProject = isDirectory && fs.existsSync( path.join(fullPath, 'index.html') );
    var isIndexHTML = fullPath.split(path.sep).pop() === 'index.html';
    var isTest = Server.isTesting && fs.existsSync( path.join(fullPath, 'index.js') );
    
    if( isProject || isIndexHTML || isTest){
      var indexName = isIndexHTML? fullPath : path.join(fullPath, 'index.html'); 
      var dirname = path.dirname(indexName);
      if(isTest){
        indexName = path.join(__dirname, '../..', 'gaston-files', 'bootstrap', 'test.html');
      }

      if(fullPath[fullPath.length - 1] !== path.sep){
        return res.send('<script> window.location.href = window.location.href + "/";</script>');
      }

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
    var script = '<script>' + gastonCompiled + '</script>';
    res.send(script + '<body>' + body + '</body>');
  };
}


