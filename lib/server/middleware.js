var fs = require('graceful-fs')
  , path = require('path')
  , through = require('through2')
  , Bundler = require('../bundler')
  , Watcher = require('./watcher')
  , gastonFilesPath = path.join(__dirname, '../..', 'gaston-files')
  , gastonPath = path.join(__dirname, '..', 'browser', 'gaston-compiled.js')
  , gastonCompiled;

//directories running as test or app
var running = {};
var watchifies = {};


module.exports = function middleware(config, Server){
  return function(req, res, next){
    var url = req.url.replace(/\?.+$/, '');

    var match = /\&action=(test|dev)+/.exec(req.url);
    if(match){
      register( url, match[1] );
    }

    if( path.extname(url) || !running[url]){
      return next(); 
    }

    var dirPath = path.join( config.basePath, url );

    switch( running[url] ){
      case 'dev': 
        return Bundler.forDev(dirPath)
          .then(function(stream){
            
          })
          .then( getAppIndexPath(config, dirPath) )
          .then(function(rStream){
            rStream.pipe( res );
          })
          .catch(function(err){ console.log('error', err.stack); });

        break;
      case 'test':
        return Bundler.forTest( dirPath )
          .then(function(){
            var htmlPath = path.join(gastonFilesPath, 'bootstrap', 'test.html');
            fs.createReadStream( htmlPath )
              .pipe(res);
          })
        break;
    }

  };
};

var getAppIndexPath = function(config, dirPath){
  return function(){
    var indexPath = path.join( dirPath, 'index.html');
    return fs.existsAsync(indexPath)
      .then(function(exists){
        if(!exists){
          indexPath = path.join( config.basePath, 'index.html');
        }
        return fs.createReadStream( indexPath );
      });
  }
}

var register = module.exports.register = function(runPath, action){
  if(runPath.indexOf('/') !== 0){
    runPath = '/' + runPath;
  }
  running[runPath] = action;
}


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


function middlewareOld(config, Server){
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
