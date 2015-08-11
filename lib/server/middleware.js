var fs = require('graceful-fs')
  , path = require('path')
  , through = require('through2')
  , Bundler = require('../bundler')
  , Watcher = require('../bundler/watcher')
  , gastonFilesPath = path.join(__dirname, '../..', 'gaston-files')
  , gastonPath = path.join(__dirname, '..', 'browser', 'gaston-compiled.js')
  , errorPagePath = path.join(gastonFilesPath, 'error.html')
  , gastonCompiled;

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
        return Bundler.bundle(dirPath, 'dev')
          .then( getAppIndex(config, dirPath) )
          .then(function(rStream){
            rStream
              .pipe( res );
          })
          .catch( errorHandler(res) );

        break;
      case 'test':
        return Bundler.bundle( dirPath, 'test' )
          .then(function(){
            var htmlPath = path.join(gastonFilesPath, 'bootstrap', 'test.html');
            fs.createReadStream( htmlPath )
              .pipe(res);
          })
          .catch( errorHandler(res) );
        break;
    }

  };
};

//directories running as test or app
var running = module.exports.running = {};

var getAppIndex = function(config, dirPath){
  return function(){
    var indexPath,
      exists;

    indexPath = path.join( dirPath, 'index.html');
    exists = fs.existsSync(indexPath);

    if(!exists){
      indexPath = path.join( config.basePath, 'index.html');
      if( !fs.existsSync(indexPath) ){
        indexPath = path.join(gastonFilesPath, 'bootstrap', 'index.html');
      }
    }

    return fs.createReadStream(indexPath);
  }
}

var register = module.exports.register = function(runPath, action){
  if(runPath.indexOf('/') !== 0){
    runPath = '/' + runPath;
  }
  running[runPath] = action;
}

var unregister = module.exports.unregister = function(runPath){
  running[runPath] = null;
}

function errorHandler(res){
  return function(err){ 
    
    Watcher.addWatcher(err.filename);

    if(err.stream){
      delete err.stream;
    }

    var errorMessage;
    switch( path.extname(err.filename) ){
      case '.css':
      case '.less':
      case '.scss':
      case '.sass':
        errorMessage = JSON.stringify(err);
        break;
      default:
        errorMessage = err.message;
        break;
    }

    fs.createReadStream(errorPagePath)
      .pipe( through(function(buf, enc, next){
        var data = buf.toString('utf8');
        data = data.replace('{{error}}', errorMessage);
        this.push(data);
        next();
      }) )
      .pipe( res );
  };
}
