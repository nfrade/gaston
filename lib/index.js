var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , server = require('./server')
  , Bundler = require('./bundler')
  , Watcher = require('./server/watcher')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup');

var Gaston = module.exports = {
  dev: function(options){
    fs.exists( path.join(options.path, 'index.html'), function(exists){
      if(!exists){
        return server.start(options);
      }
      server.init(options);

      Watcher.compiledDir = Watcher.fullPath = options.path;
      Watcher.launch()
        .then( server.start );
    });
  },
  build: function(options){
    Bundler.setup(options);
    var pkgPath = backtrackFile('package.json');

    return bumpup(pkgPath, options.bump)
      .then( Bundler.compile );
  }
};