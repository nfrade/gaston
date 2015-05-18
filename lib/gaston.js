var log = require('npmlog')
  , server = require('./server')
  , Bundler = require('./bundler')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup')
  , config = require('./config');

var Gaston = module.exports = {

  dev: function(){
    return server.start()
  },

  build: function(){
    var newVersion;
    Bundler.setup({
      path: config.basePath
    });
    config.isBuilding = true;
    var pkgPath = backtrackFile('package.json');
    return bumpup(pkgPath, config.bump || 'minor')
      .then(function(version){
        return newVersion = version;
      })
      .then( Bundler.compile )
      .then(function(){
        Bundler.isBuilding = false;
        return newVersion;
      })
      .catch(function(err){
        console.log(err)
      });
  },

  launch: function(){
    server.launch();
  }
};