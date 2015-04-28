
var log = require('npmlog')
  , server = require('./server')
  , Bundler = require('./bundler')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup');

var Gaston = module.exports = {
  dev: function(options){
    server.start(options);
  },
  build: function(options){
    Bundler.setup(options);
    var pkgPath = backtrackFile('package.json');

    return bumpup(pkgPath, options.bump)
      .then(function(newVersion){
        log.info('GASTON-CLI', 'bumped up version to ', newVersion);
      })
      .then( Bundler.compile )
      .then(
        function(){
          log.info('GASTON-CLI', 'SUCCESS');
          process.exit(0);
        },
        function(err){
          log.error('GASTON-CLI', err);
          process.exit(1);
        }
      )
  }
};