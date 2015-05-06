var fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , readFile = denodeify( fs.readFile )
  , Bundler = require('../bundler')
  , Watcher = require('../server/watcher');


module.exports = function(Server){
  return function(req, res, next){
    var urlPath = Server.initialPath + req.url;
    var isDir = fs.statSync(urlPath).isDirectory();
    var isIndex = fs.existsSync(urlPath + 'index.html');
    if(!isDir || !isIndex){
      return next();
    }

    Watcher.launch();
    Bundler.compilerPromise = Bundler.compilerPromise || Bundler.compile();

    Bundler.compilerPromise
      .then(function(){
        return readFile(urlPath + 'index.html', 'utf8');
      })
      .then(function(data){
        res.send(data);
      })
  };
};