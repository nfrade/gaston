var log = require('npmlog')
  , server = require('./server')
  , Bundler = require('./bundler')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup');

var Gaston = module.exports = {
  builder: require('./builder'),
  dev: function(options){
    return server.start(options)
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
  },

  launch: function(){
    server.launch();
  }
};