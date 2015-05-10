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
  builder: require('./builder'),
  dev: function(options){
    server.init(options);
    fs.exists( path.join(options.path, 'index.js'), function(exists){
      if(exists){
        Watcher.compiledDir = Watcher.fullPath = options.path;
        Watcher.launch();
      }
    });
    
    return server.start()
      .then(function(){
        var stdin = process.openStdin();
        stdin.on('data', stdinListener(options) );
      });
  },

  build: function(options){
    var newVersion;
    options = options || {};
    Bundler.setup(options);
    var pkgPath = backtrackFile('package.json');
    return bumpup(pkgPath, options.bump || 'minor')
      .then(function(version){
        newVersion = version;
      })
      .then( Bundler.compile )
      .then(function(){
        return newVersion;
      });
  }
};