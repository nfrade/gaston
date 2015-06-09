var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , server = require('./server')
  , Bundler = require('./bundler')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup')
  , config = require('./config')
  , logServer = require('./log/server')
  , socketServer = require('./server/socket-server')
  , gastonBrowserCode = require('./bundler/compile-gaston-client.js');

var Gaston = module.exports = {

  dev: function(){
    return socketServer.start()
      .then( gastonBrowserCode )
      .then(function() { console.log(0)
        return server.start() 
      });
    //dev options for bundler? instead of a global config
  },

  build: function(buildPath){
    var newVersion;
    Bundler.setup({
      path: buildPath || process.cwd()
    });
    config.isBuilding = true;
    var pkgPath = backtrackFile('package.json');
    return bumpup(pkgPath, config.bump || 'revision')
      .then(function(version){
        return newVersion = version;
      })
      .then( Bundler.compile )
      .then(function(){
        Bundler.isBuilding = false;
        return newVersion;
      })
  },

  launch: function(){
    server.launch();
  }
};