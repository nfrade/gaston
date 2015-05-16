var log = require('npmlog')
  , server = require('./server')
  , Bundler = require('./bundler')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup')
  , stdinListener = require('./stdin-listener');

var Gaston = module.exports = {
  builder: require('./builder'),
  dev: function(options){
    server.start(options)
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