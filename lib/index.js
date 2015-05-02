var log = require('npmlog')
  , denodeify = require('denodeify')
  , fs = require('graceful-fs')
  , pathExists = denodeify( fs.exists )
  , path = require('path')
  , server = require('./server')
  , Bundler = require('./bundler')
  , Watcher = require('./server/watcher')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup')
  , stdinListener = require('./stdin-listener');

var Gaston = module.exports = {
  dev: function(options){
    var exists = fs.existsSync( path.join(options.path, 'index.html') );
    if(!exists){
      return server.start(options);
    }
    server.init(options);
    Watcher.compiledDir = Watcher.fullPath = options.path;
    return Watcher.launch()
      .then( server.start )
      .then(function(){
        var stdin = process.openStdin();
        stdin.on('data', stdinListener(options) );
      });
  },

  build: function(options){
    Bundler.setup(options);
    var pkgPath = backtrackFile('package.json');
    return bumpup(pkgPath, options.bump)
      .then( Bundler.compile );
  }
};